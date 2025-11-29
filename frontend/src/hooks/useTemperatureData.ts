import { useQuery } from "@tanstack/react-query";

import { fetchTemperatureData } from "../api/endpoints";
import type { ApiError } from "../types/errors";
import type {
	TemperatureRequestParams,
	TemperatureResponse,
} from "../types/temperature";

const idleKey = ["temperature-data", "idle"] as const;

export const useTemperatureData = (params: TemperatureRequestParams | null) => {
	const queryKey = params
		? [
				"temperature-data",
				[...params.stationIds].sort(),
				params.mode,
				params.yearRange.from,
				params.yearRange.to,
				params.includeStdBand,
			]
		: idleKey;

	return useQuery<TemperatureResponse, ApiError>({
		queryKey,
		queryFn: () => fetchTemperatureData(params as TemperatureRequestParams),
		enabled: Boolean(params),
		retry: (failureCount, error) => {
			if (!params) return false;
			if (error.code === "NO_DATA") return false;
			return failureCount < 2;
		},
		staleTime: 1000 * 60,
	});
};
