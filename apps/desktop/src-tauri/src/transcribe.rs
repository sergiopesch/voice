use std::path::PathBuf;
use std::sync::Mutex;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

pub struct WhisperState {
    ctx: Option<WhisperContext>,
    model_path: Option<PathBuf>,
}

impl WhisperState {
    pub fn new() -> Self {
        Self {
            ctx: None,
            model_path: None,
        }
    }

    pub fn load_model(&mut self, path: &PathBuf) -> Result<(), String> {
        if self.model_path.as_ref() == Some(path) && self.ctx.is_some() {
            return Ok(());
        }

        let ctx = WhisperContext::new_with_params(
            path.to_str().ok_or("Invalid model path")?,
            WhisperContextParameters::default(),
        )
        .map_err(|e| format!("Failed to load whisper model: {e}"))?;

        self.ctx = Some(ctx);
        self.model_path = Some(path.clone());
        Ok(())
    }

    pub fn transcribe(&self, samples: &[f32]) -> Result<String, String> {
        let ctx = self.ctx.as_ref().ok_or("Model not loaded")?;

        let mut state = ctx.create_state().map_err(|e| format!("Failed to create state: {e}"))?;

        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        params.set_language(Some("en"));
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);
        params.set_print_special(false);
        params.set_suppress_blank(true);
        params.set_no_speech_thold(0.6);
        params.set_single_segment(false);
        params.set_n_threads(num_cpus());

        state
            .full(params, samples)
            .map_err(|e| format!("Transcription failed: {e}"))?;

        let num_segments = state.full_n_segments().map_err(|e| format!("Failed to get segments: {e}"))?;
        let mut text = String::new();
        for i in 0..num_segments {
            if let Ok(segment) = state.full_get_segment_text(i) {
                text.push_str(&segment);
            }
        }

        Ok(text.trim().to_string())
    }
}

fn num_cpus() -> i32 {
    std::thread::available_parallelism()
        .map(|n| n.get() as i32)
        .unwrap_or(4)
        .min(8)
}

pub fn model_dir() -> Result<PathBuf, String> {
    let data_dir = if cfg!(target_os = "macos") {
        dirs::home_dir()
            .ok_or("Cannot find home directory")?
            .join("Library/Application Support/VoiceDictation/models")
    } else {
        dirs::data_dir()
            .ok_or("Cannot find data directory")?
            .join("voice-dictation/models")
    };
    std::fs::create_dir_all(&data_dir).map_err(|e| format!("Failed to create model dir: {e}"))?;
    Ok(data_dir)
}

pub fn default_model_path() -> Result<PathBuf, String> {
    Ok(model_dir()?.join("ggml-base.en.bin"))
}

pub type WhisperMutex = Mutex<WhisperState>;
