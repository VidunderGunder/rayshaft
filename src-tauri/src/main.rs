#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Listener, Manager};
use window::WebviewWindowExt;

mod command;
mod window;
mod installed_apps;
mod hotkeys;

pub const SPOTLIGHT_LABEL: &str = "main";

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![installed_apps::list_installed_apps, installed_apps::launch_app, command::show, command::hide])
        .plugin(tauri_nspanel::init())
        .setup(move |app| {
            // Set activation policy to Accessory to prevent the app icon from showing on the dock
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            let handle = app.app_handle();

            let window = handle.get_webview_window(SPOTLIGHT_LABEL).unwrap();

            // Convert the window to a spotlight panel
            let panel = window.to_spotlight_panel()?;

            handle.listen(
                format!("{}_panel_did_resign_key", SPOTLIGHT_LABEL),
                move |_| {
                    // Hide the panel when it's no longer the key window
                    // This ensures the panel doesn't remain visible when it's not actively being used
                    panel.order_out(None);
                },
            );

            Ok(())
        })
        .plugin(hotkeys::build_hotkey_plugin())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
