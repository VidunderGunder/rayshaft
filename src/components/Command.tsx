import { cn } from "@/styles/utils";
import {
	type Modifier,
	type KeyboardKey,
	hotkeyModifiers,
	hotkeyKeys,
} from "@/types/keyboard";
import { type ReactNode, type ComponentProps, Fragment, useState } from "react";
import {
	getLabelFromCode,
	Keyboard,
	KeyboardBase,
	type KeyboardProps,
	useKeyboard,
	useModifiers,
} from "./Keyboard";
import { Separator } from "./shadcn/separator";
import { useHotkeys } from "@mantine/hooks";

export type Hotkey = {
	modifiers: Modifier[];
	keyboardKey: KeyboardKey;
};

export function isEqualHotkey(a: Hotkey, b: Hotkey): boolean {
	if (a.modifiers.length !== b.modifiers.length) return false;
	if (a.keyboardKey !== b.keyboardKey) return false;

	for (let i = 0; i < a.modifiers.length; i++) {
		if (!b.modifiers.includes(a.modifiers[i])) {
			return false;
		}
	}

	return true;
}

export type CommandType = Hotkey & {
	label: ReactNode;
	disabled?: boolean;
};

export type CommandProps = {
	//
} & CommandType &
	Omit<ComponentProps<"div">, "label" | "children">;

export function Command({
	disabled = false,
	className,
	modifiers,
	keyboardKey,
	label,
	...props
}: CommandProps) {
	const { Alt, Control, Meta, Shift } = useModifiers();

	let irrelevant = disabled;

	if (Alt && !modifiers.includes("Alt")) {
		irrelevant = true;
	}

	if (!irrelevant && Control && !modifiers.includes("Control")) {
		irrelevant = true;
	}

	if (!irrelevant && Meta && !modifiers.includes("Meta")) {
		irrelevant = true;
	}

	if (!irrelevant && Shift && !modifiers.includes("Shift")) {
		irrelevant = true;
	}

	return (
		<div
			className={cn(
				"flex items-center gap-1.5",
				irrelevant ? "opacity-20" : "opacity-100",
				className,
			)}
			{...props}
		>
			<div className="flex gap-[1px]">
				{modifiers.map((code) => (
					<Keyboard key={code} interactive={!irrelevant} code={code} />
				))}
				{keyboardKey && (
					<Keyboard
						key={keyboardKey}
						interactive={!irrelevant}
						code={keyboardKey}
					/>
				)}
			</div>
			{label && <div className="text-sm text-white/75">{label}</div>}
		</div>
	);
}

export function CommandSeparator({
	className,
	...props
}: ComponentProps<typeof Separator>) {
	return (
		<Separator
			orientation="vertical"
			className={cn("h-[1.1rem]", className)}
			{...props}
		/>
	);
}

export type CommandsProps = { commands: CommandType[] } & ComponentProps<"div">;

export function Commands({ commands, className, ...props }: CommandsProps) {
	return (
		<div className={cn("flex items-center gap-3", className)} {...props}>
			{commands.map((command, i) => {
				const key = [...command.modifiers, command.keyboardKey].join("-");
				return (
					<Fragment key={key}>
						{i > 0 && <CommandSeparator />}
						<Command {...command} />
					</Fragment>
				);
			})}
		</div>
	);
}

type ConfirmProps = {
	onYes: () => void;
	onNo?: () => void;
	onBoth?: () => void;
} & ComponentProps<"div">;

export function Confirm({
	onYes,
	onNo,
	onBoth,
	className,
	...props
}: ConfirmProps) {
	useHotkeys(
		[
			[
				"Y",
				() => {
					onYes?.();
					onBoth?.();
				},
			],
			[
				"N",
				() => {
					onNo?.();
					onBoth?.();
				},
			],
		],
		[],
	);

	return (
		<div className={cn("flex items-center gap-3", className)} {...props}>
			<div className="pr-2 text-sm text-white/75 ">Sure?</div>
			<Commands
				commands={[
					{
						keyboardKey: "KeyY",
						modifiers: [],
						label: "Yes",
					},
					{
						keyboardKey: "KeyN",
						modifiers: [],
						label: "No",
					},
				]}
			/>
		</div>
	);
}

type HotkeyKeyboardProps = {
	onPressDown?: (code: string) => void;
	onPressUp?: (code: string) => void;
} & KeyboardProps;

export function HotkeyKeyboard({
	children,
	code,
	className,
	onPressDown,
	onPressUp,
	...props
}: HotkeyKeyboardProps) {
	const label = children ?? getLabelFromCode(code);
	const { pressed, isModifier } = useKeyboard(code, {
		onPressDown,
		onPressUp,
	});

	return (
		<KeyboardBase
			isModifier={isModifier}
			className={cn(
				pressed ? "border-gray-300 bg-gray-300" : "hidden",
				className,
			)}
			{...props}
		>
			{label}
		</KeyboardBase>
	);
}

export type HotkeyInputProps = {
	onHotkey: (hotkey: Hotkey) => void;
} & Omit<ComponentProps<"div">, "children">;

export function HotkeyInput({
	className,
	onHotkey,
	...props
}: HotkeyInputProps) {
	const [modifiers, setModifiers] = useState<Modifier[]>([]);
	const [keys, setKeys] = useState<Modifier[]>([]);

	return (
		<div className={cn("flex h-[10px] gap-[1px]", className)} {...props}>
			{modifiers.length === 0 && keys.length === 0 && (
				<span className="text-sm italic opacity-50">
					{" "}
					Press a combination of keys...
				</span>
			)}
			{hotkeyModifiers.map((code) => {
				return (
					<HotkeyKeyboard
						key={code}
						code={code}
						onPressDown={(code) => {
							if (modifiers.includes(code)) return;
							setModifiers((prev) => [...prev, code]);
						}}
						onPressUp={(code) => {
							const index = modifiers.findIndex((m) => m === code);
							if (index === -1) return;
							setModifiers((prev) => prev.toSpliced(index, 1));
						}}
					/>
				);
			})}
			{hotkeyKeys.map((code) => {
				return (
					<HotkeyKeyboard
						key={code}
						code={code}
						onPressDown={(code) => {
							if (keys.includes(code)) return;
							setKeys((prev) => [...prev, code]);
							if (modifiers.length === 0) return;
							onHotkey({
								keyboardKey: code,
								modifiers,
							});
						}}
						onPressUp={(code) => {
							const index = keys.findIndex((m) => m === code);
							if (index === -1) return;
							setKeys((prev) => prev.toSpliced(index, 1));
						}}
					/>
				);
			})}
		</div>
	);
}
