import { cn } from "@/styles/utils";
import type { Modifier, KeyboardKey } from "@/types/keyboard";
import { type ReactNode, type ComponentProps, Fragment } from "react";
import { Keyboard, useModifiers } from "./Keyboard";
import { Separator } from "./shadcn/separator";

export type CommandType = {
	modifiers: Modifier[];
	keyboardKey: KeyboardKey;
	label: ReactNode;
};

export type CommandProps = {
	disabled?: boolean;
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
