import React, { useEffect, useRef } from 'react';
import AD_CONFIG from '../api/ads';

const AdBanner = ({ 
  type = 'horizontal', 
  className = '', 
  adsterraKey,
  bannerId,
  zoneId
}) => {
  const containerRef = useRef(null);

  // Define dimensions and default keys based on type
  const config = {
    horizontal: {
      width: '728px',
      height: '90px',
      size: '728x90',
      label: '728 x 90 Advertisement',
      defaultKey: AD_CONFIG.ADSTERRA_HORIZONTAL
    },
    square: {
      width: '300px',
      height: '250px',
      size: '300x250',
      label: '300 x 250 Advertisement',
      defaultKey: AD_CONFIG.ADSTERRA_SQUARE
    }
  };

  const selected = config[type] || config.horizontal;

  const keyToUse = adsterraKey || (typeof zoneId === 'string' && zoneId.length > 20 ? zoneId : selected.defaultKey);

  useEffect(() => {
    if (!keyToUse || !containerRef.current) return;

    // Clear previous ad content if re-rendering
    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    const numericWidth = parseInt(selected.width, 10);
    const numericHeight = parseInt(selected.height, 10);

    iframe.width = String(numericWidth);
    iframe.height = String(numericHeight);
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.backgroundColor = 'transparent';
    iframe.scrolling = 'no';
    iframe.title = 'Advertisement';

    containerRef.current.appendChild(iframe);

    try {
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              html, body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; height: 100%; width: 100%; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '${keyToUse}',
                'format' : 'iframe',
                'height' : ${numericHeight},
                'width' : ${numericWidth},
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highperformanceformat.com/${keyToUse}/invoke.js"></script>
          </body>
        </html>
      `);
      iframeDoc.close();
    } catch (e) {
      console.error('Adsterra write error:', e);
    }
  }, [keyToUse, selected.width, selected.height]);

  return (
    <div className={`flex flex-col items-center justify-center mx-auto my-8 overflow-hidden ${className}`}>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Advertisement</span>
      <div 
        className="bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative group overflow-hidden transition-all hover:border-primary/30 min-h-[90px]"
        style={{ 
          width: '100%', 
          maxWidth: selected.width, 
          minHeight: selected.height,
        }}
      >
        {keyToUse ? (
          /* Adsterra Iframe Container */
          <div ref={containerRef} className="w-full flex items-center justify-center overflow-hidden" />
        ) : bannerId ? (
          /* mbidadm / HTML Banner Ad DIV */
          <div 
            data-banner-id={bannerId} 
            className="w-full flex items-center justify-center overflow-hidden" 
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
              <p className="text-gray-600 text-[10px] mt-1 italic font-mono">Adsterra Key Missing</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
