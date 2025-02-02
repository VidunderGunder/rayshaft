import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type TemplateProps = {
	//
} & ComponentProps<"div">;

export function Template({ children, className, ...props }: TemplateProps) {
	return (
		<div className={cn("", className)} {...props}>
			{children}
		</div>
	);
}
