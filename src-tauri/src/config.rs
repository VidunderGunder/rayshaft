use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;

#[derive(Serialize, Debug, Clone, Deserialize)]
pub enum Variant {
    App,
    Url,
    Extension,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub enum Modifier {
    Shift,
    Control,
    Alt,
    Meta,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub enum KeyboardKey {
    KeyA,
    KeyB,
    KeyC,
    KeyD,
    KeyE,
    KeyF,
    KeyG,
    KeyH,
    KeyI,
    KeyJ,
    KeyK,
    KeyL,
    KeyM,
    KeyN,
    KeyO,
    KeyP,
    KeyQ,
    KeyR,
    KeyS,
    KeyT,
    KeyU,
    KeyV,
    KeyW,
    KeyX,
    KeyY,
    KeyZ,
    Digit0,
    Digit1,
    Digit2,
    Digit3,
    Digit4,
    Digit5,
    Digit6,
    Digit7,
    Digit8,
    Digit9,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub struct Hotkey {
    pub modifiers: Vec<String>,
    pub keyboard_key: String,
}

#[derive(Serialize, Debug, Clone, Deserialize)]
pub struct Config {
    pub id: String,
    pub name: String,
    pub variant: Variant,
    pub aliases: Vec<String>,
    pub hotkeys: Vec<Hotkey>,
    pub path: Option<String>,
}

pub type Configs = Vec<Config>;

#[tauri::command]
pub fn sync_configs(state: State<'_, Mutex<AppState>>, configs: Configs) -> Vec<Config> {
    let mut state = match state.lock() {
        Ok(guard) => guard,
        Err(poison_error) => {
            eprintln!("Warning: Mutex was poisoned. Recovering inner state.");
            poison_error.into_inner()
        }
    };

    state.configs = configs;

    state.configs.clone()
}
