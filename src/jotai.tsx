import { atomWithStorage } from "jotai/utils";
import type { Config } from "./components/Settings";
import { withImmer } from "jotai-immer";

export const searchAtom = atomWithStorage("search", "");
export const indexAtom = atomWithStorage("index", 0);
export const disableEscapeAtom = atomWithStorage("disable-escape", false);

const _settingsAtom = atomWithStorage<Config[]>("settings", []);
export const settingsAtom = withImmer(_settingsAtom);
