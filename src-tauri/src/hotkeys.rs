// src/hotkeys.rs

use tauri::{Manager, Runtime};
use tauri_nspanel::ManagerExt;
use tauri_plugin_global_shortcut::{
    Builder as GlobalShortcutBuilder, Code, Modifiers, Shortcut, ShortcutState,
};

use crate::window::WebviewWindowExt;

/// Builds and returns a plugin that registers two global shortcuts:
/// - Option + Command + K to toggle the spotlight panel.
/// - Control + Option + Command + N to launch Notes.
pub fn build_hotkey_plugin<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    GlobalShortcutBuilder::new()
        .with_shortcut(Shortcut::new(
            Some(Modifiers::ALT | Modifiers::SUPER),
            Code::KeyK,
        ))
        .unwrap()
        // Register the open panel hotkey.
        .with_handler(|app, shortcut, event| {
            // Only handle pressed events.
            if event.state != ShortcutState::Pressed {
                return;
            }
            if shortcut.matches(Modifiers::ALT | Modifiers::SUPER, Code::KeyK) {
                // Toggle the spotlight panel.
                // "main" here is assumed to be the label for your spotlight window.
                let window = app.get_webview_window("main").unwrap();
                let panel = app.get_webview_panel("main").unwrap();

                if panel.is_visible() {
                    panel.order_out(None);
                } else {
                    // Optionally center the window on the monitor where the cursor is.
                    if let Err(e) = window.center_at_cursor_monitor() {
                        eprintln!("Failed to center panel: {}", e);
                    }
                    panel.show();
                }
                return;
            }
        })
        .build()
}
