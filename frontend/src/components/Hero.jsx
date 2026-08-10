import React from 'react';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = ({ anime }) => {
  const navigate = useNavigate();

  if (!anime) return null;

  return (
    <div className="relative min-h-[500px] sm:min-h-[580px] h-[75vh] sm:h-[80vh] md:h-[85vh] w-full overflow-hidden flex items-center px-4 sm:px-8 md:px-16 pt-24 sm:pt-20">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={anime.bannerUrl || anime.posterUrl} 
          alt={anime.title} 
          className="w-full h-full object-cover opacity-50 sm:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 sm:via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl"
      >
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mb-3 sm:mb-6">
          <span className="bg-primary/20 text-primary px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-primary/30">
            TRENDING #1
          </span>
          <div className="flex items-center gap-1 text-yellow-500 text-xs sm:text-sm font-bold">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            <span className="text-white">{anime.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm font-medium">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{new Date(anime.releaseDate).getFullYear() || '2024'}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-6 leading-tight tracking-tight uppercase break-words">
          {anime.title}
        </h1>

        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-lg line-clamp-3">
          {anime.description}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button 
            onClick={() => navigate(`/anime/${anime.slug || anime._id}`)}
            className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 text-sm sm:text-base"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            WATCH NOW
          </button>
          <button 
            onClick={() => navigate(`/anime/${anime.slug || anime._id}`)}
            className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold transition-all text-sm sm:text-base"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            MORE INFO
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;

