use tauri::AppHandle;
use tauri_nspanel::ManagerExt;
use serde::{Deserialize, Serialize};

use crate::SPOTLIGHT_LABEL;

#[tauri::command]
pub fn show(app_handle: AppHandle) {
    let panel = app_handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

    panel.show();
}

#[tauri::command]
pub fn hide(app_handle: AppHandle) {
    let panel = app_handle.get_webview_panel(SPOTLIGHT_LABEL).unwrap();

    if panel.is_visible() {
        panel.order_out(None);
    }
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub enum Variant {
    App,
    Url,
    Extension,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub struct Config {
    pub name: String,
    pub config_type: Variant,
    pub aliases: Vec<String>,
    pub hotkeys: Vec<Hotkey>,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub struct Hotkey {
    pub modifiers: Vec<String>,
    pub keyboard_key: String,
}
