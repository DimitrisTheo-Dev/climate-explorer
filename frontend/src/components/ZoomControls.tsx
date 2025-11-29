import {useEffect, useState} from "react";
import type {YearRange} from "../types/shared";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Slider} from "./ui/slider";
import {cn} from "../lib/utils.ts";

type ZoomControlsProps = {
    focusYear: string;
    onFocusYearChange: (value: string) => void;
    focusError?: string;
    zoomPercent: number;
    onZoomChange: (value: number) => void;
    visibleRange?: YearRange;
    baseRange?: YearRange;
    onReset: () => void;
    disabled?: boolean;
};

export const ZoomControls = ({
                                 focusYear,
                                 onFocusYearChange,
                                 focusError,
                                 zoomPercent,
                                 onZoomChange,
                                 visibleRange,
                                 baseRange,
                                 onReset,
                                 disabled = false,
                             }: ZoomControlsProps) => {
    const controlsDisabled = disabled || !baseRange;

    // Local slider value for smooth movement
    const [localZoom, setLocalZoom] = useState(zoomPercent);
    useEffect(() => {
        setLocalZoom(zoomPercent);
    }, [zoomPercent]);

    // Local focus year so user can type freely
    const [localFocusYear, setLocalFocusYear] = useState(focusYear);
    useEffect(() => {
        setLocalFocusYear(focusYear);
    }, [focusYear]);

    const commitFocusYear = () => {
        // Optional: trim here
        const trimmed = localFocusYear.trim();
        onFocusYearChange(trimmed);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                        Zoom &amp; focus
                    </p>
                    <p className="text-xs text-slate-500">
                        {visibleRange
                            ? `Viewing ${visibleRange.from} – ${visibleRange.to}`
                            : "Apply a dataset to preview the zoom window."}
                    </p>
                </div>
                {
                    !controlsDisabled &&
                    <button
                        type="button"
                        className="text-[11px] font-semibold text-brand hover:text-brand-dark disabled:text-slate-400"
                        onClick={onReset}
                        disabled={controlsDisabled}
                    >
                        Reset
                    </button>
                }
            </div>

            <div className={cn("space-y-2", controlsDisabled && "opacity-50 cursor-not-allowed")}>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">Zoom level</span>
                    <span className="font-semibold text-slate-800">{localZoom}%</span>
                </div>
                <Slider
                    value={[localZoom]}
                    min={25}
                    max={100}
                    step={1}
                    disabled={controlsDisabled}
                    aria-label="Zoom level"
                    onValueChange={(value) => {
                        const next = value[0] ?? localZoom;
                        setLocalZoom(next);
                    }}
                    onValueCommit={(value) => {
                        const next = value[0] ?? zoomPercent;
                        onZoomChange(next);
                    }}
                />
            </div>

            <div className="space-y-1.5">
                <Label
                    htmlFor="focus-year"
                    className="text-xs font-medium text-slate-600"
                >
                    Year of interest
                </Label>
                <Input
                    id="focus-year"
                    // use text + numeric keyboard to avoid number quirks
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={localFocusYear}
                    disabled={controlsDisabled}
                    onChange={(event) => {
                        setLocalFocusYear(event.currentTarget.value);
                    }}
                    onBlur={commitFocusYear}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.currentTarget.blur();
                            commitFocusYear();
                        }
                    }}
                    aria-invalid={focusError ? "true" : "false"}
                    className={
                        focusError ? "border-red-200 focus-visible:ring-red-400" : ""
                    }
                />
                <p
                    className={`text-[11px] ${
                        focusError ? "text-red-500" : "text-slate-500"
                    }`}
                >
                    {focusError
                        ? focusError
                        : baseRange
                            ? `Keep between ${baseRange.from} – ${baseRange.to}`
                            : "Apply filters to enable focus."}
                </p>
            </div>
        </div>
    );
};
