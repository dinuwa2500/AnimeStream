import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AnimeCard from '../components/AnimeCard';
import { ChevronRight, Zap, TrendingUp, Clock ,Star } from 'lucide-react';
import API_BASE_URL from '../api/config';
import AdBanner from '../components/AdBanner';
import AD_CONFIG from '../api/ads';

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

  // Build JSON-LD ItemList Schema for Google Search Rich Results
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Trending Anime Series",
    "itemListElement": latestAnime.slice(0, 10).map((anime, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": anime.title,
      "url": `https://animezstream.netlify.app/anime/${anime.slug || anime._id}`,
      "image": anime.posterUrl
    }))
  };

  return (
    <div className="min-h-screen pb-20">
      <Helmet>
        <title>AnimeStream | Watch Free Anime Online HD with Sub & Dub</title>
        <meta name="description" content="Stream thousands of popular anime series and movies online free in HD. Watch One Piece, Solo Leveling, Demon Slayer & more with English Sub & Dub. Fast streaming, daily updates!" />
        <meta name="keywords" content="anime, watch anime online, free anime streaming, watch anime hd, english sub anime, anime dubbed, top anime series, watch one piece" />
        <link rel="canonical" href="https://animezstream.netlify.app/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content="AnimeStream | Watch Free Anime Online HD" />
        <meta property="og:description" content="Stream thousands of popular anime series and movies online free in HD with Sub & Dub. Fast servers, daily updates." />
        <meta property="og:url" content="https://animezstream.netlify.app/" />
        <meta property="og:type" content="website" />
        {latestAnime[0]?.posterUrl && <meta property="og:image" content={latestAnime[0].posterUrl} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AnimeStream | Watch Free Anime Online HD" />
        <meta name="twitter:description" content="Stream thousands of popular anime series online free in HD. Fast streaming, daily updates!" />
        {latestAnime[0]?.posterUrl && <meta name="twitter:image" content={latestAnime[0].posterUrl} />}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
      </Helmet>

      <Navbar />
      <Hero anime={latestAnime[0]} />

      <div className="px-4 sm:px-8 md:px-16 -mt-6 sm:-mt-8 relative z-30">
        <AdBanner type="horizontal" zoneId={AD_CONFIG.HOME_TOP} />
      </div>

      <main className="px-4 sm:px-8 md:px-16 mt-8 sm:mt-12 space-y-10 sm:space-y-16">
        {/* Recently Updated */}
        <section>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Recently Updated</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-widest">Fresh episodes daily</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
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
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/20 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Trending Now</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-widest">What everyone is watching</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
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
        <section className="glass rounded-3xl p-6 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 grid md:grid-cols-3 gap-8 sm:gap-12">
            <div className="space-y-3 sm:space-y-4">
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <h3 className="text-lg sm:text-xl font-bold">Daily Updates</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">We upload new episodes as soon as they air in Japan. Stay up to date with your favorite series.</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
              <h3 className="text-lg sm:text-xl font-bold">Fast Streaming</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Our high-speed servers ensure you get the best HD quality with zero buffering, even on slow connections.</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
              <h3 className="text-lg sm:text-xl font-bold">HD Quality</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Watch all your favorite anime in stunning 1080p with multiple server options and sub/dub support.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 sm:mt-20 px-4 sm:px-8 md:px-16 py-8 sm:py-12 border-t border-white/5 bg-surface">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter">ANIME<span className="text-primary">STREAM</span></span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">© 2026 AnimeStream. Watch Anime Online Free in HD.</p>
          <div className="flex items-center gap-6 text-xs sm:text-sm font-medium text-gray-400">
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
