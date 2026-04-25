use crate::models::ProjectMeta;
use std::fs;
use std::path::Path;

#[tauri::command]
pub fn scan_vault(vault_path: String) -> Result<Vec<ProjectMeta>, String> {
    let vault_dir = Path::new(&vault_path);
    if !vault_dir.exists() {
        return Err("书库目录不存在".into());
    }

    let mut projects = Vec::new();
    for entry in fs::read_dir(vault_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        if !path.join("project.json").exists() {
            continue;
        }
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();
        projects.push(ProjectMeta {
            name,
            directory: path.to_string_lossy().to_string(),
            created_at: String::new(),
        });
    }

    projects.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(projects)
}
