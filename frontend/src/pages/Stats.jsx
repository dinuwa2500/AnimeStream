import React, { useState, useEffect } from 'react';
import { Users, Lock, Globe, MapPin, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import API_BASE_URL from '../api/config';

const Stats = () => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/stats`, {
        headers: {
          'x-stats-password': password
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
        setIsAuthorized(true);
        localStorage.setItem('stats_password', password);
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = localStorage.getItem('stats_password');
    if (savedPassword) {
      setPassword(savedPassword);
      // Auto-login attempt could be added here
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl w-full max-w-md space-y-6 text-center">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">STATISTICS ACCESS</h1>
          <p className="text-gray-400 text-sm">Please enter the administrator password to view unique visitor data.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'AUTHORIZING...' : 'VIEW STATISTICS'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-6 md:px-16 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary flex items-center gap-3">
              <Users className="text-primary" /> VISITOR ANALYTICS
            </h1>
            <div className="glass px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {visitors.length} UNIQUE VISITORS
            </div>
          </div>

          <div className="glass rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4 font-black">Country</th>
                  <th className="px-6 py-4 font-black">Location</th>
                  <th className="px-6 py-4 font-black">IP Address</th>
                  <th className="px-6 py-4 font-black text-center">Visits</th>
                  <th className="px-6 py-4 font-black text-right">Last Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visitors.map((v, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://flagcdn.com/w40/${v.countryCode.toLowerCase()}.png`} 
                          alt={v.country}
                          className="w-6 h-4 object-cover rounded-sm shadow-lg shadow-black/40"
                          onError={(e) => e.target.src = 'https://flagcdn.com/w40/un.png'}
                        />
                        <span className="font-bold">{v.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-3 h-3 text-secondary" />
                        {v.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 group-hover:text-white transition-colors">
                      {v.ip.replace(/\d+\.\d+$/, 'x.x')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                        {v.visitCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-medium">
                          {new Date(v.lastVisit).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(v.lastVisit).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
