use plist::Value;
use serde::Serialize;
use std::path::Path;
use std::process::Command;

#[derive(Serialize)]
pub struct AppInfo {
    pub name: String,
    pub bundle_id: Option<String>,
    pub path: Option<String>,
    pub version: Option<String>,
}

/// This command runs system_profiler to list applications, parses the plist,
/// and returns a vector of AppInfo.
#[tauri::command]
pub fn list_installed_apps() -> Result<Vec<AppInfo>, String> {
    // Run system_profiler to get XML output of installed applications.
    let output = Command::new("system_profiler")
        .args(&["SPApplicationsDataType", "-xml"])
        .output()
        .map_err(|e| format!("Failed to run system_profiler: {}", e))?;

    let xml_data =
        String::from_utf8(output.stdout).map_err(|e| format!("Invalid UTF-8 data: {}", e))?;

    // Parse the XML data using the plist crate.
    let plist = Value::from_reader_xml(xml_data.as_bytes())
        .map_err(|e| format!("Failed to parse plist: {}", e))?;

    let mut apps = Vec::new();
    if let Value::Array(items) = plist {
        // Each item is a dictionary that has a "_items" key containing the list.
        for item in items {
            if let Value::Dictionary(dict) = item {
                if let Some(Value::Array(app_items)) = dict.get("_items") {
                    for app_item in app_items {
                        if let Value::Dictionary(app_dict) = app_item {
                            // Try to get the app name directly
                            let name = if let Some(name_val) =
                                app_dict.get("name").and_then(|v| v.as_string())
                            {
                                name_val.to_string()
                            } else if let Some(path_val) =
                                app_dict.get("path").and_then(|v| v.as_string())
                            {
                                // Fallback: derive name from the filename of the path (without extension)
                                Path::new(path_val)
                                    .file_stem()
                                    .and_then(|os_str| os_str.to_str())
                                    .unwrap_or("Unknown")
                                    .to_string()
                            } else {
                                "Unknown".to_string()
                            };

                            let bundle_id = app_dict
                                .get("bundle_identifier")
                                .and_then(|v| v.as_string())
                                .map(|s| s.to_string());

                            let version = app_dict
                                .get("version")
                                .and_then(|v| v.as_string())
                                .map(|s| s.to_string());

                            let path = app_dict
                                .get("path")
                                .and_then(|v| v.as_string())
                                .map(|s| s.to_string());

                            apps.push(AppInfo {
                                name,
                                bundle_id,
                                version,
                                path,
                            });
                        }
                    }
                }
            }
        }
    } else {
        return Err("Unexpected plist format".into());
    }

    Ok(apps)
}

#[tauri::command]
pub fn toggle_app(app_path: String) -> Result<(), String> {
    //     // Verify the provided app path exists.
    //     let path = Path::new(&app_path);
    //     if !path.exists() {
    //         return Err(format!("App path does not exist: {}", app_path));
    //     }

    //     // Extract the app name (e.g., "Safari" from "/Applications/Safari.app")
    //     let app_name = path
    //         .file_stem()
    //         .and_then(|s| s.to_str())
    //         .ok_or_else(|| "Could not determine app name from path".to_string())?;

    //     // App toggle: https://brettterpstra.com/2011/01/22/quick-tip-applescript-application-toggle/
    //     let apple_script = format!(
    //         r#"
    // on run argv
    //     if (count of argv) < 1 then
    //         error "Missing argument: appName"
    //     end if

    //     set appName to item 1 of argv

    //     set startIt to false
    //     tell application "System Events"
    //         if not (exists process appName) then
    //             set startIt to true
    //         else if frontmost of process appName then
    //             set visible of process appName to false
    //         else
    //             set frontmost of process appName to true
    //         end if
    //     end tell
    //     if startIt then
    //         tell application appName to activate
    //     end if
    // end run
    //         "#,
    //     );

    //     // Execute the AppleScript using `osascript`
    //     let output = Command::new("osascript")
    //         .arg("-e")
    //         .arg(apple_script)
    //         .arg(&app_name)
    //         .output()
    //         .map_err(|e| format!("Failed to run AppleScript: {}", e))?;

    //     if !output.status.success() {
    //         let err_msg = String::from_utf8_lossy(&output.stderr);
    //         return Err(format!("AppleScript execution failed: {}", err_msg));
    //     }

    //     Ok(())
    Command::new("open")
        .arg(app_path)
        .spawn()
        .map_err(|e| format!("Failed to launch app: {}", e))?;
    Ok(())
}
