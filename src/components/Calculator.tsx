import type { ComponentProps } from "react";
import { cn } from "@/styles/utils";

export type CalculatorProps = {
	output?: string;
} & Omit<ComponentProps<"div">, "children">;

export function Calculator({ output, className, ...props }: CalculatorProps) {
	if (!output) return null;

	return (
		<div className={cn("opacity-75", className)} {...props}>
			= {output}
		</div>
	);
}

export function isMath(e: string): boolean {
	if (typeof e !== "string") return false;
	const clean = e.replaceAll(" ", "");

	const allowedChars = /^[\d+\-*/^%().\sA-Za-z]+$/;
	if (!allowedChars.test(clean)) return false;

	// Require at least one digit so that expressions like "sin" alone don't trigger.
	if (!/\d/.test(clean)) return false;

	// Ensure at least one operator is present:
	if (!/[+\-*/^%]/.test(clean)) return false;

	return true;
}

export function solve(e: string): string | undefined {
	if (!isMath(e)) return;
	const clean = e.replaceAll(" ", "");

	try {
		// Use a new Function to evaluate the expression in a slightly safer sandbox.
		// The "use strict" is optional but can help prevent some accidental global leaks.
		const result = Function(`"use strict"; return (${clean})`)();
		return String(result);
	} catch (_) {
		// You can also return error details here if needed
		return;
	}
}
