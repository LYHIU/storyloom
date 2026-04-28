use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMeta {
    pub name: String,
    pub directory: String,
    pub created_at: String,
    pub cover_index: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,         // 文件名 (不含扩展名)
    pub title: String,      // 章节标题
    pub file_path: String,  // 完整路径
    pub word_count: usize,
    pub status: ChapterStatus,
    pub order: usize,
    pub volume: String,     // 所属卷名
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChapterStatus {
    Draft,
    Done,
    Revising,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub volumes: Vec<String>,
    pub chapter_order: Vec<String>,
    pub cover_index: Option<usize>,
}
