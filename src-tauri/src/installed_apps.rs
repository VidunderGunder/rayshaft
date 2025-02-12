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

/// Launch an app given its full path.
/// On macOS, the "open" command can be used.
#[tauri::command]
pub fn launch_app(app_path: String) -> Result<(), String> {
    Command::new("open")
        .arg(app_path)
        .spawn()
        .map_err(|e| format!("Failed to launch app: {}", e))?;
    Ok(())
}
