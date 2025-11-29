import type { AnalyticsSummary as AnalyticsSummaryType } from "../types/analytics";
import type { ApiError } from "../types/errors";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";

type AnalyticsStripProps = {
	data?: AnalyticsSummaryType;
	isLoading: boolean;
	error?: ApiError | null;
	onRetry?: () => void;
};

const cardsFromData = (data: AnalyticsSummaryType) => [
	{
		label: "Period",
		value: `${data.selectedPeriod.from} – ${data.selectedPeriod.to}`,
	},
	{ label: "Stations", value: data.stationsAnalyzed.toString() },
	{ label: "Mean", value: `${data.overallMeanTemperature.toFixed(1)}°C` },
	{ label: "Max", value: `${data.overallMaxTemperature.toFixed(1)}°C` },
	{ label: "Min", value: `${data.overallMinTemperature.toFixed(1)}°C` },
];

const SkeletonCard = () => (
	<Card className="h-full border border-dashed border-slate-200 bg-slate-50">
		<CardHeader className="pb-2">
			<div className="h-2 w-16 rounded-full bg-slate-200" />
		</CardHeader>
		<CardContent>
			<div className="h-4 w-24 rounded-full bg-slate-200" />
		</CardContent>
	</Card>
);

export const AnalyticsStrip = ({
	data,
	isLoading,
	error,
	onRetry,
}: AnalyticsStripProps) => {
	if (isLoading) {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_, index) => (
					<SkeletonCard key={index} />
				))}
			</div>
		);
	}

	if (error) {
		return <ErrorBanner message={error.message} onRetry={onRetry} />;
	}

	if (!data) {
		return (
			<Card className="border-dashed">
				<CardContent className="py-6">
					<EmptyState
						title="Run an analysis"
						description="Pick stations and years, then apply to view multi-station analytics."
					/>
				</CardContent>
			</Card>
		);
	}

	const cards = cardsFromData(data);

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
			{cards.map((card) => (
				<Card key={card.label} className="border border-slate-200">
					<CardHeader className="pb-1">
						<CardTitle className="text-[11px] uppercase text-slate-500">
							{card.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="text-lg font-semibold text-slate-900">
						{card.value}
					</CardContent>
				</Card>
			))}
		</div>
	);
};
