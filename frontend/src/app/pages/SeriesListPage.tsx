import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Series } from '../types';
import { seriesApi } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Eye, Tv, Film } from 'lucide-react';
import { toast } from 'sonner';

export function SeriesListPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Series | null>(null);

  useEffect(() => {
    loadSeries();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = series.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.genre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSeries(filtered);
    } else {
      setFilteredSeries(series);
    }
  }, [searchQuery, series]);

  async function loadSeries() {
    try {
      setLoading(true);
      const data = await seriesApi.getAll();
      setSeries(data);
      setFilteredSeries(data);
    } catch (error) {
      toast.error('Failed to load series');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(seriesId: string) {
    try {
      await seriesApi.delete(seriesId);
      toast.success('Series deleted successfully');
      setDeleteConfirm(null);
      loadSeries();
    } catch (error) {
      toast.error('Failed to delete series');
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-white/[0.06] rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-white/[0.04] rounded animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-white/[0.06] rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-[#13131f] rounded-xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Series</h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {series.length > 0 ? `${series.length} series in your library` : 'Browse and manage your series collection'}
          </p>
        </div>
        <Link to="/series/new">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/20">
            <Plus className="w-4 h-4" />
            Add Series
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search by title or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#13131f] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20"
        />
      </div>

      {/* Series Grid */}
      {filteredSeries.length === 0 ? (
        <div className="rounded-xl bg-[#13131f] border border-white/[0.06] py-20 text-center">
          <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {searchQuery ? 'No series found' : 'No series yet'}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {searchQuery ? 'Try a different search term' : 'Add your first series to get started'}
          </p>
          {!searchQuery && (
            <Link to="/series/new">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0">
                <Plus className="w-4 h-4" />
                Add Series
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSeries.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl bg-[#13131f] border border-white/[0.06] hover:border-violet-500/25 hover:bg-[#16162a] transition-all duration-200 overflow-hidden"
            >
              {/* Status accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                item.status === 'ongoing' ? 'bg-blue-500' :
                item.status === 'completed' ? 'bg-emerald-500' :
                'bg-red-500'
              }`} />

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 bg-violet-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Film className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.genre} · {item.release_year}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(item.status) as any} className="flex-shrink-0">
                    {item.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>{item.total_seasons} {item.total_seasons === 1 ? 'season' : 'seasons'}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1 border-t border-white/[0.04]">
                  <Link to={`/series/${item.id}`} className="flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-300 hover:text-white hover:bg-white/[0.06] text-xs h-8"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                  </Link>
                  <Link to={`/series/${item.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] h-8 w-8 p-0"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                    onClick={() => setDeleteConfirm(item)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          title="Delete Series"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
