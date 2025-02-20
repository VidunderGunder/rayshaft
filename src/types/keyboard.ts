import type { Hotkey } from "@/components/Command";
import type { StringWithSuggestions } from ".";

export type SafeHotkey = {
	modifiers: SafeHotkeyModifier[];
	keyboard_key: SafeHotkeyKey;
};

export type Modifier = StringWithSuggestions<
	| "Shift"
	| "ShiftLeft"
	| "ShiftRight"
	| "Control"
	| "ControlLeft"
	| "ControlRight"
	| "Alt"
	| "AltLeft"
	| "AltRight"
	| "Meta"
	| "MetaLeft"
	| "MetaRight"
>;
export type KeyboardKey = StringWithSuggestions<
	// Alphanumeric
	| "KeyA"
	| "KeyB"
	| "KeyC"
	| "KeyD"
	| "KeyE"
	| "KeyF"
	| "KeyG"
	| "KeyH"
	| "KeyI"
	| "KeyJ"
	| "KeyK"
	| "KeyL"
	| "KeyM"
	| "KeyN"
	| "KeyO"
	| "KeyP"
	| "KeyQ"
	| "KeyR"
	| "KeyS"
	| "KeyT"
	| "KeyU"
	| "KeyV"
	| "KeyW"
	| "KeyX"
	| "KeyY"
	| "KeyZ"
	| "Digit0"
	| "Digit1"
	| "Digit2"
	| "Digit3"
	| "Digit4"
	| "Digit5"
	| "Digit6"
	| "Digit7"
	| "Digit8"
	| "Digit9"
	// Editing & Control keys
	| "Escape"
	| "Tab"
	| "CapsLock"
	| "Enter"
	| "Return"
	| "Backspace"
	| "Delete"
	| "Space"
	// Navigation keys
	| "ArrowUp"
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	| "Home"
	| "End"
	| "PageUp"
	| "PageDown"
	// Function keys (typically F1–F12 on Apple keyboards)
	| "F1"
	| "F2"
	| "F3"
	| "F4"
	| "F5"
	| "F6"
	| "F7"
	| "F8"
	| "F9"
	| "F10"
	| "F11"
	| "F12"
	// Punctuation and symbol keys
	| "Grave" // `
	| "Minus" // -
	| "Plus" // +
	| "Equal" // =
	| "BracketLeft" // [
	| "BracketRight" // ]
	| "Backslash" // \
	| "Semicolon" // ;
	| "Quote" // '
	| "Comma" // ,
	| "Period" // .
	| "Slash" // /
>;

export const hotkeyModifiers = [
	"Shift",
	"Control",
	"Alt",
	"Meta",
] as const satisfies Modifier[];

export type SafeHotkeyModifier = (typeof hotkeyModifiers)[number];

export const hotkeyKeys = [
	"KeyA",
	"KeyB",
	"KeyC",
	"KeyD",
	"KeyE",
	"KeyF",
	"KeyG",
	"KeyH",
	"KeyI",
	"KeyJ",
	"KeyK",
	"KeyL",
	"KeyM",
	"KeyN",
	"KeyO",
	"KeyP",
	"KeyQ",
	"KeyR",
	"KeyS",
	"KeyT",
	"KeyU",
	"KeyV",
	"KeyW",
	"KeyX",
	"KeyY",
	"KeyZ",
	"Digit0",
	"Digit1",
	"Digit2",
	"Digit3",
	"Digit4",
	"Digit5",
	"Digit6",
	"Digit7",
	"Digit8",
	"Digit9",
] as const satisfies KeyboardKey[];

export type SafeHotkeyKey = (typeof hotkeyKeys)[number];

export const hotkeyModifierWebToMantine = {
	Meta: "Meta",
	Alt: "alt",
	Control: "ctrl",
	Shift: "shift",
} as const satisfies Record<SafeHotkeyModifier, string>;

export const hotkeyModifierWebToPlugin = {
	Meta: "Command",
	Alt: "Option",
	Control: "Control",
	Shift: "Shift",
} as const satisfies Record<SafeHotkeyModifier, string>;

export function isHotkeyModifier(
	modifier: string,
): modifier is SafeHotkeyModifier {
	return (hotkeyModifiers as string[]).includes(modifier);
}

export function safeHotkeyModifier(
	modifier: string,
): SafeHotkeyModifier | undefined {
	if (!isHotkeyModifier(modifier)) return;
	return modifier;
}

export const hotkeyKeyWebToMantine = {
	KeyA: "A",
	KeyB: "B",
	KeyC: "C",
	KeyD: "D",
	KeyE: "E",
	KeyF: "F",
	KeyG: "G",
	KeyH: "H",
	KeyI: "I",
	KeyJ: "J",
	KeyK: "K",
	KeyL: "L",
	KeyM: "M",
	KeyN: "N",
	KeyO: "O",
	KeyP: "P",
	KeyQ: "Q",
	KeyR: "R",
	KeyS: "S",
	KeyT: "T",
	KeyU: "U",
	KeyV: "V",
	KeyW: "W",
	KeyX: "X",
	KeyY: "Y",
	KeyZ: "Z",
	Digit0: "0",
	Digit1: "1",
	Digit2: "2",
	Digit3: "3",
	Digit4: "4",
	Digit5: "5",
	Digit6: "6",
	Digit7: "7",
	Digit8: "8",
	Digit9: "9",
} as const satisfies Partial<Record<KeyboardKey, string>> &
	Record<SafeHotkeyKey, string>;

export const hotkeyKeyWebToPlugin = {
	KeyA: "A",
	KeyB: "B",
	KeyC: "C",
	KeyD: "D",
	KeyE: "E",
	KeyF: "F",
	KeyG: "G",
	KeyH: "H",
	KeyI: "I",
	KeyJ: "J",
	KeyK: "K",
	KeyL: "L",
	KeyM: "M",
	KeyN: "N",
	KeyO: "O",
	KeyP: "P",
	KeyQ: "Q",
	KeyR: "R",
	KeyS: "S",
	KeyT: "T",
	KeyU: "U",
	KeyV: "V",
	KeyW: "W",
	KeyX: "X",
	KeyY: "Y",
	KeyZ: "Z",
	Digit0: "0",
	Digit1: "1",
	Digit2: "2",
	Digit3: "3",
	Digit4: "4",
	Digit5: "5",
	Digit6: "6",
	Digit7: "7",
	Digit8: "8",
	Digit9: "9",
} as const satisfies Record<SafeHotkeyKey, string>;

export function isSafeHotkeyKey(
	keyboard_key: string,
): keyboard_key is SafeHotkeyKey {
	return (hotkeyKeys as string[]).includes(keyboard_key);
}

export function getSafeHotkeyKey(
	keyboard_key: string,
): SafeHotkeyKey | undefined {
	if (!isSafeHotkeyKey(keyboard_key)) return;
	return keyboard_key;
}

export function getSafeHotkey(hotkey: Hotkey): SafeHotkey | undefined {
	for (const modifier of hotkey.modifiers) {
		if (!isHotkeyModifier(modifier)) return;
	}
	if (!isSafeHotkeyKey(hotkey.keyboard_key)) return;
	return hotkey as SafeHotkey;
}

export function getSafeHotkeyString(hotkey: Hotkey): string | undefined {
	const safeHotkey = getSafeHotkey(hotkey);
	if (!safeHotkey) return;
	return [
		...safeHotkey.modifiers.map(
			(modifier) => hotkeyModifierWebToPlugin[modifier as SafeHotkeyModifier],
		),
		hotkeyKeyWebToPlugin[safeHotkey.keyboard_key],
	].join("+");
}

// type SafeHotkeyModifier = ("Shift" | "Control" | "Alt" | "Meta")
export function sortSafeModifiers(
	modifiers: SafeHotkeyModifier[],
): SafeHotkeyModifier[] {
	const modifierOrder: Record<SafeHotkeyModifier, number> = {
		Shift: 0,
		Control: 1,
		Alt: 2,
		Meta: 3,
	};

	return modifiers.slice().sort((a, b) => modifierOrder[a] - modifierOrder[b]);
}
