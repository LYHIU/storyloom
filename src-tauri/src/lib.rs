mod commands;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::project::read_cover,
            commands::project::set_cover,
            commands::project::delete_cover,
            commands::project::rename_project,
            commands::project::delete_project,
            commands::project::create_project,
            commands::project::open_project,
            commands::project::list_chapters,
            commands::file::read_chapter,
            commands::file::write_chapter,
            commands::file::create_chapter,
            commands::file::delete_chapter,
            commands::file::rename_chapter,
            commands::vault::scan_vault,
            commands::ai::get_ai_config,
            commands::ai::save_ai_config,
            commands::ai::ai_chat,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
