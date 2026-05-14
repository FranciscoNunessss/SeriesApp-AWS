import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Season, Episode, Series } from '../types';
import { seasonsApi, episodesApi, seriesApi, watchedApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle2, Play, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function SeasonDetailPage() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const { activeUserId } = useActiveUser();

  const [season, setSeason] = useState<Season | null>(null);
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [watchedEpisodeIds, setWatchedEpisodeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateEpisode, setShowCreateEpisode] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deletingEpisode, setDeletingEpisode] = useState<Episode | null>(null);
  const [markingWatched, setMarkingWatched] = useState<Episode | null>(null);

  useEffect(() => {
    if (seasonId) {
      loadData();
    }
  }, [seasonId, activeUserId]);

  async function loadData() {
    try {
      setLoading(true);
      const seasonData = await seasonsApi.getById(seasonId!);
      const seriesData = await seriesApi.getById(seasonData.series_id);
      const episodesData = await episodesApi.getBySeason(seasonId!);
      const watchedIds = activeUserId
        ? await watchedApi.getWatchedEpisodeIds(activeUserId)
        : new Set<string>();

      setSeason(seasonData);
      setSeries(seriesData);
      setEpisodes(episodesData.sort((a, b) => a.episode_number - b.episode_number));
      setWatchedEpisodeIds(watchedIds);
    } catch (error) {
      toast.error('Failed to load season details');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEpisode(data: {
    episode_number: number;
    title: string;
    duration_minutes: number;
    synopsis: string;
  }) {
    try {
      await episodesApi.create(seasonId!, data);
      toast.success('Episode created successfully');
      setShowCreateEpisode(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create episode');
    }
  }

  async function handleUpdateEpisode(
    episodeId: string,
    data: {
      episode_number: number;
      title: string;
      duration_minutes: number;
      synopsis: string;
    }
  ) {
    try {
      await episodesApi.update(episodeId, data);
      toast.success('Episode updated successfully');
      setEditingEpisode(null);
      loadData();
    } catch (error) {
      toast.error('Failed to update episode');
    }
  }

  async function handleDeleteEpisode(episodeId: string) {
    try {
      await episodesApi.delete(episodeId);
      toast.success('Episode deleted successfully');
      setDeletingEpisode(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete episode');
    }
  }

  async function handleMarkWatched(episodeId: string, rating?: number) {
    if (!activeUserId) {
      toast.error('Please select an active user first');
      return;
    }

    try {
      await watchedApi.markAsWatched({
        user_id: activeUserId,
        episode_id: episodeId,
        rating,
      });
      toast.success('Episode marked as watched');
      setMarkingWatched(null);
      loadData();
    } catch (error) {
      toast.error('Episode already marked as watched');
    }
  }

  if (loading || !season || !series) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-white/[0.06] rounded-lg" />
        <div className="h-24 bg-[#13131f] rounded-xl border border-white/[0.06]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#13131f] rounded-xl border border-white/[0.06]" />
        ))}
      </div>
    );
  }

  const watchedCount = episodes.filter((ep) => watchedEpisodeIds.has(ep.id)).length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/series/${series.id}`)}
        className="text-slate-400 hover:text-white hover:bg-white/[0.06] -ml-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {series.title}
      </Button>

      {/* Header card */}
      <div className="rounded-xl bg-[#13131f] border border-white/[0.06] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-violet-400">{season.season_number}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Season {season.season_number}</h1>
              <p className="text-sm text-slate-400">
                {series.title} · {season.release_year}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {episodes.length > 0 && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{watchedCount}/{episodes.length}</p>
                <p className="text-xs text-slate-500">episodes watched</p>
              </div>
            )}
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 text-white border-0"
              onClick={() => setShowCreateEpisode(true)}
            >
              <Plus className="w-4 h-4" />
              Add Episode
            </Button>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      {episodes.length === 0 ? (
        <div className="rounded-xl bg-[#13131f] border border-white/[0.06] py-16 text-center">
          <div className="w-14 h-14 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Play className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No episodes yet</h3>
          <p className="text-slate-500 text-sm mb-5">Add episodes to this season</p>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-500 text-white border-0"
            onClick={() => setShowCreateEpisode(true)}
          >
            <Plus className="w-4 h-4" />
            Add Episode
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((episode) => {
            const isWatched = watchedEpisodeIds.has(episode.id);

            return (
              <div
                key={episode.id}
                className={`group rounded-xl border transition-all duration-200 ${
                  isWatched
                    ? 'bg-emerald-500/[0.04] border-emerald-500/15'
                    : 'bg-[#13131f] border-white/[0.06] hover:border-violet-500/20 hover:bg-[#16162a]'
                }`}
              >
                <div className="p-4 flex items-start gap-4">
                  {/* Episode number */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    isWatched
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-white/[0.06] text-slate-400'
                  }`}>
                    {episode.episode_number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{episode.title}</h3>
                      {isWatched && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    {episode.synopsis && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                        {episode.synopsis}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Clock className="w-3 h-3" />
                      <span>{episode.duration_minutes} min</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isWatched && activeUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 text-xs h-8 px-3"
                        onClick={() => setMarkingWatched(episode)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Watched</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-200 hover:bg-white/[0.06] h-8 w-8 p-0"
                      onClick={() => setEditingEpisode(episode)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                      onClick={() => setDeletingEpisode(episode)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Episode Modal */}
      <EpisodeFormModal
        isOpen={showCreateEpisode}
        onClose={() => setShowCreateEpisode(false)}
        onSubmit={handleCreateEpisode}
        title="Add Episode"
      />

      {/* Edit Episode Modal */}
      {editingEpisode && (
        <EpisodeFormModal
          isOpen={true}
          onClose={() => setEditingEpisode(null)}
          onSubmit={(data) => handleUpdateEpisode(editingEpisode.id, data)}
          title="Edit Episode"
          initialData={editingEpisode}
        />
      )}

      {/* Delete Episode Confirmation */}
      {deletingEpisode && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingEpisode(null)}
          onConfirm={() => handleDeleteEpisode(deletingEpisode.id)}
          title="Delete Episode"
          message={`Are you sure you want to delete "${deletingEpisode.title}"?`}
          confirmText="Delete"
          variant="danger"
        />
      )}

      {/* Mark as Watched Modal */}
      {markingWatched && (
        <MarkWatchedModal
          isOpen={true}
          onClose={() => setMarkingWatched(null)}
          onSubmit={(rating) => handleMarkWatched(markingWatched.id, rating)}
          episode={markingWatched}
        />
      )}
    </div>
  );
}

interface EpisodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    episode_number: number;
    title: string;
    duration_minutes: number;
    synopsis: string;
  }) => void;
  title: string;
  initialData?: Episode;
}

function EpisodeFormModal({ isOpen, onClose, onSubmit, title, initialData }: EpisodeFormModalProps) {
  const [formData, setFormData] = useState({
    episode_number: initialData?.episode_number || 1,
    title: initialData?.title || '',
    duration_minutes: initialData?.duration_minutes || 45,
    synopsis: initialData?.synopsis || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        episode_number: initialData.episode_number,
        title: initialData.title,
        duration_minutes: initialData.duration_minutes,
        synopsis: initialData.synopsis,
      });
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Episode Number"
          type="number"
          min="1"
          required
          value={formData.episode_number}
          onChange={(e) =>
            setFormData({ ...formData, episode_number: parseInt(e.target.value) })
          }
        />
        <Input
          label="Title"
          required
          placeholder="Enter episode title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          required
          value={formData.duration_minutes}
          onChange={(e) =>
            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
          }
        />
        <Textarea
          label="Synopsis"
          required
          placeholder="Enter episode synopsis"
          rows={4}
          value={formData.synopsis}
          onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface MarkWatchedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating?: number) => void;
  episode: Episode;
}

function MarkWatchedModal({ isOpen, onClose, onSubmit, episode }: MarkWatchedModalProps) {
  const [rating, setRating] = useState<number | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(rating);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark as Watched">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-white">{episode.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">Episode {episode.episode_number}</p>
        </div>
        <Input
          label="Rating (Optional)"
          type="number"
          min="1"
          max="10"
          placeholder="Rate from 1 to 10"
          value={rating || ''}
          onChange={(e) => setRating(e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0">
            <CheckCircle2 className="w-4 h-4" />
            Mark as Watched
          </Button>
        </div>
      </form>
    </Modal>
  );
}
