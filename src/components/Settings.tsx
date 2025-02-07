import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ReactFocusLock from "react-focus-lock";

type Shortcut = "string";

type Config = {
	snippets: string[];
	shortcuts: string[];
};

export type SettingsProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Settings({ className, ...props }: SettingsProps) {
	return (
		<ReactFocusLock
			className={cn("[box-shadow:0_0_0_3px_rgba(255,255,255,0.5)]", className)}
			{...props}
		>
			{/*  */}
		</ReactFocusLock>
	);
}
