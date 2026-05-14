from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SeriesBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    genre: str | None = Field(default=None, max_length=50)
    release_year: int | None = Field(default=None, ge=1900, le=2100)
    status: str | None = Field(default=None, max_length=30)
    total_seasons: int | None = Field(default=None, ge=1)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        return value


class SeriesCreate(SeriesBase):
    pass


class SeriesUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    genre: str | None = Field(default=None, max_length=50)
    release_year: int | None = Field(default=None, ge=1900, le=2100)
    status: str | None = Field(default=None, max_length=30)
    total_seasons: int | None = Field(default=None, ge=1)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        return value


class SeriesResponse(SeriesBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)