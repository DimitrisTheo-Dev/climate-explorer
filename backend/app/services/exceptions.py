class RepositoryError(Exception):
    """Base class for repository related errors."""


class NoDataError(Exception):
    """Raised when a query does not return any rows."""


class InvalidStationError(RepositoryError):
    """Raised when a station id is not part of the dataset."""


class InvalidYearRangeError(RepositoryError):
    """Raised when the requested year range falls outside the dataset."""
