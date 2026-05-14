import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, Play, Bell, User, Star, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../api/config';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`${API_BASE_URL}/animes?q=${searchQuery}`);
        const data = await response.json();
        setResults(data.slice(0, 6)); // Show top 6 results
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleResultClick = (id) => {
    navigate(`/anime/${id}`);
    setSearchQuery('');
    setShowResults(false);
  };
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ANIME<span className="text-primary">STREAM</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/" className="hover:text-white transition-colors">Trending</Link>
          <Link to="/" className="hover:text-white transition-colors">Genres</Link>
          <Link to="/" className="hover:text-white transition-colors">Movies</Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search anime..." 
            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 w-64 transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />

          <AnimatePresence>
            {showResults && (searchQuery.length >= 2) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 left-0 w-[350px] glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-2 z-[60]"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                    Searching...
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((anime) => (
                      <div 
                        key={anime._id}
                        onClick={() => handleResultClick(anime.slug || anime._id)}
                        className="flex gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all group"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-lg">
                          <img src={anime.posterUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{anime.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                              <Star className="w-3 h-3 fill-current" /> {anime.rating}
                            </div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                              {anime.type} • {anime.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                    No series found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
          </button>
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Guest</span>
          </button>
          <button className="md:hidden p-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
