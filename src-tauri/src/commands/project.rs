use crate::models::*;
use std::fs;
use std::path::Path;

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
    };
    let config_json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(project_dir.join("project.json"), config_json).map_err(|e| e.to_string())?;

    Ok(ProjectMeta {
        name,
        directory: project_dir.to_string_lossy().into(),
        created_at: String::new(),
    })
}

#[tauri::command]
pub fn open_project(path: String) -> Result<ProjectMeta, String> {
    let project_dir = Path::new(&path);
    let config_path = project_dir.join("project.json");
    if !config_path.exists() {
        return Err("不是有效的项目目录：缺少 project.json".into());
    }
    let name = project_dir
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into();
    Ok(ProjectMeta {
        name,
        directory: path,
        created_at: String::new(),
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

fn count_chinese_chars(text: &str) -> usize {
    text.chars()
        .filter(|c| matches!(c, '\u{4e00}'..='\u{9fff}' | '\u{3400}'..='\u{4dbf}'))
        .count()
}

fn extract_title(content: &str) -> Option<String> {
    content.lines().find(|l| l.starts_with("# ")).map(|l| l.trim_start_matches("# ").to_string())
}
