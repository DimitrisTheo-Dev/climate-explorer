import { describe, expect, it } from "vitest";

import {
	prepareSeries,
	computeYDomain,
	calculateScales,
	buildStdBands,
} from "../prepareSeries";
import type { TemperatureResponse } from "../../../types/temperature";
import type { Station } from "../../../types/station";
import type { YearRange } from "../../../types/shared";

const stations: Station[] = [
	{ id: "alpha", name: "Alpha", firstYear: 1900, lastYear: 2000 },
	{ id: "beta", name: "Beta", firstYear: 1900, lastYear: 2000 },
];

const visibleRange: YearRange = { from: 1900, to: 1902 };

const monthlyResponse: TemperatureResponse = {
	mode: "monthly",
	series: [
		{
			stationId: "alpha",
			points: [
				{ year: 1900, month: 1, temperature: 1.2 },
				{ year: 1903, month: 1, temperature: 1.4 },
			],
		},
	],
};

const annualResponse: TemperatureResponse = {
	mode: "annual",
	series: [
		{
			stationId: "alpha",
			points: [
				{ year: 1900, mean: 1.1, std: 0.2, upper: 1.3, lower: 0.9 },
				{ year: 1901, mean: 1.4, std: 0.1, upper: 1.5, lower: 1.3 },
			],
		},
	],
};

describe("chart preparation utilities", () => {
	it("prepares monthly series and filters by visible range", () => {
		const series = prepareSeries(monthlyResponse, stations, visibleRange);
		expect(series).toHaveLength(1);
		expect(series[0].points).toHaveLength(1);
		expect(series[0].points[0].stationName).toBe("Alpha");
	});

	it("computes y domain including std bands", () => {
		const series = prepareSeries(annualResponse, stations, visibleRange);
		const domain = computeYDomain(series, "annual_std");
		expect(domain[0]).toBeCloseTo(0.9);
		expect(domain[1]).toBeCloseTo(1.5);
	});

	it("calculates scales for the viewport", () => {
		const series = prepareSeries(annualResponse, stations, visibleRange);
		const dimensions = {
			width: 640,
			height: 320,
			margin: { top: 20, right: 20, bottom: 30, left: 40 },
		};
		const { xScale, yScale } = calculateScales(
			visibleRange,
			computeYDomain(series, "annual"),
			dimensions,
		);
		expect(xScale(visibleRange.from)).toBeCloseTo(40);
		expect(yScale(1.4)).toBeLessThan(yScale(0.9));
	});

	it("builds std bands from annual data", () => {
		const series = prepareSeries(annualResponse, stations, visibleRange);
		const bands = buildStdBands(series);
		expect(bands[0].bandPoints).toHaveLength(2);
	});
});
