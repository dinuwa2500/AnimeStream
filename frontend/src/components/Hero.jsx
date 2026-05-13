import React from 'react';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = ({ anime }) => {
  const navigate = useNavigate();

  if (!anime) return null;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden flex items-center px-6 md:px-16 pt-20">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={anime.bannerUrl || anime.posterUrl} 
          alt={anime.title} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30">
            TRENDING #1
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold text-white">{anime.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{new Date(anime.releaseDate).getFullYear() || '2024'}</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight uppercase">
          {anime.title}
        </h1>

        <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg line-clamp-3">
          {anime.description}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => navigate(`/anime/${anime.slug || anime._id}`)}
            className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            <Play className="w-5 h-5 fill-current" />
            WATCH NOW
          </button>
          <button 
            onClick={() => navigate(`/anime/${anime.slug || anime._id}`)}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold transition-all"
          >
            <Info className="w-5 h-5" />
            MORE INFO
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
