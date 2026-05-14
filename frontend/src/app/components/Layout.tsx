import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Tv, Users, History } from 'lucide-react';
import { UserSelector } from './UserSelector';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/users', label: 'Users', icon: Users },
    { path: '/series', label: 'Series', icon: Tv },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#0e0e17]">
      {/* Top Navigation */}
      <nav className="bg-[#13131f]/90 backdrop-blur-md border-b border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:shadow-violet-600/50 transition-shadow">
                <Tv className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                SeriesTracker
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm',
                      isActive
                        ? 'bg-violet-600/20 text-violet-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Selector */}
            <UserSelector />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
