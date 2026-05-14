import { useEffect, useState } from 'react';
import { User } from '../types';
import { usersApi } from '../api';
import { useActiveUser } from '../context/ActiveUserContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/badge';
import { Plus, Edit, Check, Users } from 'lucide-react';
import { toast } from 'sonner';

function UserAvatar({ username }: { username: string }) {
  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
  ];
  const colorIndex = username.charCodeAt(0) % colors.length;

  return (
    <div
      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center flex-shrink-0 shadow-lg`}
    >
      <span className="text-sm font-bold text-white">{initials}</span>
    </div>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { activeUserId, setActiveUserId } = useActiveUser();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(data: { username: string; email: string }) {
    try {
      await usersApi.create(data);
      toast.success('User created successfully');
      setShowCreateModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  }

  async function handleUpdateUser(userId: string, data: { username: string; email: string }) {
    try {
      await usersApi.update(userId, data);
      toast.success('User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 bg-white/[0.06] rounded-lg" />
          <div className="h-9 w-28 bg-white/[0.06] rounded-lg" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-[#13131f] rounded-xl border border-white/[0.06]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {users.length > 0
              ? `${users.length} ${users.length === 1 ? 'user' : 'users'} — select one to track progress`
              : 'Manage users and select the active user'}
          </p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/20"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="rounded-xl bg-[#13131f] border border-white/[0.06] py-20 text-center">
          <div className="w-14 h-14 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No users yet</h3>
          <p className="text-slate-500 text-sm mb-5">Create your first user to start tracking</p>
          <Button
            className="bg-violet-600 hover:bg-violet-500 text-white border-0"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const isActive = activeUserId === user.id;
            return (
              <div
                key={user.id}
                className={`rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-500/[0.06] border-violet-500/25'
                    : 'bg-[#13131f] border-white/[0.06] hover:border-white/[0.10]'
                }`}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3.5">
                    <UserAvatar username={user.username} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{user.username}</span>
                        {isActive && (
                          <Badge variant="info" className="text-[10px] px-1.5 py-0">
                            <Check className="w-2.5 h-2.5" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-white/[0.06] text-xs h-8 px-3"
                        onClick={() => setActiveUserId(user.id)}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-200 hover:bg-white/[0.06] h-8 w-8 p-0"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create User Modal */}
      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        title="Create User"
      />

      {/* Edit User Modal */}
      {editingUser && (
        <UserFormModal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          title="Edit User"
          initialData={editingUser}
        />
      )}
    </div>
  );
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { username: string; email: string }) => void;
  title: string;
  initialData?: User;
}

function UserFormModal({ isOpen, onClose, onSubmit, title, initialData }: UserFormModalProps) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [email, setEmail] = useState(initialData?.email || '');

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username);
      setEmail(initialData.email);
    } else {
      setUsername('');
      setEmail('');
    }
  }, [initialData]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ username, email });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter username"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter email"
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
