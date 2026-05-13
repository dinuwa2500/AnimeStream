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
        episodes: [{ episodeNumber: 1, title: '', videoUrl: '', thumbnailUrl: '', duration: '24m' }]
      }
    ]
  });

  const [uploadProgress, setUploadProgress] = useState({
    poster: 0,
    banner: 0,
    episodes: {}, // key: `v-${sIdx}-${eIdx}`
    thumbnails: {} // key: `t-${sIdx}-${eIdx}`
  });

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
              episodes: [{ episodeNumber: 1, title: '', videoUrl: '', thumbnailUrl: '', duration: '24m' }]
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
                        <div className="flex flex-col gap-4 w-full">
                          {/* Video Upload */}
                          <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-bold">Video File (Gofile.io)</label>
                            <div className="relative">
                              <input 
                                type="file" 
                                id={`file-${sIdx}-${eIdx}`}
                                className="hidden"
                                onChange={(e) => handleFileChange(e, sIdx, eIdx)}
                                accept="video/*"
                              />
                              <label 
                                htmlFor={`file-${sIdx}-${eIdx}`}
                                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg h-8 px-3 text-[10px] font-bold cursor-pointer transition-all w-full"
                              >
                                {uploadProgress.episodes[`v-${sIdx}-${eIdx}`] > 0 ? 'UPLOADING...' : 'SELECT VIDEO'}
                              </label>
                            </div>
                            {uploadProgress.episodes[`v-${sIdx}-${eIdx}`] > 0 && (
                              <div className="w-full space-y-1">
                                <div className="flex justify-between text-[8px] font-black text-primary uppercase tracking-tighter">
                                  <span>GOFILE</span>
                                  <span>{uploadProgress.episodes[`v-${sIdx}-${eIdx}`]}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden shadow-inner">
                                  <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress.episodes[`v-${sIdx}-${eIdx}`]}%` }} />
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
                                  thumbnails: { ...prev.thumbnails, [`t-${sIdx}-${eIdx}`]: progress }
                                }));
                              }}
                              onClientUploadComplete={(res) => {
                                const newSeasons = [...animeData.seasons];
                                newSeasons[sIdx].episodes[eIdx].thumbnailUrl = res[0].url;
                                setAnimeData({...animeData, seasons: newSeasons});
                                setUploadProgress(prev => {
                                  const newThumbs = { ...prev.thumbnails };
                                  delete newThumbs[`t-${sIdx}-${eIdx}`];
                                  return { ...prev, thumbnails: newThumbs };
                                });
                              }}
                              appearance={{
                                button: "ut-ready:bg-secondary/50 ut-uploading:cursor-not-allowed bg-white/5 text-[10px] h-8 px-3 rounded-lg border border-white/10 w-full",
                              }}
                              content={{
                                button({ isUploading }) {
                                  if (isUploading) return "UPDATING...";
                                  return "UPLOAD THUMB";
                                },
                              }}
                            />
                            {uploadProgress.thumbnails[`t-${sIdx}-${eIdx}`] > 0 && (
                              <div className="w-full space-y-1">
                                <div className="flex justify-between text-[8px] font-black text-secondary uppercase tracking-tighter">
                                  <span>THUMB</span>
                                  <span>{uploadProgress.thumbnails[`t-${sIdx}-${eIdx}`]}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden shadow-inner">
                                  <div className="bg-secondary h-full transition-all" style={{ width: `${uploadProgress.thumbnails[`t-${sIdx}-${eIdx}`]}%` }} />
                                </div>
                              </div>
                            )}
                          </div>

                          <input 
                            type="text"
                            placeholder="Video URL"
                            className="bg-transparent text-xs focus:outline-none w-full border-b border-white/5 pb-1"
                            value={ep.videoUrl}
                            onChange={(e) => {
                              const newSeasons = [...animeData.seasons];
                              newSeasons[sIdx].episodes[eIdx].videoUrl = e.target.value;
                              setAnimeData({...animeData, seasons: newSeasons});
                            }}
                          />
                        </div>
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
