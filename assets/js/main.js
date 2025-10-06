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
                console.log('Searching for homes in:', location);
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

        // Test loading states function (for debugging)
        window.testLoadingStates = this.testLoadingStates.bind(this);
    }

    async initializeApp() {
        console.log('Page loaded, testing APIs...');
        
        // Load prompts configuration
        await window.apiHandler.loadPrompts();
        
        // Add test loading states button (for debugging)
        this.addDebugButton();
        
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
            console.log('✅ AWS Bedrock is working correctly');
        } else {
            console.log('❌ API tests failed - check console for details');
            console.log('💡 Setup Instructions:');
            console.log('1. Sign up for AWS Bedrock');
            console.log('2. Configure AWS credentials');
            console.log('3. Enable Titan Image Generator model access');
            console.log('4. Start server: npm start');
        }
        
        // Check if we have a location parameter
        const urlParams = new URLSearchParams(window.location.search);
        const location = urlParams.get('location');
        
        if (location) {
            // Load homes for the specified location
            document.getElementById('locationSearchHome').value = decodeURIComponent(location);
            await window.apiHandler.loadHomes(decodeURIComponent(location), 1, 'relevant');
        } else {
            // Default to New York, NY
            await window.apiHandler.loadHomes('New York, NY', 1, 'relevant');
        }
    }

    addDebugButton() {
        const testButton = document.createElement('button');
        testButton.textContent = 'Test Loading States';
        testButton.className = 'btn btn-warning btn-sm';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '1000';
        testButton.onclick = this.testLoadingStates;
        document.body.appendChild(testButton);
    }

    // Test loading states function (for debugging)
    testLoadingStates() {
        console.log('🧪 Testing loading states...');
        const cards = document.querySelectorAll('[data-home-id]');
        cards.forEach((card, index) => {
            setTimeout(() => {
                window.imageHandler.showCardLoadingState(card);
            }, index * 500);
            
            setTimeout(() => {
                window.imageHandler.hideCardLoadingState(card);
            }, index * 500 + 3000);
        });
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
    console.log('Debug commands available:');
    console.log('- debugSwitchModel("gemini") or debugSwitchModel("aws")');
    console.log('- debugShowModelInfo()');
    console.log('- Add ?debug=1 to URL to show debug UI');
    
    // Initialize main application
    window.mainApp = new MainApp();
});
