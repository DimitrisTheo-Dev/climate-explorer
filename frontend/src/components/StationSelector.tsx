import { useCallback, useMemo, useState } from "react";
import { ChevronsUpDown, Search, X } from "lucide-react";

import type { Station } from "../types/station";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type StationSelectorProps = {
    stations: Station[];
    selectedStations: string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
    errorMessage?: string;
};

export const StationSelector = ({
                                    stations,
                                    selectedStations,
                                    onChange,
                                    disabled = false,
                                    errorMessage,
                                }: StationSelectorProps) => {
    const [open, setOpen] = useState(false);

    const selectedMetadata = stations.filter((station) =>
        selectedStations.includes(station.id),
    );
    const allStationIds = stations.map((station) => station.id);
    const canSelectAll =
        stations.length > 0 && selectedStations.length < stations.length;

    const toggleStation = useCallback(
        (stationId: string) => {
            if (selectedStations.includes(stationId)) {
                onChange(selectedStations.filter((id) => id !== stationId));
            } else {
                onChange([...selectedStations, stationId]);
            }
        },
        [onChange, selectedStations],
    );

    const stationItems = useMemo(
        () =>
            stations.map((station) => {
                const checked = selectedStations.includes(station.id);
                return (
                    <CommandItem
                        key={station.id}
                        value={station.name}
                        // keep popover open while selecting
                        onSelect={() => toggleStation(station.id)}
                        className="flex items-center gap-2 border-b border-slate-200 px-1 py-2 cursor-pointer hover:bg-slate-50"
                    >
                        <Checkbox checked={checked} aria-hidden="true" />
                        <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {station.name}
              </span>
                            <span className="text-xs text-slate-500">
                {station.firstYear} – {station.lastYear}
              </span>
                        </div>
                    </CommandItem>
                );
            }),
        [stations, selectedStations, toggleStation],
    );

    const handleSelectAll = () => {
        if (!canSelectAll) return;
        onChange(allStationIds);
    };

    const handleClear = () => {
        if (!selectedStations.length) return;
        onChange([]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label
                        htmlFor="station-select"
                        className="text-[12px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                        Stations
                    </Label>
                    <p className="text-xs text-slate-500">
                        {stations.length
                            ? `${selectedStations.length || "No"} selected · ${
                                stations.length
                            } total`
                            : "Loading…"}
                    </p>
                </div>
                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[11px] font-semibold text-brand hover:text-brand-dark disabled:text-slate-400"
                        disabled={!canSelectAll}
                        onClick={handleSelectAll}
                    >
                        Select all stations
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[11px]"
                        disabled={!selectedStations.length}
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                </div>
            </div>

            <Popover
                open={open}
                onOpenChange={(next) => {
                    if (disabled || !stations.length) return;
                    setOpen(next);
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        id="station-select"
                        variant="outline"
                        className="h-10 w-full justify-between border-slate-200 text-left text-sm font-normal"
                        disabled={disabled || !stations.length}
                    >
            <span className="truncate">
              {selectedStations.length
                  ? `${selectedStations.length} selected`
                  : stations.length
                      ? "Select stations"
                      : "Loading stations…"}
            </span>
                        <ChevronsUpDown className="size-4 text-slate-400" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-80 p-0"
                >
                    <Command>
                        <div className="flex items-center gap-1 border-b border-slate-200 px-3 py-2">
                            <Search className="size-3.5 text-slate-400" aria-hidden="true" />
                            <CommandInput placeholder="Search stations" autoFocus />
                        </div>
                        <CommandList className="max-h-[420px] overflow-y-auto">
                            <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                                No station found.
                            </CommandEmpty>
                            <CommandGroup>{stationItems}</CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedMetadata.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {selectedMetadata.map((station) => (
                        <Badge
                            key={station.id}
                            role="button"
                            tabIndex={0}
                            aria-pressed="true"
                            onClick={() => toggleStation(station.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    toggleStation(station.id);
                                }
                            }}
                            className="flex cursor-pointer select-none items-center gap-1 border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] hover:bg-white"
                        >
                            <span className="truncate">{station.name}</span>
                            <X className="size-3 text-slate-400" aria-hidden="true" />
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-slate-500">
                    Pick one or more stations to analyze.
                </p>
            )}

            {errorMessage ? (
                <p className="text-xs text-red-500">{errorMessage}</p>
            ) : null}
        </div>
    );
};
