import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

interface TawkToCredentials {
  propertyId: string;
  widgetName: string;
}

const fetchTawkToCredentials = async (): Promise<TawkToCredentials | null> => {
  
  try {
    const response = await axios.post<TawkToCredentials>("/api/config/get-tawkto-credentials");
    return {
      propertyId: response.data.propertyId,
      widgetName: response.data.widgetName
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Failed to fetch Tawk.to credentials:', axiosError);
    return null;
  }
};

const LiveChat = () => {
  const [credentials, setCredentials] = useState<TawkToCredentials | null>(null);
  
  useEffect(() => {
    const loadCredentials = async () => {
      const creds = await fetchTawkToCredentials();
      if (creds) {
        setCredentials(creds);
      }
    };
    
    loadCredentials();
  }, []);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    // Check if script is already loaded
    if (window.Tawk_API?.showWidget) {
      return;
    }

    // Load Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${credentials.propertyId}/${credentials.widgetName}`;
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
  }, [credentials]);

};

export default LiveChat;