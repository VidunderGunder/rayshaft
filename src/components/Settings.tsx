import {
	type Dispatch,
	useCallback,
	useEffect,
	useState,
	type ComponentProps,
} from "react";
import { cn } from "@/styles/utils";
import ReactFocusLock from "react-focus-lock";
import {
	Command,
	Commands,
	Confirm,
	type Hotkey,
	HotkeyInput,
} from "./Command";
import { Separator } from "./shadcn/separator";
import { getHotkeyHandler, useHotkeys } from "@mantine/hooks";
import { Alias } from "./Alias";
import { useConfigs } from "@/jotai";

export type ConfigVariant = "App" | "Url" | "Extension";

export type Config = {
	id: string;
	name: string;
	variant: ConfigVariant;
	aliases: string[];
	hotkeys: Hotkey[];
	path?: string;
};

export type SettingsProps = {
	open?: boolean;
	configId: string;
	configVariant: ConfigVariant;
	configName: string;
	configPath?: string;
	onClose?: () => void;
} & Omit<ComponentProps<"div">, "children">;

type Mode = "addHotkey" | "addAlias" | "removeHotkey" | "removeAlias" | null;

export function Settings({
	className,
	open = false,
	onClose,
	configId,
	configName,
	configVariant,
	configPath,
	...props
}: SettingsProps) {
	const {
		addAlias,
		removeAlias,
		addHotkey,
		removeHotkey,
		configs: settings,
	} = useConfigs();
	// const reset = useResetAtom(settingsAtom);
	// reset();

	const [mode, setMode] = useState<Mode>(null);

	const [showConfim, setShowConfirm] = useState(false);
	const [alias, setAlias] = useState("");

	const handleClose = useCallback(() => {
		setMode(null);
		setAlias("");
		setShowConfirm(false);
	}, []);

	let configIndex = configId
		? settings.findIndex((e) => e.id === configId)
		: -1;

	let config = configIndex > -1 ? settings[configIndex] : undefined;

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

	const hasHotkeys = !!config?.hotkeys?.length;
	const hasAliases = !!config?.aliases?.length;

	function handleReset() {
		// TODO
	}

	const disableAddHotkey =
		(mode !== null && mode !== "addHotkey") ||
		(config?.hotkeys.length ?? 0) >= 5;
	const disableAddAlias =
		(mode !== null && mode !== "addAlias") ||
		(config?.aliases.length ?? 0) >= 5;
	const disableRemoveHotkey =
		(mode !== null && mode !== "removeHotkey") || !hasHotkeys;
	const disableRemoveAlias =
		(mode !== null && mode !== "removeAlias") || !hasAliases;

	function remove(i: number) {
		if (mode === "removeAlias") {
			const isLast = config?.aliases?.length === 1;
			removeAlias({
				id: configId,
				alias: i,
			});
			if (isLast) setMode(null);
			return;
		}
		if (mode === "removeHotkey") {
			const isLast = config?.hotkeys?.length === 1;
			removeHotkey({
				id: configId,
				hotkey: i,
			});
			if (isLast) setMode(null);
			return;
		}
	}

	useEffect(() => {
		if (!open) handleClose();
	}, [open, handleClose]);

	useEffect(() => {
		if (mode === null) {
			setAlias("");
		}
	}, [mode]);

	if (!config) return;

	return (
		<>
			{open && <SettingsHotkeys remove={remove} />}
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
						{showConfim ? (
							<Confirm
								onYes={handleReset}
								onBoth={() => setShowConfirm(false)}
							/>
						) : (
							<Commands
								commands={[
									{
										modifiers: [],
										keyboard_key: "KeyR",
										label: "Reset",
										disabled: !open || mode !== null,
										handler() {
											if (!open) return;
											setShowConfirm(true);
										},
									},
									{
										modifiers: [],
										keyboard_key: "Escape",
										label: "Close",
										disabled: !open || mode !== null,
										handler() {
											onClose?.();
										},
									},
								]}
							/>
						)}
					</div>
				</div>
				<Separator />
				<div className="flex flex-col gap-4">
					<div className="flex flex-col justify-between gap-1">
						<div className="flex justify-between">
							Hotkey{config.hotkeys.length > 1 ? "s" : null}
							<Commands
								commands={[
									{
										label: mode === "removeHotkey" ? "Done" : "Remove",
										modifiers: mode === "removeHotkey" ? [] : ["Shift"],
										keyboard_key: mode === "removeHotkey" ? "Escape" : "KeyH",
										disabled: disableRemoveHotkey || !open,
										handler(e) {
											e.preventDefault();
											if (mode === "removeHotkey") {
												setMode(null);
												return;
											}
											setMode("removeHotkey");
										},
									},
									mode === "addHotkey"
										? {
												label: "Abort",
												modifiers: [],
												keyboard_key: "Escape",
												disabled: disableAddHotkey || !open,
												handler(e) {
													e.preventDefault();
													setMode(null);
												},
											}
										: {
												label: "Add",
												modifiers: [],
												keyboard_key: "KeyH",
												disabled: disableAddHotkey || !open,
												handler(e) {
													e.preventDefault();
													setMode("addHotkey");
												},
											},
								]}
							/>
						</div>
						<div className="flex flex-wrap gap-2.5">
							{hasHotkeys ? (
								config.hotkeys.map((hotkey, i) => {
									return (
										<div
											className="relative"
											key={[...hotkey.modifiers, ...hotkey.keyboard_key].join(
												"-",
											)}
										>
											{mode === "removeHotkey" && (
												<button
													className="-bottom-1.5 -right-1.5 absolute z-[1] flex size-3.5 items-center justify-center rounded-full border border-white bg-red-400 text-[8px]"
													type="button"
												>
													<span className="relative top-[1px]">{i + 1}</span>
												</button>
											)}
											<Command {...hotkey} label={null} disabled={!open} />
										</div>
									);
								})
							) : mode === "addHotkey" ? null : (
								<span className="text-sm opacity-35">–</span>
							)}
							{mode === "addHotkey" && (
								<div>
									<HotkeyInput
										onHotkey={(hotkey) => {
											addHotkey({
												hotkey,
												id: configId,
												defaults: {
													name: configName,
													variant: configVariant,
													path: configPath,
												},
											});
											setMode(null);
										}}
									/>
								</div>
							)}
						</div>
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="flex justify-between">
							Alias{config.aliases.length > 1 ? "es" : null}
							<Commands
								commands={[
									{
										disabled: disableRemoveAlias || !open,
										modifiers: mode === "removeAlias" ? [] : ["Shift"],
										keyboard_key: mode === "removeAlias" ? "Escape" : "KeyA",
										label: mode === "removeAlias" ? "Done" : "Remove",
										handler(e) {
											e.preventDefault();
											if (mode === "removeAlias") {
												setMode(null);
												return;
											}
											setMode("removeAlias");
										},
									},
									mode === "addAlias"
										? {
												disabled: disableAddAlias || !open,
												modifiers: [],
												keyboard_key: "Escape",
												label: "Abort",
												handler(e) {
													e.preventDefault();
													setMode(null);
												},
											}
										: {
												disabled: disableAddAlias || !open,
												modifiers: [],
												keyboard_key: "KeyA",
												label: "Add",
												handler(e) {
													e.preventDefault();
													setMode("addAlias");
												},
											},
								]}
							/>
						</div>
						<div className="flex flex-wrap items-start gap-1">
							{hasAliases ? (
								config.aliases.map((alias, i) => {
									return (
										<div className="relative" key={alias}>
											{mode === "removeAlias" && (
												<button
													className="-bottom-1.5 -right-1.5 absolute z-[1] flex size-3.5 items-center justify-center rounded-full border border-white bg-red-400 text-[8px]"
													type="button"
												>
													<span className="relative top-[1px]">{i + 1}</span>
												</button>
											)}
											<Alias>{alias}</Alias>
										</div>
									);
								})
							) : mode === "addAlias" ? null : (
								<span className="text-sm opacity-35">–</span>
							)}
							{mode === "addAlias" && (
								<ReactFocusLock className="flex gap-1">
									<input
										className="flex h-[1.25rem] items-center rounded-lg border border-slate-500 px-1.5 text-sm"
										value={alias}
										onChange={(e) => {
											setAlias(e.currentTarget.value);
										}}
										onKeyDown={getHotkeyHandler([
											[
												"Enter",
												() => {
													addAlias({
														alias,
														id: configId,
														defaults: {
															name: configName,
															variant: configVariant,
															path: configPath,
														},
													});
													setMode(null);
												},
											],
										])}
										placeholder="alias"
									/>
									<Command
										modifiers={[]}
										keyboard_key="Enter"
										label={alias === "" ? "Abort" : "Save"}
										disabled={!open}
									/>
								</ReactFocusLock>
							)}
						</div>
					</div>
				</div>
			</ReactFocusLock>
		</>
	);
}

function SettingsHotkeys({
	remove,
}: {
	remove: (i: number) => void;
}) {
	useHotkeys(
		[
			["Digit1", () => remove(0)],
			["Digit2", () => remove(1)],
			["Digit3", () => remove(2)],
			["Digit4", () => remove(3)],
			["Digit5", () => remove(4)],
		],
		[],
	);
	return null;
}
