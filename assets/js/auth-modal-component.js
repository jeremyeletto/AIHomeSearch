/**
 * Authentication Modal Component
 * Shared modal component for all authentication options
 */
class AuthModalComponent {
    constructor() {
        this.init();
    }

    init() {
        this.createModalHTML();
        this.addModalStyles();
        this.setupEventListeners();
    }

    createModalHTML() {
        const modalHTML = `
            <!-- Authentication Modal -->
            <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered auth-modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header border-0 pb-0">
                            <h5 class="modal-title" id="authModalLabel">Welcome to AI Home Upgrades</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body pt-0">
                            <!-- Social Login Options -->
                            <div class="social-login-row d-flex gap-3 mb-4">
                                <button class="btn btn-social" onclick="supabaseAuth.signInWithApple()" title="Sign in with Apple">
                                    <i class="fab fa-apple"></i>
                                </button>
                                <button class="btn btn-social" onclick="supabaseAuth.signInWithGoogle()" title="Sign in with Google">
                                    <i class="fab fa-google"></i>
                                </button>
                                <button class="btn btn-social" onclick="supabaseAuth.signInWithDiscord()" title="Sign in with Discord">
                                    <i class="fab fa-discord"></i>
                                </button>
                                <button class="btn btn-social" onclick="supabaseAuth.signInWithFacebook()" title="Sign in with Facebook">
                                    <i class="fab fa-facebook-f"></i>
                                </button>
                                <button class="btn btn-social" onclick="supabaseAuth.signInWithMicrosoft()" title="Sign in with Microsoft">
                                    <i class="fab fa-microsoft"></i>
                                </button>
                            </div>

                            <div class="text-center mb-3">
                                <span class="text-muted">or</span>
                            </div>

                            <!-- Phone Authentication -->
                            <div class="phone-input-group d-flex gap-2 mb-3">
                                <select class="form-select country-select" id="countryCode">
                                    <option value="+1">🇺🇸 +1</option>
                                    <option value="+44">🇬🇧 +44</option>
                                    <option value="+33">🇫🇷 +33</option>
                                    <option value="+49">🇩🇪 +49</option>
                                    <option value="+81">🇯🇵 +81</option>
                                    <option value="+86">🇨🇳 +86</option>
                                    <option value="+91">🇮🇳 +91</option>
                                    <option value="+61">🇦🇺 +61</option>
                                    <option value="+55">🇧🇷 +55</option>
                                    <option value="+52">🇲🇽 +52</option>
                                </select>
                                <input type="tel" class="form-control" id="phoneNumber" placeholder="Enter your phone number">
                            </div>

                            <button class="btn btn-primary w-100 mb-3" onclick="supabaseAuth.signInWithPhone()">
                                Continue with Phone <i class="fas fa-arrow-right ms-2"></i>
                            </button>

                            <div class="signup-option text-center">
                                <span class="text-muted">Don't have an account? </span>
                                <button class="btn-link" onclick="this.showSignUpModal()">Sign up</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if it exists
        const existingModal = document.getElementById('authModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    addModalStyles() {
        const styles = `
            <style id="auth-modal-styles">
                /* Social Login Buttons */
                .btn-social {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #4a5568;
                    font-size: 18px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-social:hover {
                    border-color: #667eea;
                    color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
                }

                .social-login-row {
                    justify-content: center;
                }

                /* Signup Link */
                .signup-option .btn-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                    padding: 0;
                    margin-left: 8px;
                }

                .signup-option .btn-link:hover {
                    color: #5a67d8;
                    text-decoration: underline;
                }

                /* Modal Size Customization */
                .auth-modal-dialog {
                    max-width: 400px;
                    width: 90%;
                    margin: 1rem auto;
                }

                /* Mobile Responsive */
                @media (max-width: 576px) {
                    .auth-modal-dialog {
                        width: 95%;
                        margin: 0.5rem auto;
                    }
                    
                    .modal-content {
                        border-radius: 12px;
                    }
                    
                    .social-login-row {
                        gap: 8px;
                        margin-bottom: 20px;
                    }
                    
                    .btn-social {
                        width: 44px;
                        height: 44px;
                        font-size: 16px;
                    }
                    
                    .phone-input-group {
                        flex-direction: column;
                        gap: 8px;
                    }
                    
                    .country-select {
                        width: 100%;
                    }
                    
                    .modal-header {
                        padding: 1rem 1rem 0.5rem 1rem;
                    }
                    
                    .modal-body {
                        padding: 0.5rem 1rem 1rem 1rem;
                    }
                }
            </style>
        `;

        // Remove existing modal styles
        const existingStyles = document.getElementById('auth-modal-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        // Add global function for sign up modal
        window.showSignUpModal = () => {
            alert('Sign-up functionality coming soon! For now, you can sign in with any of the available providers.');
        };
    }
}

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authModalComponent = new AuthModalComponent();
});

// Export for use in other scripts
window.AuthModalComponent = AuthModalComponent;
