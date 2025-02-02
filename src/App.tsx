import useEscape from "./hooks/useEscape";

export function App() {
	useEscape();

	return (
		<div className="size-full">
			<form>
				<input type="text" name="text" placeholder="Search..." />
			</form>
		</div>
	);
}
