import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export const SheetPortal = ({
	className,
	...props
}: SheetPrimitive.DialogPortalProps) => (
	<SheetPrimitive.Portal className={cn(className)} {...props} />
);
SheetPortal.displayName = SheetPrimitive.Portal.displayName;

export const SheetOverlay = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<SheetPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out",
			className,
		)}
		{...props}
	/>
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

type SheetContentProps = React.ComponentPropsWithoutRef<
	typeof SheetPrimitive.Content
> & {
	side?: "top" | "bottom" | "left" | "right";
};

const sideClasses: Record<NonNullable<SheetContentProps["side"]>, string> = {
	top: "inset-x-0 top-0 border-b",
	bottom: "inset-x-0 bottom-0 border-t",
	left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-md",
	right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-md",
};

export const SheetContent = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Content>,
	SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
	<SheetPortal>
		<SheetOverlay />
		<SheetPrimitive.Content
			ref={ref}
			className={cn(
				"fixed z-50 bg-white p-6 shadow-card transition ease-out data-[state=closed]:animate-out data-[state=open]:animate-in",
				sideClasses[side],
				className,
			)}
			{...props}
		>
			{children}
			<SheetPrimitive.Close className="absolute right-4 top-4 rounded-full bg-white/90 p-1 text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand">
				<X className="size-4" aria-hidden="true" />
				<span className="sr-only">Close</span>
			</SheetPrimitive.Close>
		</SheetPrimitive.Content>
	</SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

export const SheetHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("space-y-1 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

export const SheetTitle = ({
	className,
	...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
	<h3
		className={cn("text-lg font-semibold text-slate-900", className)}
		{...props}
	/>
);
SheetTitle.displayName = SheetPrimitive.Title.displayName;

export const SheetDescription = ({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
	<p className={cn("text-sm text-slate-500", className)} {...props} />
);
SheetDescription.displayName = SheetPrimitive.Description.displayName;
