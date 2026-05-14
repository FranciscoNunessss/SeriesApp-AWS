from pydantic import BaseModel, ConfigDict, Field, field_validator


class EpisodeBase(BaseModel):
    episode_number: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=150)
    duration_minutes: int | None = Field(default=None, ge=1)
    synopsis: str | None = None

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        return value


class EpisodeCreate(EpisodeBase):
    pass


class EpisodeUpdate(BaseModel):
    episode_number: int | None = Field(default=None, ge=1)
    title: str | None = Field(default=None, min_length=1, max_length=150)
    duration_minutes: int | None = Field(default=None, ge=1)
    synopsis: str | None = None

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Title cannot be empty")
        return value


class EpisodeResponse(EpisodeBase):
    id: int
    season_id: int

    model_config = ConfigDict(from_attributes=True)