import { useEffect } from 'react';

const LiveChat = () => {
  useEffect(() => {
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID;
    const widgetName = import.meta.env.VITE_TAWKTO_WIDGET_NAME;

    if (!propertyId || !widgetName) {
      console.error('Tawk.to credentials not found in environment variables');
      return;
    }

    // Check if script is already loaded
    if (window.Tawk_API?.showWidget) {
      return;
    }

    // Load Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetName}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Tawk.to chat widget');
    };

    // Insert script
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    // Initialize
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    return () => {
      // Cleanup function
      const scripts = document.head.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('tawk.to')) {
          document.head.removeChild(scripts[i]);
          break;
        }
      }
    };
  }, []);

  const toggleChat = () => {
    if (window.Tawk_API?.toggle) {
      window.Tawk_API.toggle();
    }
  };

  return (
    <>
      {/* Optional Floating Action Button for mobile */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 md:hidden z-50 p-3 bg-neon-green text-black rounded-full shadow-lg hover:bg-neon-green-dark transition-all duration-300"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </>
  );
};

export default LiveChat;