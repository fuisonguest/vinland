/**
 * Configuration settings for the application
 */

// Determine the current environment
const isProduction = window.location.hostname !== 'localhost';

// API base URL - automatically switches between local and production
export const API_BASE_URL = isProduction 
  ? 'https://retrend-final.onrender.com' // Updated production URL
  : 'https://retrend-final.onrender.com';

// Razorpay configuration
export const RAZORPAY_KEY_ID = 'rzp_live_FcuvdvTYCmLf7m'; // Should be the same in production and development

// URLs
export const getApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

// Helper for debug logging in development only
export const devLog = (...args) => {
  if (!isProduction) {
    console.log(...args);
  }
};
