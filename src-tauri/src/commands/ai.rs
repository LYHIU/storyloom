use serde::{Deserialize, Serialize};
use std::path::Path;
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AiConfig {
    pub enabled: bool,
    pub provider: String,
    pub base_url: String,
    pub api_key: String,
    pub model: String,
}

impl Default for AiConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            provider: "openai".into(),
            base_url: "https://api.openai.com/v1".into(),
            api_key: String::new(),
            model: "gpt-4o-mini".into(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub messages: Vec<ChatMessage>,
    #[serde(default = "default_temperature")]
    pub temperature: f64,
    #[serde(default = "default_max_tokens")]
    pub max_tokens: u32,
}

fn default_temperature() -> f64 { 0.7 }
fn default_max_tokens() -> u32 { 2048 }

fn config_path(vault_path: &str) -> String {
    Path::new(vault_path).join("ai_config.json").to_string_lossy().to_string()
}

fn read_ai_config(config_path: &str) -> Result<AiConfig, String> {
    let path = Path::new(config_path);
    if path.exists() {
        let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).map_err(|e| format!("配置解析失败: {}", e))
    } else {
        Ok(AiConfig::default())
    }
}

#[tauri::command]
pub fn get_ai_config(vault_path: String) -> Result<AiConfig, String> {
    read_ai_config(&config_path(&vault_path))
}

#[tauri::command]
pub fn save_ai_config(vault_path: String, config: AiConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(config_path(&vault_path), json).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn ai_chat(vault_path: String, request: ChatRequest) -> Result<String, String> {
    let config = read_ai_config(&config_path(&vault_path))?;
    if !config.enabled {
        return Err("AI 功能未启用，请在设置中开启".into());
    }
    if config.base_url.is_empty() {
        return Err("未配置 API 地址".into());
    }

    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": config.model,
        "messages": request.messages,
        "temperature": request.temperature,
        "max_tokens": request.max_tokens,
        "stream": false,
    });

    let url = format!("{}/chat/completions", config.base_url.trim_end_matches('/'));
    let mut req = client.post(&url)
        .header("Content-Type", "application/json")
        .json(&body);

    if !config.api_key.is_empty() {
        req = req.header("Authorization", format!("Bearer {}", config.api_key));
    }

    let resp = req.send().await.map_err(|e| format!("请求失败: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("API 返回错误 ({}): {}", status, text));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| format!("解析响应失败: {}", e))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| format!("未获取到回复: {}", json))?;

    Ok(content.to_string())
}
