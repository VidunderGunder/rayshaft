import { useEscape } from "@/hooks/useEscape";
import { launchApp, useApps } from "./hooks/useApps";
import { useCallback, useEffect, useRef } from "react";
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
import { ScrollArea } from "./components/shadcn/scroll-area";

export function App() {
	const [search, setSearch] = useAtom(searchAtom);
	const resetSearch = useResetAtom(searchAtom);

	const [index, setIndex] = useAtom(indexAtom);
	const resetIndex = useResetAtom(indexAtom);

	const reset = useCallback(
		function reset() {
			resetSearch();
			resetIndex();
		},
		[resetSearch, resetIndex],
	);

	const handleLaunch = useCallback(
		function handleLaunch(appPath: string | undefined) {
			reset();
			launchApp(appPath);
			invoke("hide");
		},
		[reset],
	);

	useEscape({ onEscape: reset });

	const apps = useApps();
	const fuse = new Fuse(apps, {
		keys: ["name"],
	});
	const results = fuse.search(search);
	const showResults = results.length > 0;

	const current = results[index];

	function setIndexNext() {
		const nextIndex = next(index, results.length);
		setIndex(nextIndex);
		virtuoso.current?.scrollIntoView({
			index: nextIndex,
			behavior: "auto",
		});
	}
	function setIndexPrevious() {
		const previousIndex = previous(index, results.length);
		setIndex(previousIndex);
		virtuoso.current?.scrollIntoView({
			index: previousIndex,
			behavior: "auto",
		});
	}

	useEffect(() => {
		if (search === "") resetIndex();
	}, [search, resetIndex]);

	const virtuoso = useRef<VirtuosoHandle>(null);

	return (
		<div className="flex size-full max-h-full flex-col items-stretch justify-start overflow-hidden">
			<div className="relative flex items-center">
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
						["Enter", () => handleLaunch(current.item.path)],
					])}
					className={cn(
						"w-full rounded-2xl bg-gray-900/90 px-3.5 py-3 text-white",
						showResults ? "rounded-b-none" : "",
					)}
				/>
			</div>
			{showResults && (
				<Virtuoso
					className="rounded-b-2xl bg-gray-900/90 text-white"
					style={{
						height: 48 * 4,
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
						const isFocused = i === index;
						return (
							<button
								type="button"
								key={item.path}
								className={cn(
									"flex size-full cursor-pointer justify-between px-3.5 py-3",
									isFocused ? "bg-white/10" : "hover:bg-white/5",
								)}
								onClick={() => void handleLaunch(item.path)}
							>
								<div>{item.name}</div>
								<div className="flex gap-0.5">
									{itemShortcut?.modifiers.map((modifier) => {
										return (
											<Keyboard interactive code={modifier} key={modifier} />
										);
									})}
									{itemShortcut?.letters.map((letter) => {
										return <Keyboard interactive code={letter} key={letter} />;
									})}
								</div>
							</button>
						);
					}}
				/>
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
