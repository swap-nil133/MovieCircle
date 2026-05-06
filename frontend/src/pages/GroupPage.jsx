import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useGroupStore from '../context/groupStore';
import useMovieStore from '../context/movieStore';
import useAuthStore from '../context/authStore';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import MovieGrid from '../components/movies/MovieGrid';
import AddMovieModal from '../components/movies/AddMovieModal';
import MovieDetailModal from '../components/movies/MovieDetailModal';

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { fetchGroup, currentGroup, loading: groupLoading } = useGroupStore();

  const {
    fetchMovies,
    fetchTopRated,
    fetchRecommendations,
    movies,
    filters,
    clearMovies,
  } = useMovieStore();

  const [showAddMovie, setShowAddMovie] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeSection, setActiveSection] = useState('all');

  useEffect(() => {
    if (groupId) {
      fetchGroup(groupId);
      loadMovies();
    }

    return () => clearMovies();
  }, [groupId]);

  const loadMovies = () => {
    fetchMovies(groupId, filters);
    fetchTopRated(groupId);
    fetchRecommendations(groupId);
  };

  const handleFilterChange = (newFilters) => {
    fetchMovies(groupId, { ...filters, ...newFilters });
  };

  if (groupLoading && !currentGroup) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cinema-gold/30 border-t-cinema-gold rounded-full animate-spin mx-auto mb-4" />

            <p className="text-cinema-subtle">
              Loading group...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentGroup && !groupLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">

            <div className="text-5xl mb-4">
              🚫
            </div>

            <h2 className="font-display text-2xl font-semibold mb-3">
              Group not found
            </h2>

            <p className="text-cinema-subtle mb-6">
              This group doesn't exist or you don't have access.
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-6">

        {/* Main content FIRST on mobile */}
        <main className="flex-1 min-w-0 order-1 lg:order-2">

          {/* Group header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 animate-fade-in">

            <div className="min-w-0">

              <div className="flex items-center gap-2 flex-wrap mb-1">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-cinema-subtle hover:text-cinema-text transition-colors text-sm"
                >
                  ← Dashboard
                </button>

                <span className="text-cinema-border">
                  ›
                </span>

                <span className="text-cinema-subtle text-sm truncate">
                  {currentGroup?.name}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-cinema-text break-words">
                {currentGroup?.name}
              </h1>

              {currentGroup?.description && (
                <p className="text-cinema-subtle mt-1 break-words">
                  {currentGroup.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">

                <span className="badge-muted">
                  👥 {currentGroup?.members?.length} members
                </span>

                <span className="badge-muted">
                  🎬 {movies.length} movies
                </span>

                <span
                  className="font-mono text-xs text-cinema-gold bg-cinema-gold/10 px-2 py-1 rounded cursor-pointer hover:bg-cinema-gold/20 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(currentGroup?.inviteCode);
                    toast.success('Invite code copied!');
                  }}
                  title="Click to copy invite code"
                >
                  {currentGroup?.inviteCode}
                </span>

              </div>
            </div>

            {/* Add Movie button */}
            <button
              onClick={() => setShowAddMovie(true)}
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              + Add Movie
            </button>

          </div>

          {/* Section tabs */}
          <div className="flex flex-wrap gap-2 mb-6 bg-cinema-card rounded-xl p-1 border border-cinema-border w-full sm:w-fit">

            {[
              { id: 'all', label: '🎬 All Movies' },
              { id: 'top-rated', label: '⭐ Top Rated' },
              { id: 'recommendations', label: '🎯 For You' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === id
                    ? 'bg-cinema-gold text-cinema-black'
                    : 'text-cinema-subtle hover:text-cinema-text'
                }`}
              >
                {label}
              </button>
            ))}

          </div>

          {/* Movie grid */}
          <MovieGrid
            groupId={groupId}
            activeSection={activeSection}
            onMovieClick={setSelectedMovie}
            onRefresh={loadMovies}
          />

        </main>

        {/* Sidebar BELOW on mobile */}
        <div className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
          <Sidebar
            group={currentGroup}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onFilterChange={handleFilterChange}
          />
        </div>

      </div>

      {showAddMovie && (
        <AddMovieModal
          groupId={groupId}
          onClose={() => setShowAddMovie(false)}
          onAdded={() => {
            fetchTopRated(groupId);
            fetchRecommendations(groupId);
          }}
        />
      )}

      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          groupId={groupId}
          group={currentGroup}
          onClose={() => setSelectedMovie(null)}
          onUpdate={loadMovies}
        />
      )}
    </div>
  );
}
