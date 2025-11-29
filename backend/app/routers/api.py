from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ..dependencies import get_analytics_service, get_repository
from ..exceptions import ApiException
from ..models.schemas import (
    AnalyticsRequest,
    AnalyticsResponse,
    AnnualPoint,
    AnnualSeries,
    AnnualTemperatureResponse,
    ErrorResponse,
    MonthlyPoint,
    MonthlySeries,
    MonthlyTemperatureResponse,
    StationResponse,
    TemperatureDataRequest,
    YearRange,
)
from ..services.analytics_service import AnalyticsService
from ..services.data_repository import DataRepository
from ..services.exceptions import InvalidStationError, InvalidYearRangeError, NoDataError

router = APIRouter()


def _dedupe_station_ids(station_ids: list[str]) -> list[str]:
    seen: dict[str, None] = {}
    for station_id in station_ids:
        seen.setdefault(station_id, None)
    return list(seen.keys())


@router.get("/stations", response_model=list[StationResponse])
def list_stations(repository: DataRepository = Depends(get_repository)) -> list[StationResponse]:
    return [
        StationResponse(
            id=meta.station_id,
            name=meta.name,
            first_year=meta.first_year,
            last_year=meta.last_year,
        )
        for meta in repository.get_stations()
    ]


@router.post(
    "/temperature-data",
    response_model=MonthlyTemperatureResponse | AnnualTemperatureResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid user request."},
        404: {"model": ErrorResponse, "description": "No data found for the selection."},
    },
)
def get_temperature_data(
    payload: TemperatureDataRequest,
    repository: DataRepository = Depends(get_repository),
):
    station_ids = _dedupe_station_ids(payload.station_ids)
    year_from = payload.year_range.from_year
    year_to = payload.year_range.to_year

    if payload.mode == "monthly" and payload.include_std_band:
        raise ApiException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_PAYLOAD",
            message="Standard deviation bands are only available for annual mode.",
        )

    try:
        if payload.mode == "monthly":
            df = repository.filter_monthly(station_ids, year_from, year_to)
        else:
            df = repository.filter_annual(station_ids, year_from, year_to)
    except InvalidStationError as exc:
        raise ApiException(status_code=status.HTTP_400_BAD_REQUEST, code="INVALID_STATION", message=str(exc))
    except InvalidYearRangeError as exc:
        raise ApiException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="INVALID_YEAR_RANGE",
            message=str(exc),
        )

    if df.empty:
        raise ApiException(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NO_DATA",
            message="No data for the selected stations and year range.",
        )

    if payload.mode == "monthly":
        series = []
        for station_id, group in df.groupby("station_id"):
            points = [
                MonthlyPoint(
                    year=int(row.year),
                    month=int(row.month),
                    temperature=float(row.temperature),
                )
                for row in group.itertuples()
            ]
            series.append(MonthlySeries(station_id=station_id, points=points))

        return MonthlyTemperatureResponse(mode="monthly", series=series)

    series = []
    for station_id, group in df.groupby("station_id"):
        points = []
        for row in group.itertuples():
            if payload.include_std_band:
                points.append(
                    AnnualPoint(
                        year=int(row.year),
                        mean=float(row.mean),
                        std=float(row.std),
                        upper=float(row.upper),
                        lower=float(row.lower),
                    )
                )
            else:
                points.append(
                    AnnualPoint(
                        year=int(row.year),
                        mean=float(row.mean),
                        std=None,
                        upper=None,
                        lower=None,
                    )
                )
        series.append(AnnualSeries(station_id=station_id, points=points))

    return AnnualTemperatureResponse(mode="annual", series=series)


@router.post(
    "/analytics",
    response_model=AnalyticsResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid station selection."},
        404: {"model": ErrorResponse, "description": "No analytics data available."},
        422: {"model": ErrorResponse, "description": "Invalid year range."},
    },
)
def get_analytics(
    payload: AnalyticsRequest,
    analytics_service: AnalyticsService = Depends(get_analytics_service),
):
    try:
        summary = analytics_service.summarize(
            payload.station_ids,
            payload.year_range.from_year,
            payload.year_range.to_year,
        )
    except NoDataError:
        raise ApiException(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NO_DATA",
            message="No data for the selected stations and year range.",
        )
    except InvalidStationError as exc:
        raise ApiException(status_code=status.HTTP_400_BAD_REQUEST, code="INVALID_STATION", message=str(exc))
    except InvalidYearRangeError as exc:
        raise ApiException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="INVALID_YEAR_RANGE",
            message=str(exc),
        )

    return AnalyticsResponse(
        selected_period=summary.selected_period,
        stations_analyzed=summary.stations_analyzed,
        overall_mean_temperature=summary.overall_mean_temperature,
        overall_min_temperature=summary.overall_min_temperature,
        overall_max_temperature=summary.overall_max_temperature,
        per_station=summary.per_station,
    )
