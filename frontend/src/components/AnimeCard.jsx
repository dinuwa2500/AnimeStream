import { Play, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AnimeCard = ({ title, image, rating, episodes, type, id }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={() => navigate(`/anime/${id || 'solo-leveling'}`)}
      className="group relative rounded-2xl overflow-hidden bg-surface border border-white/5 cursor-pointer shadow-xl"
    >
      {/* Poster Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-primary p-4 rounded-full scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-primary/30">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider">
            {type}
          </span>
        </div>
        
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-[10px] font-bold">{rating}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
          <span>{episodes} Episodes</span>
          <button className="p-1 hover:bg-white/5 rounded-md transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnimeCard;
