use crate::models::*;
use std::fs;
use std::path::Path;
use base64::Engine as _;

const DEFAULT_COVER_COUNT: usize = 20;

#[tauri::command]
pub fn read_cover(project_path: String) -> Result<Option<String>, String> {
    for ext in &["png", "jpg", "jpeg"] {
        let cover_path = Path::new(&project_path).join(format!("cover.{}", ext));
        if cover_path.exists() {
            let data = fs::read(&cover_path).map_err(|e| e.to_string())?;
            let b64 = base64::engine::general_purpose::STANDARD.encode(&data);
            let mime = if *ext == "png" { "image/png" } else { "image/jpeg" };
            return Ok(Some(format!("data:{};base64,{}", mime, b64)));
        }
    }
    Ok(None)
}

#[tauri::command]
pub fn delete_project(project_path: String) -> Result<(), String> {
    let path = Path::new(&project_path);
    if !path.join("project.json").exists() {
        return Err("不是有效的项目目录".into());
    }
    fs::remove_dir_all(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_cover(project_path: String, source_path: String) -> Result<(), String> {
    let ext = Path::new(&source_path)
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_lowercase();
    if !matches!(ext.as_str(), "png" | "jpg" | "jpeg") {
        return Err("只支持 png/jpg 格式".into());
    }
    for old_ext in &["png", "jpg", "jpeg"] {
        let old = Path::new(&project_path).join(format!("cover.{}", old_ext));
        if old.exists() {
            fs::remove_file(&old).map_err(|e| e.to_string())?;
        }
    }
    let dest = Path::new(&project_path).join(format!("cover.{}", ext));
    fs::copy(&source_path, &dest).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn rename_project(project_path: String, new_name: String) -> Result<String, String> {
    let path = Path::new(&project_path);
    if !path.join("project.json").exists() {
        return Err("不是有效的项目目录".into());
    }
    let parent = path.parent().ok_or("无效路径")?;
    let new_path = parent.join(&new_name);
    if new_path.exists() {
        return Err("同名目录已存在".into());
    }
    fs::rename(path, &new_path).map_err(|e| e.to_string())?;
    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_cover(project_path: String) -> Result<(), String> {
    for ext in &["png", "jpg", "jpeg"] {
        let cover_path = Path::new(&project_path).join(format!("cover.{}", ext));
        if cover_path.exists() {
            fs::remove_file(&cover_path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn create_project(name: String, directory: String) -> Result<ProjectMeta, String> {
    let project_dir = Path::new(&directory).join(&name);
    if project_dir.exists() {
        return Err("项目目录已存在".into());
    }
    fs::create_dir_all(&project_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(project_dir.join("chapters")).map_err(|e| e.to_string())?;

    let config = ProjectConfig {
        volumes: vec!["未分类".into()],
        chapter_order: vec![],
        cover_index: Some(next_cover_index(&directory)),
    };
    let config_json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(project_dir.join("project.json"), config_json).map_err(|e| e.to_string())?;

    Ok(ProjectMeta {
        name,
        directory: project_dir.to_string_lossy().into(),
        created_at: String::new(),
        cover_index: config.cover_index,
    })
}

#[tauri::command]
pub fn open_project(path: String) -> Result<ProjectMeta, String> {
    let project_dir = Path::new(&path);
    let config_path = project_dir.join("project.json");
    if !config_path.exists() {
        return Err("无法打开此目录：该目录不是书织项目（缺少 project.json）。\n请选择通过「新建作品」创建的项目目录，或进入包含 chapters/ 和 project.json 的文件夹。".into());
    }
    let name = project_dir
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into();
    let cover_index = read_project_config(project_dir).and_then(|c| c.cover_index);
    Ok(ProjectMeta {
        name,
        directory: path,
        created_at: String::new(),
        cover_index,
    })
}

#[tauri::command]
pub fn list_chapters(project_path: String) -> Result<Vec<Chapter>, String> {
    let config_path = Path::new(&project_path).join("project.json");
    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: ProjectConfig = serde_json::from_str(&config_str).map_err(|e| e.to_string())?;

    let chapters_dir = Path::new(&project_path).join("chapters");
    let mut chapters = Vec::new();

    if chapters_dir.exists() {
        for (i, file_name) in config.chapter_order.iter().enumerate() {
            let file_path = chapters_dir.join(format!("{}.md", file_name));
            if file_path.exists() {
                let content = match fs::read_to_string(&file_path) {
                    Ok(c) => c,
                    Err(e) => {
                        eprintln!("警告: 无法读取章节文件 {}: {}", file_path.display(), e);
                        continue;
                    }
                };
                let word_count = count_chinese_chars(&content);
                let title = extract_title(&content).unwrap_or_else(|| file_name.clone());
                chapters.push(Chapter {
                    id: file_name.clone(),
                    title,
                    file_path: file_path.to_string_lossy().into(),
                    word_count,
                    status: ChapterStatus::Draft,
                    order: i,
                    volume: "未分类".into(),
                });
            }
        }
    }

    Ok(chapters)
}

fn read_project_config(project_dir: &Path) -> Option<ProjectConfig> {
    let config_str = fs::read_to_string(project_dir.join("project.json")).ok()?;
    serde_json::from_str(&config_str).ok()
}

fn next_cover_index(vault_path: &str) -> usize {
    let vault_dir = Path::new(vault_path);
    let mut used = Vec::new();
    if let Ok(entries) = fs::read_dir(vault_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }
            let index = read_project_config(&path)
                .and_then(|config| config.cover_index)
                .or_else(|| {
                    path.file_name()
                        .map(|name| fallback_cover_index(&name.to_string_lossy()))
                });
            if let Some(index) = index {
                used.push(index % DEFAULT_COVER_COUNT);
            }
        }
    }

    for index in 0..DEFAULT_COVER_COUNT {
        if !used.contains(&index) {
            return index;
        }
    }

    used.len() % DEFAULT_COVER_COUNT
}

fn fallback_cover_index(name: &str) -> usize {
    let sum: usize = name.encode_utf16().map(usize::from).sum();
    (sum * 7) % DEFAULT_COVER_COUNT
}

fn count_chinese_chars(text: &str) -> usize {
    text.chars()
        .filter(|c| matches!(c, '\u{4e00}'..='\u{9fff}' | '\u{3400}'..='\u{4dbf}'))
        .count()
}

fn extract_title(content: &str) -> Option<String> {
    content.lines().find(|l| l.starts_with("# ")).map(|l| l.trim_start_matches("# ").to_string())
}
