import type { YearRange } from "../types/shared";

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export const deriveVisibleRange = (
	baseRange: YearRange,
	focusYear: number,
	zoomPercent: number,
): YearRange => {
	const totalSpan = baseRange.to - baseRange.from;
	const minSpan = 1;
	const requestedSpan = Math.max(
		minSpan,
		Math.round(totalSpan * (zoomPercent / 100)),
	);
	const safeFocus = clamp(focusYear, baseRange.from, baseRange.to);
	let start = safeFocus - Math.floor(requestedSpan / 2);
	let end = start + requestedSpan;

	if (start < baseRange.from) {
		start = baseRange.from;
		end = start + requestedSpan;
	}
	if (end > baseRange.to) {
		end = baseRange.to;
		start = end - requestedSpan;
	}

	return {
		from: clamp(start, baseRange.from, baseRange.to),
		to: clamp(end, baseRange.from, baseRange.to),
	};
};

export const ensureFocusYear = (focus: string, range?: YearRange) => {
	if (!range) {
		return { error: "Select a station to focus the zoom.", value: undefined };
	}
	if (!focus) {
		return { error: "Enter a year to focus the zoom", value: undefined };
	}
	const numeric = Number(focus);
	if (!Number.isFinite(numeric)) {
		return { error: "Focus year must be numeric", value: undefined };
	}
	if (numeric < range.from || numeric > range.to) {
		return {
			error: `Focus year must stay within ${range.from} – ${range.to}`,
			value: undefined,
		};
	}
	return { error: undefined, value: numeric };
};
