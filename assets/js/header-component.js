/**
 * Unified Header Component
 * Handles authentication state and navigation across all pages
 */
class HeaderComponent {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('homes.html')) return 'homes';
        if (path.includes('my-images.html')) return 'my-images';
        if (path.includes('about.html')) return 'about';
        if (path.includes('index.html')) return 'index';
        return 'index';
    }

    init() {
        this.createHeaderHTML();
        this.addStyles();
        this.setupEventListeners();
        
        // Wait for DOM and Supabase to be ready, then update auth state
        this.waitForAuthAndUpdate();
    }

    createHeaderHTML() {
        // First, remove any existing header components to prevent duplicates
        this.cleanupExistingHeader();
        
        const headerHTML = `
            <nav class="navbar navbar-expand-lg navbar-light">
                <div class="container">
                    <a class="navbar-brand" href="index.html">
                        homeupgrades.xyz
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                    <!-- Signed Out State: Sign In & Sign Up Buttons -->
                    <div id="signedOutNav" class="d-flex align-items-center gap-2" style="display: flex;">
                        <button class="btn btn-outline-primary auth-btn" data-bs-toggle="modal" data-bs-target="#authModal">
                            Sign In
                        </button>
                        <button class="btn btn-primary auth-btn" data-bs-toggle="modal" data-bs-target="#authModal">
                            Sign Up
                        </button>
                    </div>

                    <!-- Signed In State: Navigation Tabs + User Avatar -->
                    <div id="signedInNav" class="d-flex align-items-center gap-3" style="display: none;">
                                <li class="nav-item">
                                    <a class="nav-link ${this.currentPage === 'homes' ? 'active' : ''}" href="homes.html">Homes</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link ${this.currentPage === 'my-images' ? 'active' : ''}" href="my-images.html">My Images</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link ${this.currentPage === 'about' ? 'active' : ''}" href="about.html">About</a>
                                </li>
                                <div class="dropdown">
                                    <button class="btn btn-link dropdown-toggle user-avatar-btn d-flex align-items-center" type="button" data-bs-toggle="dropdown">
                                        <div id="userAvatarCircle" class="user-avatar-circle me-2">
                                            <span id="userInitials">U</span>
                                        </div>
                                        <span id="userName">User</span>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li><a class="dropdown-item" href="#" id="signOutBtn">
                                            <i class="fas fa-sign-out-alt me-2"></i>Sign Out
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </nav>
        `;

        // Replace existing navbar or insert at the top
        const existingNav = document.querySelector('nav.navbar');
        if (existingNav) {
            existingNav.outerHTML = headerHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerHTML);
        }
    }

    cleanupExistingHeader() {
        // Remove any existing header components to prevent duplicates
        const existingSignedOutNav = document.querySelectorAll('#signedOutNav');
        const existingSignedInNav = document.querySelectorAll('#signedInNav');
        const existingNavbar = document.querySelectorAll('nav.navbar');
        
        // Remove all existing navigation elements
        existingSignedOutNav.forEach(nav => {
            if (nav && nav.parentNode) {
                nav.parentNode.removeChild(nav);
            }
        });
        
        existingSignedInNav.forEach(nav => {
            if (nav && nav.parentNode) {
                nav.parentNode.removeChild(nav);
            }
        });
        
        // Remove any existing navbar completely
        existingNavbar.forEach(nav => {
            if (nav && nav.parentNode) {
                nav.parentNode.removeChild(nav);
            }
        });
        
        logger.log('🧹 Header: Cleaned up existing navigation elements', {
            signedOutNav: existingSignedOutNav.length,
            signedInNav: existingSignedInNav.length,
            navbar: existingNavbar.length
        });
    }

    addStyles() {
        const styles = `
            <style>
                :root {
                    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                /* Navbar */
                .navbar {
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(10px);
                    border: none;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    z-index: 1050 !important;
                    position: relative;
                }

                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.5rem;
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .navbar-nav .nav-link {
                    color: #2d3748 !important;
                    font-weight: 500;
                }

                .navbar-nav .nav-link:hover,
                .navbar-nav .nav-link.active {
                    color: #667eea !important;
                }

                /* Auth Buttons */
                .auth-btn {
                    border-radius: 25px;
                    padding: 8px 20px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .auth-btn.btn-outline-primary {
                    border: 2px solid #e2e8f0;
                    color: #2d3748;
                    background: transparent;
                }

                .auth-btn.btn-outline-primary:hover {
                    border-color: #667eea;
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                }

                .auth-btn.btn-primary {
                    background: #667eea;
                    border: 2px solid #667eea;
                    color: white;
                }

                .auth-btn.btn-primary:hover {
                    background: #5a67d8;
                    border-color: #5a67d8;
                    transform: translateY(-1px);
                }

                /* User Avatar */
                .user-avatar-btn {
                    border: none;
                    background: none;
                    padding: 8px 12px;
                    color: #2d3748;
                    text-decoration: none;
                }

                .user-avatar-btn:hover {
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.05);
                    border-radius: 8px;
                }

                .user-avatar-circle {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                }

                /* Dropdown Menu Z-Index Fix */
                .dropdown-menu {
                    z-index: 1060 !important;
                    position: absolute !important;
                }

                .dropdown {
                    position: relative;
                    z-index: 1055 !important;
                }

                /* Ensure hero section doesn't overlap header */
                .hero-section {
                    z-index: 1 !important;
                    position: relative;
                }

                .hero-content {
                    z-index: 1 !important;
                    position: relative;
                }

                /* Floating elements should not interfere with header */
                .floating-element {
                    z-index: 1 !important;
                    position: absolute;
                }

                /* Ensure all hero content stays below header */
                .search-hero-container,
                .search-card,
                .hero-title,
                .hero-subtitle {
                    z-index: 1 !important;
                    position: relative;
                }

                /* Authentication State Management */
                .auth-hidden {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                .auth-visible {
                    display: flex !important;
                    visibility: visible !important;
                }
                
                #signedOutNav[style*="display: none"],
                #signedOutNav[style*="display: none !important"] {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                #signedInNav[style*="display: none"],
                #signedInNav[style*="display: none !important"] {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                #signedOutNav[style*="display: flex"],
                #signedOutNav[style*="display: flex !important"] {
                    display: flex !important;
                    visibility: visible !important;
                }
                
                #signedInNav[style*="display: flex"],
                #signedInNav[style*="display: flex !important"] {
                    display: flex !important;
                    visibility: visible !important;
                }

                /* Mobile Responsive */
                @media (max-width: 576px) {
                    .auth-btn {
                        padding: 6px 16px;
                        font-size: 0.9rem;
                    }
                    
                    .user-avatar-circle {
                        width: 28px;
                        height: 28px;
                        font-size: 12px;
                    }
                }
            </style>
        `;

        // Remove existing header styles and add new ones
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (style.textContent.includes('navbar') || style.textContent.includes('auth-btn')) {
                style.remove();
            }
        });

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        // Listen for authentication state changes
        document.addEventListener('authStateChanged', (event) => {
            logger.log('🔄 Header: Auth state changed', event.detail);
            this.updateAuthState(event.detail.user, event.detail.isAuthenticated);
        });

        // Also listen for when supabaseAuth is ready
        document.addEventListener('supabaseAuthReady', () => {
            logger.log('🔄 Header: SupabaseAuth ready, updating state');
            this.updateAuthState();
        });

        // Add logout button event listener
        document.addEventListener('click', (event) => {
            logger.log('🖱️ Click event detected:', event.target);
            if (event.target.id === 'signOutBtn' || event.target.closest('#signOutBtn')) {
                logger.log('🚪 Sign out button clicked!');
                event.preventDefault();
                this.handleSignOut();
            }
        });
    }

    waitForAuthAndUpdate() {
        // Try to update auth state with increasing delays to ensure everything is ready
        const attempts = [100, 300, 500, 1000];
        
        attempts.forEach((delay, index) => {
            setTimeout(() => {
                logger.log(`🔄 Header: Attempt ${index + 1} to update auth state (${delay}ms delay)`);
                this.updateAuthState();
            }, delay);
        });
    }

    updateAuthState(user = null, isAuthenticated = null) {
        logger.log('🔄 Header: Updating auth state', { user, isAuthenticated });
        
        const signedOutNav = document.getElementById('signedOutNav');
        const signedInNav = document.getElementById('signedInNav');

        logger.log('🔍 Header: Found elements', { 
            signedOutNav: !!signedOutNav, 
            signedInNav: !!signedInNav,
            supabaseAuthExists: typeof supabaseAuth !== 'undefined',
            supabaseAuthUser: typeof supabaseAuth !== 'undefined' ? supabaseAuth.user : 'N/A'
        });

        // Get current auth state if not provided
        if (user === null && typeof supabaseAuth !== 'undefined') {
            user = supabaseAuth.user;
            isAuthenticated = !!user;
            logger.log('🔄 Header: Got auth state from supabaseAuth', { user: user?.email, isAuthenticated });
        }

        // If still no auth state, try to get from session storage
        if (user === null && isAuthenticated === null) {
            try {
                const sessionData = localStorage.getItem('sb-bireysdjzzildmekblfj-auth-token');
                if (sessionData) {
                    const session = JSON.parse(sessionData);
                    if (session && session.user) {
                        user = session.user;
                        isAuthenticated = true;
                        logger.log('🔄 Header: Got auth state from localStorage', { user: user?.email, isAuthenticated });
                    }
                }
            } catch (error) {
                logger.log('🔄 Header: Could not parse session from localStorage:', error);
            }
        }

        logger.log('🔄 Header: Final auth state', { user: user?.email, isAuthenticated, signedOutNav: !!signedOutNav, signedInNav: !!signedInNav });

        if (isAuthenticated && user) {
            // User is signed in - show navigation tabs and user avatar
            logger.log('✅ Header: User is signed in, showing navigation');
            if (signedOutNav) {
                signedOutNav.style.display = 'none !important';
                signedOutNav.style.visibility = 'hidden';
                signedOutNav.classList.add('auth-hidden');
                signedOutNav.classList.remove('auth-visible');
                logger.log('✅ Header: Hidden signed out nav');
            }
            if (signedInNav) {
                signedInNav.style.display = 'flex !important';
                signedInNav.style.visibility = 'visible';
                signedInNav.classList.add('auth-visible');
                signedInNav.classList.remove('auth-hidden');
                logger.log('✅ Header: Showing signed in nav');
                
                // Update user info
                const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                const initials = this.generateInitials(fullName);
                
                const userNameEl = document.getElementById('userName');
                const userInitialsEl = document.getElementById('userInitials');
                
                if (userNameEl) {
                    userNameEl.textContent = fullName;
                    logger.log('✅ Header: Updated userName element');
                }
                if (userInitialsEl) {
                    userInitialsEl.textContent = initials;
                    logger.log('✅ Header: Updated userInitials element');
                }
                
                logger.log('✅ Header: Updated user info', { fullName, initials });
            }
        } else {
            // User is signed out - show Sign In and Sign Up buttons
            logger.log('❌ Header: User is signed out, showing auth buttons');
            if (signedOutNav) {
                signedOutNav.style.display = 'flex !important';
                signedOutNav.style.visibility = 'visible';
                signedOutNav.classList.add('auth-visible');
                signedOutNav.classList.remove('auth-hidden');
                logger.log('✅ Header: Showing signed out nav');
            }
            if (signedInNav) {
                signedInNav.style.display = 'none !important';
                signedInNav.style.visibility = 'hidden';
                signedInNav.classList.add('auth-hidden');
                signedInNav.classList.remove('auth-visible');
                logger.log('✅ Header: Hidden signed in nav');
            }
        }
    }

    generateInitials(name) {
        if (!name) return 'U';
        
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return 'U';
    }

    async handleSignOut() {
        try {
            logger.log('🚪 Header: Initiating sign out...');
            logger.log('🔍 SupabaseAuth available:', typeof supabaseAuth !== 'undefined');
            logger.log('🔍 SupabaseAuth.signOut available:', typeof supabaseAuth !== 'undefined' && typeof supabaseAuth.signOut === 'function');
            
            if (typeof supabaseAuth !== 'undefined' && supabaseAuth.signOut) {
                logger.log('🔄 Calling supabaseAuth.signOut()...');
                await supabaseAuth.signOut();
                logger.log('✅ Header: Sign out successful');
                
                // Force a full page reload to clear authentication state
                logger.log('🔄 Reloading page to clear authentication state...');
                window.location.reload();
            } else {
                console.error('❌ Header: supabaseAuth not available');
                // Fallback: force page reload
                logger.log('🔄 Fallback: reloading page...');
                window.location.reload();
            }
        } catch (error) {
            console.error('❌ Header: Sign out failed:', error);
            // Still reload page even if sign out fails
            logger.log('🔄 Error fallback: reloading page...');
            window.location.reload();
        }
    }
}

// Global flag to prevent multiple initializations
window.headerComponentInitialized = false;

// Initialize header when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Prevent multiple initializations
    if (window.headerComponentInitialized || window.headerComponent) {
        logger.log('🚀 Header Component: Already initialized, skipping...');
        return;
    }
    
    logger.log('🚀 Header Component: DOM ready, initializing...');
    window.headerComponentInitialized = true;
    window.headerComponent = new HeaderComponent();
    
    // Also try to update auth state after multiple delays to ensure supabaseAuth is ready
    const delays = [100, 300, 500, 1000, 2000];
    delays.forEach((delay, index) => {
        setTimeout(() => {
            if (window.headerComponent) {
                logger.log(`🔄 Header Component: Delayed auth state update ${index + 1} (${delay}ms)`);
                window.headerComponent.updateAuthState();
            }
        }, delay);
    });
});

// Export for use in other scripts
window.HeaderComponent = HeaderComponent;

// Add manual trigger for testing
window.testHeaderState = () => {
    if (window.headerComponent) {
        logger.log('🧪 Manual header state test triggered');
        window.headerComponent.updateAuthState();
    } else {
        logger.log('❌ Header component not available');
    }
};

// Add method to force refresh header
window.refreshHeader = () => {
    logger.log('🔄 Force refreshing header...');
    
    // Reset initialization flag
    window.headerComponentInitialized = false;
    
    // Clean up existing elements
    const existingSignedOutNav = document.querySelectorAll('#signedOutNav');
    const existingSignedInNav = document.querySelectorAll('#signedInNav');
    const existingNavbar = document.querySelectorAll('nav.navbar');
    
    existingSignedOutNav.forEach(nav => nav.remove());
    existingSignedInNav.forEach(nav => nav.remove());
    existingNavbar.forEach(nav => nav.remove());
    
    // Reinitialize
    window.headerComponent = new HeaderComponent();
    window.headerComponentInitialized = true;
    
    logger.log('✅ Header refreshed successfully');
};

// Add manual sign out test function
window.testSignOut = () => {
    logger.log('🧪 Manual sign out test triggered');
    if (window.headerComponent) {
        window.headerComponent.handleSignOut();
    } else {
        logger.log('❌ Header component not available');
    }
};
