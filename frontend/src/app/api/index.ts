import type { Episode, HistoryItem, Season, Series, User, UserProgress, WatchedEpisode } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

type ApiUser = {
  id: number;
  username: string;
  email: string;
  created_at: string;
};

type ApiSeries = {
  id: number;
  title: string;
  description: string | null;
  genre: string | null;
  release_year: number | null;
  status: string | null;
  total_seasons: number | null;
  created_at: string;
};

type ApiSeason = {
  id: number;
  series_id: number;
  season_number: number;
  release_year: number | null;
};

type ApiEpisode = {
  id: number;
  season_id: number;
  episode_number: number;
  title: string;
  duration_minutes: number | null;
  synopsis: string | null;
};

type ApiWatchedEpisode = {
  id: number;
  user_id: number;
  episode_id: number;
  watched_at: string;
  rating: number | null;
};

type ApiProgress = {
  user_id: number;
  series_id: number;
  total_episodes: number;
  watched_episodes: number;
  progress_percent: number;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

function toStringId(value: number | string): string {
  return String(value);
}

function normalizeDate(value: string): string {
  return new Date(value).toISOString();
}

function normalizeUser(data: ApiUser): User {
  return {
    id: toStringId(data.id),
    username: data.username,
    email: data.email,
    created_at: normalizeDate(data.created_at),
  };
}

function normalizeSeries(data: ApiSeries): Series {
  return {
    id: toStringId(data.id),
    title: data.title,
    description: data.description ?? '',
    genre: data.genre ?? '',
    release_year: data.release_year ?? new Date().getFullYear(),
    status: (data.status as Series['status']) ?? 'ongoing',
    total_seasons: data.total_seasons ?? 0,
    created_at: normalizeDate(data.created_at),
  };
}

function normalizeSeason(data: ApiSeason): Season {
  return {
    id: toStringId(data.id),
    series_id: toStringId(data.series_id),
    season_number: data.season_number,
    release_year: data.release_year ?? new Date().getFullYear(),
    created_at: new Date().toISOString(),
  };
}

function normalizeEpisode(data: ApiEpisode): Episode {
  return {
    id: toStringId(data.id),
    season_id: toStringId(data.season_id),
    episode_number: data.episode_number,
    title: data.title,
    duration_minutes: data.duration_minutes ?? 0,
    synopsis: data.synopsis ?? '',
    created_at: new Date().toISOString(),
  };
}

function normalizeWatchedEpisode(data: ApiWatchedEpisode): WatchedEpisode {
  return {
    id: toStringId(data.id),
    user_id: toStringId(data.user_id),
    episode_id: toStringId(data.episode_id),
    watched_at: normalizeDate(data.watched_at),
    rating: data.rating ?? undefined,
  };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      if (typeof payload?.detail === 'string') {
        message = payload.detail;
      } else if (Array.isArray(payload?.detail)) {
        message = payload.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(', ') || message;
      } else if (payload?.detail) {
        message = String(payload.detail);
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function getUserWatchedEpisodes(userId: string): Promise<ApiWatchedEpisode[]> {
  return request<ApiWatchedEpisode[]>(`/users/${userId}/history/`);
}

// Users API
export const usersApi = {
  async getAll(): Promise<User[]> {
    const data = await request<ApiUser[]>('/users/');
    return data.map(normalizeUser);
  },

  async getById(userId: string): Promise<User> {
    const data = await request<ApiUser>(`/users/${userId}`);
    return normalizeUser(data);
  },

  async create(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const created = await request<ApiUser>('/users/', {
      method: 'POST',
      body: data,
    });
    return normalizeUser(created);
  },

  async update(userId: string, data: Partial<User>): Promise<User> {
    const updated = await request<ApiUser>(`/users/${userId}`, {
      method: 'PUT',
      body: data,
    });
    return normalizeUser(updated);
  },
};

// Series API
export const seriesApi = {
  async getAll(): Promise<Series[]> {
    const data = await request<ApiSeries[]>('/series/');
    return data.map(normalizeSeries);
  },

  async getById(seriesId: string): Promise<Series> {
    const data = await request<ApiSeries>(`/series/${seriesId}`);
    return normalizeSeries(data);
  },

  async create(data: Omit<Series, 'id' | 'created_at'>): Promise<Series> {
    const created = await request<ApiSeries>('/series/', {
      method: 'POST',
      body: data,
    });
    return normalizeSeries(created);
  },

  async update(seriesId: string, data: Partial<Series>): Promise<Series> {
    const updated = await request<ApiSeries>(`/series/${seriesId}`, {
      method: 'PUT',
      body: data,
    });
    return normalizeSeries(updated);
  },

  async delete(seriesId: string): Promise<void> {
    await request<void>(`/series/${seriesId}`, {
      method: 'DELETE',
    });
  },
};

// Seasons API
export const seasonsApi = {
  async getBySeries(seriesId: string): Promise<Season[]> {
    const data = await request<ApiSeason[]>(`/series/${seriesId}/seasons/`);
    return data.map(normalizeSeason);
  },

  async getById(seasonId: string): Promise<Season> {
    const data = await request<ApiSeason>(`/seasons/${seasonId}`);
    return normalizeSeason(data);
  },

  async create(seriesId: string, data: Omit<Season, 'id' | 'series_id' | 'created_at'>): Promise<Season> {
    const created = await request<ApiSeason>(`/series/${seriesId}/seasons/`, {
      method: 'POST',
      body: data,
    });
    return normalizeSeason(created);
  },

  async update(seasonId: string, data: Partial<Season>): Promise<Season> {
    const updated = await request<ApiSeason>(`/seasons/${seasonId}`, {
      method: 'PUT',
      body: data,
    });
    return normalizeSeason(updated);
  },

  async delete(seasonId: string): Promise<void> {
    await request<void>(`/seasons/${seasonId}`, {
      method: 'DELETE',
    });
  },
};

// Episodes API
export const episodesApi = {
  async getBySeason(seasonId: string): Promise<Episode[]> {
    const data = await request<ApiEpisode[]>(`/seasons/${seasonId}/episodes/`);
    return data.map(normalizeEpisode);
  },

  async getById(episodeId: string): Promise<Episode> {
    const data = await request<ApiEpisode>(`/episodes/${episodeId}`);
    return normalizeEpisode(data);
  },

  async create(seasonId: string, data: Omit<Episode, 'id' | 'season_id' | 'created_at'>): Promise<Episode> {
    const created = await request<ApiEpisode>(`/seasons/${seasonId}/episodes/`, {
      method: 'POST',
      body: data,
    });
    return normalizeEpisode(created);
  },

  async update(episodeId: string, data: Partial<Episode>): Promise<Episode> {
    const updated = await request<ApiEpisode>(`/episodes/${episodeId}`, {
      method: 'PUT',
      body: data,
    });
    return normalizeEpisode(updated);
  },

  async delete(episodeId: string): Promise<void> {
    await request<void>(`/episodes/${episodeId}`, {
      method: 'DELETE',
    });
  },
};

async function buildHistoryItems(watchedEpisodes: ApiWatchedEpisode[]): Promise<HistoryItem[]> {
  const episodeIds = [...new Set(watchedEpisodes.map((item) => item.episode_id))];
  const episodes = await Promise.all(episodeIds.map((episodeId) => episodesApi.getById(String(episodeId))));
  const episodeMap = new Map(episodes.map((episode) => [Number(episode.id), episode]));

  const seasonIds = [...new Set(episodes.map((episode) => Number(episode.season_id)))];
  const seasons = await Promise.all(seasonIds.map((seasonId) => seasonsApi.getById(String(seasonId))));
  const seasonMap = new Map(seasons.map((season) => [Number(season.id), season]));

  const seriesIds = [...new Set(seasons.map((season) => Number(season.series_id)))];
  const seriesList = await Promise.all(seriesIds.map((seriesId) => seriesApi.getById(String(seriesId))));
  const seriesMap = new Map(seriesList.map((series) => [Number(series.id), series]));

  return watchedEpisodes
    .map((watched) => {
      const episode = episodeMap.get(watched.episode_id);
      if (!episode) {
        return null;
      }

      const season = seasonMap.get(Number(episode.season_id));
      if (!season) {
        return null;
      }

      const series = seriesMap.get(Number(season.series_id));
      if (!series) {
        return null;
      }

      return {
        id: toStringId(watched.id),
        series_title: series.title,
        season_number: season.season_number,
        episode_number: episode.episode_number,
        episode_title: episode.title,
        watched_at: normalizeDate(watched.watched_at),
        rating: watched.rating ?? undefined,
      } satisfies HistoryItem;
    })
    .filter((item): item is HistoryItem => item !== null)
    .sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime());
}

// Watched Episodes API
export const watchedApi = {
  async markAsWatched(data: { user_id: string; episode_id: string; rating?: number }): Promise<WatchedEpisode> {
    const created = await request<ApiWatchedEpisode>('/watched-episodes/', {
      method: 'POST',
      body: data,
    });
    return normalizeWatchedEpisode(created);
  },

  async getUserHistory(userId: string): Promise<HistoryItem[]> {
    const watchedEpisodes = await getUserWatchedEpisodes(userId);
    return buildHistoryItems(watchedEpisodes);
  },

  async getWatchedEpisodeIds(userId: string): Promise<Set<string>> {
    const watchedEpisodes = await getUserWatchedEpisodes(userId);
    return new Set(watchedEpisodes.map((item) => toStringId(item.episode_id)));
  },

  async getUserProgress(userId: string, seriesId: string): Promise<UserProgress> {
    const progress = await request<ApiProgress>(`/users/${userId}/progress/${seriesId}`);
    return {
      series_id: toStringId(progress.series_id),
      total_episodes: progress.total_episodes,
      watched_episodes: progress.watched_episodes,
      percentage: progress.progress_percent,
    };
  },

  async isEpisodeWatched(userId: string, episodeId: string): Promise<boolean> {
    const watchedEpisodeIds = await getUserWatchedEpisodes(userId).then((items) =>
      new Set(items.map((item) => toStringId(item.episode_id)))
    );
    return watchedEpisodeIds.has(toStringId(episodeId));
  },
};
