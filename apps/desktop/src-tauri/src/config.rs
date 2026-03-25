use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    #[serde(default = "default_hotkey")]
    pub hotkey: String,
    #[serde(default)]
    pub selected_mic: Option<String>,
    #[serde(default = "default_insertion_strategy")]
    pub insertion_strategy: InsertionStrategy,
}

fn default_hotkey() -> String {
    "Alt+D".to_string()
}

fn default_insertion_strategy() -> InsertionStrategy {
    InsertionStrategy::Auto
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum InsertionStrategy {
    #[default]
    Auto,
    Clipboard,
    TypeSimulation,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            hotkey: default_hotkey(),
            selected_mic: None,
            insertion_strategy: InsertionStrategy::Auto,
        }
    }
}

impl AppConfig {
    fn config_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let config_dir = dirs::config_dir()
            .ok_or("Cannot find config directory (XDG_CONFIG_HOME)")?
            .join("voice");
        fs::create_dir_all(&config_dir)?;
        Ok(config_dir.join("config.json"))
    }

    pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
        let path = Self::config_path()?;
        if path.exists() {
            let content = fs::read_to_string(&path)?;
            Ok(serde_json::from_str(&content)?)
        } else {
            let config = Self::default();
            config.save()?;
            Ok(config)
        }
    }

    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        let path = Self::config_path()?;
        let content = serde_json::to_string_pretty(self)?;
        fs::write(&path, content)?;
        Ok(())
    }
}
