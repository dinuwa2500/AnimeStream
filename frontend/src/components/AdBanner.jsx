import React from 'react';

const AdBanner = ({ type = 'horizontal', className = '', zoneId }) => {
  // Define dimensions based on type
  const config = {
    horizontal: {
      width: '728px',
      height: '90px',
      size: '728x90',
      label: '728 x 90 Advertisement',
    },
    square: {
      width: '350px',
      height: '250px',
      size: '350x250',
      label: '350 x 250 Advertisement',
    }
  };

  const selected = config[type] || config.horizontal;

  return (
    <div className={`flex flex-col items-center justify-center mx-auto my-8 overflow-hidden ${className}`}>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Advertisement</span>
      <div 
        className="bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative group overflow-hidden transition-all hover:border-primary/30"
        style={{ 
          width: '100%', 
          maxWidth: selected.width, 
          height: selected.height,
          aspectRatio: type === 'horizontal' ? '728/90' : '350/250'
        }}
      >
        {zoneId ? (
          /* Actual A-Ads Iframe */
          <iframe 
            data-aa={zoneId} 
            src={`//ad.a-ads.com/${zoneId}/?size=${selected.size}`} 
            style={{
              width: selected.width,
              height: selected.height,
              border: '0px',
              padding: 0,
              overflow: 'hidden',
              backgroundColor: 'transparent',
              display: 'block',
              margin: 'auto'
            }}
            title={`A-Ads ${selected.size}`}
          />
        ) : (
          /* Ad Placeholder Content */
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 mb-2 rounded-full bg-white/5 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-gray-400 text-sm font-medium">{selected.label}</p>
              <p className="text-gray-600 text-[10px] mt-1 italic font-mono">zoneId: {zoneId || 'MISSING'}</p>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/10 blur-3xl rounded-full" />
          </>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
