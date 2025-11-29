export type StationApiResponse = {
	id: string;
	name: string;
	first_year: number;
	last_year: number;
};

export type MonthlyPointApi = {
	year: number;
	month: number;
	temperature: number;
};

export type AnnualPointApi = {
	year: number;
	mean: number;
	std: number | null;
	upper: number | null;
	lower: number | null;
};

export type MonthlySeriesApi = {
	station_id: string;
	points: MonthlyPointApi[];
};

export type AnnualSeriesApi = {
	station_id: string;
	points: AnnualPointApi[];
};

export type TemperatureResponseApi =
	| {
			mode: "monthly";
			series: MonthlySeriesApi[];
	  }
	| {
			mode: "annual";
			series: AnnualSeriesApi[];
	  };

export type AnalyticsResponseApi = {
	selected_period: { from: number; to: number };
	stations_analyzed: number;
	overall_mean_temperature: number;
	overall_min_temperature: number;
	overall_max_temperature: number;
	per_station: {
		station_id: string;
		mean: number;
		min: number;
		max: number;
	}[];
};
