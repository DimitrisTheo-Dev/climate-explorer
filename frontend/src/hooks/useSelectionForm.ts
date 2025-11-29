import { useCallback, useEffect, useMemo, useState } from "react";

import {
	ClimateExplorerFormSchema,
	type ClimateExplorerFormValues,
} from "../lib/climateSchema";
import type { ViewMode, YearRange } from "../types/shared";

type YearRangeInputs = {
	from: string;
	to: string;
};

const defaultYearInputs = (bounds?: YearRange): YearRangeInputs => ({
	from: bounds ? String(bounds.from) : "",
	to: bounds ? String(bounds.to) : "",
});

type SelectionErrors = {
	stationIds?: string;
	yearRange?: {
		from?: string;
		to?: string;
	};
};

export const useSelectionForm = (initialBounds?: YearRange) => {
	const [stationIds, setStationIds] = useState<string[]>([]);
	const [mode, setMode] = useState<ViewMode>("monthly");
	const [yearInputs, setYearInputs] = useState<YearRangeInputs>(
		defaultYearInputs(initialBounds),
	);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (initialBounds && !initialized) {
			setYearInputs(defaultYearInputs(initialBounds));
			setInitialized(true);
		}
	}, [initialBounds, initialized]);

	const schemaPayload = useMemo(
		() => ({
			stationIds,
			mode,
			yearRange: yearInputs,
			zoom: undefined,
		}),
		[stationIds, mode, yearInputs],
	);

	const validation = useMemo(
		() => ClimateExplorerFormSchema.safeParse(schemaPayload),
		[schemaPayload],
	);

	const boundsErrors = useMemo(() => {
		if (!validation.success || !initialBounds) return {};
		const issues: SelectionErrors["yearRange"] = {};
		if (validation.data.yearRange.from < initialBounds.from) {
			issues.from = `Must be ≥ ${initialBounds.from}`;
		}
		if (validation.data.yearRange.to > initialBounds.to) {
			issues.to = `Must be ≤ ${initialBounds.to}`;
		}
		return issues;
	}, [validation, initialBounds]);

	const formErrors: SelectionErrors = useMemo(() => {
		const errors: SelectionErrors = {};
		if (!validation.success) {
			validation.error.issues.forEach((issue) => {
				if (issue.path[0] === "stationIds") {
					errors.stationIds = "Select at least one station";
				}
				if (issue.path[0] === "yearRange") {
					const field = issue.path[1];
					errors.yearRange = errors.yearRange ?? {};
					if (field === "from") {
						errors.yearRange.from = issue.message;
					}
					if (field === "to") {
						errors.yearRange.to = issue.message;
					}
				}
			});
		}
		if (boundsErrors.from || boundsErrors.to) {
			errors.yearRange = {
				from: boundsErrors.from ?? errors.yearRange?.from,
				to: boundsErrors.to ?? errors.yearRange?.to,
			};
		}
		return errors;
	}, [validation, boundsErrors]);

	const parsedValues: ClimateExplorerFormValues | null =
		validation.success &&
		!formErrors.yearRange?.from &&
		!formErrors.yearRange?.to
			? validation.data
			: null;

	const updateStationIds = (next: string[]) => {
		const unique = Array.from(new Set(next));
		setStationIds(unique);
	};

	const updateYearInput = (field: keyof YearRangeInputs, value: string) => {
		setYearInputs((prev) => ({ ...prev, [field]: value }));
	};

	const deriveBaseMode = (currentMode: ViewMode): "monthly" | "annual" =>
		currentMode === "monthly" ? "monthly" : "annual";
	const deriveStdBand = (currentMode: ViewMode) => currentMode === "annual_std";

	const baseMode = deriveBaseMode(mode);
	const includeStdBand = deriveStdBand(mode);

	const setBaseMode = (next: "monthly" | "annual") => {
		setMode((prev) => {
			const shouldKeepStd = deriveStdBand(prev);
			if (next === "monthly") return "monthly";
			return shouldKeepStd ? "annual_std" : "annual";
		});
	};

	const setIncludeStdBand = (enabled: boolean) => {
		setMode((prev) => {
			const currentBase = deriveBaseMode(prev);
			if (currentBase === "monthly") return "monthly";
			return enabled ? "annual_std" : "annual";
		});
	};

	const syncFromValues = useCallback(
		(values: ClimateExplorerFormValues) => {
			setStationIds(values.stationIds);
				setMode(values.mode);
				setYearInputs({
					from: String(values.yearRange.from),
					to: String(values.yearRange.to),
			});
		},
		[],
	);

	const resetToDefaults = useCallback(() => {
		setStationIds([]);
		setMode("monthly");
		setYearInputs(defaultYearInputs(initialBounds));
	}, [initialBounds]);

	return {
		stationIds,
		setStationIds: updateStationIds,
		mode,
		baseMode,
		includeStdBand,
		setMode,
		setBaseMode,
		setIncludeStdBand,
		yearInputs,
		setYearInput: updateYearInput,
		errors: formErrors,
		parsedValues,
		isValid: Boolean(parsedValues),
		syncFromValues,
		resetToDefaults,
	};
};
