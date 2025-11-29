import { useQuery } from "@tanstack/react-query";

import { fetchAnalytics } from "../api/endpoints";
import type { ApiError } from "../types/errors";
import type {
	AnalyticsRequestParams,
	AnalyticsSummary,
} from "../types/analytics";

const idleKey = ["analytics", "idle"] as const;

export const useAnalytics = (params: AnalyticsRequestParams | null) => {
	const queryKey = params
		? [
				"analytics",
				[...params.stationIds].sort(),
				params.yearRange.from,
				params.yearRange.to,
			]
		: idleKey;

	return useQuery<AnalyticsSummary, ApiError>({
		queryKey,
		queryFn: () => fetchAnalytics(params as AnalyticsRequestParams),
		enabled: Boolean(params),
		retry: (failureCount, error) => {
			if (!params) return false;
			if (error.code === "NO_DATA") return false;
			return failureCount < 2;
		},
		staleTime: 1000 * 60,
	});
};
