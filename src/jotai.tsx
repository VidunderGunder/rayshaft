import { atomWithStorage } from "jotai/utils";

export const searchAtom = atomWithStorage("search", "");
export const indexAtom = atomWithStorage("index", 0);
