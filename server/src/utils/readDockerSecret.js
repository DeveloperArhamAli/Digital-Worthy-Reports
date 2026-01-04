import fs from 'fs';
import path from 'path';

const secretsDir = '/run/secrets';

function readDockerSecret(secretName) {
  try {
    const secretPath = path.join(secretsDir, secretName);
    console.log(fs.readFileSync(secretPath, 'utf8').trim())
    return fs.readFileSync(secretPath, 'utf8').trim();
  } catch (err) {
    console.error(`Could not read secret: ${secretName}`, err.message);
    return null;
  }
}

const API_URL = readDockerSecret("api_url")
const BACKEND_URL = readDockerSecret("backend_url")
const COMPANY_NAME = readDockerSecret("company_name")
const FRONTEND_URL = readDockerSecret("frontend_url")
const JWT_SECRET = readDockerSecret("jwt_secret")
const JWT_EXPIRES_IN = readDockerSecret("jwt_expires_in")
const REFRESH_TOKEN_SECRET = readDockerSecret("refresh_token_secret")
const REFRESH_TOKEN_EXPIRES_IN = readDockerSecret("refresh_token_expires_in")
const MONGODB_URI = readDockerSecret("mongodb_uri")
const NODE_ENV = readDockerSecret("node_env")
const PORT = readDockerSecret("port")
const RATE_LIMIT_MAX_REQUESTS = readDockerSecret("rate_limit_max_requests")
const RATE_LIMIT_WINDOW_MS = readDockerSecret("rate_limit_window_ms")
const REPORT_EXPIRY_DAYS = readDockerSecret("report_expiry_days")
const REPORT_STORAGE_PATH = readDockerSecret("report_storage_path")
const SMTP_FROM_NAME = readDockerSecret("smtp_from_name")
const SMTP_FROM = readDockerSecret("smtp_from")
const SMTP_HOST = readDockerSecret("smtp_host")
const SMTP_PASS = readDockerSecret("smtp_pass")
const SMTP_PORT = readDockerSecret("smtp_port")
const SMTP_SECURE = readDockerSecret("smtp_secure")
const SMTP_USER = readDockerSecret("smtp_user")
const STRIPE_SECRET_KEY = readDockerSecret("stripe_secret_key")
const STRIPE_WEBHOOK_SECRET = readDockerSecret("stripe_webhook_secret")
const VIN_API_KEY = readDockerSecret("vin_api_key")
const VIN_API_URL = readDockerSecret("vin_api_url")

const VITE_API_URL = readDockerSecret("vite_api_url")
const VITE_BACKEND_URL = readDockerSecret("vite_backend_url")
const VITE_TAWKTO_PROPERTY_ID = readDockerSecret("vite_tawkto_property_id")
const VITE_TAWKTO_WIDGET_NAME = readDockerSecret("vite_tawkto_widget_name")

const CLOUDINARY_CLOUD_NAME = readDockerSecret("cloudinary_cloud_name")
const CLOUDINARY_API_KEY = readDockerSecret("cloudinary_api_key")
const CLOUDINARY_API_SECRET = readDockerSecret("cloudinary_api_secret")

export { API_URL, BACKEND_URL, COMPANY_NAME, FRONTEND_URL, JWT_SECRET, MONGODB_URI, NODE_ENV, PORT, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS, REPORT_EXPIRY_DAYS, REPORT_STORAGE_PATH, SMTP_FROM_NAME, SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_USER, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VIN_API_KEY, VIN_API_URL, VITE_API_URL, VITE_BACKEND_URL, VITE_TAWKTO_PROPERTY_ID, VITE_TAWKTO_WIDGET_NAME, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET };