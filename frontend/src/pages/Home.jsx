import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import { ChevronRight, Zap, TrendingUp, Clock ,Star } from 'lucide-react';
import API_BASE_URL from '../api/config';

const Home = () => {
  const [latestAnime, setLatestAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/animes`);
        const data = await response.json();
        setLatestAnime(data);
      } catch (error) {
        console.error('Error fetching animes:', error);
      } finally {
        setLoading(false);
      }
    };

    const trackVisit = async () => {
      try {
        await fetch(`${API_BASE_URL}/stats/track`, { method: 'POST' });
      } catch (error) {
        // Silent fail for tracking
      }
    };

    fetchAnimes();
    trackVisit();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <Hero anime={latestAnime[0]} />

      <main className="px-6 md:px-16 mt-12 space-y-16">
        {/* Recently Updated */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Recently Updated</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Fresh episodes daily</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {latestAnime.map((anime) => (
              <AnimeCard 
                key={anime._id} 
                id={anime.slug || anime._id}
                title={anime.title}
                image={anime.posterUrl}
                rating={anime.rating}
                episodes={anime.episodes}
                type={anime.type}
                seasons={anime.seasons}
              />
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/20 p-2 rounded-xl">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">What everyone is watching</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...latestAnime].reverse().map((anime) => (
              <AnimeCard 
                key={anime._id} 
                id={anime.slug || anime._id}
                title={anime.title}
                image={anime.posterUrl}
                rating={anime.rating}
                episodes={anime.episodes}
                type={anime.type}
                seasons={anime.seasons}
              />
            ))}
          </div>
        </section>

        {/* Features Info */}
        <section className="glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
          <div className="relative z-10 grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <Clock className="w-10 h-10 text-primary" />
              <h3 className="text-xl font-bold">Daily Updates</h3>
              <p className="text-gray-400 text-sm leading-relaxed">We upload new episodes as soon as they air in Japan. Stay up to date with your favorite series.</p>
            </div>
            <div className="space-y-4">
              <Zap className="w-10 h-10 text-secondary" />
              <h3 className="text-xl font-bold">Fast Streaming</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Our high-speed servers ensure you get the best HD quality with zero buffering, even on slow connections.</p>
            </div>
            <div className="space-y-4">
              <Star className="w-10 h-10 text-accent" />
              <h3 className="text-xl font-bold">HD Quality</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Watch all your favorite anime in stunning 1080p with multiple server options and sub/dub support.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 px-6 md:px-16 py-12 border-t border-white/5 bg-surface">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter">ANIME<span className="text-primary">STREAM</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 AnimeStream. Watch Anime Online Free in HD.</p>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
