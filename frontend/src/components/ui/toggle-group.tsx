import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "../../lib/utils";

export const ToggleGroup = ToggleGroupPrimitive.Root;

export const ToggleGroupItem = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
	<ToggleGroupPrimitive.Item
		ref={ref}
		className={cn(
			"inline-flex cursor-pointer select-none items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=on]:border-brand data-[state=on]:bg-brand/5 data-[state=on]:text-slate-900",
			className,
		)}
		{...props}
	/>
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
