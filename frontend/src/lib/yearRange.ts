import { z } from "zod";

import type { YearRange } from "../types/shared";

export type YearInputValues = { from: string; to: string };
export type YearRangeErrors = { from?: string; to?: string };

export const YearRangeSchema = z
	.object({
		from: z.number({ required_error: "Enter a starting year" }),
		to: z.number({ required_error: "Enter an ending year" }),
	})
	.refine((value) => value.from <= value.to, {
		message: "End year must be after start year",
		path: ["to"],
	});

const parseYear = (value: string) => {
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : undefined;
};

export const midpoint = (range: YearRange) =>
	Math.round((range.from + range.to) / 2);

export const validateYearInputs = (
	values: YearInputValues,
	bounds?: YearRange,
): { errors: YearRangeErrors; range?: YearRange } => {
	const parsedFrom = parseYear(values.from);
	const parsedTo = parseYear(values.to);
	const errors: YearRangeErrors = {};

	if (parsedFrom === undefined) {
		errors.from = "Enter a valid start year";
	}
	if (parsedTo === undefined) {
		errors.to = "Enter a valid end year";
	}

	if (parsedFrom !== undefined && bounds && parsedFrom < bounds.from) {
		errors.from = `Must be ≥ ${bounds.from}`;
	}
	if (parsedTo !== undefined && bounds && parsedTo > bounds.to) {
		errors.to = `Must be ≤ ${bounds.to}`;
	}

	if (
		!errors.from &&
		!errors.to &&
		parsedFrom !== undefined &&
		parsedTo !== undefined
	) {
		try {
			const safeRange = YearRangeSchema.parse({
				from: parsedFrom,
				to: parsedTo,
			});
			return { errors, range: safeRange };
		} catch (schemaError) {
			const zodError = schemaError as z.ZodError;
			zodError.issues.forEach((issue) => {
				if (issue.path[0] === "from") {
					errors.from = issue.message;
				}
				if (issue.path[0] === "to") {
					errors.to = issue.message;
				}
			});
		}
	}

	return { errors };
};
