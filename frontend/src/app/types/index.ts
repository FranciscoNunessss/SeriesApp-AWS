export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  genre: string;
  release_year: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  total_seasons: number;
  created_at: string;
}

export interface Season {
  id: string;
  series_id: string;
  season_number: number;
  release_year: number;
  created_at: string;
}

export interface Episode {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  duration_minutes: number;
  synopsis: string;
  created_at: string;
}

export interface WatchedEpisode {
  id: string;
  user_id: string;
  episode_id: string;
  watched_at: string;
  rating?: number;
}

export interface HistoryItem {
  id: string;
  series_title: string;
  season_number: number;
  episode_number: number;
  episode_title: string;
  watched_at: string;
  rating?: number;
}

export interface UserProgress {
  series_id: string;
  total_episodes: number;
  watched_episodes: number;
  percentage: number;
}
