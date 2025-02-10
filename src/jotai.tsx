import { atomWithStorage } from "jotai/utils";
import type { Config } from "./components/Settings";
import { withImmer } from "jotai-immer";
import { useAtom } from "jotai";
import { isEqualHotkey, type Hotkey } from "./components/Command";

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

export function useSettings() {
	const [settings, setSettings] = useAtom(settingsAtom);

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
		setSettings((draft) => {
			if (alias === "") return;

			const configIndex = id ? settings.findIndex((e) => e.id === id) : -1;
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
		setSettings((draft) => {
			if (alias === "") return;

			const configIndex = id ? settings.findIndex((e) => e.id === id) : -1;
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

	function addHotkey({
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
		setSettings((draft) => {
			const configIndex = id ? settings.findIndex((e) => e.id === id) : -1;
			const configExists = configIndex !== -1 && configIndex < draft.length;

			console.log({
				configIndex,
				configExists,
			});

			if (!defaults) return draft;

			const c: Config = configExists
				? draft[configIndex]
				: {
						id,
						...defaults,
						aliases: [],
						hotkeys: [hotkey],
					};

			if (!configExists) {
				draft.push(c);
				return draft;
			}

			const hotkeyIndex =
				typeof hotkey === "number"
					? hotkey
					: draft[configIndex].hotkeys.findIndex((h) =>
							isEqualHotkey(h, hotkey),
						);
			const hotkeyExists = hotkeyIndex !== -1;

			console.log({
				hotkeyIndex,
				hotkeyExists,
			});

			if (hotkeyExists) {
				return draft;
			}

			draft[configIndex].hotkeys.push(hotkey);

			return draft;
		});
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
		setSettings((draft) => {
			const configIndex = id ? settings.findIndex((e) => e.id === id) : -1;
			const configExists = configIndex !== -1 && configIndex < draft.length;
			console.log({
				configIndex,
				configExists,
			});

			if (!configExists) return draft;

			const hotkeyIndex =
				typeof hotkey === "number"
					? hotkey
					: draft[configIndex].hotkeys.findIndex((h) =>
							isEqualHotkey(h, hotkey),
						);
			const hotkeyExists = hotkeyIndex !== -1;

			console.log({
				hotkeyIndex,
				hotkeyExists,
			});

			if (!hotkeyExists) return draft;

			draft[configIndex].hotkeys.splice(hotkeyIndex, 1);

			return draft;
		});
	}

	function reset() {
		setSettings([]);
	}

	return {
		settings,
		setSettings,
		addAlias,
		removeAlias,
		addHotkey,
		removeHotkey,
		reset,
	};
}
