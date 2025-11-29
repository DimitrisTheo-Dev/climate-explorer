import * as d3 from "d3";

import type { TemperatureResponse } from "../../types/temperature";
import type { Station } from "../../types/station";
import type { ViewMode, YearRange } from "../../types/shared";
import type { ChartPoint } from "../../types/charts";

export type PreparedSeries = {
	stationId: string;
	points: ChartPoint[];
};

export type ChartDimensions = {
	width: number;
	height: number;
	margin: { top: number; right: number; bottom: number; left: number };
};

const MONTH_LABEL_MODIFIER = 1 / 12;

const buildStationLookup = (stations: Station[]) =>
	stations.reduce<Record<string, Station>>((acc, station) => {
		acc[station.id] = station;
		return acc;
	}, {});

export const prepareSeries = (
	response: TemperatureResponse,
	stations: Station[],
	visibleRange: YearRange,
): PreparedSeries[] => {
	const stationLookup = buildStationLookup(stations);
	if (response.mode === "monthly") {
		return response.series.map((series) => ({
			stationId: series.stationId,
			points: series.points
				.map((point) => ({
					stationId: series.stationId,
					stationName:
						stationLookup[series.stationId]?.name ?? series.stationId,
					xValue: point.year + (point.month - 1) * MONTH_LABEL_MODIFIER,
					yValue: point.temperature,
					year: point.year,
					month: point.month,
					temperature: point.temperature,
				}))
				.filter(
					(point) =>
						point.xValue >= visibleRange.from &&
						point.xValue <= visibleRange.to,
				),
		}));
	}

	return response.series.map((series) => ({
		stationId: series.stationId,
		points: series.points
			.map((point) => ({
				stationId: series.stationId,
				stationName: stationLookup[series.stationId]?.name ?? series.stationId,
				xValue: point.year,
				yValue: point.mean,
				year: point.year,
				mean: point.mean,
				std: point.std,
				upper: point.upper,
				lower: point.lower,
			}))
			.filter(
				(point) =>
					point.xValue >= visibleRange.from && point.xValue <= visibleRange.to,
			),
	}));
};

export const computeYDomain = (
	series: PreparedSeries[],
	viewMode: ViewMode,
): [number, number] => {
	const allPoints = series.flatMap((entry) => entry.points);
	if (!allPoints.length) return [0, 1];
	if (viewMode === "annual_std") {
		const lows = allPoints.map((point) => point.lower ?? point.yValue);
		const highs = allPoints.map((point) => point.upper ?? point.yValue);
		return [Math.min(...lows), Math.max(...highs)];
	}
	const values = allPoints.map((point) => point.yValue);
	return [Math.min(...values), Math.max(...values)];
};

export const calculateScales = (
	visibleRange: YearRange,
	yDomain: [number, number],
	dimensions: ChartDimensions,
) => {
	const xScale = d3
		.scaleLinear()
		.domain([visibleRange.from, visibleRange.to])
		.range([
			dimensions.margin.left,
			dimensions.width - dimensions.margin.right,
		]);

	const padding = (yDomain[1] - yDomain[0]) * 0.1 || 1;
	const yScale = d3
		.scaleLinear()
		.domain([yDomain[0] - padding, yDomain[1] + padding])
		.range([
			dimensions.height - dimensions.margin.bottom,
			dimensions.margin.top,
		]);

	const xTicks = xScale.ticks(
		Math.min(10, visibleRange.to - visibleRange.from),
	);
	const yTicks = yScale.ticks(6);

	return { xScale, yScale, xTicks, yTicks };
};

export const buildStdBands = (series: PreparedSeries[]) => {
	return series.map((entry) => ({
		stationId: entry.stationId,
		bandPoints: entry.points.filter(
			(point) => point.lower !== null && point.upper !== null,
		),
	}));
};
