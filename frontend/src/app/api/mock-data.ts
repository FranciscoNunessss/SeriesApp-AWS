import { User, Series, Season, Episode, WatchedEpisode, HistoryItem, UserProgress } from '../types';

// Mock data storage
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    created_at: '2024-02-20T14:30:00Z',
  },
];

export const mockSeries: Series[] = [
  {
    id: '1',
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine producer partners with a former student to secure his family\'s future.',
    genre: 'Crime Drama',
    release_year: 2008,
    status: 'completed',
    total_seasons: 5,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Stranger Things',
    description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces to get him back.',
    genre: 'Sci-Fi Horror',
    release_year: 2016,
    status: 'ongoing',
    total_seasons: 4,
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '3',
    title: 'The Office',
    description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    genre: 'Comedy',
    release_year: 2005,
    status: 'completed',
    total_seasons: 9,
    created_at: '2024-01-10T00:00:00Z',
  },
];

export const mockSeasons: Season[] = [
  { id: '1', series_id: '1', season_number: 1, release_year: 2008, created_at: '2024-01-01T00:00:00Z' },
  { id: '2', series_id: '1', season_number: 2, release_year: 2009, created_at: '2024-01-01T00:00:00Z' },
  { id: '3', series_id: '2', season_number: 1, release_year: 2016, created_at: '2024-01-05T00:00:00Z' },
  { id: '4', series_id: '2', season_number: 2, release_year: 2017, created_at: '2024-01-05T00:00:00Z' },
  { id: '5', series_id: '3', season_number: 1, release_year: 2005, created_at: '2024-01-10T00:00:00Z' },
];

export const mockEpisodes: Episode[] = [
  {
    id: '1',
    season_id: '1',
    episode_number: 1,
    title: 'Pilot',
    duration_minutes: 58,
    synopsis: 'Diagnosed with terminal lung cancer, chemistry teacher Walter White teams up with former student Jesse Pinkman to cook and sell crystal meth.',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    season_id: '1',
    episode_number: 2,
    title: 'Cat\'s in the Bag...',
    duration_minutes: 48,
    synopsis: 'Walt and Jesse try to dispose of the two bodies in the RV, which proves to be more difficult than anticipated.',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    season_id: '1',
    episode_number: 3,
    title: '...And the Bag\'s in the River',
    duration_minutes: 48,
    synopsis: 'Walt is struggling to decide whether to kill Krazy-8 or let him go.',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    season_id: '3',
    episode_number: 1,
    title: 'Chapter One: The Vanishing of Will Byers',
    duration_minutes: 48,
    synopsis: 'On his way home from a friend\'s house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.',
    created_at: '2024-01-05T00:00:00Z',
  },
  {
    id: '5',
    season_id: '3',
    episode_number: 2,
    title: 'Chapter Two: The Weirdo on Maple Street',
    duration_minutes: 56,
    synopsis: 'Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.',
    created_at: '2024-01-05T00:00:00Z',
  },
];

export const mockWatchedEpisodes: WatchedEpisode[] = [
  {
    id: '1',
    user_id: '1',
    episode_id: '1',
    watched_at: '2024-03-01T20:00:00Z',
    rating: 9,
  },
  {
    id: '2',
    user_id: '1',
    episode_id: '2',
    watched_at: '2024-03-02T21:30:00Z',
    rating: 8,
  },
  {
    id: '3',
    user_id: '1',
    episode_id: '4',
    watched_at: '2024-03-10T19:00:00Z',
    rating: 10,
  },
];
