import type { TemperatureResponse } from "../types/temperature";
import type { ViewMode, YearRange } from "../types/shared";
import type { Station } from "./station";

export type ClimateChartProps = {
	response: TemperatureResponse;
	stations: Station[];
	viewMode: ViewMode;
	visibleRange: YearRange;
	className?: string;
};

export type ChartPoint = {
	stationId: string;
	stationName: string;
	xValue: number;
	yValue: number;
	year: number;
	month?: number;
	temperature?: number;
	mean?: number;
	std?: number | null;
	upper?: number | null;
	lower?: number | null;
};
