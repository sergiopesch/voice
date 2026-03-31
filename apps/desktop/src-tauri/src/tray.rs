use tauri::{
    menu::{MenuBuilder, MenuItem, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder},
    tray::TrayIconBuilder,
    Manager,
};
use log::{error, info};
use std::sync::Mutex;

const HOTKEY_PRESETS: &[&str] = &[
    "Alt+D",
    "Alt+Shift+D",
];

/// Holds the tray icon ID and toggle menu item for runtime updates
pub struct TrayState {
    pub tray_id: String,
    pub toggle_item: MenuItem<tauri::Wry>,
    pub current_hotkey: String,
    pub hotkey_items: Vec<(String, MenuItem<tauri::Wry>)>,
    pub recording: bool,
    pub microphone_ready: bool,
}

pub type TrayMutex = Mutex<TrayState>;

#[derive(Copy, Clone)]
enum TrayVisualState {
    NotReady,
    Ready,
    Recording,
}

fn tray_debug_enabled() -> bool {
    std::env::var("VOICE_TRAY_DEBUG")
        .map(|value| {
            matches!(
                value.trim().to_ascii_lowercase().as_str(),
                "1" | "true" | "yes" | "on"
            )
        })
        .unwrap_or(false)
}

fn tray_state_label(state: TrayVisualState) -> &'static str {
    match state {
        TrayVisualState::NotReady => "not-ready",
        TrayVisualState::Ready => "ready",
        TrayVisualState::Recording => "recording",
    }
}

pub fn setup_tray(app: &tauri::App, hotkey_label: &str) -> Result<(), Box<dyn std::error::Error>> {
    let quit = MenuItemBuilder::with_id("quit", "Quit Voice").build(app)?;
    let toggle = MenuItemBuilder::with_id("toggle", "Start Dictation").build(app)?;

    // Build hotkey submenu with presets
    let mut hotkey_submenu = SubmenuBuilder::with_id(app, "hotkey_menu", "Change Hotkey");
    let mut hotkey_items: Vec<(String, MenuItem<tauri::Wry>)> = Vec::new();

    for &preset in HOTKEY_PRESETS {
        let label = if preset == hotkey_label {
            format!("✓ {preset}")
        } else {
            format!("  {preset}")
        };
        let id = format!("hotkey:{preset}");
        let item = MenuItemBuilder::with_id(&id, &label).build(app)?;
        hotkey_submenu = hotkey_submenu.item(&item);
        hotkey_items.push((preset.to_string(), item));
    }

    hotkey_submenu = hotkey_submenu.separator();
    let edit_config = MenuItemBuilder::with_id("edit_config", "Custom...").build(app)?;
    hotkey_submenu = hotkey_submenu.item(&edit_config);

    let hotkey_menu = hotkey_submenu.build()?;

    let menu = MenuBuilder::new(app)
        .item(&toggle)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&hotkey_menu)
        .item(&PredefinedMenuItem::separator(app)?)
        .item(&quit)
        .build()?;

    let icon_rgba = create_mic_icon(32, [140, 140, 140, 235], TrayVisualState::NotReady);
    let icon = tauri::image::Image::new_owned(icon_rgba, 32, 32);

    let tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .tooltip("Voice — Initializing microphone...")
        .on_menu_event(move |app, event| {
            let id = event.id().as_ref();
            match id {
                "quit" => {
                    app.exit(0);
                }
                "toggle" => {
                    crate::eval_toggle(app);
                }
                "edit_config" => {
                    open_config_file();
                }
                id if id.starts_with("hotkey:") => {
                    let new_hotkey = id.strip_prefix("hotkey:").unwrap();
                    if let Err(e) = crate::change_hotkey_runtime(app, new_hotkey) {
                        error!("Failed to change hotkey: {e}");
                    }
                }
                _ => {}
            }
        })
        .build(app)?;

    let tray_id = tray.id().as_ref().to_string();
    app.manage(Mutex::new(TrayState {
        tray_id,
        toggle_item: toggle,
        current_hotkey: hotkey_label.to_string(),
        hotkey_items,
        recording: false,
        microphone_ready: false,
    }));

    Ok(())
}

/// Update the hotkey checkmarks in the tray menu
pub fn update_hotkey_display(app: &tauri::AppHandle, new_hotkey: &str) {
    let state = app.state::<TrayMutex>();
    let Ok(mut tray_state) = state.lock() else { return };

    tray_state.current_hotkey = new_hotkey.to_string();

    for (preset, item) in &tray_state.hotkey_items {
        let label = if preset == new_hotkey {
            format!("✓ {preset}")
        } else {
            format!("  {preset}")
        };
        let _ = item.set_text(&label);
    }
}

fn open_config_file() {
    let config_path = dirs::config_dir()
        .map(|d| d.join("voice/config.json"))
        .unwrap_or_default();

    if config_path.exists() {
        if let Err(e) = std::process::Command::new("xdg-open")
            .arg(&config_path)
            .spawn()
        {
            error!("Failed to open config file: {e}");
        } else {
            info!("Opened config file: {}", config_path.display());
        }
    } else {
        error!("Config file not found: {}", config_path.display());
    }
}

/// Update the tray icon and menu to reflect recording state.
pub fn set_recording_state(app: &tauri::AppHandle, recording: bool) {
    let state = app.state::<TrayMutex>();
    let Ok(mut tray_state) = state.lock() else {
        error!("Failed to lock tray state");
        return;
    };

    tray_state.recording = recording;
    apply_tray_state(app, &tray_state);
}

/// Update microphone readiness state in tray icon and tooltip.
pub fn update_microphone_ready(app: &tauri::AppHandle, ready: bool) {
    let state = app.state::<TrayMutex>();
    let Ok(mut tray_state) = state.lock() else {
        error!("Failed to lock tray state");
        return;
    };

    tray_state.microphone_ready = ready;
    apply_tray_state(app, &tray_state);
}

fn apply_tray_state(app: &tauri::AppHandle, tray_state: &TrayState) {
    let (state, color, tooltip) = if tray_state.recording {
        (
            TrayVisualState::Recording,
            [255, 80, 80, 240],
            "Voice — Recording...",
        )
    } else if tray_state.microphone_ready {
        (TrayVisualState::Ready, [76, 201, 124, 240], "Voice — Ready")
    } else {
        (
            TrayVisualState::NotReady,
            [140, 140, 140, 235],
            "Voice — Microphone not ready",
        )
    };

    let debug_enabled = tray_debug_enabled();
    let effective_tooltip = if debug_enabled {
        format!("{tooltip} [dbg:{}]", tray_state_label(state))
    } else {
        tooltip.to_string()
    };

    let icon_rgba = create_mic_icon(32, color, state);
    let icon = tauri::image::Image::new_owned(icon_rgba, 32, 32);

    if let Some(tray) = app.tray_by_id(&tray_state.tray_id) {
        if let Err(e) = tray.set_icon(Some(icon)) {
            error!("Failed to set tray icon: {e}");
        }
        if let Err(e) = tray.set_tooltip(Some(&effective_tooltip)) {
            error!("Failed to set tray tooltip: {e}");
        }

        if debug_enabled {
            info!(
                "Tray update -> state={}, color=rgba({},{},{},{}), recording={}, microphone_ready={}, tooltip='{}'",
                tray_state_label(state),
                color[0],
                color[1],
                color[2],
                color[3],
                tray_state.recording,
                tray_state.microphone_ready,
                effective_tooltip
            );
        }
    }

    let label = if tray_state.recording {
        "Stop Dictation"
    } else {
        "Start Dictation"
    };
    let _ = tray_state.toggle_item.set_text(label);
}

/// Update just the tray tooltip
pub fn update_tray_tooltip(app: &tauri::AppHandle, tooltip: &str) {
    let state = app.state::<TrayMutex>();
    let Ok(tray_state) = state.lock() else { return };
    if let Some(tray) = app.tray_by_id(&tray_state.tray_id) {
        let _ = tray.set_tooltip(Some(tooltip));
    }
}

fn create_mic_icon(size: u32, color: [u8; 4], state: TrayVisualState) -> Vec<u8> {
    let mut pixels = create_base_mic_icon(size, color);
    draw_state_badge(&mut pixels, size, state);
    pixels
}

fn create_base_mic_icon(size: u32, color: [u8; 4]) -> Vec<u8> {
    let mut pixels = vec![0u8; (size * size * 4) as usize];
    let s = size as f32;

    for py in 0..size {
        for px in 0..size {
            let x = px as f32;
            let y = py as f32;

            let nx = x / s;
            let ny = y / s;

            let alpha = mic_shape(nx, ny);

            if alpha > 0.0 {
                let idx = ((py * size + px) * 4) as usize;
                let a = (alpha.min(1.0) * color[3] as f32) as u8;
                pixels[idx] = color[0];
                pixels[idx + 1] = color[1];
                pixels[idx + 2] = color[2];
                pixels[idx + 3] = a;
            }
        }
    }

    pixels
}

fn draw_state_badge(pixels: &mut [u8], size: u32, state: TrayVisualState) {
    match state {
        TrayVisualState::NotReady => {
            // A high-contrast slash keeps "not ready" visible in monochrome trays.
            draw_line(pixels, size, 9, 23, 23, 9, [255, 255, 255, 235], 1.5);
            draw_line(pixels, size, 10, 23, 23, 10, [255, 255, 255, 160], 1.0);
        }
        TrayVisualState::Ready => {
            // Check mark also survives panel desaturation.
            draw_line(pixels, size, 9, 18, 13, 22, [255, 255, 255, 235], 1.6);
            draw_line(pixels, size, 13, 22, 22, 12, [255, 255, 255, 235], 1.6);
        }
        TrayVisualState::Recording => {
            // Bright center dot for active capture.
            draw_filled_circle(pixels, size, 22.0, 10.0, 3.2, [255, 255, 255, 245]);
        }
    }
}

fn draw_line(
    pixels: &mut [u8],
    size: u32,
    x0: i32,
    y0: i32,
    x1: i32,
    y1: i32,
    color: [u8; 4],
    thickness: f32,
) {
    let min_x = (x0.min(x1) as f32 - thickness - 1.0).floor().max(0.0) as i32;
    let max_x = (x0.max(x1) as f32 + thickness + 1.0).ceil().min(size as f32 - 1.0) as i32;
    let min_y = (y0.min(y1) as f32 - thickness - 1.0).floor().max(0.0) as i32;
    let max_y = (y0.max(y1) as f32 + thickness + 1.0).ceil().min(size as f32 - 1.0) as i32;

    let ax = x0 as f32;
    let ay = y0 as f32;
    let bx = x1 as f32;
    let by = y1 as f32;
    let abx = bx - ax;
    let aby = by - ay;
    let ab_len_sq = (abx * abx + aby * aby).max(0.0001);

    for py in min_y..=max_y {
        for px in min_x..=max_x {
            let px_f = px as f32;
            let py_f = py as f32;

            let apx = px_f - ax;
            let apy = py_f - ay;
            let t = ((apx * abx + apy * aby) / ab_len_sq).clamp(0.0, 1.0);
            let cx = ax + abx * t;
            let cy = ay + aby * t;

            let dx = px_f - cx;
            let dy = py_f - cy;
            let dist = (dx * dx + dy * dy).sqrt();

            if dist <= thickness {
                let softness = 0.8;
                let alpha_factor = (1.0 - ((dist - (thickness - softness)).max(0.0) / softness))
                    .clamp(0.0, 1.0);
                blend_pixel(pixels, size, px, py, color, alpha_factor);
            }
        }
    }
}

fn draw_filled_circle(
    pixels: &mut [u8],
    size: u32,
    cx: f32,
    cy: f32,
    radius: f32,
    color: [u8; 4],
) {
    let min_x = (cx - radius - 1.0).floor().max(0.0) as i32;
    let max_x = (cx + radius + 1.0).ceil().min(size as f32 - 1.0) as i32;
    let min_y = (cy - radius - 1.0).floor().max(0.0) as i32;
    let max_y = (cy + radius + 1.0).ceil().min(size as f32 - 1.0) as i32;

    for py in min_y..=max_y {
        for px in min_x..=max_x {
            let dx = px as f32 - cx;
            let dy = py as f32 - cy;
            let dist = (dx * dx + dy * dy).sqrt();
            if dist <= radius {
                let alpha_factor = (1.0 - (dist / radius).powf(2.2)).clamp(0.4, 1.0);
                blend_pixel(pixels, size, px, py, color, alpha_factor);
            }
        }
    }
}

fn blend_pixel(
    pixels: &mut [u8],
    size: u32,
    x: i32,
    y: i32,
    color: [u8; 4],
    alpha_factor: f32,
) {
    if x < 0 || y < 0 || x >= size as i32 || y >= size as i32 {
        return;
    }

    let idx = (((y as u32) * size + (x as u32)) * 4) as usize;

    let src_a = ((color[3] as f32 / 255.0) * alpha_factor).clamp(0.0, 1.0);
    let dst_a = (pixels[idx + 3] as f32 / 255.0).clamp(0.0, 1.0);
    let out_a = src_a + dst_a * (1.0 - src_a);

    if out_a <= 0.0 {
        return;
    }

    let blend_channel = |src: u8, dst: u8| -> u8 {
        let src_c = src as f32 / 255.0;
        let dst_c = dst as f32 / 255.0;
        let out_c = (src_c * src_a + dst_c * dst_a * (1.0 - src_a)) / out_a;
        (out_c * 255.0).round().clamp(0.0, 255.0) as u8
    };

    pixels[idx] = blend_channel(color[0], pixels[idx]);
    pixels[idx + 1] = blend_channel(color[1], pixels[idx + 1]);
    pixels[idx + 2] = blend_channel(color[2], pixels[idx + 2]);
    pixels[idx + 3] = (out_a * 255.0).round().clamp(0.0, 255.0) as u8;
}

fn mic_shape(nx: f32, ny: f32) -> f32 {
    let cx = 0.5;

    let cap_cx = cx;
    let cap_cy = 0.28;
    let cap_rx = 0.22;
    let cap_ry = 0.28;
    let dx = (nx - cap_cx) / cap_rx;
    let dy = (ny - cap_cy) / cap_ry;
    let cap_dist = dx * dx + dy * dy;
    if cap_dist <= 1.0 {
        return smooth_edge(1.0 - cap_dist, 0.08);
    }

    let arc_cy = 0.62;
    let arc_rx = 0.28;
    let arc_ry = 0.10;
    let arc_dx = (nx - cx) / arc_rx;
    let arc_dy = (ny - arc_cy) / arc_ry;
    let arc_dist = arc_dx * arc_dx + arc_dy * arc_dy;
    if (0.7..=1.0).contains(&arc_dist) && ny > 0.56 {
        return smooth_edge(1.0 - (arc_dist - 0.85).abs() / 0.15, 0.3);
    }

    let stand_hw = 0.04;
    if (nx - cx).abs() < stand_hw && ny > 0.62 && ny < 0.82 {
        return smooth_edge(1.0 - (nx - cx).abs() / stand_hw, 0.3);
    }

    let base_hw = 0.20;
    let base_h = 0.06;
    let base_y = 0.82;
    if (nx - cx).abs() < base_hw && ny >= base_y && ny < base_y + base_h {
        let edge_x = smooth_edge(1.0 - (nx - cx).abs() / base_hw, 0.15);
        let edge_y = smooth_edge(1.0 - ((ny - base_y - base_h / 2.0).abs() / (base_h / 2.0)), 0.3);
        return edge_x.min(edge_y);
    }

    0.0
}

fn smooth_edge(v: f32, softness: f32) -> f32 {
    if softness <= 0.0 {
        return if v > 0.0 { 1.0 } else { 0.0 };
    }
    (v / softness).clamp(0.0, 1.0)
}
