import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Tv, Users, History, Play, Star, TrendingUp } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-[#0e0e17]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.3)_0%,_transparent_60%)]" />

        <div className="relative px-8 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            Your personal TV tracker
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Never lose track of{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              what you watch
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Track your favorite TV series, seasons, and episodes across multiple profiles.
            Rate episodes and monitor your viewing progress effortlessly.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/series">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0 shadow-lg shadow-violet-600/30 px-6">
                <Play className="w-4 h-4 fill-current" />
                Browse Series
              </Button>
            </Link>
            <Link to="/users">
              <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white bg-transparent px-6">
                Manage Users
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Everything you need</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/users" className="group">
            <div className="h-full p-6 rounded-xl bg-[#13131f] border border-white/[0.06] hover:border-violet-500/30 hover:bg-[#16162a] transition-all duration-200 space-y-4">
              <div className="w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Multiple Profiles</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Create separate profiles for everyone. Track progress independently per user.
                </p>
              </div>
            </div>
          </Link>

          <Link to="/series" className="group">
            <div className="h-full p-6 rounded-xl bg-[#13131f] border border-white/[0.06] hover:border-violet-500/30 hover:bg-[#16162a] transition-all duration-200 space-y-4">
              <div className="w-10 h-10 bg-violet-500/15 rounded-lg flex items-center justify-center group-hover:bg-violet-500/25 transition-colors">
                <Tv className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Series Library</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Add series with full details — genre, year, status — and organize by season and episode.
                </p>
              </div>
            </div>
          </Link>

          <Link to="/history" className="group">
            <div className="h-full p-6 rounded-xl bg-[#13131f] border border-white/[0.06] hover:border-violet-500/30 hover:bg-[#16162a] transition-all duration-200 space-y-4">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/25 transition-colors">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Watch History</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  View your complete watch history with ratings and timestamps.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="rounded-xl bg-[#13131f] border border-white/[0.06] p-8">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Getting Started</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: '01', text: 'Create or select a user from the Users page' },
            { step: '02', text: 'Add your favorite TV series with genre, year, and status' },
            { step: '03', text: 'Create seasons and add episodes for each series' },
            { step: '04', text: 'Mark episodes as watched and rate them to track progress' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-4">
              <span className="flex-shrink-0 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1 mt-0.5 font-mono">
                {step}
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
