import { useState } from "react";

import { useAnalytics } from "./useAnalytics";
import type { AnalyticsRequestParams } from "../types/analytics";

export const useAnalyticsQuery = () => {
	const [params, setParams] = useState<AnalyticsRequestParams | null>(null);
	const query = useAnalytics(params);

	const requestAnalytics = (next: AnalyticsRequestParams) => {
		setParams(next);
	};

	return {
		data: query.data,
		error: query.error,
		isFetching: query.isFetching,
		refetch: query.refetch,
		requestAnalytics,
	};
};
