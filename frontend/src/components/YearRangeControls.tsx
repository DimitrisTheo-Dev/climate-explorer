import {
    Fragment,
    useEffect,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

type YearRangeControlsProps = {
    values: { from: string; to: string };
    errors: { from?: string; to?: string };
    onChange: (field: "from" | "to", value: string) => void;
    minYear?: number;
    maxYear?: number;
};

const helperText = (
    field: "from" | "to",
    errors: { from?: string; to?: string },
    bounds?: { min?: number; max?: number },
) => {
    if (errors[field]) return errors[field];
    if (field === "from" && bounds?.min !== undefined) return `≥ ${bounds.min}`;
    if (field === "to" && bounds?.max !== undefined) return `≤ ${bounds.max}`;
    return "Awaiting data";
};

export const YearRangeControls = ({
                                      values,
                                      errors,
                                      onChange,
                                      minYear,
                                      maxYear,
                                  }: YearRangeControlsProps) => {
    const [localValues, setLocalValues] = useState<{ from: string; to: string }>({
        from: values?.from ?? "",
        to: values?.to ?? "",
    });

    useEffect(() => {
        setLocalValues({
            from: values?.from ?? "",
            to: values?.to ?? "",
        });
    }, [values?.from, values?.to]);

    const applyFullRange = () => {
        setLocalValues((prev) => ({
            ...prev,
            from: minYear !== undefined ? String(minYear) : prev.from,
            to: maxYear !== undefined ? String(maxYear) : prev.to,
        }));

        if (minYear !== undefined) onChange("from", String(minYear));
        if (maxYear !== undefined) onChange("to", String(maxYear));
    };

    const handleChange =
        (field: "from" | "to") =>
            (event: ChangeEvent<HTMLInputElement>) => {
                const next = event.target?.value ?? "";
                setLocalValues((prev) => ({
                    ...prev,
                    [field]: next,
                }));
            };

    const commitField = (field: "from" | "to") => {
        const raw = localValues[field] ?? "";
        const trimmed = raw.trim();
        if (trimmed !== values[field]) {
            onChange(field, trimmed);
        }
    };

    const handleBlur = (field: "from" | "to") => () => {
        commitField(field);
    };

    const handleKeyDown =
        (field: "from" | "to") =>
            (event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") {
                    // blur will trigger onBlur → commitField
                    (event.target as HTMLInputElement | null)?.blur();
                }
            };

    const renderInput = (field: "from" | "to", label: string) => (
        <div className="space-y-1.5">
            <Label
                htmlFor={`year-${field}`}
                className="text-xs font-medium text-slate-600"
            >
                {label}
            </Label>
            <Input
                id={`year-${field}`}
                // text + numeric keyboard so typing full years feels natural
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={localValues[field] ?? ""}
                onChange={handleChange(field)}
                onBlur={handleBlur(field)}
                onKeyDown={handleKeyDown(field)}
                aria-invalid={errors[field] ? "true" : "false"}
                className={
                    errors[field] ? "border-red-200 focus-visible:ring-red-400" : ""
                }
            />
            <p
                className={`text-[11px] ${
                    errors[field] ? "text-red-500" : "text-slate-500"
                }`}
            >
                {helperText(field, errors, { min: minYear, max: maxYear })}
            </p>
        </div>
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                        Years
                    </Label>
                    <p className="text-xs text-slate-500">
                        {minYear !== undefined && maxYear !== undefined
                            ? `Available ${minYear} – ${maxYear}`
                            : "Awaiting station metadata"}
                    </p>
                </div>
                {minYear !== undefined && maxYear !== undefined ? (
                    <button
                        type="button"
                        className="text-[11px] font-medium text-brand hover:text-brand-dark"
                        onClick={applyFullRange}
                    >
                        Use full range
                    </button>
                ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {(["from", "to"] as const).map((field) => (
                    <Fragment key={field}>
                        {renderInput(field, field === "from" ? "From year" : "To year")}
                    </Fragment>
                ))}
            </div>
        </div>
    );
};
