import { useEscape } from "@/hooks/useEscape";
import { handleLaunch, useApps } from "./hooks/useApps";

export function App() {
	useEscape();
	const apps = useApps();

	return (
		<div className="flex size-full items-start justify-center">
			<div className="relative flex flex-1 items-center">
				<input
					type="text"
					name="text"
					placeholder="Gotta go fast..."
					className="w-full rounded-2xl bg-gray-950/50 px-3.5 py-3 text-white"
				/>
				<span role="img" className="absolute right-4">
					🦔💨
				</span>
			</div>
			<ul className="flex flex-col gap-2">
				{apps.map((app) => {
					return (
						<li
							key={app.bundle_id}
							className="cursor-pointer rounded p-2 hover:bg-gray-700"
							onClick={() => handleLaunch(app.path)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleLaunch(app.path);
							}}
						>
							{app.name} {app.version ? `(${app.version})` : ""}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
