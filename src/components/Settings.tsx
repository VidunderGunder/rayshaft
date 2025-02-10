import { useState, type ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ReactFocusLock from "react-focus-lock";
import { Command, Commands } from "./Command";
import { Separator } from "./shadcn/separator";
import type { KeyboardKey, Modifier } from "@/types/keyboard";
import { getHotkeyHandler, useHotkeys } from "@mantine/hooks";
import { Alias } from "./Alias";
import { useAtom, useSetAtom } from "jotai";
import { disableEscapeAtom, settingsAtom } from "@/jotai";
import { useResetAtom } from "jotai/utils";

export type ConfigVariant = "App" | "Url" | "Extension";

export type Config = {
	id: string;
	name: string;
	variant: ConfigVariant;
	aliases: string[];
	hotkeys: { modifiers: Modifier[]; keyboardKey: KeyboardKey }[];
	path?: string;
};

export type SettingsProps = {
	open?: boolean;
	configId: string;
	configVariant: ConfigVariant;
	configName: string;
	configPath?: string;
} & Omit<ComponentProps<"div">, "children">;

export function Settings({
	className,
	open = false,
	configId,
	configName,
	configVariant,
	configPath,
	...props
}: SettingsProps) {
	const setDisableEscape = useSetAtom(disableEscapeAtom);
	const [settings, setSettings] = useAtom(settingsAtom);
	// const reset = useResetAtom(settingsAtom);
	// reset();
	const [addingAlias, setAddingAlias] = useState(false);
	const [addingHotkey, setAddingHotkey] = useState(false);

	const [alias, setAlias] = useState("");

	console.log(settings);

	useHotkeys(
		[
			[
				"mod+T",
				(e) => {
					e.preventDefault();
					if (addingAlias) return;
					setAlias("");
					setAddingAlias(false);
					setAddingHotkey((prev) => {
						setDisableEscape(!prev);
						return !prev;
					});
				},
			],
			[
				"mod+L",
				(e) => {
					e.preventDefault();
					if (addingHotkey) return;
					setAddingHotkey(false);
					setAddingAlias((prev) => {
						setDisableEscape(!prev);
						return !prev;
					});
				},
			],
			[
				"mod+K",
				() => {
					setAddingHotkey(false);
					setAlias("");
					setAddingAlias(false);
					setDisableEscape(false);
				},
			],
			[
				"Escape",
				(e) => {
					if (addingAlias || addingHotkey) {
						e.preventDefault();
						setAddingAlias(false);
						setAlias("");
						setAddingHotkey(false);
						setDisableEscape(false);
					}
				},
			],
		],
		[],
	);

	let configIndex = configId
		? settings.findIndex((e) => e.id === configId)
		: -1;

	console.log(configId, configIndex);

	let config = configIndex > -1 ? settings[configIndex] : undefined;
	console.log(config);

	if (!config && configId) {
		config = {
			id: configId,
			name: configName,
			aliases: [],
			hotkeys: [],
			variant: configVariant,
			path: configPath,
		};
		configIndex = settings.length - 1;
	}
	if (!config) return;

	const hasHotkeys = !!config?.hotkeys?.length;
	const hasAliases = !!config?.aliases?.length;

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
					<Commands
						commands={[
							{
								modifiers: ["Meta"],
								keyboardKey: "KeyK",
								label: "Close",
							},
						]}
					/>
				</div>
			</div>
			<Separator />
			<div className="flex flex-col gap-4">
				<div className="flex flex-col justify-between gap-1">
					<div className="flex justify-between">
						Hotkey{config.hotkeys.length > 1 ? "s" : null}
						<Command
							disabled={addingAlias}
							modifiers={["Meta"]}
							keyboardKey="KeyT"
							label={addingHotkey ? "Abort" : "Add"}
						/>
					</div>
					<div className="flex gap-2.5">
						{hasHotkeys ? (
							config.hotkeys.map((hotkey) => {
								return (
									<Command
										key={[...hotkey.modifiers, ...hotkey.keyboardKey].join("-")}
										{...hotkey}
										label={null}
									/>
								);
							})
						) : addingHotkey ? null : (
							<span className="opacity-35">–</span>
						)}
						{addingHotkey && <div>Adding</div>}
					</div>
				</div>
				<div className="flex flex-col justify-between gap-1">
					<div className="flex justify-between">
						Alias{config.aliases.length > 1 ? "es" : null}
						<Command
							disabled={addingHotkey}
							modifiers={["Meta"]}
							keyboardKey="KeyL"
							label={addingAlias ? "Abort" : "Add"}
						/>
					</div>
					<div className="flex items-start gap-1">
						{hasAliases ? (
							config.aliases.map((alias) => {
								return <Alias key={alias}>{alias}</Alias>;
							})
						) : addingAlias ? null : (
							<span className="opacity-35">–</span>
						)}
						{addingAlias && (
							<ReactFocusLock className="flex gap-1">
								<input
									value={alias}
									onChange={(e) => {
										setAlias(e.currentTarget.value);
									}}
									onKeyDown={getHotkeyHandler([
										[
											"Enter",
											() => {
												setSettings((draft) => {
													if (typeof configIndex !== "number") return draft;

													const exists =
														configIndex !== -1 && configIndex < draft.length;

													const c: Config = exists
														? draft[configIndex]
														: {
																id: configId,
																name: configName,
																aliases: [alias],
																hotkeys: [],
																variant: configVariant,
																path: configPath,
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
												setAddingAlias(false);
												setAlias("");
											},
										],
									])}
									placeholder="alias"
									className="!text-sm flex h-[1.25rem] items-center rounded-lg border border-slate-500 px-1.5"
								/>
								<Command modifiers={[]} keyboardKey="Enter" label={"Save"} />
							</ReactFocusLock>
						)}
					</div>
				</div>
			</div>
		</ReactFocusLock>
	);
}
