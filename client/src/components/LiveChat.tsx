import React, { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const LiveChat: React.FC = () => {
  useEffect(() => {
    const propertyId = import.meta.env.VITE_TAWKTO_PROPERTY_ID;
    const widgetName = import.meta.env.VITE_TAWKTO_WIDGET_NAME;

    if (!propertyId || !widgetName) {
      console.error('Tawk.to credentials not found in environment variables');
      return;
    }

    // Check if script is already loaded
    if (window.Tawk_API && window.Tawk_API.showWidget) {
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

    // Customize appearance to match theme
    window.Tawk_API.customize = {
      theme: {
        primaryColor: '#39ff14', // Neon green
        secondaryColor: '#121212', // Dark background
        backgroundColor: '#1a1a1a',
        textColor: '#e0e0e0'
      },
      chatStyle: {
        color: '#ffffff',
        backgroundColor: '#39ff14'
      }
    };

    // Optional: Auto-start chat after delay
    const startChatAfterDelay = () => {
      setTimeout(() => {
        if (window.Tawk_API && window.Tawk_API.maximize) {
          // Only auto-start on mobile or based on certain conditions
          if (window.innerWidth < 768) {
            // window.Tawk_API.maximize();
          }
        }
      }, 30000); // 30 seconds delay
    };

    startChatAfterDelay();

    return () => {
      // Cleanup function
      // Note: Tawk.to doesn't provide a proper cleanup API
      // The script will remain loaded but hidden
    };
  }, []);

  // Manual chat controls
  const chatControls = {
    open: () => {
      if (window.Tawk_API && window.Tawk_API.maximize) {
        window.Tawk_API.maximize();
      }
    },
    close: () => {
      if (window.Tawk_API && window.Tawk_API.minimize) {
        window.Tawk_API.minimize();
      }
    },
    toggle: () => {
      if (window.Tawk_API && window.Tawk_API.toggle) {
        window.Tawk_API.toggle();
      }
    }
  };

  // Expose controls globally if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).chatControls = chatControls;
    }
  }, []);

  return null; // Tawk.to injects its own UI
};

export default LiveChat;