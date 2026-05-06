import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';
import useGroupStore from '../context/groupStore';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import JoinGroupModal from '../components/groups/JoinGroupModal';
import Navbar from '../components/layout/Navbar';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { groups, fetchGroups, loading } = useGroupStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="font-display text-4xl font-bold text-cinema-text">
              Hey, <span className="gradient-text">{user?.username}</span> 👋
            </h1>
            <span>
              <p className="text-sm text-white-500 mt-1">
               Developed by <span className="text-yellow-400 font-medium">SwapNIL</span>
              </p>
            </span>
            <p className="text-cinema-subtle mt-2">Your movie circles are waiting.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowJoin(true)} className="btn-secondary">
              Join Group
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              + New Group
            </button>
          </div>
        </div>

        {/* Groups grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 h-48 shimmer" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="font-display text-2xl font-semibold text-cinema-text mb-3">No groups yet</h2>
            <p className="text-cinema-subtle mb-8 max-w-sm mx-auto">
              Create a group and invite your friends to start tracking movies together.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                Create Your First Group
              </button>
              <button onClick={() => setShowJoin(true)} className="btn-secondary">
                Join with Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, i) => (
              <button
                key={group._id}
                onClick={() => navigate(`/group/${group._id}`)}
                className="card p-6 text-left hover:border-cinema-gold/40 transition-all duration-300 movie-card-hover animate-slide-up group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Group avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cinema-gold/30 to-cinema-accent/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  🎬
                </div>

                <h3 className="font-display text-xl font-semibold text-cinema-text mb-1 group-hover:text-cinema-gold transition-colors">
                  {group.name}
                </h3>

                {group.description && (
                  <p className="text-cinema-subtle text-sm mb-4 line-clamp-2">{group.description}</p>
                )}

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-cinema-border">
                  <span className="badge-muted">
                    👥 {group.members?.length || 0} members
                  </span>
                  <span className="badge-muted">
                    🎬 {group.movies?.length || 0} movies
                  </span>
                </div>

                <div className="mt-3 text-xs text-cinema-subtle">
                  Owner: {group.owner?.username}
                </div>

                {/* Invite code */}
                <div
                  className="mt-2 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(group.inviteCode);
                    toast.success('Invite code copied!');
                  }}
                >
                  <span className="text-xs text-cinema-subtle">Code:</span>
                  <span className="font-mono text-xs text-cinema-gold bg-cinema-gold/10 px-2 py-0.5 rounded cursor-pointer hover:bg-cinema-gold/20 transition-colors">
                    {group.inviteCode}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinGroupModal onClose={() => setShowJoin(false)} />}
    </div>
  );
}
