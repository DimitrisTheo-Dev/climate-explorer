import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "../../lib/utils";

export const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(
			"flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-slate-800",
			className,
		)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

export const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
	<div className="flex items-center border-b border-slate-200 px-2">
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				"h-9 w-full bg-transparent px-2 text-sm outline-none placeholder:text-slate-400",
				className,
			)}
			{...props}
		/>
	</div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

export const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.List
		ref={ref}
		className={cn("max-h-52 overflow-y-auto py-1 text-sm", className)}
		{...props}
	/>
));
CommandList.displayName = CommandPrimitive.List.displayName;

export const CommandEmpty = CommandPrimitive.Empty;
export const CommandGroup = CommandPrimitive.Group;
export const CommandItem = CommandPrimitive.Item;
