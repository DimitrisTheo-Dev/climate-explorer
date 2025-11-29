import { useMemo } from "react";

import type { useSelectionForm } from "../hooks/useSelectionForm";
import type { useZoomState } from "../hooks/useZoomState";
import type { YearRange } from "../types/shared";
import type { Station } from "../types/station";
import { ModeToggle } from "./ModeToggle";
import { SigmaToggle } from "./SigmaToggle";
import { StationSelector } from "./StationSelector";
import { YearRangeControls } from "./YearRangeControls";
import { ZoomControls } from "./ZoomControls";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type SelectionFormState = ReturnType<typeof useSelectionForm>;
type ZoomState = ReturnType<typeof useZoomState>;

type FilterControlsProps = {
	selectionForm: SelectionFormState;
	zoomState: ZoomState;
	stations: Station[];
	isStationsLoading: boolean;
	globalYearBounds?: YearRange;
	appliedYearRange?: YearRange;
	onApply: () => void;
};

export const FilterControls = ({
	selectionForm,
	zoomState,
	stations,
	isStationsLoading,
	globalYearBounds,
	appliedYearRange,
	onApply,
}: FilterControlsProps) => {
	const yearErrors = useMemo(
		() => selectionForm.errors.yearRange ?? {},
		[selectionForm.errors.yearRange],
	);

	return (
		<div className="flex flex-col gap-4">
			<Card className="border border-slate-200/80 bg-slate-50/70 p-4 shadow-none">
				<ZoomControls
					focusYear={zoomState.focusYear}
					onFocusYearChange={zoomState.setFocusYear}
					focusError={zoomState.focusError}
					zoomPercent={zoomState.zoomPercent}
					onZoomChange={zoomState.setZoomPercent}
					visibleRange={zoomState.visibleRange}
					baseRange={appliedYearRange}
					onReset={zoomState.reset}
					disabled={!appliedYearRange}
				/>
			</Card>
			<Card className="flex flex-col gap-5 border border-slate-200 bg-white/95 p-4 shadow-card sm:p-5">
				<StationSelector
					stations={stations}
					selectedStations={selectionForm.stationIds}
					onChange={selectionForm.setStationIds}
					disabled={isStationsLoading}
					errorMessage={selectionForm.errors.stationIds}
				/>
				<div className="space-y-4">
					<ModeToggle
						value={selectionForm.baseMode}
						onChange={selectionForm.setBaseMode}
					/>
					{selectionForm.baseMode === "annual" ? (
						<SigmaToggle
							enabled={selectionForm.includeStdBand}
							onToggle={selectionForm.setIncludeStdBand}
						/>
					) : null}
				</div>
				<YearRangeControls
					values={selectionForm.yearInputs}
					errors={yearErrors}
					onChange={selectionForm.setYearInput}
					minYear={globalYearBounds?.from}
					maxYear={globalYearBounds?.to}
				/>
				<div className="space-y-2 pt-2">
					<Button
						className="w-full"
						onClick={onApply}
						disabled={!selectionForm.isValid || isStationsLoading}
					>
						Apply selection
					</Button>
					<p className="text-[11px] text-slate-500">
						Changes sync with analytics after clicking apply.
					</p>
				</div>
			</Card>
		</div>
	);
};
