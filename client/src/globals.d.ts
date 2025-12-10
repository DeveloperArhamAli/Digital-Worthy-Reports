// Global type declarations for Tawk.to
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

interface Window {
  Tawk_API?: TawkAPI;
  Tawk_LoadStart?: Date;
}