import { launchApp, useApps } from "./hooks/useApps";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "./styles/utils";
import Fuse from "fuse.js";
import { useAtom } from "jotai";
import { indexAtom, searchAtom, useSettings } from "./jotai";
import { useResetAtom } from "jotai/utils";
import { getHotkeyHandler, useHotkeys } from "@mantine/hooks";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import ReactFocusLock from "react-focus-lock";
import { Settings } from "./components/Settings";
import { Commands, type CommandType } from "./components/Command";
import { Alias } from "./components/Alias";

export function App() {
	const [search, setSearch] = useAtom(searchAtom);
	const resetSearch = useResetAtom(searchAtom);

	const [index, setIndex] = useAtom(indexAtom);
	const resetIndex = useResetAtom(indexAtom);

	const { settings } = useSettings();
	const [showSettings, setShowSettings] = useState(false);

	const reset = useCallback(
		function reset() {
			resetSearch();
			resetIndex();
			setShowSettings(false);
		},
		[resetSearch, resetIndex],
	);

	const close = useCallback(
		function close() {
			reset();
			invoke("hide");
		},
		[reset],
	);

	const handleLaunch = useCallback(
		function handleLaunch(appPath: string | undefined) {
			launchApp(appPath);
			close();
		},
		[close],
	);

	function toggleSettings() {
		if (!search) return;
		setShowSettings(!showSettings);
	}

	const apps = useApps();
	const fuse = new Fuse(apps, {
		keys: ["name"],
	});
	const results = fuse.search(search);
	const showResults = results.length > 0;

	const current = results[index] as (typeof results)[number] | undefined;

	function setIndexNext() {
		const newIndex = next(index, results.length);
		setIndex(newIndex);
		virtuoso.current?.scrollIntoView({
			index: newIndex,
			behavior: "auto",
		});
	}
	function setIndexPrevious() {
		const newIndex = previous(index, results.length);
		setIndex(newIndex);
		virtuoso.current?.scrollIntoView({
			index: newIndex,
			behavior: "auto",
		});
	}

	function setIndexTop() {
		const newIndex = 0;
		setIndex(newIndex);
		virtuoso.current?.scrollIntoView({
			index: newIndex,
			behavior: "auto",
		});
	}
	function setIndexBottom() {
		const newIndex = results.length - 1;
		setIndex(newIndex);
		virtuoso.current?.scrollIntoView({
			index: newIndex,
			behavior: "auto",
		});
	}

	useEffect(() => {
		if (search === "") resetIndex();
	}, [search, resetIndex]);

	const virtuoso = useRef<VirtuosoHandle>(null);

	useHotkeys(
		[
			["Escape", close],
			["Mod+K", toggleSettings],
		],
		[],
	);

	return (
		<div className="relative flex size-full max-h-full flex-col items-stretch justify-start overflow-hidden">
			<ReactFocusLock className="relative flex items-center">
				<input
					type="text"
					name="text"
					placeholder="Gotta go fast..."
					value={search}
					onChange={(e) => {
						setShowSettings(false);
						const value = e.target.value;
						setSearch(value);
					}}
					onKeyDown={getHotkeyHandler([
						["ArrowDown", setIndexNext],
						["ArrowUp", setIndexPrevious],
						["mod+ArrowUp", setIndexTop],
						["mod+ArrowDown", setIndexBottom],
						[
							"Enter",
							() => {
								if (showSettings) return;
								handleLaunch(current?.item.path);
							},
						],
					])}
					className={cn(
						"w-full rounded-2xl bg-gray-900/90 px-3.5 py-3 text-white backdrop-blur-sm",
						showResults ? "rounded-b-none" : "",
					)}
				/>
			</ReactFocusLock>
			{showResults && (
				<Virtuoso
					className="rounded-b-2xl bg-gray-900/90 text-white backdrop-blur-sm"
					style={{
						height: 48 * results.length,
						maxHeight: 48 * 10,
					}}
					ref={virtuoso}
					data={results}
					itemContent={(i, result) => {
						const { item } = result;
						const config = settings.find((c) => c.id === item.path);
						const itemShortcut: CommandType = {
							modifiers: config?.hotkeys[0]?.modifiers ?? [],
							keyboardKey: config?.hotkeys[0]?.keyboardKey ?? "",
							label: config?.variant === "App" ? "open" : null,
						};
						const isShortcut =
							!!itemShortcut.keyboardKey && !!itemShortcut.modifiers.length;
						const isFocused = i === index;

						const commands: CommandType[] = [];
						if (isFocused)
							commands.push({
								keyboardKey: "KeyK",
								modifiers: ["Meta"],
								label: "Config",
							});
						if (isShortcut) commands.push(itemShortcut);
						return (
							<span
								key={item.path}
								className={cn(
									"relative flex size-full items-stretch justify-between",
									isFocused ? "bg-white/10" : "",
								)}
							>
								<button
									type="button"
									className="flex flex-1 justify-between px-3.5 py-3 text-left hover:bg-white/5"
									onClick={() => void handleLaunch(item.path)}
								>
									<div className="flex items-center gap-3">
										{item.name}
										<div className="flex items-center gap-1">
											{config?.aliases.map((alias) => {
												return <Alias key={alias}>{alias}</Alias>;
											})}
										</div>
									</div>
									<div className="pr-3.5">
										<Commands commands={commands} />
									</div>
								</button>
							</span>
						);
					}}
				/>
			)}
			<Settings
				className={cn("absolute inset-x-12 top-12 rounded-2xl")}
				open={showSettings}
				configId={current?.item.path ?? ""}
				configVariant={"App"}
				configName={current?.item.name ?? ""}
				configPath={current?.item.path}
			/>
		</div>
	);
}

function next(i: number, length: number) {
	const j = i + 1;
	if (j > length - 1) return 0;
	return j;
}
function previous(i: number, length: number) {
	const j = i - 1;
	if (j < 0) return length - 1;
	return j;
}
