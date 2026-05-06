import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import useMovieStore from '../../context/movieStore';
import api from '../../utils/api';
import { formatDate, formatRuntime, getLanguageLabel, getInitials, getUserColor } from '../../utils/format';

function StarRating({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const display = hover || value || 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHover(star)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange(star)}
          className={`text-lg transition-all duration-100 hover:scale-125 disabled:cursor-default ${
            star <= display ? 'text-cinema-gold' : 'text-cinema-muted'
          }`}
        >
          ★
        </button>
      ))}
      {display > 0 && (
        <span className="ml-2 text-sm font-mono text-cinema-gold font-medium">{display}/10</span>
      )}
    </div>
  );
}

export default function MovieDetailModal({ movie: initialMovie, groupId, group, onClose, onUpdate }) {
  const { user } = useAuthStore();
  const { updateMovieRating, updateMovieWatched, removeMovie } = useMovieStore();
  const [movie, setMovie] = useState(initialMovie);
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [pendingRating, setPendingRating] = useState(movie.userRating || 0);

  // Refresh movie data
  const refreshMovie = async () => {
    try {
      const { data } = await api.get(`/movies/${movie._id}`);
      setMovie({
        ...data.movie,
        userRating: data.movie.ratings?.find((r) => r.user._id === user._id)?.rating || null,
        userWatched: data.movie.watchedBy?.some((w) => w.user._id === user._id && w.watched),
        userWatchedDate: data.movie.watchedBy?.find((w) => w.user._id === user._id)?.watchedDate || null,
      });
    } catch (err) {
      console.error('Failed to refresh movie', err);
    }
  };

  useEffect(() => {
    refreshMovie();
  }, []);

  const handleRating = async (rating) => {
    setPendingRating(rating);
    setRatingLoading(true);
    try {
      const { data } = await api.post('/ratings', { movieId: movie._id, groupId, rating });
      updateMovieRating(movie._id, rating, data.avgRating, user._id, user.username, user.email);
      setMovie((m) => ({
        ...m,
        userRating: rating,
        avgRating: data.avgRating,
        ratings: m.ratings.some((r) => r.user._id === user._id)
          ? m.ratings.map((r) => r.user._id === user._id ? { ...r, rating } : r)
          : [...(m.ratings || []), { user: { _id: user._id, username: user.username }, rating }],
      }));
      toast.success('Rating saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleWatched = async () => {
    setWatchedLoading(true);
    try {
      const { data } = await api.post('/watched/toggle', { movieId: movie._id, groupId });
      updateMovieWatched(movie._id, data.watched, data.watchedDate, user._id, user.username, user.email);
      setMovie((m) => {
        let newWatchedBy;
        if (data.watched) {
          const exists = m.watchedBy?.find((w) => w.user._id === user._id);
          if (exists) {
            newWatchedBy = m.watchedBy.map((w) => w.user._id === user._id ? { ...w, watchedDate: data.watchedDate } : w);
          } else {
            newWatchedBy = [...(m.watchedBy || []), { user: { _id: user._id, username: user.username }, watchedDate: data.watchedDate, watched: true }];
          }
        } else {
          newWatchedBy = (m.watchedBy || []).filter((w) => w.user._id !== user._id);
        }
        return { ...m, userWatched: data.watched, userWatchedDate: data.watchedDate, watchedBy: newWatchedBy };
      });
      toast.success(data.watched ? '✅ Marked as watched' : 'Removed from watched');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setWatchedLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove "${movie.title}" from this group?`)) return;
    setLoading(true);
    const result = await removeMovie(movie._id);
    if (result.success) {
      toast.success('Movie removed');
      if (onUpdate) onUpdate();
      onClose();
    } else {
      toast.error(result.message);
      setLoading(false);
    }
  };

  const isOwner = group?.owner?._id === user?._id || group?.owner === user?._id;
  const isAdder = movie.addedBy?._id === user?._id || movie.addedBy === user?._id;
  const canDelete = isOwner || isAdder;
  const avgRating = movie.ratings?.length > 0
    ? Math.round(movie.ratings.reduce((s, r) => s + r.rating, 0) / movie.ratings.length * 10) / 10
    : movie.avgRating || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 modal-backdrop bg-cinema-black/80" onClick={onClose} />

      <div className="relative w-full max-w-3xl card shadow-modal animate-scale-in my-auto">
        {/* Backdrop */}
        {movie.backdrop && (
          <div className="absolute top-0 left-0 right-0 h-48 rounded-t-xl overflow-hidden">
            <img src={movie.backdrop} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cinema-card" />
          </div>
        )}

        <div className="relative p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-cinema-muted hover:bg-cinema-border flex items-center justify-center text-cinema-subtle hover:text-cinema-text transition-all z-10"
          >
            ✕
          </button>

          {/* Movie header */}
          <div className="flex gap-5 mb-6" style={{ marginTop: movie.backdrop ? '120px' : '0' }}>
            {/* Poster */}
            <div className="w-28 flex-shrink-0 rounded-xl overflow-hidden shadow-card border border-cinema-border">
              <img
                src={movie.poster || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='168' viewBox='0 0 112 168'%3E%3Crect width='112' height='168' fill='%2316161f'/%3E%3Ctext x='56' y='84' text-anchor='middle' dominant-baseline='middle' fill='%232a2a3d' font-size='40'%3E🎬%3C/text%3E%3C/svg%3E`}
                alt={movie.title}
                className="w-full h-auto"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl font-bold text-cinema-text leading-tight mb-1">{movie.title}</h2>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {movie.releaseYear && <span className="badge-muted">{movie.releaseYear}</span>}
                {movie.language && <span className="badge-muted">{getLanguageLabel(movie.language)}</span>}
                {movie.runtime > 0 && <span className="badge-muted">⏱ {formatRuntime(movie.runtime)}</span>}
                {movie.tmdbRating > 0 && <span className="badge-muted">TMDb {movie.tmdbRating.toFixed(1)}</span>}
              </div>

              {movie.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {movie.genres.map((g) => (
                    <span key={g} className="badge-teal">{g}</span>
                  ))}
                </div>
              )}

              {avgRating > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cinema-gold text-xl font-bold font-mono">{avgRating}</span>
                  <span className="text-cinema-subtle text-sm">/ 10</span>
                  <span className="text-cinema-subtle text-xs">({movie.ratings?.length || 0} ratings)</span>
                </div>
              )}

              <div className="text-xs text-cinema-subtle">
                Added by <span className="text-cinema-text">{movie.addedBy?.username}</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="text-cinema-subtle text-sm leading-relaxed mb-6 border-l-2 border-cinema-border pl-4">
              {movie.overview}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating section */}
            <div className="bg-cinema-dark rounded-xl p-4 border border-cinema-border">
              <h3 className="text-sm font-semibold text-cinema-subtle uppercase tracking-wider mb-4">Your Rating</h3>
              <StarRating
                value={pendingRating}
                onChange={handleRating}
                disabled={ratingLoading}
              />
              {ratingLoading && (
                <p className="text-xs text-cinema-subtle mt-2">Saving...</p>
              )}
              {movie.ratings?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cinema-border">
                  <h4 className="text-xs text-cinema-subtle mb-3 uppercase tracking-wider">Friends' Ratings</h4>
                  <div className="space-y-2.5">
                    {movie.ratings.map((r) => (
                      <div key={r._id || r.user._id} className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-cinema-black flex-shrink-0"
                          style={{ backgroundColor: getUserColor(r.user.username) }}
                        >
                          {getInitials(r.user.username)}
                        </div>
                        <span className="text-sm text-cinema-text flex-1">{r.user.username}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-cinema-gold">★</span>
                          <span className="text-sm font-mono font-medium text-cinema-text">{r.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Watched section */}
            <div className="bg-cinema-dark rounded-xl p-4 border border-cinema-border">
              <h3 className="text-sm font-semibold text-cinema-subtle uppercase tracking-wider mb-4">Watched Status</h3>

              <button
                onClick={handleWatched}
                disabled={watchedLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  movie.userWatched
                    ? 'bg-cinema-gold/20 text-cinema-gold border border-cinema-gold/40 hover:bg-cinema-accent/20 hover:text-cinema-accent hover:border-cinema-accent/40'
                    : 'bg-cinema-muted text-cinema-subtle border border-cinema-border hover:bg-cinema-gold/20 hover:text-cinema-gold hover:border-cinema-gold/40'
                }`}
              >
                {watchedLoading ? (
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : movie.userWatched ? (
                  <>✅ Watched</>
                ) : (
                  <>👁 Mark as Watched</>
                )}
              </button>

              {movie.userWatched && movie.userWatchedDate && (
                <p className="text-xs text-cinema-subtle text-center mt-2">
                  Watched on {formatDate(movie.userWatchedDate)}
                </p>
              )}

              {movie.watchedBy?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cinema-border">
                  <h4 className="text-xs text-cinema-subtle mb-3 uppercase tracking-wider">
                    Watched by ({movie.watchedBy.filter((w) => w.watched !== false).length})
                  </h4>
                  <div className="space-y-2.5">
                    {movie.watchedBy.filter((w) => w.watched !== false).map((w) => (
                      <div key={w._id || w.user._id} className="flex items-start gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-cinema-black flex-shrink-0"
                          style={{ backgroundColor: getUserColor(w.user.username) }}
                        >
                          {getInitials(w.user.username)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-cinema-text">{w.user.username}</span>
                            <span className="text-cinema-gold text-xs">✅</span>
                          </div>
                          {w.watchedDate && (
                            <div className="text-xs text-cinema-subtle">
                              Watched on {formatDate(w.watchedDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete button */}
          {canDelete && (
            <div className="mt-5 pt-5 border-t border-cinema-border flex justify-end">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-sm text-cinema-accent hover:text-cinema-accent-dim transition-colors flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-3 h-3 border border-cinema-accent/30 border-t-cinema-accent rounded-full animate-spin" />
                ) : (
                  '🗑'
                )}
                Remove from group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
