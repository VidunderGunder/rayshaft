import useEscape from "./hooks/useEscape";

export function App() {
	useEscape();

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
		</div>
	);
}
