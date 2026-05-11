import useMovieStore from '../../context/movieStore';
import MovieCard from './MovieCard';

export default function MovieGrid({
  groupId,
  activeSection,
  onMovieClick,
  onRefresh,
}) {

  const {
    movies,
    topRated,
    recommendations,
    loading,
  } = useMovieStore();

  const getDisplayMovies = () => {

    if (activeSection === 'top-rated')
      return topRated;

    if (activeSection === 'recommendations')
      return recommendations;

    // WATCH LATER
    if (activeSection === 'watch-later')
      return movies.filter((m) => m.userWatchLater);

    return movies;
  };

  const displayMovies = getDisplayMovies();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="aspect-[2/3] rounded-xl shimmer"
          />
        ))}

      </div>
    );
  }

  if (displayMovies.length === 0) {

    const emptyMessages = {

      all: {
        icon: '🎬',
        title: 'No movies yet',
        desc: 'Add the first movie to this group using an IMDb link.',
      },

      'top-rated': {
        icon: '⭐',
        title: 'No rated movies',
        desc: 'Rate some movies to see the top-rated list.',
      },

      recommendations: {
        icon: '🎯',
        title: 'All caught up!',
        desc: 'You’ve watched everything in this group. Add more movies!',
      },

      // WATCH LATER
      'watch-later': {
        icon: '📌',
        title: 'Nothing saved yet',
        desc: 'Save movies to your Watch Later list.',
      },
    };

    const msg =
      emptyMessages[activeSection] ||
      emptyMessages.all;

    return (
      <div className="text-center py-20 animate-fade-in">

        <div className="text-5xl mb-4">
          {msg.icon}
        </div>

        <h3 className="font-display text-xl font-semibold text-cinema-text mb-2">
          {msg.title}
        </h3>

        <p className="text-cinema-subtle max-w-sm mx-auto">
          {msg.desc}
        </p>

      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

      {displayMovies.map((movie, i) => (
        <MovieCard
          key={movie._id}
          movie={movie}
          groupId={groupId}
          onClick={() => onMovieClick(movie)}
          onRefresh={onRefresh}
          style={{
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}

    </div>
  );
}
