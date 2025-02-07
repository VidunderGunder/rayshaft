import { launchApp, useApps } from "./hooks/useApps";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "./styles/utils";
import Fuse from "fuse.js";
import { Keyboard } from "./components/Keyboard";
import type { KeyboardKey, Modifier } from "./types/keyboard";
import { useAtom } from "jotai";
import { indexAtom, searchAtom } from "./jotai";
import { useResetAtom } from "jotai/utils";
import { getHotkeyHandler } from "@mantine/hooks";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useWindowHotkeys } from "./hooks/useWindowHotkeys";
import ReactFocusLock from "react-focus-lock";
import { Separator } from "./components/shadcn/separator";
import { Settings } from "./components/Settings";

export function App() {
	const [search, setSearch] = useAtom(searchAtom);
	const resetSearch = useResetAtom(searchAtom);

	const [index, setIndex] = useAtom(indexAtom);
	const resetIndex = useResetAtom(indexAtom);

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
		setShowSettings(!showSettings);
	}

	useWindowHotkeys([["Escape", close]]);

	const apps = useApps();
	const fuse = new Fuse(apps, {
		keys: ["name"],
	});
	const results = fuse.search(search);
	const showResults = results.length > 0;

	const current = results[index];

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

	return (
		<div className="relative flex size-full max-h-full flex-col items-stretch justify-start overflow-hidden">
			<ReactFocusLock
				className="relative flex items-center"
				disabled={showSettings}
			>
				<input
					type="text"
					name="text"
					placeholder="Gotta go fast..."
					value={search}
					onChange={(e) => {
						const value = e.target.value;
						setSearch(value);
					}}
					onKeyDown={getHotkeyHandler([
						["ArrowDown", setIndexNext],
						["ArrowUp", setIndexPrevious],
						["mod+ArrowUp", setIndexTop],
						["mod+ArrowDown", setIndexBottom],
						["Enter", () => handleLaunch(current.item.path)],
						["mod+K", toggleSettings],
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
						const itemShortcut: {
							modifiers: Modifier[];
							letters: KeyboardKey[];
						} = {
							modifiers: [],
							letters: [],
						};
						if (item.name === "Notes") {
							itemShortcut.modifiers = ["Control", "Alt", "Meta"];
							itemShortcut.letters = ["KeyN"];
						}
						const isShortcut =
							!!itemShortcut.letters.length && !!itemShortcut.modifiers.length;
						const isFocused = i === index;
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
									className="flex flex-1 px-3.5 py-3 text-left hover:bg-white/5"
									onClick={() => void handleLaunch(item.path)}
								>
									<div>{item.name}</div>
								</button>
								<div className="pointer-events-none absolute right-0 flex h-full items-center gap-3 pr-3.5">
									{isFocused && (
										<div className="flex items-center gap-2">
											<div className="flex gap-0.5">
												<Keyboard
													interactive
													code={"Meta" satisfies Modifier}
												/>
												<Keyboard
													interactive
													code={"KeyK" satisfies KeyboardKey}
												/>
											</div>
											<div className="text-sm text-white/75">
												Config {showSettings ? "(open)" : ""}
											</div>
										</div>
									)}
									{isShortcut && isFocused && (
										<Separator orientation="vertical" className="h-[1.5rem]" />
									)}
									{isShortcut && (
										<div className="flex items-center gap-2">
											<div className="flex gap-0.5">
												{itemShortcut?.modifiers.map((modifier) => {
													return (
														<Keyboard
															interactive
															code={modifier}
															key={modifier}
														/>
													);
												})}
												{itemShortcut?.letters.map((letter) => {
													return (
														<Keyboard interactive code={letter} key={letter} />
													);
												})}
											</div>
											<div className="text-sm text-white/75">Open</div>
										</div>
									)}
								</div>
							</span>
						);
					}}
				/>
			)}
			{showSettings && (
				<Settings className="absolute inset-x-12 top-12 min-h-[100px] rounded-2xl bg-gray-900/95" />
			)}
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
