# RetrEnd

This is the RetrEnd marketplace application.

## Deployment Notes

### Firebase Authentication Setup

After deploying to Vercel, you need to add your Vercel domain to Firebase:

1. Go to the Firebase console: https://console.firebase.google.com/
2. Select your project
3. Go to Authentication → Settings → Authorized domains
4. Add your Vercel domain (e.g., `retrend-final.vercel.app`) to the list

This will fix the "The current domain is not authorized for OAuth operations" error.

### Backend Configuration

Make sure your backend URL is properly configured in `src/utils/config.js`. For production, use your actual deployed backend URL.
# vinland
