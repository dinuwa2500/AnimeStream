import React, { useState } from 'react';
import { UploadButton } from "@uploadthing/react";
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';

import API_BASE_URL from '../api/config';

const Admin = () => {
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
        episodes: [{ episodeNumber: 1, title: '', videoUrl: '', duration: '24m' }]
      }
    ]
  });

  const handleAddSeason = () => {
    setAnimeData({
      ...animeData,
      seasons: [
        ...animeData.seasons,
        {
          seasonNumber: animeData.seasons.length + 1,
          title: `Season ${animeData.seasons.length + 1}`,
          episodes: [{ episodeNumber: 1, title: '', videoUrl: '', duration: '24m' }]
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
      duration: '24m'
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
        : animeData.genres
    };

    try {
      const response = await fetch(`${API_BASE_URL}/animes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        alert('Anime saved successfully! 🚀');
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
              episodes: [{ episodeNumber: 1, title: '', videoUrl: '', duration: '24m' }]
            }
          ]
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to connect to the server.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-6 md:px-16 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              ADMIN DASHBOARD
            </h1>
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              <Save className="w-5 h-5" />
              SAVE ANIME
            </button>
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
                      onClientUploadComplete={(res) => {
                        setAnimeData({...animeData, posterUrl: res[0].url});
                        alert("Upload Completed");
                      }}
                      onUploadError={(error) => alert(`ERROR! ${error.message}`)}
                    />
                    {animeData.posterUrl && <p className="text-xs text-green-500 font-medium">Poster uploaded! ✅</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-400">Banner Image</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-white/5">
                    <UploadButton
                      endpoint="bannerUploader"
                      onClientUploadComplete={(res) => {
                        setAnimeData({...animeData, bannerUrl: res[0].url});
                        alert("Banner Uploaded");
                      }}
                      onUploadError={(error) => alert(`ERROR! ${error.message}`)}
                    />
                    {animeData.bannerUrl && <p className="text-xs text-green-500 font-medium">Banner uploaded! ✅</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Seasons & Episodes Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Seasons & Episodes</h2>
                <button 
                  type="button"
                  onClick={handleAddSeason}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  <Plus className="w-4 h-4" /> ADD SEASON
                </button>
              </div>

              {animeData.seasons.map((season, sIdx) => (
                <div key={sIdx} className="glass rounded-3xl p-8 space-y-6 border-l-4 border-primary">
                  <div className="flex items-center justify-between">
                    <input 
                      type="text"
                      className="bg-transparent text-xl font-bold focus:outline-none border-b border-transparent focus:border-primary/50"
                      value={season.title}
                      onChange={(e) => {
                        const newSeasons = [...animeData.seasons];
                        newSeasons[sIdx].title = e.target.value;
                        setAnimeData({...animeData, seasons: newSeasons});
                      }}
                    />
                    <button className="text-red-500 hover:text-red-400 p-2"><Trash2 className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-4">
                    {season.episodes.map((ep, eIdx) => (
                      <div key={eIdx} className="grid md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 font-bold">EP {ep.episodeNumber}</span>
                          <input 
                            type="text"
                            placeholder="Episode Title"
                            className="bg-transparent text-sm focus:outline-none w-full"
                            value={ep.title}
                            onChange={(e) => {
                              const newSeasons = [...animeData.seasons];
                              newSeasons[sIdx].episodes[eIdx].title = e.target.value;
                              setAnimeData({...animeData, seasons: newSeasons});
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <UploadButton
                            endpoint="videoUploader"
                            onClientUploadComplete={(res) => {
                              const newSeasons = [...animeData.seasons];
                              newSeasons[sIdx].episodes[eIdx].videoUrl = res[0].url;
                              setAnimeData({...animeData, seasons: newSeasons});
                              alert("Video Uploaded!");
                            }}
                            appearance={{
                              button: "ut-ready:bg-primary ut-uploading:cursor-not-allowed bg-white/5 text-[10px] h-8 px-3 rounded-lg border border-white/10",
                            }}
                          />
                          <input 
                            type="text"
                            placeholder="Or paste URL"
                            className="bg-transparent text-xs focus:outline-none w-full border-b border-white/5"
                            value={ep.videoUrl}
                            onChange={(e) => {
                              const newSeasons = [...animeData.seasons];
                              newSeasons[sIdx].episodes[eIdx].videoUrl = e.target.value;
                              setAnimeData({...animeData, seasons: newSeasons});
                            }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button className="text-gray-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => handleAddEpisode(sIdx)}
                      className="w-full border-2 border-dashed border-white/5 hover:border-white/10 py-3 rounded-2xl text-xs font-bold text-gray-500 transition-all uppercase tracking-widest"
                    >
                      + Add Episode to Season {season.seasonNumber}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
