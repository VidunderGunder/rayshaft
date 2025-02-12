import { atomWithStorage } from "jotai/utils";
import type { Config, ConfigVariant } from "./components/Settings";
import { withImmer } from "jotai-immer";
import { useAtom } from "jotai";
import { isEqualHotkey, type Hotkey } from "./components/Command";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect } from "react";
import {
	register,
	unregister,
	isRegistered,
} from "@tauri-apps/plugin-global-shortcut";
import { launchApp } from "./hooks/useApps";
import {
	getSafeHotkey,
	hotkeyModifierWebToPlugin,
	getSafeHotkeyString,
} from "./types/keyboard";

// ASCII Text Generator:
// https://patorjk.com/software/taag/#p=display&f=Elite&t=Hello%20World

/**
▄▄▄▄▄       ▄▄▄·    ▄▄▌  ▄▄▄ . ▌ ▐·▄▄▄ .▄▄▌  
•██  ▪     ▐█ ▄█    ██•  ▀▄.▀·▪█·█▌▀▄.▀·██•  
 ▐█.▪ ▄█▀▄  ██▀·    ██▪  ▐▀▀▪▄▐█▐█•▐▀▀▪▄██▪  
 ▐█▌·▐█▌.▐▌▐█▪·•    ▐█▌▐▌▐█▄▄▌ ███ ▐█▄▄▌▐█▌▐▌
 ▀▀▀  ▀█▄▀▪.▀       .▀▀▀  ▀▀▀ . ▀   ▀▀▀ .▀▀▀ 
*/

export const searchAtom = atomWithStorage("search", "");
export const indexAtom = atomWithStorage("index", 0);

/**

.▄▄ · ▄▄▄ .▄▄▄▄▄▄▄▄▄▄▪   ▐ ▄  ▄▄ • .▄▄ · 
▐█ ▀. ▀▄.▀·•██  •██  ██ •█▌▐█▐█ ▀ ▪▐█ ▀. 
▄▀▀▀█▄▐▀▀▪▄ ▐█.▪ ▐█.▪▐█·▐█▐▐▌▄█ ▀█▄▄▀▀▀█▄
▐█▄▪▐█▐█▄▄▌ ▐█▌· ▐█▌·▐█▌██▐█▌▐█▄▪▐█▐█▄▪▐█
 ▀▀▀▀  ▀▀▀  ▀▀▀  ▀▀▀ ▀▀▀▀▀ █▪·▀▀▀▀  ▀▀▀▀ 
*/

const settingsStorageAtom = atomWithStorage<Config[]>("settings", []);
export const settingsAtom = withImmer(settingsStorageAtom);

function syncConfigs(configs: Config[]) {
	invoke("sync_configs", {
		configs,
	});
}

export function useConfigs() {
	const [configs, setConfigs] = useAtom(settingsAtom);
	const configsExist = configs.length;

	function addAlias({
		id,
		alias,
		defaults,
	}: {
		id: string;
		alias: string;
		/**
		 * Passing defaults enables creating a new config if it doesn't already exist
		 */
		defaults?: Omit<Config, "id" | "aliases" | "hotkeys">;
	}) {
		setConfigs((draft) => {
			if (alias === "") return;

			const configIndex = id ? configs.findIndex((e) => e.id === id) : -1;
			const exists = configIndex !== -1 && configIndex < draft.length;

			if (!defaults) return draft;

			const c: Config = exists
				? draft[configIndex]
				: {
						id,
						...defaults,
						aliases: [alias],
						hotkeys: [],
					};

			if (!exists) {
				draft.push(c);
				return draft;
			}

			if (draft[configIndex].aliases.includes(alias)) {
				return draft;
			}

			draft[configIndex].aliases.push(alias);

			return draft;
		});
	}

	function removeAlias({
		id,
		alias,
	}: {
		id: string;
		/**
		 * Either the alias `string` or the alias index `number`
		 */
		alias: string | number;
	}) {
		setConfigs((draft) => {
			if (alias === "") return;

			const configIndex = id ? configs.findIndex((e) => e.id === id) : -1;
			const configExists = configIndex !== -1 && configIndex < draft.length;

			if (!configExists) return draft;

			const aliasIndex =
				typeof alias === "number"
					? alias
					: draft[configIndex].aliases.findIndex((a) => a === alias);
			const aliasExists = aliasIndex !== -1;

			if (!aliasExists) return draft;

			draft[configIndex].aliases.splice(aliasIndex, 1);

			return draft;
		});
	}

	async function addHotkey({
		id,
		hotkey,
		defaults,
	}: {
		id: string;
		/**
		 * Either the alias `string` or the alias index `number`
		 */
		hotkey: Hotkey;
		defaults?: Omit<Config, "id" | "aliases" | "hotkeys">;
	}) {
		const safeHotkey = getSafeHotkey(hotkey);
		if (!safeHotkey) return;

		const safeHotkeyString = getSafeHotkeyString(hotkey);
		if (!safeHotkeyString) return;

		if (!defaults) return;

		const registered = await isRegistered(safeHotkeyString);
		if (registered) {
			return;
		}

		let shouldRegister = false;

		setConfigs((draft) => {
			const configIndex = id ? configs.findIndex((e) => e.id === id) : -1;
			const configExists = configIndex !== -1 && configIndex < draft.length;

			const c: Config = configExists
				? draft[configIndex]
				: {
						id,
						...defaults,
						aliases: [],
						hotkeys: [safeHotkey],
					};

			if (!configExists) {
				shouldRegister = true;
				draft.push(c);
				return draft;
			}

			const hotkeyIndex = draft[configIndex].hotkeys.findIndex((h) =>
				isEqualHotkey(h, hotkey),
			);
			const hotkeyExists = hotkeyIndex !== -1;

			if (hotkeyExists) {
				return draft;
			}

			shouldRegister = true;

			draft[configIndex].hotkeys.push(hotkey);

			return draft;
		});

		if (!shouldRegister) return;
		setTimeout(() => {
			register(safeHotkeyString, () => {
				if (defaults.variant === "App") {
					launchApp(defaults.path);
				}
			});
		}, 1000);
	}

	function removeHotkey({
		id,
		hotkey,
	}: {
		id: string;
		/**
		 * Either the hotkey `Hotkey` or the hotkey index `number`
		 */
		hotkey: Hotkey | number;
	}) {
		setConfigs((draft) => {
			const configIndex = id ? configs.findIndex((e) => e.id === id) : -1;
			const configExists = configIndex !== -1 && configIndex < draft.length;

			if (!configExists) return draft;

			const hotkeyIndex =
				typeof hotkey === "number"
					? hotkey
					: draft[configIndex].hotkeys.findIndex((h) =>
							isEqualHotkey(h, hotkey),
						);
			const hotkeyExists = hotkeyIndex !== -1;

			if (!hotkeyExists) return draft;

			const existingHotkey = configs[configIndex].hotkeys[hotkeyIndex];
			const existingHotkeyString = getSafeHotkeyString(existingHotkey);
			if (existingHotkeyString) unregister(existingHotkeyString);

			draft[configIndex].hotkeys.splice(hotkeyIndex, 1);

			return draft;
		});
	}

	function reset() {
		setConfigs([]);
	}

	useEffect(() => {
		syncConfigs(configs);
	}, [configs]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <We only want initial values>
	const init = useCallback(
		function init() {
			for (const config of configs) {
				for (const hotkey of config.hotkeys) {
					const safeHotkeyString = getSafeHotkeyString(hotkey);
					if (!safeHotkeyString) continue;
					isRegistered(safeHotkeyString).then((v) => {
						if (v) return;
						register(safeHotkeyString, () => {
							if (config.variant === "App") {
								launchApp(config.path);
								return;
							}
						});
					});
				}
			}
		},
		[configsExist],
	);

	return {
		init,
		configs,
		setConfigs,
		addAlias,
		removeAlias,
		addHotkey,
		removeHotkey,
		reset,
	};
}
