import React, { useState, useEffect } from 'react';
import { UploadButton } from "@uploadthing/react";
import { Plus, Trash2, Save,Settings , Image as ImageIcon, List } from 'lucide-react';
import Navbar from '../components/Navbar';

import API_BASE_URL from '../api/config';

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('adminToken') ? true : false);
  const [passwordInput, setPasswordInput] = useState('');
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [currentBatch, setCurrentBatch] = useState(0); // 0 = 1-50, 1 = 51-100, etc.
  const [existingAnimes, setExistingAnimes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const [animeData, setAnimeData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    bannerUrl: '',
    genres: [],
    rating: 0,
    status: 'Ongoing',
    type: 'TV',
    releaseDate: new Date().toISOString().split('T')[0],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodes: [{ 
          episodeNumber: 1, 
          title: '', 
          videoUrl: '', 
          thumbnailUrl: '', 
          duration: '24m',
          telegram: { fileId: '', accessHash: '', fileReference: '' }
        }]
      }
    ]
  });

  const [uploadProgress, setUploadProgress] = useState({
    poster: 0,
    banner: 0,
    episodes: {}, // key: `v-${sIdx}-${eIdx}`
    thumbnails: {} // key: `t-${sIdx}-${eIdx}`
  });

  const fetchExistingAnimes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/animes`);
      const data = await response.json();
      setExistingAnimes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching animes:', error);
      setExistingAnimes([]);
    }
  };

  useEffect(() => {
    fetchExistingAnimes();
  }, []);

  const handleEdit = async (anime) => {
    try {
      // Fetch the FULL anime details (including seasons/episodes)
      const res = await fetch(`${API_BASE_URL}/animes/${anime._id}`);
      const fullAnime = await res.json();
      
      setAnimeData({
        ...fullAnime,
        genres: Array.isArray(fullAnime.genres) ? fullAnime.genres.join(', ') : fullAnime.genres,
        releaseDate: fullAnime.releaseDate ? fullAnime.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setEditingId(fullAnime._id);
      setIsEditing(true);
      setActiveSeasonIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Failed to load anime details");
    }
  };

  const handleReset = () => {
    setAnimeData({
      title: '',
      description: '',
      posterUrl: '',
      bannerUrl: '',
      genres: [],
      rating: 0,
      status: 'Ongoing',
      type: 'TV',
      releaseDate: new Date().toISOString().split('T')[0],
      seasons: [
        {
          seasonNumber: 1,
          title: 'Season 1',
          episodes: [{ 
            episodeNumber: 1, 
            title: '', 
            videoUrl: '', 
            thumbnailUrl: '', 
            duration: '24m',
            telegram: { fileId: '', accessHash: '', fileReference: '' }
          }]
        }
      ]
    });
    setIsEditing(false);
    setEditingId(null);
    setActiveSeasonIndex(0);
  };

  const handleAddSeason = () => {
    setAnimeData({
      ...animeData,
      seasons: [
        ...animeData.seasons,
        {
          seasonNumber: animeData.seasons.length + 1,
          title: `Season ${animeData.seasons.length + 1}`,
          episodes: [{ episodeNumber: 1, title: '', videoUrl: '', thumbnailUrl: '', duration: '24m' }]
        }
      ]
    });
  };

  const handleAddEpisode = (seasonIndex) => {
    const newSeasons = [...animeData.seasons];
    newSeasons[seasonIndex].episodes.push({
      episodeNumber: newSeasons[seasonIndex].episodes.length + 1,
      title: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: '24m',
      telegram: { fileId: '', accessHash: '', fileReference: '' }
    });
    setAnimeData({ ...animeData, seasons: newSeasons });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert genres string to array if it's still a string
    const processedData = {
      ...animeData,
      genres: typeof animeData.genres === 'string' 
        ? animeData.genres.split(',').map(g => g.trim()) 
        : animeData.genres,
      episodes: animeData.seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0)
    };

    try {
      const url = isEditing ? `${API_BASE_URL}/animes/${editingId}` : `${API_BASE_URL}/animes`;
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'admin-token': sessionStorage.getItem('adminToken')
        },
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        alert(isEditing ? 'Anime updated successfully! 🚀' : 'Anime saved successfully! 🚀');
        if (!isEditing) handleReset();
        fetchExistingAnimes();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to connect to the server.');
    }
  };

  const uploadToGofile = (file, sIdx, eIdx) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Get Server
        const serverRes = await fetch('https://api.gofile.io/getServer');
        const serverData = await serverRes.json();
        if (serverData.status !== 'ok') throw new Error('Could not get Gofile server');
        const server = serverData.data.server;

        // 2. Upload with Progress
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://${server}.gofile.io/uploadFile`, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({
              ...prev,
              episodes: { ...prev.episodes, [`v-${sIdx}-${eIdx}`]: progress }
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.status === 'ok') {
              // Gofile returns a downloadPage, we want to store that
              resolve(response.data.downloadPage);
            } else {
              reject(new Error(response.message || 'Gofile upload failed'));
            }
          } else {
            reject(new Error('Gofile upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during Gofile upload'));
        xhr.send(formData);

      } catch (error) {
        reject(error);
      }
    });
  };

  const handleFileChange = async (e, sIdx, eIdx) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const downloadUrl = await uploadToGofile(file, sIdx, eIdx);
      const newSeasons = [...animeData.seasons];
      newSeasons[sIdx].episodes[eIdx].videoUrl = downloadUrl;
      setAnimeData({ ...animeData, seasons: newSeasons });
      
      setUploadProgress(prev => {
        const newEpisodes = { ...prev.episodes };
        delete newEpisodes[`v-${sIdx}-${eIdx}`];
        return { ...prev, episodes: newEpisodes };
      });
      
      alert("Video Uploaded to Gofile! 🚀");
    } catch (error) {
      console.error(error);
      alert("Gofile Upload Error: " + error.message);
      setUploadProgress(prev => {
        const newEpisodes = { ...prev.episodes };
        delete newEpisodes[`v-${sIdx}-${eIdx}`];
        return { ...prev, episodes: newEpisodes };
      });
    }
  };

  const uploadToTelegram = (file, sIdx, eIdx) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload-telegram`, true);
      xhr.setRequestHeader('admin-token', sessionStorage.getItem('adminToken'));

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({
            ...prev,
            episodes: { ...prev.episodes, [`v-${sIdx}-${eIdx}`]: progress }
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('Telegram upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  };

  const handleTelegramUpload = async (e, sIdx, eIdx) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await uploadToTelegram(file, sIdx, eIdx);
      const newSeasons = [...animeData.seasons];
      newSeasons[sIdx].episodes[eIdx].telegram = {
        fileId: res.fileId,
        accessHash: res.accessHash,
        fileReference: res.fileReference,
        messageId: res.messageId,
        peerId: res.peerId
      };
      
      // We save a RELATIVE path so it works on both localhost and Vercel
      const streamUrl = `/api/stream/${res.fileId}/${res.accessHash}/${res.fileReference}?mid=${res.messageId}&pid=${res.peerId}`;
      newSeasons[sIdx].episodes[eIdx].videoUrl = streamUrl;
      
      setAnimeData({ ...animeData, seasons: newSeasons });
      alert("Uploaded to Telegram! 🚀");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setUploadProgress(prev => {
        const newEpisodes = { ...prev.episodes };
        delete newEpisodes[`v-${sIdx}-${eIdx}`];
        return { ...prev, episodes: newEpisodes };
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl w-full max-w-md space-y-6 text-center">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-gray-400 text-sm">Enter your secret password to continue</p>
          <input 
            type="password" 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-center"
            placeholder="••••••••"
          />
          <button 
            onClick={async () => {
              try {
                const res = await fetch(`${API_BASE_URL}/admin/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ password: passwordInput })
                });
                const data = await res.json();
                if (data.success) {
                  sessionStorage.setItem('adminToken', data.token);
                  setIsAdmin(true);
                } else {
                  alert("Invalid Password");
                }
              } catch (e) {
                alert("Login failed");
              }
            }}
            className="w-full bg-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-6 md:px-16 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Existing Anime */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <List className="w-5 h-5 text-primary" /> EXISTING
              </h2>
              <button 
                onClick={handleReset}
                className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                title="Add New Anime"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              {Array.isArray(existingAnimes) && existingAnimes.length > 0 ? (
                existingAnimes.map((anime) => (
                  <div 
                    key={anime._id}
                    onClick={() => handleEdit(anime)}
                    className={`glass p-3 rounded-2xl flex gap-3 cursor-pointer transition-all border group ${
                      editingId === anime._id ? 'border-primary/50 bg-primary/5' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 shadow-lg">
                      <img src={anime.posterUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-[13px] truncate group-hover:text-primary transition-colors">{anime.title}</h4>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mt-0.5">
                        {anime.seasons?.length || 0} Seasons • {anime.episodes || anime.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0} Eps
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-[10px] text-center py-4">No series found or server error.</p>
              )}
            </div>
          </div>

          {/* Main Content - Form */}
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {isEditing ? 'EDITING SERIES' : 'ADD NEW SERIES'}
                </h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                  {isEditing ? `Editing: ${animeData.title}` : 'Initialize a new anime project'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isEditing && (
                  <button 
                    onClick={handleReset}
                    className="bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl text-[10px] font-bold transition-all border border-white/10 uppercase tracking-widest"
                  >
                    Cancel Edit
                  </button>
                )}
                <button 
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 uppercase text-xs"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Series' : 'Save Anime'}
                </button>
              </div>
            </div>

          <form className="space-y-8">
            {/* Basic Info Section */}
            <div className="glass rounded-3xl p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> General Information
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Anime Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                    placeholder="e.g. Solo Leveling"
                    value={animeData.title}
                    onChange={(e) => setAnimeData({...animeData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Genres (Comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                    placeholder="Action, Fantasy, Adventure"
                    value={animeData.genres}
                    onChange={(e) => setAnimeData({...animeData, genres: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Rating</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                    placeholder="e.g. 9.8"
                    value={animeData.rating}
                    onChange={(e) => setAnimeData({...animeData, rating: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                    value={animeData.status}
                    onChange={(e) => setAnimeData({...animeData, status: e.target.value})}
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Type</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                    value={animeData.type}
                    onChange={(e) => setAnimeData({...animeData, type: e.target.value})}
                  >
                    <option value="TV">TV Series</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Release Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50"
                    value={animeData.releaseDate}
                    onChange={(e) => setAnimeData({...animeData, releaseDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Description</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 h-32"
                  placeholder="Enter anime plot summary..."
                  value={animeData.description}
                  onChange={(e) => setAnimeData({...animeData, description: e.target.value})}
                />
              </div>

              {/* Upload Section */}
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">Poster Image</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-white/5">
                    <UploadButton
                      endpoint="imageUploader"
                      url={`${API_BASE_URL}/uploadthing`}
                      onUploadProgress={(progress) => {
                        setUploadProgress(prev => ({ ...prev, poster: progress }));
                      }}
                      onClientUploadComplete={(res) => {
                        setAnimeData({...animeData, posterUrl: res[0].url});
                        setUploadProgress(prev => ({ ...prev, poster: 0 }));
                        alert("Poster Uploaded ✅");
                      }}
                      onUploadError={(error) => {
                        setUploadProgress(prev => ({ ...prev, poster: 0 }));
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                    {uploadProgress.poster > 0 && (
                      <div className="w-full space-y-1 mt-4">
                        <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                          <span>Uploading Poster</span>
                          <span>{uploadProgress.poster}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                            style={{ width: `${uploadProgress.poster}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {animeData.posterUrl && <p className="text-xs text-green-500 font-medium">Poster uploaded! ✅</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">Banner Image</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-white/5">
                    <UploadButton
                      endpoint="bannerUploader"
                      url={`${API_BASE_URL}/uploadthing`}
                      onUploadProgress={(progress) => {
                        setUploadProgress(prev => ({ ...prev, banner: progress }));
                      }}
                      onClientUploadComplete={(res) => {
                        setAnimeData({...animeData, bannerUrl: res[0].url});
                        setUploadProgress(prev => ({ ...prev, banner: 0 }));
                        alert("Banner Uploaded ✅");
                      }}
                      onUploadError={(error) => {
                        setUploadProgress(prev => ({ ...prev, banner: 0 }));
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                    {uploadProgress.banner > 0 && (
                      <div className="w-full space-y-1 mt-4">
                        <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                          <span>Uploading Banner</span>
                          <span>{uploadProgress.banner}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-secondary to-primary h-full transition-all duration-300 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)]" 
                            style={{ width: `${uploadProgress.banner}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {animeData.bannerUrl && <p className="text-xs text-green-500 font-medium">Banner uploaded! ✅</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <List className="w-6 h-6 text-primary" /> Seasons & Episodes
                </h2>
                <button 
                  type="button"
                  onClick={handleAddSeason}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-4 h-4" /> ADD NEW SEASON
                </button>
              </div>

              {/* Season Tabs */}
              <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto custom-scrollbar">
                {animeData.seasons?.map((season, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSeasonIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeSeasonIndex === idx ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    S{season.seasonNumber}
                  </button>
                ))}
              </div>

              {/* Active Season Episodes */}
              {animeData.seasons[activeSeasonIndex] && (
                <div className="glass rounded-3xl p-8 space-y-6 border-l-4 border-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                        <span className="text-primary font-black text-xl">{animeData.seasons[activeSeasonIndex].seasonNumber}</span>
                      </div>
                      <input 
                        type="text"
                        className="bg-transparent text-xl font-bold focus:outline-none border-b border-transparent focus:border-primary/50"
                        value={animeData.seasons[activeSeasonIndex].title}
                        onChange={(e) => {
                          const newSeasons = [...animeData.seasons];
                          newSeasons[activeSeasonIndex].title = e.target.value;
                          setAnimeData({...animeData, seasons: newSeasons});
                        }}
                        placeholder="Season Title"
                      />
                    </div>
                    {animeData.seasons.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => {
                          const newSeasons = animeData.seasons.filter((_, i) => i !== activeSeasonIndex);
                          setAnimeData({...animeData, seasons: newSeasons});
                          setActiveSeasonIndex(0);
                        }}
                        className="text-red-500/50 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                          Episodes ({animeData.seasons[activeSeasonIndex].episodes.length})
                        </h3>
                        {/* Batch Pagination Buttons */}
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: Math.ceil(animeData.seasons[activeSeasonIndex].episodes.length / 50) }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCurrentBatch(i)}
                              className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${
                                currentBatch === i ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                              }`}
                            >
                              {i * 50 + 1}-{Math.min((i + 1) * 50, animeData.seasons[activeSeasonIndex].episodes.length)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 max-w-xs relative">
                        <input 
                          type="text" 
                          placeholder="Search Ep #..." 
                          value={episodeSearch}
                          onChange={(e) => setEpisodeSearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {animeData.seasons[activeSeasonIndex].episodes
                        .filter(ep => ep.episodeNumber.toString().includes(episodeSearch) || ep.title.toLowerCase().includes(episodeSearch.toLowerCase()))
                        .slice(episodeSearch ? 0 : currentBatch * 50, episodeSearch ? 999 : (currentBatch + 1) * 50)
                        .map((ep, eIdx) => (
                      <div key={eIdx} className="grid md:grid-cols-4 gap-4 bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                        <div className="md:col-span-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-primary font-black text-xs uppercase">EP {ep.episodeNumber}</span>
                            <input 
                              type="text"
                              placeholder="Episode Title"
                              className="bg-transparent text-sm font-bold focus:outline-none w-full border-b border-white/10 focus:border-primary/50 transition-colors"
                              value={ep.title}
                              onChange={(e) => {
                                const newSeasons = [...animeData.seasons];
                                newSeasons[activeSeasonIndex].episodes[eIdx].title = e.target.value;
                                setAnimeData({...animeData, seasons: newSeasons});
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Duration</label>
                            <input 
                              type="text"
                              placeholder="e.g. 24m"
                              className="bg-white/5 text-xs px-3 py-2 rounded-lg focus:outline-none w-full border border-white/5"
                              value={ep.duration}
                              onChange={(e) => {
                                const newSeasons = [...animeData.seasons];
                                newSeasons[activeSeasonIndex].episodes[eIdx].duration = e.target.value;
                                setAnimeData({...animeData, seasons: newSeasons});
                              }}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Video Upload */}
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-bold">Video File</label>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  id={`file-${activeSeasonIndex}-${eIdx}`}
                                  className="hidden"
                                  onChange={(e) => handleFileChange(e, activeSeasonIndex, eIdx)}
                                  accept="video/*"
                                />
                                <label 
                                  htmlFor={`file-${activeSeasonIndex}-${eIdx}`}
                                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl h-10 px-4 text-[10px] font-bold cursor-pointer transition-all w-full"
                                >
                                  {uploadProgress.episodes[`v-${activeSeasonIndex}-${eIdx}`] > 0 ? 'UPLOADING...' : 'GOFILE'}
                                </label>
                              </div>

                              {/* Telegram Upload */}
                              <div className="relative mt-2">
                                <input 
                                  type="file" 
                                  id={`tg-${activeSeasonIndex}-${eIdx}`}
                                  className="hidden"
                                  onChange={(e) => handleTelegramUpload(e, activeSeasonIndex, eIdx)}
                                  accept="video/*"
                                />
                                <label 
                                  htmlFor={`tg-${activeSeasonIndex}-${eIdx}`}
                                  className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl h-10 px-4 text-[10px] font-bold cursor-pointer transition-all w-full text-primary"
                                >
                                  {uploadProgress.episodes[`v-${activeSeasonIndex}-${eIdx}`] > 0 ? 'UPLOADING...' : 'TELEGRAM'}
                                </label>
                              </div>
                              {uploadProgress.episodes[`v-${activeSeasonIndex}-${eIdx}`] > 0 && (
                                <div className="w-full space-y-1">
                                  <div className="flex justify-between text-[8px] font-black text-primary uppercase tracking-tighter">
                                    <span>{uploadProgress.episodes[`v-${activeSeasonIndex}-${eIdx}`]}%</span>
                                  </div>
                                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress.episodes[`v-${activeSeasonIndex}-${eIdx}`]}%` }} />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Thumbnail Upload */}
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-500 uppercase font-bold">Thumbnail</label>
                              <UploadButton
                                endpoint="imageUploader"
                                url={`${API_BASE_URL}/uploadthing`}
                                onUploadProgress={(progress) => {
                                  setUploadProgress(prev => ({
                                    ...prev,
                                    thumbnails: { ...prev.thumbnails, [`t-${activeSeasonIndex}-${eIdx}`]: progress }
                                  }));
                                }}
                                onClientUploadComplete={(res) => {
                                  const newSeasons = [...animeData.seasons];
                                  newSeasons[activeSeasonIndex].episodes[eIdx].thumbnailUrl = res[0].url;
                                  setAnimeData({...animeData, seasons: newSeasons});
                                  setUploadProgress(prev => {
                                    const newThumbs = { ...prev.thumbnails };
                                    delete newThumbs[`t-${activeSeasonIndex}-${eIdx}`];
                                    return { ...prev, thumbnails: newThumbs };
                                  });
                                }}
                                appearance={{
                                  button: "ut-ready:bg-secondary/20 bg-white/5 text-[10px] h-10 px-4 rounded-xl border border-white/10 w-full font-bold",
                                }}
                                content={{
                                  button({ isUploading }) {
                                    if (isUploading) return "UPDATING...";
                                    return "THUMBNAIL";
                                  },
                                }}
                              />
                            </div>
                          </div>
                          
                          <input 
                            type="text"
                            placeholder="Video URL (Direct link or Gofile page)"
                            className="bg-white/5 text-xs px-4 py-3 rounded-xl focus:outline-none w-full border border-white/5 focus:border-primary/30 transition-all"
                            value={ep.videoUrl}
                            onChange={(e) => {
                              const newSeasons = [...animeData.seasons];
                              newSeasons[activeSeasonIndex].episodes[eIdx].videoUrl = e.target.value;
                              setAnimeData({...animeData, seasons: newSeasons});
                            }}
                          />
                        </div>

                        <div className="md:col-span-1 flex flex-col justify-between items-end pb-1">
                          <button 
                            type="button"
                            onClick={() => {
                              const newSeasons = [...animeData.seasons];
                              newSeasons[activeSeasonIndex].episodes = newSeasons[activeSeasonIndex].episodes.filter((_, i) => i !== eIdx);
                              setAnimeData({...animeData, seasons: newSeasons});
                            }}
                            className="bg-red-500/10 text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {ep.thumbnailUrl && (
                            <img src={ep.thumbnailUrl} className="w-16 h-10 object-cover rounded-lg shadow-lg border border-white/10" alt="" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button"
                      onClick={() => handleAddEpisode(activeSeasonIndex)}
                      className="w-full border-2 border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/5 py-4 rounded-2xl text-xs font-bold text-gray-500 hover:text-primary transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Episode to Season {animeData.seasons[activeSeasonIndex].seasonNumber}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Admin;
