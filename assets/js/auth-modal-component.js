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
                            <!-- Google Login Button -->
                            <button class="btn btn-google w-100 mb-4" onclick="supabaseAuth.signInWithGoogle()">
                                <i class="fab fa-google me-2"></i>
                                Continue with Google
                            </button>

                            <div class="text-center mb-3">
                                <span class="text-muted">or</span>
                            </div>

                            <!-- Email/Password Authentication -->
                            <div class="email-auth-form">
                                <div class="mb-3">
                                    <input type="email" class="form-control" id="emailInput" placeholder="Enter your email address">
                                </div>
                                <div class="mb-3">
                                    <input type="password" class="form-control" id="passwordInput" placeholder="Enter your password">
                                </div>
                                
                                <button class="btn btn-primary w-100 mb-3" onclick="supabaseAuth.signInWithEmail()">
                                    Sign In with Email <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                                
                                <button class="btn btn-outline-primary w-100 mb-3" onclick="supabaseAuth.signUpWithEmail()">
                                    Create Account <i class="fas fa-user-plus ms-2"></i>
                                </button>
                            </div>

                            <div class="signup-option text-center">
                                <span class="text-muted">New to AI Home Upgrades? </span>
                                <button class="btn-link" onclick="supabaseAuth.signUpWithEmail()">Create your account</button>
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
                /* Google Login Button */
                .btn-google {
                    background: #4285f4;
                    border: 2px solid #4285f4;
                    color: white;
                    font-weight: 500;
                    padding: 12px 20px;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .btn-google:hover {
                    background: #3367d6;
                    border-color: #3367d6;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
                }

                .btn-google i {
                    font-size: 18px;
                }

                /* Email Auth Form */
                .email-auth-form .form-control {
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }

                .email-auth-form .form-control:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    outline: none;
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
                    
                    .btn-google {
                        padding: 14px 20px;
                        font-size: 16px;
                    }
                    
                    .email-auth-form .form-control {
                        padding: 14px 16px;
                        font-size: 16px;
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
