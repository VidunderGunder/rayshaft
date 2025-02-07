import { cn } from "@/styles/utils";
import type { Modifier, KeyboardKey } from "@/types/keyboard";
import type { ReactNode, ComponentProps } from "react";
import { Keyboard, useModifiers } from "./Keyboard";

export type CommandType = {
	modifiers: Modifier[];
	keyboardKey: KeyboardKey;
	label: ReactNode;
};

export type CommandProps = CommandType &
	Omit<ComponentProps<"div">, "label" | "children">;

export function Command({
	className,
	modifiers,
	keyboardKey,
	label,
	...props
}: CommandProps) {
	const { Alt, Control, Meta, Shift } = useModifiers();

	let irrelevant = false;

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
				"flex items-center gap-2",
				irrelevant ? "opacity-20" : "opacity-100",
				className,
			)}
			{...props}
		>
			<div className="flex gap-0.5">
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
			<div className="text-sm text-white/75">{label}</div>
		</div>
	);
}
