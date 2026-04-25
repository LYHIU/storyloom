use std::fs;
use std::path::{Path, PathBuf};

#[tauri::command]
pub fn read_chapter(file_path: String) -> Result<String, String> {
    if !file_path.ends_with(".md") {
        return Err("只允许读取 .md 文件".into());
    }
    fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_chapter(file_path: String, content: String) -> Result<(), String> {
    if !file_path.ends_with(".md") {
        return Err("只允许写入 .md 文件".into());
    }
    if let Some(parent) = Path::new(&file_path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&file_path, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_chapter(project_path: String, file_name: String, title: String) -> Result<String, String> {
    if file_name.contains('/') || file_name.contains('\\') || file_name.contains("..") || file_name.contains('\0') {
        return Err("Invalid file name".into());
    }
    let chapters_dir = Path::new(&project_path).join("chapters");
    let file_path = chapters_dir.join(format!("{}.md", file_name));
    if file_path.exists() {
        return Err("章节文件已存在".into());
    }
    let content = format!("# {}\n\n", title);
    fs::write(&file_path, &content).map_err(|e| e.to_string())?;
    update_chapter_order(&project_path, &file_name)?;
    Ok(file_path.to_string_lossy().into())
}

fn validate_path_in_project(file_path: &str, project_path: &str) -> Result<PathBuf, String> {
    let file = std::fs::canonicalize(file_path).map_err(|e| format!("无效文件路径: {}", e))?;
    let project = std::fs::canonicalize(project_path).map_err(|e| format!("无效项目路径: {}", e))?;
    if !file.starts_with(&project) {
        return Err("文件路径不在项目目录内".into());
    }
    Ok(file)
}

#[tauri::command]
pub fn delete_chapter(file_path: String, project_path: String) -> Result<(), String> {
    validate_path_in_project(&file_path, &project_path)?;
    fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    let file_name = Path::new(&file_path)
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    remove_from_chapter_order(&project_path, &file_name)?;
    Ok(())
}

#[tauri::command]
pub fn rename_chapter(file_path: String, project_path: String, new_title: String) -> Result<(), String> {
    validate_path_in_project(&file_path, &project_path)?;

    // 读取当前内容
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;

    // 替换第一个 # 标题行
    let new_content;
    if content.starts_with("# ") {
        let first_newline = content.find('\n').unwrap_or(content.len());
        new_content = format!("# {}{}", new_title, &content[first_newline..]);
    } else {
        new_content = format!("# {}\n\n{}", new_title, content);
    }

    fs::write(&file_path, &new_content).map_err(|e| e.to_string())?;
    Ok(())
}(project_path: &str, file_name: &str) -> Result<(), String> {
    let config_path = Path::new(project_path).join("project.json");
    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config: crate::models::ProjectConfig =
        serde_json::from_str(&config_str).map_err(|e| e.to_string())?;
    if !config.chapter_order.contains(&file_name.to_string()) {
        config.chapter_order.push(file_name.to_string());
    }
    fs::write(&config_path, serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}

fn remove_from_chapter_order(project_path: &str, file_name: &str) -> Result<(), String> {
    let config_path = Path::new(project_path).join("project.json");
    let config_str = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config: crate::models::ProjectConfig =
        serde_json::from_str(&config_str).map_err(|e| e.to_string())?;
    config.chapter_order.retain(|f| f != file_name);
    fs::write(&config_path, serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}
