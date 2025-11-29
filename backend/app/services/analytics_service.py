from __future__ import annotations

from typing import Iterable

from ..models.schemas import AnalyticsSummary, AnalyticsPerStation, YearRange
from .data_repository import DataRepository
from .exceptions import InvalidYearRangeError, NoDataError


class AnalyticsService:
    """Performs aggregate statistics on the filtered dataset."""

    def __init__(self, repository: DataRepository):
        self._repository = repository

    def summarize(self, station_ids: Iterable[str], year_from: int, year_to: int) -> AnalyticsSummary:
        if year_from > year_to:
            raise InvalidYearRangeError("year_range.from must be before year_range.to")

        normalized_ids = list(dict.fromkeys(str(sid) for sid in station_ids))
        df = self._repository.filter_monthly(normalized_ids, year_from, year_to)
        if df.empty:
            raise NoDataError("No rows for selected stations/year range")

        overall = df["temperature"].agg(["mean", "min", "max"])
        period = YearRange(from_year=int(df["year"].min()), to_year=int(df["year"].max()))

        per_station_df = (
            df.groupby("station_id")["temperature"]
            .agg(mean="mean", min="min", max="max")
            .reset_index()
        )

        per_station = [
            AnalyticsPerStation(
                station_id=row.station_id,
                mean=float(row.mean),
                min=float(row.min),
                max=float(row.max),
            )
            for row in per_station_df.itertuples()
        ]

        return AnalyticsSummary(
            selected_period=period,
            stations_analyzed=int(per_station_df["station_id"].nunique()),
            overall_mean_temperature=float(overall["mean"]),
            overall_min_temperature=float(overall["min"]),
            overall_max_temperature=float(overall["max"]),
            per_station=per_station,
        )
