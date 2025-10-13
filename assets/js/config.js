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
    
    // Search results cache
    searchResultsCache: new Map(),
    cacheExpirationTime: 30 * 60 * 1000, // 30 minutes in milliseconds
    
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
    
    // Cache management functions
    generateCacheKey: function(location, page, sort) {
        return `${location.toLowerCase().trim()}|${page}|${sort}`;
    },
    
    getCachedResults: function(location, page, sort) {
        const cacheKey = this.generateCacheKey(location, page, sort);
        const cached = this.searchResultsCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpirationTime) {
            console.log(`📦 Using cached results for: ${location} (page ${page}, sort: ${sort})`);
            return cached.data;
        } else if (cached) {
            console.log(`⏰ Cache expired for: ${location} (page ${page}, sort: ${sort})`);
            this.searchResultsCache.delete(cacheKey);
        }
        
        return null;
    },
    
    setCachedResults: function(location, page, sort, data) {
        const cacheKey = this.generateCacheKey(location, page, sort);
        this.searchResultsCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        console.log(`💾 Cached results for: ${location} (page ${page}, sort: ${sort})`);
        
        // Store last search state in localStorage for persistence across page loads
        try {
            localStorage.setItem('lastSearchState', JSON.stringify({
                location: location,
                page: page,
                sort: sort,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Could not save search state to localStorage:', e);
        }
        
        // Limit cache size to prevent memory issues
        this.cleanupCache();
    },
    
    getLastSearchState: function() {
        try {
            const stored = localStorage.getItem('lastSearchState');
            console.log('🔍 Raw localStorage data:', stored);
            
            if (stored) {
                const state = JSON.parse(stored);
                console.log('🔍 Parsed search state:', state);
                
                // Check if state is recent (within last 24 hours)
                if (state.timestamp && (Date.now() - state.timestamp) < 24 * 60 * 60 * 1000) {
                    console.log('✅ Valid recent search state found:', state);
                    return state;
                } else {
                    console.log('⏰ Search state too old or missing timestamp:', state);
                }
            } else {
                console.log('❌ No search state found in localStorage');
            }
        } catch (e) {
            console.warn('Could not load search state from localStorage:', e);
        }
        return null;
    },
    
    cleanupCache: function() {
        const maxCacheSize = 50; // Maximum number of cached searches
        
        if (this.searchResultsCache.size > maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(this.searchResultsCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const toRemove = entries.slice(0, this.searchResultsCache.size - maxCacheSize);
            toRemove.forEach(([key]) => {
                this.searchResultsCache.delete(key);
            });
            
            console.log(`🧹 Cleaned up ${toRemove.length} expired cache entries`);
        }
    }
};

// Export for use in other modules
window.CONFIG = CONFIG;
