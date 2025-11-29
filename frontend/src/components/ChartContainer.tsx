import type { Station } from "../types/station";
import type { TemperatureResponse } from "../types/temperature";
import type { ApiError } from "../types/errors";
import type { ViewMode, YearRange } from "../types/shared";
import { Card } from "./ui/card";
import { ClimateChart } from "./ClimateChart";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingMessage } from "./LoadingMessage";

type ChartContainerProps = {
	response?: TemperatureResponse;
	isLoading: boolean;
	error?: ApiError | null;
	onRetry?: () => void;
	stations: Station[];
	viewMode: ViewMode;
	visibleRange: YearRange;
};

export const ChartContainer = ({
	response,
	isLoading,
	error,
	onRetry,
	stations,
	viewMode,
	visibleRange,
}: ChartContainerProps) => {
	if (isLoading) {
		return (
			<Card className="flex h-full items-center justify-center border border-slate-200">
				<LoadingMessage label="Preparing chart…" />
			</Card>
		);
	}

	if (error) {
		if (error.code === "NO_DATA") {
			return (
				<Card className="flex h-full items-center justify-center border border-slate-200 p-6">
					<EmptyState
						title="No data for this selection"
						description="Try broadening the year range or picking different stations."
						action={
							onRetry && (
								<button
									type="button"
									onClick={onRetry}
									className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
								>
									Retry
								</button>
							)
						}
					/>
				</Card>
			);
		}
		return (
			<Card className="border border-slate-200 p-4">
				<ErrorBanner message={error.message} onRetry={onRetry} />
			</Card>
		);
	}

	if (!response) {
		return (
			<Card className="flex h-full items-center justify-center border border-dashed border-slate-300 p-6">
				<EmptyState
					title="Visualize the trend"
					description="Run an analysis to project multi-station temperature trends."
				/>
			</Card>
		);
	}

	return (
		<Card className="flex h-full flex-col border border-slate-200 p-4">
			<ClimateChart
				className="flex h-full flex-col"
				response={response}
				stations={stations}
				viewMode={viewMode}
				visibleRange={visibleRange}
			/>
		</Card>
	);
};
