import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// export type UseProps = {
// 	//
// };

type AppInfo = {
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

export function handleLaunch(appPath?: string) {
	if (appPath) {
		invoke("launch_app", { appPath })
			.then(() => console.log("App launched"))
			.catch(console.error);
	}
}
