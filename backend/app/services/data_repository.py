from __future__ import annotations

"""Data repository for the climate dataset."""

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Callable, Iterable, Tuple

import pandas as pd

from .exceptions import InvalidStationError, InvalidYearRangeError

MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]

EXPECTED_COLUMNS = {"Station Number", "Year", *MONTHS}
MONTH_TO_NUMBER = {name: idx + 1 for idx, name in enumerate(MONTHS)}


@dataclass(frozen=True)
class StationMetadata:
    station_id: str
    name: str
    first_year: int
    last_year: int


def _validate_csv_schema(frame: pd.DataFrame) -> None:
    missing = EXPECTED_COLUMNS.difference(frame.columns)
    if missing:
        raise ValueError(f"Temperature CSV is missing columns: {', '.join(sorted(missing))}")


def _load_monthly_frame(csv_path: Path) -> pd.DataFrame:
    """Load and normalize the raw CSV into a tidy monthly DataFrame."""

    dtype_map = {"Station Number": "string", "Year": "Int64", **{month: "float64" for month in MONTHS}}
    raw = pd.read_csv(csv_path, sep=";", dtype=dtype_map)
    _validate_csv_schema(raw)

    raw = raw.dropna(subset=["Station Number", "Year"])

    melted = (
        raw.melt(
            id_vars=["Station Number", "Year"],
            value_vars=MONTHS,
            var_name="month_name",
            value_name="temperature",
        )
        .dropna(subset=["temperature"])
        .assign(
            station_id=lambda df: df["Station Number"].astype(str),
            year=lambda df: df["Year"].astype(int),
            month=lambda df: df["month_name"].map(MONTH_TO_NUMBER).astype(int),
            temperature=lambda df: pd.to_numeric(df["temperature"], errors="coerce"),
        )
        .dropna(subset=["temperature"])
        .drop(columns=["Station Number", "Year", "month_name"])
        .sort_values(["station_id", "year", "month"])
        .reset_index(drop=True)
    )

    if melted.empty:
        raise ValueError("Temperature CSV did not yield any valid monthly rows")

    return melted


def _build_annual_frame(monthly_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregate monthly rows into annual statistics."""

    def _std(series: pd.Series) -> float:
        return float(series.std(ddof=0)) if not series.empty else float("nan")

    grouped = (
        monthly_df.groupby(["station_id", "year"])["temperature"].agg(mean="mean", std=_std).reset_index()
    )
    grouped["std"] = grouped["std"].fillna(0.0)
    grouped["upper"] = grouped["mean"] + grouped["std"]
    grouped["lower"] = grouped["mean"] - grouped["std"]
    return grouped.sort_values(["station_id", "year"]).reset_index(drop=True)


def _build_station_metadata(monthly_df: pd.DataFrame) -> dict[str, StationMetadata]:
    """Construct metadata per station from the normalized dataset."""

    meta = (
        monthly_df.groupby("station_id")["year"].agg(first_year="min", last_year="max").reset_index()
    )
    return {
        row.station_id: StationMetadata(
            station_id=row.station_id,
            name=f"Station {row.station_id}",
            first_year=int(row.first_year),
            last_year=int(row.last_year),
        )
        for row in meta.itertuples()
    }


class DataRepository:
    """Loads and exposes normalized temperature data for downstream services."""

    def __init__(self, csv_path: Path):
        if not csv_path.exists():
            raise FileNotFoundError(f"Temperature data CSV not found at {csv_path}")

        self._monthly_df = _load_monthly_frame(csv_path)
        self._annual_df = _build_annual_frame(self._monthly_df)
        self._station_meta = _build_station_metadata(self._monthly_df)

        self._monthly_cache: Callable[[Tuple[Tuple[str, ...], int, int]], pd.DataFrame] = lru_cache(maxsize=128)(
            self._build_monthly_slice
        )
        self._annual_cache: Callable[[Tuple[Tuple[str, ...], int, int]], pd.DataFrame] = lru_cache(maxsize=128)(
            self._build_annual_slice
        )

    def _build_monthly_slice(self, key: Tuple[Tuple[str, ...], int, int]) -> pd.DataFrame:
        station_ids, year_from, year_to = key
        mask = (
            self._monthly_df["station_id"].isin(station_ids)
            & (self._monthly_df["year"] >= year_from)
            & (self._monthly_df["year"] <= year_to)
        )
        return self._monthly_df.loc[mask]

    def _build_annual_slice(self, key: Tuple[Tuple[str, ...], int, int]) -> pd.DataFrame:
        station_ids, year_from, year_to = key
        mask = (
            self._annual_df["station_id"].isin(station_ids)
            & (self._annual_df["year"] >= year_from)
            & (self._annual_df["year"] <= year_to)
        )
        return self._annual_df.loc[mask]

    @property
    def station_ids(self) -> list[str]:
        return sorted(self._station_meta.keys())

    def get_stations(self) -> list[StationMetadata]:
        return [self._station_meta[sid] for sid in self.station_ids]

    def get_global_year_bounds(self) -> tuple[int, int]:
        return int(self._monthly_df["year"].min()), int(self._monthly_df["year"].max())

    def ensure_year_range(self, year_from: int, year_to: int) -> None:
        min_year, max_year = self.get_global_year_bounds()
        if year_from < min_year or year_to > max_year:
            raise InvalidYearRangeError(
                f"Year range must be between {min_year} and {max_year} inclusive."
            )

    def _ensure_station_ids(self, station_ids: set[str]) -> None:
        unknown = station_ids - set(self._station_meta)
        if unknown:
            raise InvalidStationError("Unknown station ids requested.")

    def filter_monthly(self, station_ids: Iterable[str], year_from: int, year_to: int) -> pd.DataFrame:
        ids = {str(sid) for sid in station_ids}
        if not ids:
            raise InvalidStationError("station_ids must not be empty")
        self._ensure_station_ids(ids)
        self.ensure_year_range(year_from, year_to)

        station_key = tuple(sorted(ids))
        return self._monthly_cache((station_key, year_from, year_to)).copy()

    def filter_annual(self, station_ids: Iterable[str], year_from: int, year_to: int) -> pd.DataFrame:
        ids = {str(sid) for sid in station_ids}
        if not ids:
            raise InvalidStationError("station_ids must not be empty")
        self._ensure_station_ids(ids)
        self.ensure_year_range(year_from, year_to)

        station_key = tuple(sorted(ids))
        return self._annual_cache((station_key, year_from, year_to)).copy()
