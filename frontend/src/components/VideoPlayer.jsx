import React from 'react';
import ReactPlayer from 'react-player';
import { Maximize, Volume2, Settings } from 'lucide-react';

// Handle ReactPlayer default export issue in some environments
let Player = ReactPlayer;
if (Player && Player.default) {
  Player = Player.default;
}

// Fallback for some bundling scenarios
if (typeof Player !== 'function' && Player && typeof Player.default === 'function') {
  Player = Player.default;
}

import API_BASE_URL from '../api/config';

/**
 * VideoPlayer Component
 * A wrapper around ReactPlayer to allow easy migration between streaming services.
 * Currently supports direct file URLs (UploadThing, Telegram Proxy), YouTube, etc.
 */
const VideoPlayer = ({ url, onEnded }) => {
  // Fix for environment-specific URLs (e.g., /api/stream -> http://localhost:5000/api/stream)
  let resolvedUrl = url && url.startsWith('/api') 
    ? `${API_BASE_URL}${url.replace('/api', '')}` 
    : url;

  // Convert Google Drive share/view link to embed preview link if needed
  if (resolvedUrl && resolvedUrl.includes('drive.google.com')) {
    const driveMatch = resolvedUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      resolvedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
  }

  // Convert Streamtape view link (/v/ID) to embed link (/e/ID)
  if (resolvedUrl && (resolvedUrl.includes('streamtape') || resolvedUrl.includes('streamta.pe') || resolvedUrl.includes('adblockstreamtape'))) {
    resolvedUrl = resolvedUrl.replace('/v/', '/e/');
  }

  // Detect if the URL is an embed link (like DoodStream, Gofile, Google Drive, Streamtape)
  const isEmbed = resolvedUrl && (
    resolvedUrl.includes('doodstream.com/e/') || 
    resolvedUrl.includes('doodapi.co/e/') ||
    resolvedUrl.includes('dsvplay.com/e/') ||
    resolvedUrl.includes('gofile.io/d/') ||
    resolvedUrl.includes('drive.google.com') ||
    resolvedUrl.includes('streamtape') ||
    resolvedUrl.includes('streamta.pe') ||
    resolvedUrl.includes('adblockstreamtape')
  );

  if (!resolvedUrl) return (
    <div className="aspect-video bg-black flex items-center justify-center rounded-2xl border border-white/5">
      <p className="text-gray-500 font-medium">Select an episode to start watching</p>
    </div>
  );

  return (
    <div className="relative group aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-white/5">
      {isEmbed ? (
        <iframe
          src={resolvedUrl}
          className="w-full h-full border-none"
          allowFullScreen
          scrolling="no"
          allow="autoplay; encrypted-media"
        />
      ) : (
        <Player
          url={resolvedUrl}
          width="100%"
          height="100%"
          controls={true}
          playing={true}
          onEnded={onEnded}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              }
            }
          }}
        />
      )}
      
      {/* Optional: Add custom overlays or branding here */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            {isEmbed ? 'EXTERNAL PLAYER' : 'HD 1080P'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
