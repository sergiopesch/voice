mod config;
mod insertion;
mod transcribe;

use config::AppConfig;
use std::sync::Mutex;
use transcribe::{WhisperMutex, WhisperState};

#[tauri::command]
fn get_config() -> Result<AppConfig, String> {
    AppConfig::load().map_err(|e| e.to_string())
}

#[tauri::command]
fn save_config(config: AppConfig) -> Result<(), String> {
    config.save().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_platform_info() -> PlatformInfo {
    PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        session_type: std::env::var("XDG_SESSION_TYPE").unwrap_or_default(),
        desktop: std::env::var("XDG_CURRENT_DESKTOP").unwrap_or_default(),
    }
}

#[derive(serde::Serialize)]
pub struct PlatformInfo {
    os: String,
    arch: String,
    session_type: String,
    desktop: String,
}

// --- Model management ---

#[derive(serde::Serialize)]
pub struct ModelStatus {
    downloaded: bool,
    path: String,
    size_mb: f64,
}

#[tauri::command]
fn get_model_status() -> Result<ModelStatus, String> {
    let path = transcribe::default_model_path()?;
    let downloaded = path.exists();
    let size_mb = if downloaded {
        std::fs::metadata(&path)
            .map(|m| m.len() as f64 / 1_048_576.0)
            .unwrap_or(0.0)
    } else {
        0.0
    };
    Ok(ModelStatus {
        downloaded,
        path: path.to_string_lossy().to_string(),
        size_mb,
    })
}

#[tauri::command]
fn download_model() -> Result<String, String> {
    let path = transcribe::default_model_path()?;
    if path.exists() {
        return Ok(path.to_string_lossy().to_string());
    }

    let url = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin";

    let response = reqwest::blocking::get(url)
        .map_err(|e| format!("Download failed: {e}"))?;

    if !response.status().is_success() {
        return Err(format!("Download failed with status: {}", response.status()));
    }

    let bytes = response
        .bytes()
        .map_err(|e| format!("Failed to read response: {e}"))?;

    std::fs::write(&path, &bytes)
        .map_err(|e| format!("Failed to save model: {e}"))?;

    Ok(path.to_string_lossy().to_string())
}

// --- Transcription ---

#[tauri::command]
fn transcribe_audio(
    samples: Vec<f32>,
    state: tauri::State<'_, WhisperMutex>,
) -> Result<String, String> {
    if samples.is_empty() {
        return Err("No audio samples provided".to_string());
    }

    let model_path = transcribe::default_model_path()?;
    if !model_path.exists() {
        return Err("Model not downloaded. Please download the model first.".to_string());
    }

    let mut whisper = state
        .lock()
        .map_err(|e| format!("Failed to lock whisper state: {e}"))?;

    whisper.load_model(&model_path)?;
    whisper.transcribe(&samples)
}

// --- Text insertion ---

#[derive(serde::Serialize)]
pub struct InsertResult {
    strategy: String,
    success: bool,
}

#[tauri::command]
fn insert_text(text: String, strategy: String) -> Result<InsertResult, String> {
    let result = insertion::insert_text(&text, &strategy)?;
    Ok(InsertResult {
        strategy: format!("{:?}", result.strategy).to_lowercase(),
        success: result.success,
    })
}

#[cfg(target_os = "linux")]
fn grant_webview_permissions(app: &tauri::App) {
    use glib::object::Cast;
    use tauri::Manager;
    use webkit2gtk::PermissionRequestExt;
    use webkit2gtk::WebViewExt;

    if let Some(window) = app.get_webview_window("main") {
        window.with_webview(move |wv| {
            let webview: webkit2gtk::WebView = wv.inner().clone().downcast().unwrap();
            webview.connect_permission_request(
                |_wv, request: &webkit2gtk::PermissionRequest| {
                    request.allow();
                    true
                },
            );
        }).ok();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(Mutex::new(WhisperState::new()) as WhisperMutex)
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            get_platform_info,
            get_model_status,
            download_model,
            transcribe_audio,
            insert_text,
        ])
        .setup(|app| {
            #[cfg(target_os = "linux")]
            grant_webview_permissions(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
