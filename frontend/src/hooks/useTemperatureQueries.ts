import { useState } from "react";

import { useTemperatureData } from "./useTemperatureData";
import type { TemperatureRequestParams } from "../types/temperature";

export const useTemperatureQueries = () => {
	const [params, setParams] = useState<TemperatureRequestParams | null>(null);
	const query = useTemperatureData(params);

	const requestTemperature = (next: TemperatureRequestParams) => {
		setParams(next);
	};

	return {
		data: query.data,
		error: query.error,
		isFetching: query.isFetching,
		refetch: query.refetch,
		requestTemperature,
	};
};
