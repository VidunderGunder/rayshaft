import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// export type UseProps = {
// 	//
// };

export type AppInfo = {
	name: string;
	bundle_id?: string;
	version?: string;
	path?: string;
};

export function useApps(
	// {}: UseProps
) {
	const [apps, setApps] = useState<AppInfo[]>([]);

	useEffect(() => {
		invoke<AppInfo[]>("list_installed_apps").then(setApps).catch(console.error);
	}, []);

	return apps;
}

export function toggleApp(appPath?: string) {
	if (!appPath) return;
	invoke("toggle_app", { appPath });
}
