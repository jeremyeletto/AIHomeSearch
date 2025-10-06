// Supabase Authentication Module
class SupabaseAuth {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Import Supabase client
            const { createClient } = supabase;
            
            // Initialize Supabase client
            this.supabase = createClient(
                'https://blreysdjzzildmekblfj.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscmV5c2RqenppbGRtZWtibGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODMzMDUsImV4cCI6MjA3NTI1OTMwNX0.n9pShYBUTIo2nwLcDcyUDex8NU1Xzpp9kPQKX2Y4BIs'
            );

            // Check for existing session
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Error getting session:', error);
            } else if (session) {
                this.user = session.user;
                this.onAuthStateChange(this.user);
            }

            // Listen for auth state changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔄 SupabaseAuth: Auth state change event:', event, session?.user?.email);
                if (event === 'SIGNED_IN') {
                    this.user = session.user;
                    this.onAuthStateChange(this.user);
                } else if (event === 'SIGNED_OUT') {
                    this.user = null;
                    this.onAuthStateChange(null);
                } else if (event === 'TOKEN_REFRESHED') {
                    this.user = session.user;
                    this.onAuthStateChange(this.user);
                }
            });

            this.isInitialized = true;
            console.log('✅ Supabase Auth initialized successfully');
            
            // Dispatch ready event
            const readyEvent = new CustomEvent('supabaseAuthReady', { 
                detail: { user: this.user, isAuthenticated: !!this.user } 
            });
            document.dispatchEvent(readyEvent);
            
        } catch (error) {
            console.error('❌ Failed to initialize Supabase Auth:', error);
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`
                }
            });

            if (error) {
                throw error;
            }

            console.log('🔐 Google sign-in initiated');
            return data;
        } catch (error) {
            console.error('❌ Google sign-in failed:', error);
            throw error;
        }
    }

    // Sign in with Apple
    async signInWithApple() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`
                }
            });

            if (error) {
                throw error;
            }

            console.log('🍎 Apple sign-in initiated');
            return data;
        } catch (error) {
            console.error('❌ Apple sign-in failed:', error);
            throw error;
        }
    }

    // Sign in with Discord
    async signInWithDiscord() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`
                }
            });

            if (error) {
                throw error;
            }

            console.log('🎮 Discord sign-in initiated');
            return data;
        } catch (error) {
            console.error('❌ Discord sign-in failed:', error);
            throw error;
        }
    }

    // Sign in with Facebook
    async signInWithFacebook() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`
                }
            });

            if (error) {
                throw error;
            }

            console.log('📘 Facebook sign-in initiated');
            return data;
        } catch (error) {
            console.error('❌ Facebook sign-in failed:', error);
            throw error;
        }
    }

    // Sign in with Microsoft
    async signInWithMicrosoft() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'azure',
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`
                }
            });

            if (error) {
                throw error;
            }

            console.log('🏢 Microsoft sign-in initiated');
            return data;
        } catch (error) {
            console.error('❌ Microsoft sign-in failed:', error);
            throw error;
        }
    }

    // Sign in with Phone Number
    async signInWithPhone() {
        try {
            const countryCode = document.getElementById('countryCode').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            
            if (!phoneNumber) {
                alert('Please enter your phone number');
                return;
            }

            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            console.log('📱 Starting phone sign-in for:', fullPhoneNumber);
            
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.signInWithOtp({
                phone: fullPhoneNumber,
                options: {
                    channel: 'sms'
                }
            });

            if (error) {
                throw error;
            }

            console.log('✅ SMS sent successfully');
            
            // Show OTP input modal
            this.showOTPModal(fullPhoneNumber);
            
        } catch (error) {
            console.error('❌ Phone sign-in failed:', error);
            alert('Failed to send SMS. Please check your phone number and try again.');
            throw error;
        }
    }

    // Show OTP verification modal
    showOTPModal(phoneNumber) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Verify Phone Number</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <p>We sent a verification code to <strong>${phoneNumber}</strong></p>
                        <div class="mb-3">
                            <label class="form-label">Enter verification code</label>
                            <input type="text" class="form-control" id="otpInput" placeholder="123456" maxlength="6">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="supabaseAuth.verifyOTP('${phoneNumber}')">Verify</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus on OTP input
        setTimeout(() => {
            document.getElementById('otpInput').focus();
        }, 100);
    }

    // Verify OTP code
    async verifyOTP(phoneNumber) {
        try {
            const otpCode = document.getElementById('otpInput').value;
            
            if (!otpCode) {
                alert('Please enter the verification code');
                return;
            }

            console.log('🔐 Verifying OTP...');
            
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { data, error } = await this.supabase.auth.verifyOtp({
                phone: phoneNumber,
                token: otpCode,
                type: 'sms'
            });

            if (error) {
                throw error;
            }

            console.log('✅ Phone verification successful');
            
            // Close modal
            document.querySelector('.modal').remove();
            
        } catch (error) {
            console.error('❌ OTP verification failed:', error);
            alert('Invalid verification code. Please try again.');
            throw error;
        }
    }

    // Sign out
    async signOut() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                throw error;
            }

            // Clear user data
            this.user = null;
            
            // Dispatch auth state change event
            this.onAuthStateChange(null);
            
            console.log('👋 User signed out successfully');
        } catch (error) {
            console.error('❌ Sign-out failed:', error);
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get user profile
    async getUserProfile() {
        try {
            if (!this.user) {
                throw new Error('No authenticated user');
            }

            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('❌ Failed to get user profile:', error);
            throw error;
        }
    }

    // Save generated image to database
    async saveGeneratedImage(imageData) {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to save images');
            }

            // Validate and clean data before sending to Supabase
            const insertData = {
                user_id: this.user.id,
                original_image_url: imageData.originalUrl || '',
                generated_image_url: imageData.generatedUrl || '',
                prompt: imageData.prompt || 'Home Upgrade',
                upgrade_type: imageData.upgradeType || 'Home Upgrade',
                property_address: imageData.propertyAddress || 'Property Address',
                property_price: imageData.propertyPrice || 0,
                property_bedrooms: imageData.propertyBedrooms || 0,
                property_bathrooms: imageData.propertyBathrooms || 0,
                property_sqft: imageData.propertySqft || 0,
                generation_status: 'completed'
            };

            console.log('💾 Supabase insert data:', insertData);

            const { data, error } = await this.supabase
                .from('generated_images')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase insert error:', error);
                throw error;
            }

            console.log('✅ Image saved to database:', data);
            return data;
        } catch (error) {
            console.error('❌ Failed to save image:', error);
            throw error;
        }
    }

    // Get user's generated images
    async getUserImages() {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to get images');
            }

            const { data, error } = await this.supabase
                .from('generated_images')
                .select('*')
                .eq('user_id', this.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data || [];
        } catch (error) {
            console.error('❌ Failed to get user images:', error);
            throw error;
        }
    }

    // Delete user's generated image
    async deleteUserImage(imageId) {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to delete images');
            }

            const { data, error } = await this.supabase
                .from('generated_images')
                .delete()
                .eq('id', imageId)
                .eq('user_id', this.user.id)
                .select();

            if (error) {
                throw error;
            }

            console.log('✅ Image deleted successfully:', data);
            return data;
        } catch (error) {
            console.error('❌ Failed to delete image:', error);
            throw error;
        }
    }

    // Upload image to storage
    async uploadImage(file, fileName) {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to upload images');
            }

            const fileExt = fileName.split('.').pop();
            const filePath = `${this.user.id}/${Date.now()}.${fileExt}`;

            const { data, error } = await this.supabase.storage
                .from('generated-images')
                .upload(filePath, file);

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('generated-images')
                .getPublicUrl(filePath);

            console.log('✅ Image uploaded successfully:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error) {
            console.error('❌ Failed to upload image:', error);
            throw error;
        }
    }

    // Auth state change handler
    onAuthStateChange(user) {
        // Update UI based on auth state
        this.updateAuthUI(user);
        
        // Dispatch custom event for other components
        const event = new CustomEvent('authStateChanged', { 
            detail: { user: user, isAuthenticated: !!user } 
        });
        document.dispatchEvent(event);
    }

    // Update authentication UI
    updateAuthUI(user) {
        const signedOutNav = document.getElementById('signedOutNav');
        const signedInNav = document.getElementById('signedInNav');
        
        if (user) {
            // User is signed in
            if (signedOutNav) {
                signedOutNav.style.display = 'none';
            }
            if (signedInNav) {
                signedInNav.style.display = 'flex';
                
                // Update user info with initials
                const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
                const userName = fullName;
                
                // Generate initials from full name
                const initials = this.generateInitials(fullName);
                
                const userNameEl = document.getElementById('userName');
                const userInitialsEl = document.getElementById('userInitials');
                
                if (userNameEl) {
                    userNameEl.textContent = userName;
                }
                if (userInitialsEl) {
                    userInitialsEl.textContent = initials;
                }
            }
        } else {
            // User is signed out
            if (signedOutNav) {
                signedOutNav.style.display = 'flex';
            }
            if (signedInNav) {
                signedInNav.style.display = 'none';
            }
        }
    }

    // Generate initials from full name
    generateInitials(name) {
        if (!name) return 'U';
        
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            // First and last name initials
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1) {
            // Single name - take first two characters
            return parts[0].substring(0, 2).toUpperCase();
        }
        return 'U';
    }

    // Require authentication for page access
    requireAuth() {
        // Wait for initialization if not ready
        if (!this.isInitialized) {
            console.log('⏳ Auth not initialized yet, waiting...');
            return false;
        }

        if (!this.isAuthenticated()) {
            console.log('❌ User not authenticated, redirecting to index...');
            // Redirect to landing page if not authenticated
            window.location.href = 'index.html';
            return false;
        }
        
        console.log('✅ User authenticated successfully');
        return true;
    }
}

// Create global auth instance
window.supabaseAuth = new SupabaseAuth();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseAuth;
}

// Debug function to check redirect URL
window.debugRedirectUrl = () => {
    const currentUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3001'}`;
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Redirect URL will be:', currentUrl);
    console.log('🔍 Hostname:', window.location.hostname);
    console.log('🔍 Port:', window.location.port || '3001');
    return currentUrl;
};

