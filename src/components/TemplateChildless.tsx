import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type TemplateProps = {
	//
} & Omit<ComponentProps<"div">, "children">;

export function Template({ className, ...props }: TemplateProps) {
	return (
		<div className={cn("", className)} {...props}>
			{/*  */}
		</div>
	);
}
