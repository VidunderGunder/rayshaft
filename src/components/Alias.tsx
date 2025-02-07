import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type AliasProps = {
	//
} & ComponentProps<"div">;

export function Alias({ children, className, ...props }: AliasProps) {
	return (
		<div
			className={cn(
				"rounded-md bg-gray-400 px-1.5 py-0 text-gray-800 text-sm",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
