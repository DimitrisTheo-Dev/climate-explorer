import { useQuery } from "@tanstack/react-query";

import { fetchStations } from "../api/endpoints";
import type { ApiError } from "../types/errors";
import type { Station } from "../types/station";

export const useStations = () => {
	return useQuery<Station[], ApiError>({
		queryKey: ["stations"],
		queryFn: fetchStations,
		staleTime: 1000 * 60 * 5,
	});
};
