import { useEffect, useState } from 'react';
import { User } from '../types';
import { usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Select } from './ui/select';
import { User as UserIcon } from 'lucide-react';

export function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeUserId, setActiveUserId } = useActiveUser();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
      if (data.length > 0 && !activeUserId) {
        setActiveUserId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="w-36 h-8 bg-white/[0.06] rounded-lg animate-pulse" />;
  }

  const activeUser = users.find((u) => u.id === activeUserId);

  return (
    <div className="flex items-center gap-2">
      {activeUser && (
        <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-violet-400">
            {activeUser.username.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
      {!activeUser && <UserIcon className="w-4 h-4 text-slate-500" />}
      <Select
        value={activeUserId || ''}
        onChange={(e) => setActiveUserId(e.target.value)}
        className="w-40 bg-transparent border-white/[0.08] text-slate-300 text-sm focus:border-violet-500/50"
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </Select>
    </div>
  );
}
