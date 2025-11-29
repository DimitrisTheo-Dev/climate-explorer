import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import type { ChartPoint, ClimateChartProps } from "../types/charts";
import type { Station } from "../types/station";
import { cn } from "../lib/utils";
import { EmptyState } from "./EmptyState";
import {
	buildStdBands,
	calculateScales,
	computeYDomain,
	prepareSeries,
} from "../lib/chart/prepareSeries";

const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
const colorPalette = d3.schemeTableau10;

export const ClimateChart = ({
	response,
	stations,
	viewMode,
	visibleRange,
	className,
}: ClimateChartProps) => {
	const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(
		null,
	);
	const svgRef = useRef<SVGSVGElement | null>(null);
	const [hoverPoint, setHoverPoint] = useState<ChartPoint | null>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	useEffect(() => {
		if (!chartContainer) return;
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			setDimensions({
				width: entry.contentRect.width,
				height: entry.contentRect.height,
			});
		});
		observer.observe(chartContainer);
		return () => observer.disconnect();
	}, [chartContainer]);

	const chartDimensions = useMemo(() => {
		const width = Math.max(dimensions.width, 640);
		const height = Math.max(dimensions.height, 320);
		return {
			width,
			height,
			margin: { top: 24, right: 32, bottom: 40, left: 56 },
		};
	}, [dimensions]);

	const stationLookup = useMemo(
		() =>
			stations.reduce<Record<string, Station>>((acc, station) => {
				acc[station.id] = station;
				return acc;
			}, {}),
		[stations],
	);

	const preparedSeries = useMemo(
		() => prepareSeries(response, stations, visibleRange),
		[response, stations, visibleRange],
	);

	const allPoints = useMemo(
		() => preparedSeries.flatMap((series) => series.points),
		[preparedSeries],
	);

	const yDomain = useMemo(
		() => computeYDomain(preparedSeries, viewMode),
		[preparedSeries, viewMode],
	);

	const { xScale, yScale, xTicks, yTicks } = useMemo(
		() => calculateScales(visibleRange, yDomain, chartDimensions),
		[visibleRange, yDomain, chartDimensions],
	);

	const stdBands = useMemo(
		() => buildStdBands(preparedSeries),
		[preparedSeries],
	);

	const colorScale = useMemo(
		() =>
			d3
				.scaleOrdinal<string, string>()
				.domain(preparedSeries.map((series) => series.stationId))
				.range(colorPalette),
		[preparedSeries],
	);

	const handlePointerMove = (
		event: React.MouseEvent<SVGRectElement, MouseEvent>,
	) => {
		if (!svgRef.current || !allPoints.length) return;
		const bounds = svgRef.current.getBoundingClientRect();
		const relativeX =
			((event.clientX - bounds.left) / bounds.width) * chartDimensions.width;
		const xValue = xScale.invert(relativeX);
		let closest: ChartPoint | null = null;
		let bestDistance = Number.POSITIVE_INFINITY;
		for (const point of allPoints) {
			const distance = Math.abs(point.xValue - xValue);
			if (distance < bestDistance) {
				bestDistance = distance;
				closest = point;
			}
		}
		if (!closest) return;
		setHoverPoint(closest);
	};

	const handlePointerLeave = () => setHoverPoint(null);

	const renderTooltip = () => {
		if (!hoverPoint || !svgRef.current) return null;
		const x = xScale(hoverPoint.xValue);
		const y = yScale(hoverPoint.yValue);
		const labelLines = [`${hoverPoint.stationName} — ${hoverPoint.year}`];
		if (response.mode === "monthly" && hoverPoint.month) {
			labelLines.push(
				`${MONTH_LABELS[hoverPoint.month - 1]}: ${hoverPoint.temperature?.toFixed(1)}°C`,
			);
		}
		if (response.mode === "annual") {
			labelLines.push(`Mean: ${hoverPoint.mean?.toFixed(1)}°C`);
			if (
				viewMode === "annual_std" &&
				hoverPoint.std !== null &&
				hoverPoint.std !== undefined
			) {
				labelLines.push(`Std dev: ${hoverPoint.std.toFixed(1)}°C`);
			}
		}

		return (
			<div
				className="pointer-events-none absolute rounded-xl border border-slate-200 bg-white/95 px-4 py-2 text-xs shadow-card"
				style={{
					left: Math.min(x, chartDimensions.width - 140),
					top: Math.max(y - 60, 10),
				}}
			>
				{labelLines.map((line) => (
					<p key={line} className="text-slate-700">
						{line}
					</p>
				))}
			</div>
		);
	};

	if (!allPoints.length) {
		return (
			<div
				className={cn("flex h-full items-center justify-center p-6", className)}
			>
				<EmptyState
					title="No visible points"
					description="Adjust the zoom slider to bring data into view."
				/>
			</div>
		);
	}

	const lineGenerator = d3
		.line<ChartPoint>()
		.x((point) => xScale(point.xValue))
		.y((point) => yScale(point.yValue))
		.curve(d3.curveMonotoneX);

	const areaGenerator = d3
		.area<ChartPoint>()
		.x((point) => xScale(point.xValue))
		.y0((point) => yScale(point.lower ?? point.yValue))
		.y1((point) => yScale(point.upper ?? point.yValue))
		.curve(d3.curveBasis);

	return (
		<div className={cn("flex h-full flex-col gap-4", className)}>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-0.5">
					<p className="text-sm font-semibold text-slate-900">
						Temperature trends
					</p>
					<p className="text-xs text-slate-500">
						{viewMode === "monthly" &&
							"Monthly lines visualize raw variability."}
						{viewMode === "annual" &&
							"Annual averages smooth intra-year noise."}
						{viewMode === "annual_std" &&
							"Annual averages with ±1σ bands reveal variance."}
					</p>
				</div>
				<div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
					{preparedSeries.map((series) => (
						<span
							key={series.stationId}
							className="inline-flex items-center gap-2"
						>
							<span
								className="inline-block size-2.5 rounded-full"
								style={{ backgroundColor: colorScale(series.stationId) }}
							/>
							{stationLookup[series.stationId]?.name ?? series.stationId}
						</span>
					))}
				</div>
			</div>
			<div ref={setChartContainer} className="relative flex-1 min-h-0">
				<svg
					role="img"
					aria-label="Temperature chart"
					ref={svgRef}
					viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
					className="h-full w-full"
				>
					<title>Temperature chart</title>
					<g className="text-xs text-slate-500">
						{xTicks.map((tick) => (
							<g key={tick} transform={`translate(${xScale(tick)},0)`}>
								<line
									y1={chartDimensions.margin.top}
									y2={chartDimensions.height - chartDimensions.margin.bottom}
									stroke="#e2e8f0"
									strokeDasharray="2 4"
								/>
								<text
									y={
										chartDimensions.height - chartDimensions.margin.bottom + 24
									}
									textAnchor="middle"
								>
									{tick}
								</text>
							</g>
						))}
						{yTicks.map((tick) => (
							<g key={tick} transform={`translate(0, ${yScale(tick)})`}>
								<line
									x1={chartDimensions.margin.left}
									x2={chartDimensions.width - chartDimensions.margin.right}
									stroke="#e2e8f0"
									strokeDasharray="2 4"
								/>
								<text
									x={chartDimensions.margin.left - 12}
									textAnchor="end"
									dy="0.32em"
								>
									{tick.toFixed(1)}°
								</text>
							</g>
						))}
					</g>
					{viewMode === "annual_std" && response.mode === "annual"
						? stdBands.map((series) => (
								<path
									key={`${series.stationId}-band`}
									d={areaGenerator(series.bandPoints)}
									fill={colorScale(series.stationId)}
									opacity={0.12}
								/>
							))
						: null}
					{preparedSeries.map((series) => (
						<path
							key={series.stationId}
							d={lineGenerator(series.points)}
							fill="none"
							stroke={colorScale(series.stationId)}
							strokeWidth={2.5}
						/>
					))}
					<rect
						x={chartDimensions.margin.left}
						y={chartDimensions.margin.top}
						width={
							chartDimensions.width -
							chartDimensions.margin.left -
							chartDimensions.margin.right
						}
						height={
							chartDimensions.height -
							chartDimensions.margin.top -
							chartDimensions.margin.bottom
						}
						fill="transparent"
						role="presentation"
						aria-hidden="true"
						onMouseMove={handlePointerMove}
						onMouseLeave={handlePointerLeave}
					/>
				</svg>
				{renderTooltip()}
			</div>
		</div>
	);
};
