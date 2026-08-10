import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, Star, Calendar, Clock, List, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import API_BASE_URL from '../api/config';
import AdBanner from '../components/AdBanner';
import AD_CONFIG from '../api/ads';

const AnimeDetails = () => {
  const { id } = useParams();
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodeChunkIndex, setEpisodeChunkIndex] = useState(0);
  const CHUNK_SIZE = 50;
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [anime, setAnime] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailsRes, allRes] = await Promise.all([
          fetch(`${API_BASE_URL}/animes/${id}`),
          fetch(`${API_BASE_URL}/animes`)
        ]);
        
        const detailsData = await detailsRes.json();
        const allData = await allRes.json();
        
        setAnime(detailsData);
        setRecommendations(allData.filter(a => a._id !== detailsData._id).slice(0, 5));
        
        if (detailsData.seasons && detailsData.seasons.length > 0) {
          setActiveSeason(detailsData.seasons[0].seasonNumber);
          if (detailsData.seasons[0].episodes.length > 0) {
            setCurrentVideoUrl(detailsData.seasons[0].episodes[0].videoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setEpisodeChunkIndex(0);
  }, [activeSeason]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-400">Anime not found.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary rounded-xl font-bold">Go Home</button>
      </div>
    );
  }

  const pageTitle = `Watch ${anime.title} English Sub & Dub Free HD | AnimeStream`;
  const pageDescription = `Watch ${anime.title} full episodes free online in HD with English Sub and Dub. ${anime.description ? anime.description.substring(0, 150) + '...' : ''}`;
  const canonicalUrl = `https://animezstream.netlify.app/anime/${anime.slug || anime._id}`;
  const genresString = Array.isArray(anime.genres) ? anime.genres.join(', ') : anime.genres || 'Anime';

  // Build TVSeries JSON-LD Schema for Google Rich Snippets
  const tvSeriesSchema = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": anime.title,
    "description": anime.description,
    "image": anime.posterUrl,
    "genre": genresString,
    "aggregateRating": anime.rating ? {
      "@type": "AggregateRating",
      "ratingValue": anime.rating,
      "bestRating": "10",
      "ratingCount": "150"
    } : undefined,
    "numberOfEpisodes": anime.episodes || anime.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0,
    "url": canonicalUrl
  };

  return (
    <div className="min-h-screen pb-20">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${anime.title}, watch ${anime.title}, ${anime.title} english sub, ${anime.title} dub, ${genresString}`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={anime.posterUrl || anime.bannerUrl} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={anime.posterUrl || anime.bannerUrl} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(tvSeriesSchema)}
        </script>
      </Helmet>

      <Navbar />
      
      {/* Hero Banner Section */}
      <div className="relative h-[48vh] sm:h-[60vh] md:h-[70vh] w-full min-h-[360px] sm:min-h-[480px]">
        <img src={anime.bannerUrl || anime.posterUrl} className="w-full h-full object-cover opacity-40" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 md:px-16 pb-14 sm:pb-20 md:pb-28 flex flex-row items-end gap-4 sm:gap-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-24 sm:w-44 md:w-64 aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0"
          >
            <img src={anime.posterUrl} className="w-full h-full object-cover" alt="Poster" />
          </motion.div>
          
          <div className="flex-1 space-y-2 sm:space-y-4 min-w-0">
            <div className="flex items-center gap-3">
              <span className="bg-primary px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold">{anime.type}</span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span className="text-white text-xs sm:text-sm font-bold">{anime.rating}</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-4xl md:text-6xl font-black truncate">{anime.title}</h1>
            <p className="text-gray-400 max-w-3xl line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm md:text-base leading-relaxed">
              {anime.description}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-6 pt-1 sm:pt-4 text-xs sm:text-sm font-medium text-gray-300">
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> {new Date(anime.releaseDate).getFullYear() || 'N/A'}</div>
              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> {anime.status}</div>
              <div className="flex items-center gap-1.5">
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> 
                {anime.episodes || anime.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0} EPS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container with Video Player Flanked by Side Banners */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 flex flex-col xl:flex-row gap-6 items-start justify-center -mt-10 sm:-mt-16 md:-mt-20 relative z-20">
        
        {/* Left Side Ad - Desktop (Flanking Video Player) */}
        <aside className="hidden xl:flex flex-col items-center w-[300px] shrink-0 sticky top-24 pt-2">
          <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_LEFT} />
          <div className="mt-4 p-5 glass rounded-2xl border border-white/5 text-center w-full">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1">Support Us</p>
            <p className="text-xs text-gray-400">Enjoying the site? Consider disabling adblock to help us keep the servers running!</p>
          </div>
        </aside>

        {/* Center Section (Video Player + Episodes & Recs) */}
        <div className="flex-1 w-full max-w-5xl space-y-6 sm:space-y-8">
          
          {/* Video Player */}
          <div className="w-full">
            <VideoPlayer url={currentVideoUrl} />
          </div>

          {/* Mobile/Tablet Ad Top */}
          <div className="xl:hidden w-full flex justify-center my-2 sm:my-4">
            <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_MOBILE_TOP} />
          </div>

          <main className="grid lg:grid-cols-3 gap-8">
            {/* Episodes Section */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">Episodes</h2>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                  {anime.seasons?.map((s) => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => setActiveSeason(s.seasonNumber)}
                      className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                        activeSeason === s.seasonNumber 
                          ? 'bg-primary text-white' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      Season {s.seasonNumber}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Episode Chunk Tabs */}
                {anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes.length > CHUNK_SIZE && (
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 mb-3">
                    {Array.from({ length: Math.ceil((anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes.length || 0) / CHUNK_SIZE) }).map((_, idx) => {
                      const start = idx * CHUNK_SIZE + 1;
                      const end = Math.min((idx + 1) * CHUNK_SIZE, anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes.length || 0);
                      return (
                        <button
                          key={idx}
                          onClick={() => setEpisodeChunkIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            episodeChunkIndex === idx 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                          }`}
                        >
                          Episodes {start}-{end}
                        </button>
                      );
                    })}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeSeason}-${episodeChunkIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-2.5 sm:gap-3 max-h-[600px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar"
                  >
                    {anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes
                      .slice(episodeChunkIndex * CHUNK_SIZE, (episodeChunkIndex + 1) * CHUNK_SIZE)
                      .map((ep) => (
                      <div 
                        key={ep.episodeNumber}
                        onClick={() => ep.videoUrl && setCurrentVideoUrl(ep.videoUrl)}
                        className={`group flex items-center justify-between border p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${
                          currentVideoUrl === ep.videoUrl 
                            ? 'bg-primary/10 border-primary/50' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg shrink-0 transition-colors ${
                            currentVideoUrl === ep.videoUrl ? 'bg-primary' : 'bg-background group-hover:bg-primary'
                          }`}>
                            <Play className={`w-4 h-4 transition-colors ${
                              currentVideoUrl === ep.videoUrl ? 'text-white fill-current' : 'text-gray-400 group-hover:text-white'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-bold text-xs sm:text-sm truncate ${currentVideoUrl === ep.videoUrl ? 'text-primary' : ''}`}>
                              EP {ep.episodeNumber}: {ep.title}
                            </h4>
                            <span className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-widest font-bold">{ep.duration}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${currentVideoUrl === ep.videoUrl ? 'text-primary' : 'text-gray-600'}`} />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar / Recommendations */}
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold">You might also like</h2>
              <div className="grid gap-3 sm:gap-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec._id} 
                    onClick={() => {
                      navigate(`/anime/${rec.slug || rec._id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="flex gap-3 sm:gap-4 group cursor-pointer"
                  >
                    <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-white/5">
                      <img src={rec.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rec.title} />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-1">{rec.title}</h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {Array.isArray(rec.genres) ? rec.genres.join(', ') : rec.genres}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-[10px] font-bold">{rec.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No other series found.</p>
                )}
              </div>
            </div>
          </main>

          {/* Mobile/Tablet Ad Bottom */}
          <div className="xl:hidden w-full flex justify-center mt-6 sm:mt-8">
            <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_MOBILE_BOTTOM} />
          </div>
        </div>

        {/* Right Side Ad - Desktop (Flanking Video Player) */}
        <aside className="hidden xl:flex flex-col items-center w-[300px] shrink-0 sticky top-24 pt-2">
          <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_RIGHT} />
          <div className="mt-4 space-y-4 w-full">
            <div className="p-5 glass rounded-2xl border border-white/5">
              <h3 className="font-bold text-xs mb-1">Join our Discord</h3>
              <p className="text-[11px] text-gray-400 mb-3">Connect with other anime fans and get instant update notifications.</p>
              <button className="w-full py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg transition-colors">Join Community</button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default AnimeDetails;
