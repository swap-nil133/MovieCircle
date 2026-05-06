import { useState } from 'react';
import toast from 'react-hot-toast';
import useMovieStore from '../../context/movieStore';

export default function AddMovieModal({ groupId, onClose, onAdded }) {
  const [imdbLink, setImdbLink] = useState('');
  const { addMovie, addingMovie } = useMovieStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imdbLink.trim()) {
      toast.error('Please enter an IMDb link');
      return;
    }

    const result = await addMovie(imdbLink.trim(), groupId);
    if (result.success) {
      toast.success(`"${result.movie.title}" added!`);
      if (onAdded) onAdded();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop bg-cinema-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md card shadow-modal animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-cinema-text">Add Movie</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-cinema-muted hover:bg-cinema-border flex items-center justify-center text-cinema-subtle hover:text-cinema-text transition-all"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">
                IMDb Link
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="https://www.imdb.com/title/tt1234567/"
                value={imdbLink}
                onChange={(e) => setImdbLink(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-cinema-subtle mt-2">
                Paste any IMDb movie URL or just the IMDb ID (e.g., tt1234567)
              </p>
            </div>

            {/* Example links */}
            <div className="bg-cinema-muted/50 rounded-lg p-3 border border-cinema-border">
              <p className="text-xs text-cinema-subtle mb-2 font-medium">Accepted formats:</p>
              <div className="space-y-1">
                {[
                  'https://www.imdb.com/title/tt0111161/',
                  'https://imdb.com/title/tt0468569',
                  'tt0137523',
                ].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setImdbLink(ex)}
                    className="block font-mono text-xs text-cinema-gold hover:text-cinema-gold-dim transition-colors text-left"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingMovie}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {addingMovie ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cinema-black/30 border-t-cinema-black rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Add Movie'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
