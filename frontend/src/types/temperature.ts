import type { YearRange } from "./shared";

export type TemperatureRequestParams = {
	stationIds: string[];
	mode: "monthly" | "annual";
	includeStdBand: boolean;
	yearRange: YearRange;
};

export type MonthlyPoint = {
	year: number;
	month: number;
	temperature: number;
};

export type AnnualPoint = {
	year: number;
	mean: number;
	std: number | null;
	upper: number | null;
	lower: number | null;
};

export type MonthlySeries = {
	stationId: string;
	points: MonthlyPoint[];
};

export type AnnualSeries = {
	stationId: string;
	points: AnnualPoint[];
};

export type TemperatureResponse =
	| {
			mode: "monthly";
			series: MonthlySeries[];
	  }
	| {
			mode: "annual";
			series: AnnualSeries[];
	  };
