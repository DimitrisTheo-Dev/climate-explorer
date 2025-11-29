import { useCallback, useEffect, useMemo, useState } from "react";

import { deriveVisibleRange, ensureFocusYear } from "../lib/zoom";
import { midpoint } from "../lib/yearRange";
import type { YearRange } from "../types/shared";

type UseZoomStateArgs = {
	appliedYearRange?: YearRange;
};

export const useZoomState = ({ appliedYearRange }: UseZoomStateArgs) => {
	const [focusInput, setFocusInput] = useState("");
	const [focusValue, setFocusValue] = useState<number | null>(null);
	const [focusError, setFocusError] = useState<string | undefined>();
	const [zoomPercent, setZoomPercent] = useState(100);

	const reset = useCallback(() => {
		if (!appliedYearRange) {
			setFocusInput("");
			setFocusValue(null);
			setZoomPercent(100);
			setFocusError(undefined);
			return;
		}
		const mid = midpoint(appliedYearRange);
		setFocusInput(String(mid));
		setFocusValue(mid);
		setZoomPercent(100);
		setFocusError(undefined);
	}, [appliedYearRange]);

	useEffect(() => {
		reset();
	}, [reset]);

	const handleFocusChange = useCallback(
		(next: string) => {
			setFocusInput(next);
			if (!appliedYearRange) return;
			const numeric = Number(next);
			if (!Number.isFinite(numeric)) {
				setFocusValue(null);
				return;
			}
			const clamped = Math.min(
				Math.max(numeric, appliedYearRange.from),
				appliedYearRange.to,
			);
			setFocusValue(clamped);
		},
		[appliedYearRange],
	);

	useEffect(() => {
		if (!appliedYearRange) {
			setFocusError(undefined);
			return;
		}
		if (!focusInput.trim()) {
			setFocusError(undefined);
			return;
		}
		const { error } = ensureFocusYear(focusInput, appliedYearRange);
		setFocusError(error);
	}, [focusInput, appliedYearRange]);

	const visibleRange = useMemo(() => {
		if (!appliedYearRange) return undefined;
		const center = focusValue ?? midpoint(appliedYearRange);
		return deriveVisibleRange(appliedYearRange, center, zoomPercent);
	}, [appliedYearRange, focusValue, zoomPercent]);

	return {
		focusYear: focusInput,
		setFocusYear: handleFocusChange,
		focusError,
		zoomPercent,
		setZoomPercent,
		visibleRange,
		reset,
	};
};
