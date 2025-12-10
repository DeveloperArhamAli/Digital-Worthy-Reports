import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Tawk_API?: {
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
    };
  }
}

export const useChat = () => {
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Initialize chat
  useEffect(() => {
    const initChat = () => {
      if (!window.Tawk_API) {
        window.Tawk_API = {};
      }

      // Set up event handlers
      window.Tawk_API.onLoad = () => {
        setIsChatLoaded(true);
        console.log('Tawk.to chat loaded');
      };

      window.Tawk_API.onChatMaximized = () => {
        setIsChatOpen(true);
        setUnreadMessages(0);
      };

      window.Tawk_API.onChatMinimized = () => {
        setIsChatOpen(false);
      };

      window.Tawk_API.onChatHidden = () => {
        setIsChatOpen(false);
      };

      window.Tawk_API.onChatStarted = () => {
        // Track chat started
      };

      window.Tawk_API.onChatEnded = () => {
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
    if (window.Tawk_API && window.Tawk_API.maximize) {
      window.Tawk_API.maximize();
    }
  }, []);

  const closeChat = useCallback(() => {
    if (window.Tawk_API && window.Tawk_API.minimize) {
      window.Tawk_API.minimize();
    }
  }, []);

  const toggleChat = useCallback(() => {
    if (window.Tawk_API && window.Tawk_API.toggle) {
      window.Tawk_API.toggle();
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