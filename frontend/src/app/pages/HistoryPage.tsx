import { useEffect, useState } from 'react';
import { HistoryItem, User } from '../types';
import { watchedApi, usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Badge } from '../components/ui/badge';
import { Select } from '../components/ui/select';
import { History, Star, Tv, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function HistoryPage() {
  const { activeUserId } = useActiveUser();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      setSelectedUserId(activeUserId);
    }
  }, [activeUserId]);

  useEffect(() => {
    if (selectedUserId) {
      loadHistory(selectedUserId);
    }
  }, [selectedUserId]);

  async function loadUsers() {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  }

  async function loadHistory(userId: string) {
    try {
      setLoading(true);
      const data = await watchedApi.getUserHistory(userId);
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Group history by series
  const groupedHistory = history.reduce<Record<string, HistoryItem[]>>((acc, item) => {
    if (!acc[item.series_title]) {
      acc[item.series_title] = [];
    }
    acc[item.series_title].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Watch History</h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {selectedUser
              ? `${history.length} episodes watched by ${selectedUser.username}`
              : 'Select a user to view their history'}
          </p>
        </div>
        <div className="w-52 flex-shrink-0">
          <Select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-[#13131f] border-white/[0.08] text-slate-200"
          >
            <option value="">Choose a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Content */}
      {!selectedUserId ? (
        <div className="rounded-xl bg-[#13131f] border border-white/[0.06] py-20 text-center">
          <div className="w-14 h-14 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Select a user</h3>
          <p className="text-slate-500 text-sm">Choose a user above to view their watch history</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#13131f] rounded-xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-xl bg-[#13131f] border border-white/[0.06] py-20 text-center">
          <div className="w-14 h-14 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Tv className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No watch history</h3>
          <p className="text-slate-500 text-sm">
            {selectedUser?.username} hasn't watched any episodes yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedHistory).map(([seriesTitle, items]) => (
            <div key={seriesTitle} className="rounded-xl bg-[#13131f] border border-white/[0.06] overflow-hidden">
              {/* Series header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                <div className="w-7 h-7 bg-violet-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tv className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span className="text-sm font-semibold text-white">{seriesTitle}</span>
                <span className="text-xs text-slate-500 ml-auto">{items.length} {items.length === 1 ? 'episode' : 'episodes'}</span>
              </div>

              {/* Episodes */}
              <div className="divide-y divide-white/[0.03]">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">
                        <span className="text-slate-500">S{item.season_number}E{item.episode_number}</span>
                        {' · '}
                        {item.episode_title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(item.watched_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {item.rating && (
                      <Badge variant="warning" className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {item.rating}/10
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
