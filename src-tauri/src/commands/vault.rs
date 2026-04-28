use crate::models::ProjectMeta;
use std::fs;
use std::path::Path;
use std::time::SystemTime;

fn read_cover_index(project_dir: &Path) -> Option<usize> {
    let config_str = fs::read_to_string(project_dir.join("project.json")).ok()?;
    let config: crate::models::ProjectConfig = serde_json::from_str(&config_str).ok()?;
    config.cover_index
}

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

        let created_at = fs::metadata(&path)
            .ok()
            .and_then(|m| m.modified().or_else(|_| m.created()).ok())
            .unwrap_or(SystemTime::UNIX_EPOCH)
            .duration_since(SystemTime::UNIX_EPOCH)
            .map(|d| d.as_secs().to_string())
            .unwrap_or_default();

        projects.push(ProjectMeta {
            name,
            directory: path.to_string_lossy().to_string(),
            created_at,
            cover_index: read_cover_index(&path),
        });
    }

    projects.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(projects)
}
