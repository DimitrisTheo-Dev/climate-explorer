import { z } from "zod";

export const ClimateExplorerFormSchema = z.object({
	stationIds: z.array(z.string().min(1)).min(1, "Select at least one station"),
	mode: z.enum(["monthly", "annual", "annual_std"]),
	yearRange: z
		.object({
			from: z.preprocess(
				(value) => (typeof value === "string" ? Number(value) : value),
				z.number({ required_error: "Enter a start year" }),
			),
			to: z.preprocess(
				(value) => (typeof value === "string" ? Number(value) : value),
				z.number({ required_error: "Enter an end year" }),
			),
		})
		.refine((range) => range.from <= range.to, {
			message: "Start year must be before end year",
			path: ["to"],
		}),
	zoom: z
		.object({
			startYear: z.number().optional(),
			endYear: z.number().optional(),
		})
		.optional(),
});

export type ClimateExplorerFormValues = z.infer<
	typeof ClimateExplorerFormSchema
>;
