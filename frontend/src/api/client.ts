import axios from "axios";

import { ApiError, type ApiErrorPayload } from "../types/errors";

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
	timeout: 15000,
});

export const normalizeApiError = (error: unknown): ApiError => {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status ?? 500;
		const payload = error.response?.data as ApiErrorPayload | undefined;
		const message =
			payload?.error?.message ??
			error.response?.statusText ??
			"Unable to complete request";
		const code = payload?.error?.code;
		return new ApiError(message, status, code);
	}
	return new ApiError("Unexpected error", 500);
};
