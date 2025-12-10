import { useState, useEffect, useCallback } from 'react';

interface TawkAPI {
  onLoad?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onChatHidden?: () => void;
  onChatStarted?: () => void;
  onChatEnded?: () => void;
  maximize?: () => void;
  minimize?: () => void;
  toggle?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  [key: string]: any;
}

interface WindowWithTawk extends Window {
  Tawk_API?: TawkAPI;
}

export const useChat = () => {
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Initialize chat
  useEffect(() => {
    const win = window as WindowWithTawk;
    
    const initChat = () => {
      if (!win.Tawk_API) {
        win.Tawk_API = {};
      }

      // Set up event handlers
      win.Tawk_API.onLoad = () => {
        setIsChatLoaded(true);
        console.log('Tawk.to chat loaded');
      };

      win.Tawk_API.onChatMaximized = () => {
        setIsChatOpen(true);
        setUnreadMessages(0);
      };

      win.Tawk_API.onChatMinimized = () => {
        setIsChatOpen(false);
      };

      win.Tawk_API.onChatHidden = () => {
        setIsChatOpen(false);
      };

      win.Tawk_API.onChatStarted = () => {
        // Track chat started
      };

      win.Tawk_API.onChatEnded = () => {
        // Track chat ended
      };

      // Simulate unread messages (you'd typically get this from Tawk.to API)
      const interval = setInterval(() => {
        if (!isChatOpen && Math.random() > 0.7) {
          setUnreadMessages(prev => prev + 1);
        }
      }, 30000);

      return () => clearInterval(interval);
    };

    initChat();
  }, [isChatOpen]);

  const openChat = useCallback(() => {
    const win = window as WindowWithTawk;
    if (win.Tawk_API && win.Tawk_API.maximize) {
      win.Tawk_API.maximize();
    }
  }, []);

  const closeChat = useCallback(() => {
    const win = window as WindowWithTawk;
    if (win.Tawk_API && win.Tawk_API.minimize) {
      win.Tawk_API.minimize();
    }
  }, []);

  const toggleChat = useCallback(() => {
    const win = window as WindowWithTawk;
    if (win.Tawk_API && win.Tawk_API.toggle) {
      win.Tawk_API.toggle();
    }
  }, []);

  return {
    isChatLoaded,
    isChatOpen,
    unreadMessages,
    openChat,
    closeChat,
    toggleChat,
  };
};