import { cn } from "../lib/utils";
import { Label } from "./ui/label";

type SigmaToggleProps = {
	enabled: boolean;
	onToggle: (next: boolean) => void;
};

export const SigmaToggle = ({ enabled, onToggle }: SigmaToggleProps) => (
	<div className="space-y-2">
		<Label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
			±1σ band
		</Label>
		<div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
			<p className="text-xs text-slate-600">
				Highlight variability around the annual mean.
			</p>
			<button
				type="button"
				aria-pressed={enabled}
				onClick={() => onToggle(!enabled)}
				className={cn(
					"w-full rounded-lg px-3 py-2 text-sm font-semibold transition",
					enabled
						? "bg-brand text-white hover:bg-brand-dark"
						: "border border-dashed border-slate-300 bg-white text-slate-600 hover:border-slate-400",
				)}
			>
				{enabled ? "Including ±1σ band" : "Add ±1σ band"}
			</button>
		</div>
	</div>
);
