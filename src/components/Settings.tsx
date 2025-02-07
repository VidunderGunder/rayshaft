import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ReactFocusLock from "react-focus-lock";
import { Command } from "./Command";
import { Separator } from "./shadcn/separator";
import type { KeyboardKey, Modifier } from "@/types/keyboard";
import { useHotkeys } from "@mantine/hooks";
import { Alias } from "./Alias";

export type Config = {
	name: string;
	aliases: string[];
	hotkeys: { modifiers: Modifier[]; keyboardKey: KeyboardKey }[];
};

export type SettingsProps = {
	open?: boolean;
} & Omit<ComponentProps<"div">, "children">;

const configExample: Config = {
	name: "Notes",
	hotkeys: [
		{
			modifiers: ["Control", "Alt", "Meta"],
			keyboardKey: "KeyN",
		},
		{
			modifiers: ["Control", "Alt", "Meta"],
			keyboardKey: "KeyT",
		},
	],
	aliases: ["notes", "nts", "n"],
};

export function Settings({ className, open = false, ...props }: SettingsProps) {
	const config = configExample;

	const hasHotkeys = !!config.hotkeys?.length;
	const hasAliases = !!config.aliases?.length;

	useHotkeys([
		[
			"mod+T",
			(e) => {
				e.preventDefault();
				console.log("yo");
			},
		],
		[
			"mod+L",
			(e) => {
				e.preventDefault();
				console.log("yo");
			},
		],
	]);

	return (
		<ReactFocusLock
			disabled={!open}
			className={cn(
				"flex flex-col gap-[11px] bg-gray-900/95 px-3.5 py-3 text-white [box-shadow:0_0_0_3px_rgba(255,255,255,0.5)]",
				open ? "" : "hidden",
				className,
			)}
			{...props}
		>
			<div className="flex items-center justify-between">
				<div className="font-black">{config.name ?? "Configuration"}</div>
				<div>
					<Command modifiers={["Meta"]} keyboardKey="KeyK" label="Close" />
				</div>
			</div>
			<Separator />
			<div className="flex flex-col gap-4">
				<div className="flex flex-col justify-between gap-1">
					<div className="flex justify-between">
						Hotkey{config.hotkeys.length > 1 ? "s" : null}
						<Command keyboardKey="KeyT" modifiers={["Meta"]} label="Add" />
					</div>
					<div className="flex gap-2.5">
						{hasHotkeys
							? config.hotkeys.map((hotkey) => {
									return (
										<Command
											key={[...hotkey.modifiers, ...hotkey.keyboardKey].join(
												"-",
											)}
											{...hotkey}
											label={null}
										/>
									);
								})
							: "-"}
					</div>
				</div>
				<div className="flex flex-col justify-between gap-1">
					<div className="flex justify-between">
						Alias{config.aliases.length > 1 ? "es" : null}
						<Command keyboardKey="KeyL" modifiers={["Meta"]} label="Add" />
					</div>
					<div className="flex gap-1">
						{hasAliases
							? config.aliases.map((alias) => {
									return <Alias key={alias}>{alias}</Alias>;
								})
							: "-"}
					</div>
				</div>
			</div>
		</ReactFocusLock>
	);
}
