// API Configuration
export const API_CONFIG = {
  // Development (backend API)
  development: {
    baseURL: 'http://localhost:5000/api',
    imageBaseURL: 'http://localhost:5000',
    uploadBaseURL: 'http://localhost:5000',
    useLocalImages: true
  },
  
  // Production (real API)
  production: {
    baseURL: 'https://your-api-domain.com/api',
    imageBaseURL: 'https://your-cdn-domain.com/images',
    uploadBaseURL: 'https://your-api-domain.com',
    useLocalImages: false
  },
  
  // Staging
  staging: {
    baseURL: 'https://staging-api-domain.com/api',
    imageBaseURL: 'https://staging-cdn-domain.com/images',
    uploadBaseURL: 'https://staging-api-domain.com',
    useLocalImages: false
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  if (import.meta.env.PROD) {
    return 'production';
  } else if (import.meta.env.VITE_ENV === 'staging') {
    return 'staging';
  }
  return 'development';
};

// Get current config
export const getCurrentConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env];
};

// Helper function to build image URL
export const buildImageURL = (imagePath, config = null) => {
  const currentConfig = config || getCurrentConfig();
  
  // If it's already a full URL, return as is
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  
  // If it's a local path starting with /, return as is
  if (imagePath && imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Build full URL
  if (imagePath) {
    return `${currentConfig.imageBaseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
  
  return null;
};
