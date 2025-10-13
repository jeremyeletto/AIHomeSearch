// Main application initialization and global functions
class MainApp {
    constructor() {
        this.init();
    }

    init() {
        // Check authentication first
        this.checkAuthentication();
        this.setupEventListeners();
        this.initializeApp();
    }

    checkAuthentication() {
        // Wait for Supabase auth to initialize
        const checkAuth = () => {
            if (window.supabaseAuth && window.supabaseAuth.isInitialized) {
                if (!window.supabaseAuth.requireAuth()) {
                    // Header component handles authentication UI
                    return;
                }
                this.setupAuthEventListeners();
            } else {
                // Wait a bit and try again
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }

    setupAuthEventListeners() {
        // Listen for authentication state changes
        document.addEventListener('authStateChanged', (event) => {
            if (!event.detail.isAuthenticated) {
                window.location.href = 'index.html';
            }
        });
    }

    setupEventListeners() {
        // Page navigation functions
        window.showHomesPage = () => {
            // Stay on current page
            return;
        };

        window.showAboutPage = () => {
            window.location.href = 'about.html';
        };

        // Search function from home page
        window.searchHomesFromHome = () => {
            const locationInput = document.getElementById('locationSearchHome');
            const location = locationInput.value.trim();
            
            if (location) {
                logger.log('Searching for homes in:', location);
                // Load homes directly without redirect
                window.apiHandler.loadHomes(location, 1, 'relevant');
            } else {
                alert('Please enter a location to search for homes.');
            }
        };

        // Global functions for HTML onclick handlers
        window.changePage = (direction) => window.pagination.changePage(direction);
        window.changeSort = () => window.pagination.changeSort();
        window.navigateImage = (homeId, direction) => window.imageHandler.navigateImage(homeId, direction);
        window.navigateModalImage = (direction) => window.imageHandler.navigateModalImage(direction);
        window.handleCustomUpgrade = () => window.upgradeUI.handleCustomUpgrade();
        window.resetModalForNewGeneration = () => window.upgradeUI.resetModalForNewGeneration();
        window.saveBeforeAfterImage = () => window.mobileView.saveBeforeAfterImage();
        window.showMobileView = (view) => window.mobileView.showMobileView(view);
        window.switchModel = (provider) => window.apiHandler.switchModel(provider);
        window.switchModalImage = (imageIndex) => window.mobileView.switchModalImage(imageIndex);
        window.switchMobileImage = (imageIndex) => window.mobileView.switchMobileImage(imageIndex);
    }

    async initializeApp() {
        logger.log('Page loaded, testing APIs...');
        
        // Load prompts configuration
        await window.apiHandler.loadPrompts();
        
        // Add Enter key event listener for search input
        const locationInput = document.getElementById('locationSearchHome');
        if (locationInput) {
            locationInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    window.searchHomesFromHome();
                }
            });
        }
        
        // Test APIs first
        const apiSuccess = await window.apiHandler.testAPIs();
        if (apiSuccess) {
            logger.log('✅ AWS Bedrock is working correctly');
        } else {
            logger.log('❌ API tests failed - check console for details');
            logger.log('💡 Setup Instructions:');
            logger.log('1. Sign up for AWS Bedrock');
            logger.log('2. Configure AWS credentials');
            logger.log('3. Enable Titan Image Generator model access');
            logger.log('4. Start server: npm start');
        }
        
        // Check if we have a location parameter in URL (highest priority)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLocation = urlParams.get('location');
        
        if (urlLocation) {
            // URL parameter takes priority
            const location = decodeURIComponent(urlLocation);
            document.getElementById('locationSearchHome').value = location;
            await window.apiHandler.loadHomes(location, 1, 'relevant');
        } else {
            // Check for last search state (second priority)
            const lastSearch = CONFIG.getLastSearchState();
            
            logger.log('🔍 Checking for last search state...', lastSearch);
            
            if (lastSearch) {
                // Restore last search
                logger.log(`🔄 Restoring last search: ${lastSearch.location} (page ${lastSearch.page}, sort: ${lastSearch.sort})`);
                document.getElementById('locationSearchHome').value = lastSearch.location;
                await window.apiHandler.loadHomes(lastSearch.location, lastSearch.page, lastSearch.sort);
            } else {
                // Default to New York, NY (last resort)
                logger.log('📍 No last search found, defaulting to New York, NY');
                document.getElementById('locationSearchHome').value = 'New York, NY';
                await window.apiHandler.loadHomes('New York, NY', 1, 'relevant');
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize debug mode and model info
    window.modelSwitcher.checkDebugMode();
    window.apiHandler.loadModelInfo();
    
    // Add debug console commands
    window.debugSwitchModel = (provider) => window.apiHandler.switchModel(provider);
    window.debugShowModelInfo = () => window.apiHandler.loadModelInfo();
    logger.log('Debug commands available:');
    logger.log('- debugSwitchModel("gemini") or debugSwitchModel("aws")');
    logger.log('- debugShowModelInfo()');
    logger.log('- Add ?debug=1 to URL to show debug UI');
    
    // Initialize main application
    window.mainApp = new MainApp();
});
