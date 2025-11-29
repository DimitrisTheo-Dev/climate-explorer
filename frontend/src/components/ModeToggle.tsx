import { cn } from "../lib/utils";
import { Label } from "./ui/label";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type ModeToggleValue = "monthly" | "annual";

type ModeToggleProps = {
	value: ModeToggleValue;
	onChange: (mode: ModeToggleValue) => void;
};

const MODES: {
	key: ModeToggleValue;
	label: string;
	description: string;
}[] = [
	{ key: "monthly", label: "Monthly", description: "Raw monthly signal" },
	{ key: "annual", label: "Annual", description: "Averaged per year" },
];

export const ModeToggle = ({ value, onChange }: ModeToggleProps) => (
	<div className="space-y-2">
		<Label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
			Mode
		</Label>
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(next) => {
				if (next) onChange(next as ModeToggleValue);
			}}
			className="grid grid-cols-2 gap-2"
		>
			{MODES.map((mode) => (
				<ToggleGroupItem
					key={mode.key}
					value={mode.key}
					aria-label={mode.label}
					className={cn(
						"flex flex-col items-start gap-0.5 rounded-xl border border-transparent px-3 py-2 text-left text-xs font-medium text-slate-600",
						value === mode.key
							? "border-brand bg-brand.light text-brand-dark"
							: "border-slate-200 bg-white",
					)}
				>
					<span className="text-sm font-semibold">{mode.label}</span>
					<span className="text-[11px] text-slate-500">{mode.description}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	</div>
);
