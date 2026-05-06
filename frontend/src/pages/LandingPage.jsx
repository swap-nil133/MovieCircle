import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cinema-gold/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-cinema-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cinema-teal/3 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-3xl animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cinema-gold flex items-center justify-center text-cinema-black text-2xl font-bold shadow-gold">
            🎬
          </div>
          <span className="font-display text-3xl font-bold text-cinema-text">MovieCircle</span>
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Watch movies{' '}
          <span className="gradient-text">together</span>,<br />
          even apart.
        </h1>

        <p className="text-cinema-subtle text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto">
          Create private groups with friends, track movies, share ratings, and discover what to watch next — all in one place.
        </p>
        
        <p className="text-sm text-white-500 mt-3">
          Developed by <span className="text-yellow-400 font-medium">SwapNIL</span>
        </p>
        <br>
        <br>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-3.5">
            Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3.5">
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { icon: '👥', title: 'Private Groups', desc: 'Create circles for your friend groups and family' },
            { icon: '⭐', title: 'Rate & Review', desc: 'See everyone\'s ratings in one beautiful dashboard' },
            { icon: '🎯', title: 'Smart Picks', desc: 'Personalized recommendations based on what you haven\'t seen' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card p-5 animate-slide-up">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="font-semibold text-cinema-text mb-1">{title}</div>
              <div className="text-cinema-subtle text-sm leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
