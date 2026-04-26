use std::fs;
use std::path::Path;

const CHARACTER_BOARD_FILE: &str = "characters.json";
const DEFAULT_CHARACTER_BOARD: &str = r#"{
  "version": 1,
  "updatedAt": "",
  "characters": [],
  "relationships": [],
  "conflicts": []
}"#;

fn validate_project_path(project_path: &str) -> Result<&Path, String> {
    let path = Path::new(project_path);
    if !path.join("project.json").exists() {
        return Err("不是有效的项目目录".into());
    }
    Ok(path)
}

#[tauri::command]
pub fn read_character_board(project_path: String) -> Result<String, String> {
    let project_dir = validate_project_path(&project_path)?;
    let board_path = project_dir.join(CHARACTER_BOARD_FILE);
    if !board_path.exists() {
        return Ok(DEFAULT_CHARACTER_BOARD.into());
    }
    fs::read_to_string(board_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_character_board(project_path: String, content: String) -> Result<(), String> {
    let project_dir = validate_project_path(&project_path)?;
    serde_json::from_str::<serde_json::Value>(&content)
        .map_err(|e| format!("人设数据不是有效 JSON: {}", e))?;
    fs::write(project_dir.join(CHARACTER_BOARD_FILE), content).map_err(|e| e.to_string())
}
