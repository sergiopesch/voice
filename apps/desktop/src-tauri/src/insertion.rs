use std::process::Command;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum ActiveStrategy {
    Wtype,
    Xdotool,
    Clipboard,
}

pub struct InsertionResult {
    pub strategy: ActiveStrategy,
    pub success: bool,
}

pub fn detect_session() -> String {
    std::env::var("XDG_SESSION_TYPE").unwrap_or_default()
}

pub fn insert_text(text: &str, preferred: &str) -> Result<InsertionResult, String> {
    let session = detect_session();

    match preferred {
        "auto" => {
            if session == "wayland" {
                if try_wtype(text) {
                    return Ok(InsertionResult { strategy: ActiveStrategy::Wtype, success: true });
                }
                // Wayland fallback: clipboard paste
                clipboard_paste(text)?;
                Ok(InsertionResult { strategy: ActiveStrategy::Clipboard, success: true })
            } else {
                // X11 or unknown
                if try_xdotool(text) {
                    return Ok(InsertionResult { strategy: ActiveStrategy::Xdotool, success: true });
                }
                clipboard_paste(text)?;
                Ok(InsertionResult { strategy: ActiveStrategy::Clipboard, success: true })
            }
        }
        "type-simulation" => {
            if session == "wayland" {
                if try_wtype(text) {
                    return Ok(InsertionResult { strategy: ActiveStrategy::Wtype, success: true });
                }
            } else {
                if try_xdotool(text) {
                    return Ok(InsertionResult { strategy: ActiveStrategy::Xdotool, success: true });
                }
            }
            Err("Type simulation failed. Is wtype/xdotool installed?".to_string())
        }
        _ => {
            clipboard_paste(text)?;
            Ok(InsertionResult { strategy: ActiveStrategy::Clipboard, success: true })
        }
    }
}

fn try_wtype(text: &str) -> bool {
    Command::new("wtype")
        .arg("--")
        .arg(text)
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn try_xdotool(text: &str) -> bool {
    Command::new("xdotool")
        .arg("type")
        .arg("--clearmodifiers")
        .arg("--delay")
        .arg("12")
        .arg("--")
        .arg(text)
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

fn clipboard_paste(text: &str) -> Result<(), String> {
    let session = detect_session();

    // Save current clipboard, set new content, paste, restore
    if session == "wayland" {
        // Get current clipboard
        let old = Command::new("wl-paste").arg("--no-newline").output().ok();

        // Set new clipboard content
        let mut child = Command::new("wl-copy")
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to run wl-copy: {e}"))?;

        if let Some(stdin) = child.stdin.as_mut() {
            use std::io::Write;
            stdin.write_all(text.as_bytes())
                .map_err(|e| format!("Failed to write to wl-copy: {e}"))?;
        }
        child.wait().map_err(|e| format!("wl-copy failed: {e}"))?;

        // Simulate Ctrl+V
        let _ = Command::new("wtype")
            .arg("-M")
            .arg("ctrl")
            .arg("-k")
            .arg("v")
            .arg("-m")
            .arg("ctrl")
            .status();

        // Small delay then restore clipboard
        std::thread::sleep(std::time::Duration::from_millis(100));
        if let Some(old_output) = old {
            if !old_output.stdout.is_empty() {
                let mut restore = Command::new("wl-copy")
                    .stdin(std::process::Stdio::piped())
                    .spawn()
                    .ok();
                if let Some(ref mut child) = restore {
                    if let Some(stdin) = child.stdin.as_mut() {
                        use std::io::Write;
                        let _ = stdin.write_all(&old_output.stdout);
                    }
                    let _ = child.wait();
                }
            }
        }
    } else {
        // X11: use xclip
        let old = Command::new("xclip")
            .args(["-selection", "clipboard", "-o"])
            .output()
            .ok();

        let mut child = Command::new("xclip")
            .args(["-selection", "clipboard"])
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to run xclip: {e}"))?;

        if let Some(stdin) = child.stdin.as_mut() {
            use std::io::Write;
            stdin.write_all(text.as_bytes())
                .map_err(|e| format!("Failed to write to xclip: {e}"))?;
        }
        child.wait().map_err(|e| format!("xclip failed: {e}"))?;

        // Simulate Ctrl+V via xdotool
        let _ = Command::new("xdotool")
            .args(["key", "--clearmodifiers", "ctrl+v"])
            .status();

        // Restore
        std::thread::sleep(std::time::Duration::from_millis(100));
        if let Some(old_output) = old {
            if !old_output.stdout.is_empty() {
                let mut restore = Command::new("xclip")
                    .args(["-selection", "clipboard"])
                    .stdin(std::process::Stdio::piped())
                    .spawn()
                    .ok();
                if let Some(ref mut child) = restore {
                    if let Some(stdin) = child.stdin.as_mut() {
                        use std::io::Write;
                        let _ = stdin.write_all(&old_output.stdout);
                    }
                    let _ = child.wait();
                }
            }
        }
    }

    Ok(())
}
