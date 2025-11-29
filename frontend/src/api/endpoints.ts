import type {
	AnalyticsRequestParams,
	AnalyticsSummary,
} from "../types/analytics";
import type { Station } from "../types/station";
import type {
	TemperatureRequestParams,
	TemperatureResponse,
} from "../types/temperature";
import type { YearRange } from "../types/shared";
import type {
	AnalyticsResponseApi,
	StationApiResponse,
	TemperatureResponseApi,
} from "../types/apiResponses";
import { apiClient, normalizeApiError } from "./client";

const toYearRange = (range: { from: number; to: number }): YearRange => ({
	from: range.from,
	to: range.to,
});

export const fetchStations = async (): Promise<Station[]> => {
	try {
		const response = await apiClient.get<StationApiResponse[]>("/stations");
		return response.data.map((station) => ({
			id: station.id,
			name: station.name,
			firstYear: station.first_year,
			lastYear: station.last_year,
		}));
	} catch (error) {
		throw normalizeApiError(error);
	}
};

export const fetchTemperatureData = async (
	params: TemperatureRequestParams,
): Promise<TemperatureResponse> => {
	try {
		const response = await apiClient.post<TemperatureResponseApi>(
			"/temperature-data",
			{
				station_ids: params.stationIds,
				mode: params.mode,
				include_std_band: params.includeStdBand,
				year_range: {
					from: params.yearRange.from,
					to: params.yearRange.to,
				},
			},
		);

		const data = response.data;
		if (data.mode === "monthly") {
			return {
				mode: "monthly",
				series: data.series.map((series) => ({
					stationId: series.station_id,
					points: series.points.map((point) => ({
						year: point.year,
						month: point.month,
						temperature: point.temperature,
					})),
				})),
			};
		}

		return {
			mode: "annual",
			series: data.series.map((series) => ({
				stationId: series.station_id,
				points: series.points.map((point) => ({
					year: point.year,
					mean: point.mean,
					std: point.std,
					upper: point.upper,
					lower: point.lower,
				})),
			})),
		};
	} catch (error) {
		throw normalizeApiError(error);
	}
};

export const fetchAnalytics = async (
	params: AnalyticsRequestParams,
): Promise<AnalyticsSummary> => {
	try {
		const response = await apiClient.post<AnalyticsResponseApi>("/analytics", {
			station_ids: params.stationIds,
			year_range: {
				from: params.yearRange.from,
				to: params.yearRange.to,
			},
		});

		const data = response.data;
		return {
			selectedPeriod: toYearRange(data.selected_period),
			stationsAnalyzed: data.stations_analyzed,
			overallMeanTemperature: data.overall_mean_temperature,
			overallMinTemperature: data.overall_min_temperature,
			overallMaxTemperature: data.overall_max_temperature,
			perStation: data.per_station.map((station) => ({
				stationId: station.station_id,
				mean: station.mean,
				min: station.min,
				max: station.max,
			})),
		};
	} catch (error) {
		throw normalizeApiError(error);
	}
};
