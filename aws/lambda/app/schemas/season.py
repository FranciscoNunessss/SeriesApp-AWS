from pydantic import BaseModel, ConfigDict, Field


class SeasonBase(BaseModel):
    season_number: int = Field(..., ge=1)
    release_year: int | None = Field(default=None, ge=1900, le=2100)


class SeasonCreate(SeasonBase):
    pass


class SeasonUpdate(BaseModel):
    season_number: int | None = Field(default=None, ge=1)
    release_year: int | None = Field(default=None, ge=1900, le=2100)


class SeasonResponse(SeasonBase):
    id: int
    series_id: int

    model_config = ConfigDict(from_attributes=True)