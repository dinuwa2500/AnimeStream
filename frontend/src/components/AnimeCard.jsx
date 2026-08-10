import { Play, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AnimeCard = ({ title, image, rating, episodes, type, id, seasons }) => {
  const navigate = useNavigate();
  const totalEpisodes = episodes || seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0;

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/anime/${id || 'solo-leveling'}`)}
      className="group relative rounded-2xl overflow-hidden bg-surface border border-white/5 cursor-pointer shadow-xl transition-all"
    >
      {/* Poster Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary p-3 sm:p-4 rounded-full scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-primary/30">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-2">
          <span className="bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-white/10 uppercase tracking-wider text-white">
            {type}
          </span>
        </div>
        
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-white/10 text-white">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-current" />
            <span className="text-[9px] sm:text-[10px] font-bold">{rating}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-xs sm:text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 font-medium">
          <span>{totalEpisodes} EPS</span>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            aria-label="Add to Watchlist"
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimeCard;

