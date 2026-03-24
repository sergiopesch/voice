use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub hotkey: String,
    pub dictation_mode: DictationMode,
    pub selected_mic: Option<String>,
    pub insertion_strategy: InsertionStrategy,
    pub asr_engine: AsrEngine,
    pub log_level: LogLevel,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum DictationMode {
    PushToTalk,
    Toggle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum InsertionStrategy {
    Auto,
    Clipboard,
    TypeSimulation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum AsrEngine {
    WhisperCpp,
    FasterWhisper,
    SherpaOnnx,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            hotkey: "Super+Shift+D".to_string(),
            dictation_mode: DictationMode::PushToTalk,
            selected_mic: None,
            insertion_strategy: InsertionStrategy::Auto,
            asr_engine: AsrEngine::WhisperCpp,
            log_level: LogLevel::Info,
        }
    }
}

impl AppConfig {
    fn config_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let config_dir = if cfg!(target_os = "macos") {
            dirs::home_dir()
                .ok_or("Cannot find home directory")?
                .join("Library/Application Support/VoiceDictation")
        } else {
            dirs::config_dir()
                .ok_or("Cannot find config directory")?
                .join("voice-dictation")
        };
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
