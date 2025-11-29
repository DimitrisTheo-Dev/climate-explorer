import type * as React from "react";

import { cn } from "../../lib/utils";

export const Badge = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
			className,
		)}
		{...props}
	/>
);
