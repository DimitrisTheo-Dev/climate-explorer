import type { YearRange } from "./shared";

export type AnalyticsRequestParams = {
	stationIds: string[];
	yearRange: YearRange;
};

export type AnalyticsPerStation = {
	stationId: string;
	mean: number;
	min: number;
	max: number;
};

export type AnalyticsSummary = {
	selectedPeriod: YearRange;
	stationsAnalyzed: number;
	overallMeanTemperature: number;
	overallMinTemperature: number;
	overallMaxTemperature: number;
	perStation: AnalyticsPerStation[];
};
