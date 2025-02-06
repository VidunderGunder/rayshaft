import { getHotkeyHandler, type HotkeyItem } from "@mantine/hooks";
import { useEffect } from "react";

export function useWindowHotkeys(items: HotkeyItem[]) {
	useEffect(() => {
		window.addEventListener("keydown", getHotkeyHandler(items));

		return () => {
			window.removeEventListener("keydown", getHotkeyHandler(items));
		};
	}, [items]);
}
