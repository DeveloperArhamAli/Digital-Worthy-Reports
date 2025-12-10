/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TAWKTO_PROPERTY_ID: string;
  readonly VITE_TAWKTO_WIDGET_NAME: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_PAYPAL_CLIENT_ID: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}