import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ClimateExplorerPage from "../ClimateExplorerPage";
import type { TemperatureResponse } from "../../types/temperature";
import type { AnalyticsSummary } from "../../types/analytics";
import type { Station } from "../../types/station";
import { ApiError } from "../../types/errors";
import { TooltipProvider } from "../../components/ui/tooltip";

import { useStations } from "../../hooks/useStations";
import { useSelectionForm } from "../../hooks/useSelectionForm";
import { useZoomState } from "../../hooks/useZoomState";
import { useTemperatureQueries } from "../../hooks/useTemperatureQueries";
import { useAnalyticsQuery } from "../../hooks/useAnalyticsQuery";

vi.mock("../../hooks/useStations", () => ({
	useStations: vi.fn(),
}));
vi.mock("../../hooks/useSelectionForm", () => ({
	useSelectionForm: vi.fn(),
}));
vi.mock("../../hooks/useZoomState", () => ({
	useZoomState: vi.fn(),
}));
vi.mock("../../hooks/useTemperatureQueries", () => ({
	useTemperatureQueries: vi.fn(),
}));
vi.mock("../../hooks/useAnalyticsQuery", () => ({
	useAnalyticsQuery: vi.fn(),
}));

const mockedStations = vi.mocked(useStations);
const mockedSelectionForm = vi.mocked(useSelectionForm);
const mockedZoom = vi.mocked(useZoomState);
const mockedTempQueries = vi.mocked(useTemperatureQueries);
const mockedAnalyticsQueries = vi.mocked(useAnalyticsQuery);

const stations: Station[] = [
	{ id: "alpha", name: "Greenland Summit", firstYear: 1900, lastYear: 2020 },
];

const temperatureResponse: TemperatureResponse = {
	mode: "monthly",
	series: [
		{
			stationId: "alpha",
			points: [
				{ year: 2000, month: 1, temperature: 1.2 },
				{ year: 2000, month: 2, temperature: 1.6 },
			],
		},
	],
};

const analyticsSummary: AnalyticsSummary = {
	selectedPeriod: { from: 1900, to: 2000 },
	stationsAnalyzed: 1,
	overallMeanTemperature: 1.2,
	overallMaxTemperature: 2.5,
	overallMinTemperature: -1.4,
	perStation: [{ stationId: "alpha", mean: 1.2, min: -1.4, max: 2.5 }],
};

const defaultSelection = {
	stationIds: ["alpha"],
	setStationIds: vi.fn(),
	mode: "monthly" as const,
	baseMode: "monthly" as const,
	includeStdBand: false,
	setMode: vi.fn(),
	setBaseMode: vi.fn(),
	setIncludeStdBand: vi.fn(),
	yearInputs: { from: "1900", to: "2000" },
	setYearInput: vi.fn(),
	errors: {},
	parsedValues: {
		stationIds: ["alpha"],
		mode: "monthly",
		yearRange: { from: 1900, to: 2000 },
		zoom: undefined,
	},
	isValid: true,
	syncFromValues: vi.fn(),
	resetToDefaults: vi.fn(),
};

const renderPage = () =>
	render(
		<TooltipProvider>
			<ClimateExplorerPage />
		</TooltipProvider>,
	);

beforeEach(() => {
	mockedStations.mockReturnValue({
		data: stations,
		isLoading: false,
		isFetching: false,
		error: null,
		refetch: vi.fn(),
	});
	mockedSelectionForm.mockReturnValue(defaultSelection);
	mockedZoom.mockReturnValue({
		focusYear: "1950",
		setFocusYear: vi.fn(),
		focusError: undefined,
		zoomPercent: 100,
		setZoomPercent: vi.fn(),
		visibleRange: { from: 1900, to: 2000 },
		reset: vi.fn(),
	});
	mockedTempQueries.mockReturnValue({
		data: temperatureResponse,
		error: null,
		isFetching: false,
		refetch: vi.fn(),
		requestTemperature: vi.fn(),
	});
	mockedAnalyticsQueries.mockReturnValue({
		data: analyticsSummary,
		error: null,
		isFetching: false,
		refetch: vi.fn(),
		requestAnalytics: vi.fn(),
	});
});

describe("ClimateExplorerPage", () => {
	it("renders analytics cards and the chart when data is available", async () => {
		const user = userEvent.setup();
		renderPage();

		const applyButtons = screen.getAllByRole("button", {
			name: /apply selection/i,
		});
		await user.click(applyButtons[0]);

		expect(screen.getByText("Period")).toBeInTheDocument();
		expect(
			await screen.findByRole("img", { name: /temperature chart/i }),
		).toBeInTheDocument();
	});

	it("renders the no-selection empty state when no stations are picked", () => {
	mockedSelectionForm.mockReturnValue({
		...defaultSelection,
		stationIds: [],
		parsedValues: null,
		isValid: false,
		baseMode: "monthly",
		includeStdBand: false,
	});

		mockedTempQueries.mockReturnValue({
			data: undefined,
			error: null,
			isFetching: false,
			refetch: vi.fn(),
			requestTemperature: vi.fn(),
		});

		renderPage();

		expect(screen.getByText(/start with stations/i)).toBeInTheDocument();
	});

	it("shows the error banner when the chart request fails", async () => {
		const user = userEvent.setup();
		mockedTempQueries.mockReturnValue({
			data: undefined,
			error: new ApiError("Server exploded", 500),
			isFetching: false,
			refetch: vi.fn(),
			requestTemperature: vi.fn(),
		});

		renderPage();
		const applyButtons = screen.getAllByRole("button", {
			name: /apply selection/i,
		});
		await user.click(applyButtons[0]);

		expect(await screen.findByText("Server exploded")).toBeInTheDocument();
	});

	it("keeps the chart idle until filters are applied", async () => {
		const user = userEvent.setup();
		renderPage();

		expect(
			screen.getByText(/choose filters and click apply/i),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: /temperature chart/i }),
		).not.toBeInTheDocument();

		const applyButtons = screen.getAllByRole("button", {
			name: /apply selection/i,
		});
		await user.click(applyButtons[0]);

		expect(
			await screen.findByRole("img", { name: /temperature chart/i }),
		).toBeInTheDocument();
	});
});
