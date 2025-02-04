import { useEscape } from "@/hooks/useEscape";
import { launchApp, useApps } from "./hooks/useApps";
import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "./styles/utils";
import Fuse from "fuse.js";
import { ScrollArea } from "@/components/shadcn/scroll-area";
import { Keyboard } from "./components/Keyboard";
import type { KeyboardKey, Modifier } from "./types/keyboard";

export function App() {
	const [search, setSearch] = useState("");
	const resetSearch = useCallback(function resetSearch() {
		setSearch("");
	}, []);

	const handleLaunch = useCallback(
		function handleLaunch(appPath: string | undefined) {
			resetSearch();
			launchApp(appPath);
			invoke("hide");
		},
		[resetSearch],
	);

	useEscape({ onEscape: resetSearch });

	const apps = useApps();
	const fuse = new Fuse(apps, {
		keys: ["name"],
	});
	const results = fuse.search(search);
	const showResults = results.length > 0;

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
					className={cn(
						"w-full rounded-2xl bg-gray-900/90 px-3.5 py-3 text-white",
						showResults ? "rounded-b-none" : "",
					)}
				/>
				{/* <span role="img" className="absolute right-4">
					🦔
				</span> */}
			</div>
			{showResults && (
				<ScrollArea className="max-h-[200px] rounded-b-2xl bg-gray-900/90 text-white">
					<ul className="flex flex-col gap-2">
						{results.map(({ item }) => {
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
							return (
								<li
									key={item.path}
									className="cursor-pointer rounded px-3.5 py-3 hover:bg-gray-700"
									onClick={() => handleLaunch(item.path)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleLaunch(item.path);
									}}
								>
									<div className="flex justify-between">
										<div>{item.name}</div>
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
									</div>
								</li>
							);
						})}
					</ul>
				</ScrollArea>
			)}
		</div>
	);
}
