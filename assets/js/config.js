// Configuration and constants
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://ai-home-upgrades-backend.onrender.com',
    CORS_PROXY: 'https://corsproxy.io/?',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    
    // Model switching
    currentModel: 'gemini', // Default to Gemini Nano Banana
    
    // Pagination and sorting state
    currentPage: 1,
    currentSort: 'relevant',
    currentLocation: 'New York, NY',
    totalPages: 1,
    
    // Global homes list for lazy loading access
    homesList: [],
    
    // Image cache to prevent repeated requests
    imageCache: new Map(),
    
    // Generated image cache for AI upgrades
    generatedImageCache: new Map(),
    
    // Prompts configuration cache
    promptsConfig: null,
    
    // Mobile view state
    currentMobileView: 'before',
    originalImageSrc: '',
    upgradedImageSrc: '',
    
    // Swipe tracking
    isDrag: false,
    startX: 0,
    currentX: 0,
    dragThreshold: 50, // Minimum distance for swipe
    swipeSensitivity: 100, // Maximum distance for single swipe
};

// Export for use in other modules
window.CONFIG = CONFIG;
