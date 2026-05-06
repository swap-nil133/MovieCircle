import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useMovieStore from '../../context/movieStore';
import useGroupStore from '../../context/groupStore';
import useAuthStore from '../../context/authStore';
import { getInitials, getUserColor } from '../../utils/format';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
];

export default function Sidebar({ group, activeSection, onSectionChange, onFilterChange }) {
  const { filters, setFilters, clearFilters, topRated, recommendations } = useMovieStore();
  const { leaveGroup } = useGroupStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleFilterChange = (key, value) => {
    const newVal = filters[key] === value ? '' : value;
    const newFilters = { ...filters, [key]: newVal };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    onFilterChange({ genre: '', minRating: '', language: '' });
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    const result = await leaveGroup(group._id);
    if (result.success) {
      toast.success('Left group');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const isOwner = group?.owner?._id === user?._id || group?.owner === user?._id;
  const hasActiveFilters = filters.genre || filters.minRating || filters.language;

  if (collapsed) {
    return (
      <aside className="w-12 flex-shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="w-10 h-10 rounded-lg bg-cinema-card border border-cinema-border flex items-center justify-center text-cinema-subtle hover:text-cinema-text hover:bg-cinema-muted transition-all"
          title="Expand sidebar"
        >
          ›
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 space-y-4 animate-slide-in-right">
      {/* Collapse button */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-cinema-subtle font-medium uppercase tracking-wider">Sidebar</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-cinema-subtle hover:text-cinema-text transition-colors text-sm"
        >
          ‹
        </button>
      </div>

      {/* Members */}
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-cinema-subtle uppercase tracking-wider mb-3">Members</h3>
        <div className="space-y-2">
          {group?.members?.map((member) => (
            <div key={member._id} className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-cinema-black flex-shrink-0"
                style={{ backgroundColor: getUserColor(member.username) }}
              >
                {getInitials(member.username)}
              </div>
              <span className="text-sm text-cinema-text truncate">{member.username}</span>
              {(group?.owner?._id === member._id || group?.owner === member._id) && (
                <span className="text-xs text-cinema-gold ml-auto">👑</span>
              )}
            </div>
          ))}
        </div>

        {!isOwner && (
          <button
            onClick={handleLeaveGroup}
            className="mt-3 w-full text-xs text-cinema-subtle hover:text-cinema-accent transition-colors py-1"
          >
            Leave group
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-cinema-subtle uppercase tracking-wider">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-cinema-accent hover:text-cinema-accent-dim transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Genre filter */}
        <div className="mb-4">
          <label className="text-xs text-cinema-subtle mb-2 block">Genre</label>
          <div className="flex flex-wrap gap-1.5">
            {GENRES.slice(0, 8).map((genre) => (
              <button
                key={genre}
                onClick={() => handleFilterChange('genre', genre)}
                className={`text-xs px-2 py-1 rounded-md transition-all ${
                  filters.genre === genre
                    ? 'bg-cinema-gold text-cinema-black font-medium'
                    : 'bg-cinema-muted text-cinema-subtle hover:text-cinema-text'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Min Rating filter */}
        <div className="mb-4">
          <label className="text-xs text-cinema-subtle mb-2 block">Min. Rating</label>
          <div className="flex gap-1.5 flex-wrap">
            {[6, 7, 8, 9].map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange('minRating', String(r))}
                className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                  filters.minRating === String(r)
                    ? 'bg-cinema-gold text-cinema-black font-medium'
                    : 'bg-cinema-muted text-cinema-subtle hover:text-cinema-text'
                }`}
              >
                {r}+
              </button>
            ))}
          </div>
        </div>

        {/* Language filter */}
        <div>
          <label className="text-xs text-cinema-subtle mb-2 block">Language</label>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleFilterChange('language', code)}
                className={`text-xs px-2 py-1 rounded-md transition-all ${
                  filters.language === code
                    ? 'bg-cinema-gold text-cinema-black font-medium'
                    : 'bg-cinema-muted text-cinema-subtle hover:text-cinema-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Rated mini list */}
      {topRated.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-cinema-subtle uppercase tracking-wider mb-3">Top Rated</h3>
          <div className="space-y-2">
            {topRated.slice(0, 5).map((movie, i) => (
              <div key={movie._id} className="flex items-center gap-2.5">
                <span className="text-xs text-cinema-subtle w-4">{i + 1}</span>
                <div className="w-8 h-12 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={movie.poster || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'%3E%3Crect width='32' height='48' fill='%232a2a3d'/%3E%3C/svg%3E`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-cinema-text font-medium truncate">{movie.title}</div>
                  <div className="text-xs text-cinema-gold">⭐ {movie.avgRating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations mini list */}
      {recommendations.length > 0 && (
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-cinema-subtle uppercase tracking-wider mb-3">🎯 Watch Next</h3>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((movie) => (
              <div key={movie._id} className="flex items-center gap-2.5">
                <div className="w-8 h-12 flex-shrink-0 rounded overflow-hidden">
                  <img
                    src={movie.poster || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='48' viewBox='0 0 32 48'%3E%3Crect width='32' height='48' fill='%232a2a3d'/%3E%3C/svg%3E`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-cinema-text font-medium truncate">{movie.title}</div>
                  <div className="text-xs text-cinema-teal">Not watched yet</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
