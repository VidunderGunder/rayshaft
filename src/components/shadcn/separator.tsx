"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/styles/utils";

type Thickness = 1 | 2 | 3 | 4 | 5;

// Excplicit classNames to ensure Tailwind includes them in the final CSS
const widths = {
	1: cn("w-[1px]"),
	2: cn("w-[2px]"),
	3: cn("w-[3px]"),
	4: cn("w-[4px]"),
	5: cn("w-[5px]"),
} as const satisfies Record<Thickness, string>;
const heights = {
	1: cn("h-[1px]"),
	2: cn("h-[2px]"),
	3: cn("h-[3px]"),
	4: cn("h-[4px]"),
	5: cn("h-[5px]"),
} as const satisfies Record<Thickness, string>;

const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
		thickness?: Thickness;
	}
>(
	(
		{
			className,
			orientation = "horizontal",
			decorative = true,
			thickness = 1,
			...props
		},
		ref,
	) => (
		<SeparatorPrimitive.Root
			ref={ref}
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"shrink-0 rounded-full bg-white/20",
				orientation === "horizontal"
					? cn(heights[thickness], "w-full")
					: cn(widths[thickness], "h-full"),
				className,
			)}
			{...props}
		/>
	),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
