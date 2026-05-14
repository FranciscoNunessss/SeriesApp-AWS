import pytest
from pydantic import ValidationError

from app.schemas.episode import EpisodeUpdate
from app.schemas.season import SeasonCreate
from app.schemas.series import SeriesCreate, SeriesUpdate
from app.schemas.user import UserCreate
from app.schemas.watched_episode import WatchedEpisodeCreate


def test_series_create_trims_title():
    payload = SeriesCreate(title="  Breaking Bad  ")
    assert payload.title == "Breaking Bad"


def test_series_create_rejects_blank_title():
    with pytest.raises(ValidationError):
        SeriesCreate(title="   ")


def test_series_update_allows_none_title():
    payload = SeriesUpdate(title=None)
    assert payload.title is None


def test_episode_update_trims_title():
    payload = EpisodeUpdate(title="  Pilot  ")
    assert payload.title == "Pilot"


def test_watched_episode_rejects_invalid_rating():
    with pytest.raises(ValidationError):
        WatchedEpisodeCreate(user_id=1, episode_id=1, rating=11)


def test_user_create_rejects_invalid_email():
    with pytest.raises(ValidationError):
        UserCreate(username="francisco", email="invalid-email")


def test_season_create_requires_positive_number():
    with pytest.raises(ValidationError):
        SeasonCreate(season_number=0)
