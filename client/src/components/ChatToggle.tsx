import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatToggleProps {
  className?: string;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ className }) => {
  const toggleChat = () => {
    if (window.Tawk_API) {
      window.Tawk_API.toggle();
    } else {
      // If chat isn't loaded, scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <button
      onClick={toggleChat}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 border border-neon-green/30 rounded-full text-neon-green hover:bg-neon-green/20 transition-colors duration-200 ${className}`}
      aria-label="Chat with us"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm font-medium">Live Chat</span>
    </button>
  );
};

export default ChatToggle;