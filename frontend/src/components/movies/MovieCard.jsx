import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';
import useMovieStore from '../../context/movieStore';
import api from '../../utils/api';
import { getPosterPlaceholder, getLanguageLabel } from '../../utils/format';

export default function MovieCard({ movie, groupId, onClick, onRefresh, style }) {
  const { user } = useAuthStore();
  const { updateMovieWatched } = useMovieStore();
  const [toggling, setToggling] = useState(false);

  const handleWatchedToggle = async (e) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const { data } = await api.post('/watched/toggle', { movieId: movie._id, groupId });
      updateMovieWatched(
        movie._id,
        data.watched,
        data.watchedDate,
        user._id,
        user.username,
        user.email
      );
      toast.success(data.watched ? '✅ Marked as watched' : 'Removed from watched');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update watched status');
    } finally {
      setToggling(false);
    }
  };

  const isWatched = movie.userWatched;
  const hasRating = movie.avgRating > 0;
  const watchedCount = movie.watchedBy?.length || 0;

  return (
    <div
      className="group relative animate-slide-up cursor-pointer movie-card-hover"
      style={style}
      onClick={onClick}
    >
      {/* Poster */}
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cinema-card border border-cinema-border relative">
        <img
          src={movie.poster || getPosterPlaceholder()}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = getPosterPlaceholder(); }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-cinema-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Watched toggle */}
        <button
          onClick={handleWatchedToggle}
          disabled={toggling}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10
            ${isWatched
              ? 'bg-cinema-gold text-cinema-black shadow-gold'
              : 'bg-cinema-black/60 text-cinema-subtle hover:bg-cinema-black/80 hover:text-cinema-text opacity-0 group-hover:opacity-100'
            }`}
          title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
        >
          {toggling ? (
            <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : isWatched ? (
            <span className="text-sm">✓</span>
          ) : (
            <span className="text-sm">👁</span>
          )}
        </button>

        {/* Rating badge */}
        {hasRating && (
          <div className="absolute top-2 left-2 badge-gold text-xs z-10">
            ⭐ {movie.avgRating}
          </div>
        )}

        {/* Watched count badge */}
        {watchedCount > 0 && (
          <div className="absolute bottom-2 left-2 badge-muted text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            👁 {watchedCount}
          </div>
        )}

        {/* User rating indicator */}
        {movie.userRating && (
          <div className="absolute bottom-2 right-2 font-mono text-xs text-cinema-gold bg-cinema-black/70 px-2 py-0.5 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            You: {movie.userRating}
          </div>
        )}
      </div>

      {/* Info below card */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-medium text-cinema-text line-clamp-2 leading-tight group-hover:text-cinema-gold transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {movie.releaseYear && (
            <span className="text-xs text-cinema-subtle">{movie.releaseYear}</span>
          )}
          {movie.language && (
            <span className="text-xs text-cinema-subtle">· {getLanguageLabel(movie.language)}</span>
          )}
        </div>
        {movie.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {movie.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-xs text-cinema-subtle bg-cinema-muted px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
