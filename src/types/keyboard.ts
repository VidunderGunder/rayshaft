import type { StringWithSuggestions } from ".";

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
	// Punctuation and symbol keys (US layout)
	| "Grave" // `
	| "Minus" // -
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
