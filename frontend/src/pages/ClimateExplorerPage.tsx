import { useMemo, useState, useEffect, useRef } from "react";
import { SlidersHorizontal } from "lucide-react";

import { AnalyticsStrip } from "../components/AnalyticsStrip";
import { ChartContainer } from "../components/ChartContainer";
import { ClimateExplorerSkeleton } from "../components/ClimateExplorerSkeleton";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { FilterControls } from "../components/FilterControls";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../components/ui/sheet";
import { useSelectionForm } from "../hooks/useSelectionForm";
import { useZoomState } from "../hooks/useZoomState";
import { useTemperatureQueries } from "../hooks/useTemperatureQueries";
import { useAnalyticsQuery } from "../hooks/useAnalyticsQuery";
import { useStations } from "../hooks/useStations";
import type { ClimateExplorerFormValues } from "../lib/climateSchema";

const ClimateExplorerPage = () => {
	const stationsQuery = useStations();
	const globalYearBounds = useMemo(() => {
		if (!stationsQuery.data?.length) return undefined;
		const firstYear = Math.min(
			...stationsQuery.data.map((station) => station.firstYear),
		);
		const lastYear = Math.max(
			...stationsQuery.data.map((station) => station.lastYear),
		);
		return { from: firstYear, to: lastYear };
	}, [stationsQuery.data]);

	const selectionForm = useSelectionForm(globalYearBounds);
	const temperatureQueries = useTemperatureQueries();
	const analyticsQueries = useAnalyticsQuery();
	const [appliedFilters, setAppliedFilters] =
		useState<ClimateExplorerFormValues | null>(null);
	const appliedYearRange = appliedFilters?.yearRange;
	const zoomState = useZoomState({
		appliedYearRange,
	});
	const syncFormFromApplied = selectionForm.syncFromValues;
	const resetFormToDefaults = selectionForm.resetToDefaults;
	const [isFiltersOpen, setFiltersOpen] = useState(false);
	const wasDrawerOpen = useRef(false);

	useEffect(() => {
		if (wasDrawerOpen.current && !isFiltersOpen) {
			if (appliedFilters) {
				syncFormFromApplied(appliedFilters);
			} else {
				resetFormToDefaults();
			}
		}
		wasDrawerOpen.current = isFiltersOpen;
	}, [
		isFiltersOpen,
		appliedFilters,
		syncFormFromApplied,
		resetFormToDefaults,
	]);

	if (stationsQuery.isLoading && !stationsQuery.data) {
		return <ClimateExplorerSkeleton />;
	}

	if (stationsQuery.error) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-background px-4">
				<div className="max-w-md w-full">
					<ErrorBanner
						message={stationsQuery.error.message}
						onRetry={() => stationsQuery.refetch()}
					/>
				</div>
			</main>
		);
	}

	const hasAppliedSelection = Boolean(appliedFilters?.stationIds.length);
	const appliedViewMode = appliedFilters?.mode ?? "monthly";
	const chartVisibleRange =
		zoomState.visibleRange ?? appliedYearRange ?? globalYearBounds ?? { from: 0, to: 0 };

	const handleApply = () => {
		if (!selectionForm.parsedValues) return false;
		const payload = selectionForm.parsedValues;
		const nextApplied: ClimateExplorerFormValues = {
			...payload,
			zoom: undefined,
		};

		setAppliedFilters(nextApplied);
		syncFormFromApplied(nextApplied);

		const apiMode = payload.mode === "monthly" ? "monthly" : "annual";
		const includeStdBand = payload.mode === "annual_std";

		temperatureQueries.requestTemperature({
			stationIds: payload.stationIds,
			mode: apiMode,
			includeStdBand,
			yearRange: payload.yearRange,
		});
		analyticsQueries.requestAnalytics({
			stationIds: payload.stationIds,
			yearRange: payload.yearRange,
		});

		return true;
	};

	const handleSheetApply = () => {
		const applied = handleApply();
		if (applied) {
			setFiltersOpen(false);
		}
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-6 lg:py-8">
				<header className="space-y-2">
					<p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand">
						Climate Explorer
					</p>
					<h1 className="text-3xl font-semibold text-slate-900">
						Global temperature intelligence
					</h1>
					<p className="max-w-3xl text-sm text-slate-500">
						Interactively compare climate stations, switch measurement modes,
						and zoom across decades without leaving the main canvas.
					</p>
				</header>

				<div className="flex-1 space-y-4">
					<div className="lg:hidden">
						<Sheet open={isFiltersOpen} onOpenChange={setFiltersOpen}>
							<SheetTrigger asChild>
								<Button
									variant="outline"
									className="w-full justify-center gap-2 text-sm font-semibold"
								>
									<SlidersHorizontal className="size-4" aria-hidden="true" />
									Filters
								</Button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-full max-w-full overflow-y-auto sm:max-w-md"
							>
								<SheetHeader>
									<SheetTitle>Filters</SheetTitle>
									<SheetDescription>
										Adjust the dataset controls and rerun the analysis.
									</SheetDescription>
								</SheetHeader>
								<div className="mt-6 flex h-full flex-col gap-5 pb-8">
									<FilterControls
										selectionForm={selectionForm}
										zoomState={zoomState}
										stations={stationsQuery.data ?? []}
										isStationsLoading={stationsQuery.isLoading}
										globalYearBounds={globalYearBounds}
										appliedYearRange={appliedYearRange}
										onApply={handleSheetApply}
									/>
								</div>
							</SheetContent>
						</Sheet>
					</div>

					<div className="grid flex-1 gap-4 lg:grid-cols-[350px,minmax(0,1fr)]">
						<aside className="hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-card sm:p-5 lg:block lg:h-full">
							<div className="flex h-full flex-col gap-5">
								<FilterControls
									selectionForm={selectionForm}
									zoomState={zoomState}
									stations={stationsQuery.data ?? []}
									isStationsLoading={stationsQuery.isLoading}
									globalYearBounds={globalYearBounds}
									appliedYearRange={appliedYearRange}
									onApply={handleApply}
								/>
							</div>
						</aside>

						<section className="flex min-h-[520px] flex-col gap-4">
							<AnalyticsStrip
								data={analyticsQueries.data}
								isLoading={analyticsQueries.isFetching}
								error={analyticsQueries.error}
								onRetry={() => analyticsQueries.refetch()}
							/>
							<div className="flex flex-1 flex-col">
								{!hasAppliedSelection ? (
									<Card className="flex flex-1 items-center justify-center border border-dashed border-slate-300 p-8">
										<EmptyState
											title="Start with stations"
											description="Choose filters and click Apply to activate analytics and the chart."
										/>
									</Card>
								) : (
									<ChartContainer
										response={temperatureQueries.data}
										isLoading={temperatureQueries.isFetching}
										error={temperatureQueries.error}
										onRetry={() => temperatureQueries.refetch()}
										stations={stationsQuery.data ?? []}
										viewMode={appliedViewMode}
										visibleRange={chartVisibleRange}
									/>
								)}
							</div>
						</section>
					</div>
				</div>
			</div>
		</main>
	);
};

export default ClimateExplorerPage;
