from __future__ import annotations

from fastapi import HTTPException


class ApiException(HTTPException):
    """HTTP exception that preserves the API error envelope."""

    def __init__(self, *, status_code: int, code: str, message: str) -> None:
        super().__init__(
            status_code=status_code,
            detail={"error": {"code": code, "message": message}},
        )
