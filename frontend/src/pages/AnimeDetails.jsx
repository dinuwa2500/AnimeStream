import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Star, Calendar, Clock, List, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import API_BASE_URL from '../api/config';
import { useNavigate } from 'react-router-dom';
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!anime) return <div className="min-h-screen flex items-center justify-center">Anime not found</div>;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      {/* Hero Banner Section */}
      <div className="relative h-[70vh] w-full min-h-[500px]">
        <img src={anime.bannerUrl} className="w-full h-full object-cover opacity-40" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-6 md:px-16 pb-32 flex flex-col md:flex-row items-end gap-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-48 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 hidden md:block"
          >
            <img src={anime.posterUrl} className="w-full h-full object-cover" alt="Poster" />
          </motion.div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <span className="bg-primary px-3 py-1 rounded-lg text-xs font-bold">{anime.type}</span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white font-bold">{anime.rating}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black">{anime.title}</h1>
            <p className="text-gray-400 max-w-3xl line-clamp-3 text-sm md:text-base leading-relaxed">
              {anime.description}
            </p>
            <div className="flex flex-wrap gap-6 pt-4 text-sm font-medium text-gray-300">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(anime.releaseDate).getFullYear() || 'N/A'}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {anime.status}</div>
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-primary" /> 
                {anime.episodes || anime.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0} Episodes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="px-4 -mt-24 relative z-20">
        <div className="max-w-5xl mx-auto">
          <VideoPlayer url={currentVideoUrl} />
        </div>
      </div>

      {/* Main Content Area with Side Ads */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-10 flex flex-col xl:flex-row gap-8 items-start justify-center">
        
        {/* Left Side Ad - Desktop */}
        <aside className="hidden xl:block w-[350px] shrink-0 sticky top-24 pt-12">
          <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_LEFT} />
          <div className="mt-8 p-6 glass rounded-2xl border border-white/5 text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-2">Support Us</p>
            <p className="text-sm text-gray-400">Enjoying the site? Consider disabling adblock to help us keep the servers running!</p>
          </div>
        </aside>

        <div className="flex-1 w-full max-w-6xl">
          {/* Mobile/Tablet Ad Top */}
          <div className="xl:hidden w-full flex justify-center mb-8">
            <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_MOBILE_TOP} />
          </div>

          <main className="grid lg:grid-cols-3 gap-12">
            {/* Episodes Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Episodes</h2>
                <div className="flex gap-2">
                  {anime.seasons?.map((s) => (
                    <button
                      key={s.seasonNumber}
                      onClick={() => setActiveSeason(s.seasonNumber)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
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

              <div className="space-y-6">
                {/* Episode Chunk Tabs */}
                {anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes.length > CHUNK_SIZE && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.from({ length: Math.ceil((anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes.length || 0) / CHUNK_SIZE) }).map((_, idx) => {
                      const start = idx * CHUNK_SIZE + 1;
                      const end = Math.min((idx + 1) * CHUNK_SIZE, anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes.length || 0);
                      return (
                        <button
                          key={idx}
                          onClick={() => setEpisodeChunkIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                    className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {anime.seasons?.find(s => s.seasonNumber === activeSeason)?.episodes
                      .slice(episodeChunkIndex * CHUNK_SIZE, (episodeChunkIndex + 1) * CHUNK_SIZE)
                      .map((ep) => (
                      <div 
                        key={ep.episodeNumber}
                        onClick={() => ep.videoUrl && setCurrentVideoUrl(ep.videoUrl)}
                        className={`group flex items-center justify-between border p-4 rounded-2xl transition-all cursor-pointer ${
                          currentVideoUrl === ep.videoUrl 
                            ? 'bg-primary/10 border-primary/50' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                            currentVideoUrl === ep.videoUrl ? 'bg-primary' : 'bg-background group-hover:bg-primary'
                          }`}>
                            <Play className={`w-4 h-4 transition-colors ${
                              currentVideoUrl === ep.videoUrl ? 'text-white fill-current' : 'text-gray-400 group-hover:text-white'
                            }`} />
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${currentVideoUrl === ep.videoUrl ? 'text-primary' : ''}`}>
                              Episode {ep.episodeNumber}: {ep.title}
                            </h4>
                            <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">{ep.duration}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${currentVideoUrl === ep.videoUrl ? 'text-primary' : 'text-gray-600'}`} />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Sidebar / Recommendations */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">You might also like</h2>
              <div className="grid gap-4">
                {recommendations.map((rec) => (
                  <div 
                    key={rec._id} 
                    onClick={() => {
                      navigate(`/anime/${rec.slug || rec._id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div className="w-20 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-white/5">
                      <img src={rec.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={rec.title} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">{rec.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                        {Array.isArray(rec.genres) ? rec.genres.join(', ') : rec.genres}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
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
          <div className="xl:hidden w-full flex justify-center mt-12">
            <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_MOBILE_BOTTOM} />
          </div>
        </div>

        {/* Right Side Ad - Desktop */}
        <aside className="hidden xl:block w-[350px] shrink-0 sticky top-24 pt-12">
          <AdBanner type="square" zoneId={AD_CONFIG.DETAILS_RIGHT} />
          <div className="mt-8 space-y-4">
            <div className="p-6 glass rounded-2xl border border-white/5">
              <h3 className="font-bold text-sm mb-2">Join our Discord</h3>
              <p className="text-xs text-gray-400 mb-4">Connect with other anime fans and get instant update notifications.</p>
              <button className="w-full py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-lg transition-colors">Join Community</button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default AnimeDetails;
