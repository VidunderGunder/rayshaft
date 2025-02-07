import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";
import ReactFocusLock from "react-focus-lock";
import { Command } from "./Command";
import { Separator } from "./shadcn/separator";

type Config = {
	snippets: string[];
	shortcuts: string[];
};

export type SettingsProps = {
	open?: boolean;
} & Omit<ComponentProps<"div">, "children">;

export function Settings({ className, open = false, ...props }: SettingsProps) {
	return (
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
				<div>Configuration</div>
				<div>
					<Command modifiers={["Meta"]} keyboardKey="KeyK" label="Close" />
				</div>
			</div>
			<Separator />
			<div className="flex items-center justify-center">Hello</div>
		</ReactFocusLock>
	);
}
