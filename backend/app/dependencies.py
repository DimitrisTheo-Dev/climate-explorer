from __future__ import annotations

from functools import lru_cache

from .config import Settings
from .services.analytics_service import AnalyticsService
from .services.data_repository import DataRepository


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_repository() -> DataRepository:
    settings = get_settings()
    return DataRepository(settings.data_path)


def get_analytics_service() -> AnalyticsService:
    return AnalyticsService(get_repository())
