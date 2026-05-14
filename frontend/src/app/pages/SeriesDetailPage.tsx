import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Series, Season, UserProgress } from '../types';
import { seriesApi, seasonsApi, watchedApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ArrowLeft, Edit, Trash2, Plus, Eye, Calendar, Film, Layers } from 'lucide-react';
import { toast } from 'sonner';

export function SeriesDetailPage() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { activeUserId } = useActiveUser();

  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showCreateSeason, setShowCreateSeason] = useState(false);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);

  useEffect(() => {
    if (seriesId) {
      loadData();
    }
  }, [seriesId, activeUserId]);

  async function loadData() {
    try {
      setLoading(true);
      const [seriesData, seasonsData] = await Promise.all([
        seriesApi.getById(seriesId!),
        seasonsApi.getBySeries(seriesId!),
      ]);
      setSeries(seriesData);
      setSeasons(seasonsData.sort((a, b) => a.season_number - b.season_number));

      if (activeUserId) {
        const progressData = await watchedApi.getUserProgress(activeUserId, seriesId!);
        setProgress(progressData);
      }
    } catch (error) {
      toast.error('Failed to load series details');
      navigate('/series');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSeries() {
    try {
      await seriesApi.delete(seriesId!);
      toast.success('Series deleted successfully');
      navigate('/series');
    } catch (error) {
      toast.error('Failed to delete series');
    }
  }

  async function handleDeleteSeason(seasonId: string) {
    try {
      await seasonsApi.delete(seasonId);
      toast.success('Season deleted successfully');
      setDeletingSeason(null);
      loadData();
    } catch (error) {
      toast.error('Failed to delete season');
    }
  }

  async function handleCreateSeason(data: { season_number: number; release_year: number }) {
    try {
      await seasonsApi.create(seriesId!, data);
      toast.success('Season created successfully');
      setShowCreateSeason(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create season');
    }
  }

  if (loading || !series) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-white/[0.06] rounded-lg" />
        <div className="h-40 bg-[#13131f] rounded-xl border border-white/[0.06]" />
        <div className="h-28 bg-[#13131f] rounded-xl border border-white/[0.06]" />
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/series')}
        className="text-slate-400 hover:text-white hover:bg-white/[0.06] -ml-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Series
      </Button>

      {/* Hero card */}
      <div className="relative rounded-xl bg-[#13131f] border border-white/[0.06] overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${
          series.status === 'ongoing' ? 'bg-blue-500' :
          series.status === 'completed' ? 'bg-emerald-500' :
          'bg-red-500'
        }`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Film className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{series.title}</h1>
                  <Badge variant={getStatusVariant(series.status) as any}>{series.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span>{series.genre}</span>
                  <span className="text-slate-600">·</span>
                  <span>{series.release_year}</span>
                  <span className="text-slate-600">·</span>
                  <span>{series.total_seasons} {series.total_seasons === 1 ? 'season' : 'seasons'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link to={`/series/${seriesId}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-white/[0.06]"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          {series.description && (
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-2xl">
              {series.description}
            </p>
          )}
        </div>
      </div>

      {/* User Progress */}
      {activeUserId && progress && (
        <div className="rounded-xl bg-[#13131f] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-white">Your Progress</span>
            </div>
            <span className="text-sm text-slate-400">
              <span className="text-white font-medium">{progress.watched_episodes}</span>
              <span className="text-slate-600"> / </span>
              {progress.total_episodes} episodes
            </span>
          </div>
          <ProgressBar value={progress.percentage} showLabel />
        </div>
      )}

      {/* Seasons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Seasons</h2>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-500 text-white border-0"
            onClick={() => setShowCreateSeason(true)}
          >
            <Plus className="w-4 h-4" />
            Add Season
          </Button>
        </div>

        {seasons.length === 0 ? (
          <div className="rounded-xl bg-[#13131f] border border-white/[0.06] py-16 text-center">
            <div className="w-14 h-14 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No seasons yet</h3>
            <p className="text-slate-500 text-sm mb-5">Add seasons to organize episodes</p>
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 text-white border-0"
              onClick={() => setShowCreateSeason(true)}
            >
              <Plus className="w-4 h-4" />
              Add Season
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="group rounded-xl bg-[#13131f] border border-white/[0.06] hover:border-violet-500/25 hover:bg-[#16162a] transition-all duration-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-violet-400">{season.season_number}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Season {season.season_number}</p>
                      <p className="text-xs text-slate-500">{season.release_year}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 p-0"
                    onClick={() => setDeletingSeason(season)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Link to={`/seasons/${season.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-400 hover:text-white hover:bg-white/[0.06] text-xs h-8"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Episodes
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Series Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteSeries}
        title="Delete Series"
        message={`Are you sure you want to delete "${series.title}"? This will also delete all seasons and episodes.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete Season Confirmation */}
      {deletingSeason && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingSeason(null)}
          onConfirm={() => handleDeleteSeason(deletingSeason.id)}
          title="Delete Season"
          message={`Are you sure you want to delete Season ${deletingSeason.season_number}? This will also delete all episodes.`}
          confirmText="Delete"
          variant="danger"
        />
      )}

      {/* Create Season Modal */}
      <SeasonFormModal
        isOpen={showCreateSeason}
        onClose={() => setShowCreateSeason(false)}
        onSubmit={handleCreateSeason}
      />
    </div>
  );
}

interface SeasonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { season_number: number; release_year: number }) => void;
}

function SeasonFormModal({ isOpen, onClose, onSubmit }: SeasonFormModalProps) {
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ season_number: seasonNumber, release_year: releaseYear });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Season">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Season Number"
          type="number"
          min="1"
          required
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(parseInt(e.target.value))}
        />
        <Input
          label="Release Year"
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          required
          value={releaseYear}
          onChange={(e) => setReleaseYear(parseInt(e.target.value))}
        />
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
            Create Season
          </Button>
        </div>
      </form>
    </Modal>
  );
}
