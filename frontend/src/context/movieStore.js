import { create } from 'zustand';
import api from '../utils/api';

const useMovieStore = create((set, get) => ({
  movies: [],
  topRated: [],
  recommendations: [],
  watchLater: [],

  loading: false,
  addingMovie: false,

  filters: {
    genre: '',
    minRating: '',
    language: '',
    country: '',
  },

  error: null,

  setFilters: (filters) =>
    set({
      filters: {
        ...get().filters,
        ...filters,
      },
    }),

  clearFilters: () =>
    set({
      filters: {
        genre: '',
        minRating: '',
        language: '',
        country: '',
      },
    }),

  fetchMovies: async (groupId, filters = {}) => {
    set({ loading: true, error: null });

    try {
      const params = new URLSearchParams();

      if (filters.genre)
        params.append('genre', filters.genre);

      if (filters.minRating)
        params.append('minRating', filters.minRating);

      if (filters.language)
        params.append('language', filters.language);

      if (filters.country)
        params.append('country', filters.country);

      const { data } = await api.get(
        `/movies/group/${groupId}?${params.toString()}`
      );

      set({
        movies: data.movies,
        loading: false,
      });

    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          'Failed to fetch movies',
        loading: false,
      });
    }
  },

  fetchTopRated: async (groupId) => {
    try {
      const { data } = await api.get(
        `/movies/group/${groupId}/top-rated`
      );

      set({
        topRated: data.movies,
      });

    } catch (err) {
      console.error('Failed to fetch top rated:', err);
    }
  },

  fetchRecommendations: async (groupId) => {
    try {
      const { data } = await api.get(
        `/movies/group/${groupId}/recommendations`
      );

      set({
        recommendations: data.recommendations,
      });

    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  },

  addMovie: async (imdbLink, groupId) => {
    set({ addingMovie: true });

    try {
      const { data } = await api.post('/movies', {
        imdbLink,
        groupId,
      });

      const newMovie = {
        ...data.movie,
        avgRating: 0,
        ratings: [],
        watchedBy: [],
        userRating: null,
        userWatched: false,
        userWatchedDate: null,
        userWatchLater: false,
      };

      set((state) => ({
        movies: [newMovie, ...state.movies],
        addingMovie: false,
      }));

      return {
        success: true,
        movie: data.movie,
      };

    } catch (err) {
      set({
        addingMovie: false,
      });

      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Failed to add movie',
      };
    }
  },

  removeMovie: async (movieId) => {
    try {
      await api.delete(`/movies/${movieId}`);

      set((state) => ({
        movies: state.movies.filter(
          (m) => m._id !== movieId
        ),

        topRated: state.topRated.filter(
          (m) => m._id !== movieId
        ),

        recommendations: state.recommendations.filter(
          (m) => m._id !== movieId
        ),

        watchLater: state.watchLater.filter(
          (m) => m._id !== movieId
        ),
      }));

      return { success: true };

    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          'Failed to remove movie',
      };
    }
  },

  updateMovieRating: (
    movieId,
    rating,
    avgRating,
    userId,
    username,
    email
  ) => {
    set((state) => ({
      movies: state.movies.map((m) => {
        if (m._id !== movieId) return m;

        const existingIdx = m.ratings.findIndex(
          (r) => r.user._id === userId
        );

        let newRatings;

        if (existingIdx >= 0) {
          newRatings = m.ratings.map((r, i) =>
            i === existingIdx
              ? { ...r, rating }
              : r
          );
        } else {
          newRatings = [
            ...m.ratings,
            {
              user: {
                _id: userId,
                username,
                email,
              },
              rating,
            },
          ];
        }

        return {
          ...m,
          ratings: newRatings,
          avgRating,
          userRating: rating,
        };
      }),
    }));
  },

  updateMovieWatched: (
    movieId,
    watched,
    watchedDate,
    userId,
    username,
    email
  ) => {
    set((state) => ({
      movies: state.movies.map((m) => {
        if (m._id !== movieId) return m;

        let newWatchedBy;

        if (watched) {
          const exists = m.watchedBy.find(
            (w) => w.user._id === userId
          );

          if (exists) {
            newWatchedBy = m.watchedBy.map((w) =>
              w.user._id === userId
                ? { ...w, watchedDate }
                : w
            );
          } else {
            newWatchedBy = [
              ...m.watchedBy,
              {
                user: {
                  _id: userId,
                  username,
                  email,
                },
                watchedDate,
                watched: true,
              },
            ];
          }
        } else {
          newWatchedBy = m.watchedBy.filter(
            (w) => w.user._id !== userId
          );
        }

        return {
          ...m,
          watchedBy: newWatchedBy,
          userWatched: watched,
          userWatchedDate: watchedDate,

          // remove from watch later automatically
          userWatchLater: watched
            ? false
            : m.userWatchLater,
        };
      }),

      recommendations: watched
        ? state.recommendations.filter(
            (m) => m._id !== movieId
          )
        : state.recommendations,

      watchLater: watched
        ? state.watchLater.filter(
            (m) => m._id !== movieId
          )
        : state.watchLater,
    }));
  },

  updateWatchLater: (movieId, saved) => {
    set((state) => ({
      movies: state.movies.map((m) =>
        m._id === movieId
          ? {
              ...m,
              userWatchLater: saved,
            }
          : m
      ),
    }));
  },

  clearMovies: () =>
    set({
      movies: [],
      topRated: [],
      recommendations: [],
      watchLater: [],
    }),
}));

export default useMovieStore;
