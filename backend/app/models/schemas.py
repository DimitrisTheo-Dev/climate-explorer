from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, FieldValidationInfo, field_validator


class YearRange(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    from_year: int = Field(alias="from", ge=0)
    to_year: int = Field(alias="to", ge=0)

    @field_validator("to_year")
    @classmethod
    def validate_order(cls, v: int, info: FieldValidationInfo):
        from_year = info.data.get("from_year")
        if from_year is not None and v < from_year:
            raise ValueError("year_range.to must be greater than or equal to year_range.from")
        return v


class StationResponse(BaseModel):
    id: str
    name: str
    first_year: int
    last_year: int


class TemperatureDataRequest(BaseModel):
    station_ids: list[str]
    mode: Literal["monthly", "annual"]
    include_std_band: bool = Field(default=False)
    year_range: YearRange

    @field_validator("station_ids")
    @classmethod
    def ensure_station_ids(cls, v: list[str]):
        if not v:
            raise ValueError("station_ids must not be empty")
        return v


class MonthlyPoint(BaseModel):
    year: int
    month: int
    temperature: float


class MonthlySeries(BaseModel):
    station_id: str
    points: list[MonthlyPoint]


class MonthlyTemperatureResponse(BaseModel):
    mode: Literal["monthly"]
    series: list[MonthlySeries]


class AnnualPoint(BaseModel):
    year: int
    mean: float
    std: float | None = None
    upper: float | None = None
    lower: float | None = None


class AnnualSeries(BaseModel):
    station_id: str
    points: list[AnnualPoint]


class AnnualTemperatureResponse(BaseModel):
    mode: Literal["annual"]
    series: list[AnnualSeries]


class AnalyticsRequest(BaseModel):
    station_ids: list[str]
    year_range: YearRange

    @field_validator("station_ids")
    @classmethod
    def ensure_station_ids(cls, v: list[str]):
        if not v:
            raise ValueError("station_ids must not be empty")
        return v


class AnalyticsPerStation(BaseModel):
    station_id: str
    mean: float
    min: float
    max: float


class AnalyticsResponse(BaseModel):
    selected_period: YearRange
    stations_analyzed: int
    overall_mean_temperature: float
    overall_min_temperature: float
    overall_max_temperature: float
    per_station: list[AnalyticsPerStation]


class AnalyticsSummary(BaseModel):
    selected_period: YearRange
    stations_analyzed: int
    overall_mean_temperature: float
    overall_min_temperature: float
    overall_max_temperature: float
    per_station: list[AnalyticsPerStation]


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
