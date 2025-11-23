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
                logger.log('🔄 SupabaseAuth: Auth state change event:', event, session?.user?.email);
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                    if (session && session.user) {
                        this.user = session.user;
                        this.onAuthStateChange(this.user);
                    }
                } else if (event === 'SIGNED_OUT') {
                    this.user = null;
                    this.onAuthStateChange(null);
                } else if (event === 'TOKEN_REFRESHED') {
                    if (session && session.user) {
                        this.user = session.user;
                        this.onAuthStateChange(this.user);
                    }
                }
            });

            this.isInitialized = true;
            logger.log('✅ Supabase Auth initialized successfully');
            
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

            // Get the correct redirect URL based on current domain
            const currentHost = window.location.hostname;
            let redirectUrl;
            
            if (currentHost === 'homeupgrades.xyz' || currentHost === 'www.homeupgrades.xyz') {
                redirectUrl = 'https://homeupgrades.xyz/';
            } else if (currentHost.includes('github.io')) {
                redirectUrl = 'https://jeremyeletto.github.io/AIHomeSearch/';
            } else {
                redirectUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            logger.log('🔐 Google sign-in initiated');
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

            // Get the correct redirect URL based on current domain
            const currentHost = window.location.hostname;
            let redirectUrl;
            
            if (currentHost === 'homeupgrades.xyz' || currentHost === 'www.homeupgrades.xyz') {
                redirectUrl = 'https://homeupgrades.xyz/';
            } else if (currentHost.includes('github.io')) {
                redirectUrl = 'https://jeremyeletto.github.io/AIHomeSearch/';
            } else {
                redirectUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            logger.log('🍎 Apple sign-in initiated');
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

            // Get the correct redirect URL based on current domain
            const currentHost = window.location.hostname;
            let redirectUrl;
            
            if (currentHost === 'homeupgrades.xyz' || currentHost === 'www.homeupgrades.xyz') {
                redirectUrl = 'https://homeupgrades.xyz/';
            } else if (currentHost.includes('github.io')) {
                redirectUrl = 'https://jeremyeletto.github.io/AIHomeSearch/';
            } else {
                redirectUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            logger.log('🎮 Discord sign-in initiated');
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

            // Get the correct redirect URL based on current domain
            const currentHost = window.location.hostname;
            let redirectUrl;
            
            if (currentHost === 'homeupgrades.xyz' || currentHost === 'www.homeupgrades.xyz') {
                redirectUrl = 'https://homeupgrades.xyz/';
            } else if (currentHost.includes('github.io')) {
                redirectUrl = 'https://jeremyeletto.github.io/AIHomeSearch/';
            } else {
                redirectUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            logger.log('📘 Facebook sign-in initiated');
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

            // Get the correct redirect URL based on current domain
            const currentHost = window.location.hostname;
            let redirectUrl;
            
            if (currentHost === 'homeupgrades.xyz' || currentHost === 'www.homeupgrades.xyz') {
                redirectUrl = 'https://homeupgrades.xyz/';
            } else if (currentHost.includes('github.io')) {
                redirectUrl = 'https://jeremyeletto.github.io/AIHomeSearch/';
            } else {
                redirectUrl = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
            }

            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'azure',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) {
                throw error;
            }

            logger.log('🏢 Microsoft sign-in initiated');
            return data;
        } catch (error) {
            console.error('❌ Microsoft sign-in failed:', error);
            throw error;
        }
    }

    // Sign in with Email and Password
    async signInWithEmail() {
        try {
            logger.log('📧 ===== EMAIL SIGN-IN STARTED =====');
            
            const emailEl = document.getElementById('emailInput');
            const passwordEl = document.getElementById('passwordInput');
            
            if (!emailEl || !passwordEl) {
                console.error('❌ Email or password input not found');
                alert('Please refresh the page and try again.');
                return;
            }
            
            const email = emailEl.value.trim();
            const password = passwordEl.value;
            
            logger.log('📋 Email form values:', {
                email: email,
                passwordLength: password?.length,
                emailValid: email.includes('@')
            });
            
            // Validate inputs
            if (!email) {
                console.error('❌ Empty email');
                alert('Please enter your email address');
                return;
            }
            
            if (!password) {
                console.error('❌ Empty password');
                alert('Please enter your password');
                return;
            }
            
            if (!email.includes('@')) {
                console.error('❌ Invalid email format');
                alert('Please enter a valid email address');
                return;
            }
            
            logger.log('✅ Email validation passed');
            
            if (!this.supabase) {
                console.error('❌ Supabase not initialized');
                throw new Error('Supabase not initialized');
            }
            
            logger.log('📤 Sending email sign-in request...');
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            logger.log('📥 Supabase email sign-in response:', {
                data: data,
                error: error,
                hasData: !!data,
                hasError: !!error
            });
            
            if (error) {
                console.error('❌ Email sign-in error:', {
                    message: error.message,
                    status: error.status,
                    statusText: error.statusText,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }
            
            logger.log('✅ Email sign-in successful:', data);
            logger.log('🎉 User authenticated with email!');
            
            // Close modal
            const modal = document.getElementById('authModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
        } catch (error) {
            console.error('❌ ===== EMAIL SIGN-IN FAILED =====');
            console.error('❌ Email sign-in error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details,
                hint: error.hint,
                status: error.status,
                statusText: error.statusText
            });
            
            // More specific error messages
            let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
            
            if (error.message?.includes('Invalid login credentials')) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.message?.includes('Email not confirmed')) {
                errorMessage = 'Please check your email and click the confirmation link before signing in.';
            } else if (error.message?.includes('Too many requests')) {
                errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            }
            
            alert(errorMessage);
            throw error;
        }
    }

    // Sign up with Email and Password
    async signUpWithEmail() {
        try {
            logger.log('📧 ===== EMAIL SIGN-UP STARTED =====');
            
            const emailEl = document.getElementById('emailInput');
            const passwordEl = document.getElementById('passwordInput');
            
            if (!emailEl || !passwordEl) {
                console.error('❌ Email or password input not found');
                alert('Please refresh the page and try again.');
                return;
            }
            
            const email = emailEl.value.trim();
            const password = passwordEl.value;
            
            logger.log('📋 Email sign-up form values:', {
                email: email,
                passwordLength: password?.length,
                emailValid: email.includes('@')
            });
            
            // Validate inputs
            if (!email) {
                console.error('❌ Empty email');
                alert('Please enter your email address');
                return;
            }
            
            if (!password) {
                console.error('❌ Empty password');
                alert('Please enter a password');
                return;
            }
            
            if (!email.includes('@')) {
                console.error('❌ Invalid email format');
                alert('Please enter a valid email address');
                return;
            }
            
            if (password.length < 6) {
                console.error('❌ Password too short');
                alert('Password must be at least 6 characters long');
                return;
            }
            
            logger.log('✅ Email sign-up validation passed');
            
            if (!this.supabase) {
                console.error('❌ Supabase not initialized');
                throw new Error('Supabase not initialized');
            }
            
            logger.log('📤 Sending email sign-up request...');
            
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password
            });
            
            logger.log('📥 Supabase email sign-up response:', {
                data: data,
                error: error,
                hasData: !!data,
                hasError: !!error
            });
            
            if (error) {
                console.error('❌ Email sign-up error:', {
                    message: error.message,
                    status: error.status,
                    statusText: error.statusText,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }
            
            logger.log('✅ Email sign-up successful:', data);
            
            // Check if email confirmation is required
            if (data.user && !data.user.email_confirmed_at) {
                logger.log('📧 Email confirmation required');
                alert('Account created! Please check your email and click the confirmation link to complete your registration.');
            } else {
                logger.log('🎉 User account created and confirmed!');
                alert('Account created successfully! You are now signed in.');
            }
            
            // Close modal
            const modal = document.getElementById('authModal');
            if (modal) {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            }
            
        } catch (error) {
            console.error('❌ ===== EMAIL SIGN-UP FAILED =====');
            console.error('❌ Email sign-up error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details,
                hint: error.hint,
                status: error.status,
                statusText: error.statusText
            });
            
            // More specific error messages
            let errorMessage = 'Failed to create account. Please try again.';
            
            if (error.message?.includes('User already registered')) {
                errorMessage = 'An account with this email already exists. Please sign in instead.';
            } else if (error.message?.includes('Password should be at least')) {
                errorMessage = 'Password must be at least 6 characters long.';
            } else if (error.message?.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            }
            
            alert(errorMessage);
            throw error;
        }
    }

    // Sign in with Phone Number
    async signInWithPhone() {
        try {
            logger.log('🚀 ===== PHONE AUTHENTICATION STARTED =====');
            
            // Get form elements
            const countryCodeEl = document.getElementById('countryCode');
            const phoneNumberEl = document.getElementById('phoneNumber');
            
            logger.log('🔍 Form elements found:', {
                countryCodeEl: !!countryCodeEl,
                phoneNumberEl: !!phoneNumberEl
            });
            
            if (!countryCodeEl || !phoneNumberEl) {
                console.error('❌ Missing form elements');
                alert('Phone form not found. Please refresh the page.');
                return;
            }
            
            const countryCode = countryCodeEl.value;
            const phoneNumber = phoneNumberEl.value;
            
            logger.log('📋 Form values:', {
                countryCode: countryCode,
                phoneNumber: phoneNumber,
                countryCodeLength: countryCode?.length,
                phoneNumberLength: phoneNumber?.length
            });
            
            // Validate inputs
            if (!phoneNumber || phoneNumber.trim() === '') {
                console.error('❌ Empty phone number');
                alert('Please enter your phone number');
                return;
            }
            
            if (!countryCode || countryCode.trim() === '') {
                console.error('❌ Empty country code');
                alert('Please select a country code');
                return;
            }

            const fullPhoneNumber = `${countryCode}${phoneNumber}`;
            logger.log('📱 Full phone number constructed:', fullPhoneNumber);
            
            // Validate phone number format
            const phoneRegex = /^\+[1-9]\d{1,14}$/;
            if (!phoneRegex.test(fullPhoneNumber)) {
                console.error('❌ Invalid phone number format:', fullPhoneNumber);
                alert('Please enter a valid phone number with country code');
                return;
            }
            
            logger.log('✅ Phone number format is valid');
            
            // Check Supabase initialization
            if (!this.supabase) {
                console.error('❌ Supabase not initialized');
                throw new Error('Supabase not initialized');
            }
            
            logger.log('✅ Supabase client is ready');
            
            // Check current Supabase configuration
            logger.log('🔧 Supabase configuration:', {
                url: this.supabase.supabaseUrl,
                key: this.supabase.supabaseKey ? 'Present' : 'Missing',
                clientInitialized: !!this.supabase.auth
            });
            
            logger.log('📤 Sending OTP request to Supabase...');
            logger.log('📤 Request payload:', {
                phone: fullPhoneNumber,
                options: { channel: 'sms' }
            });

            const { data, error } = await this.supabase.auth.signInWithOtp({
                phone: fullPhoneNumber,
                options: {
                    channel: 'sms'
                }
            });

            logger.log('📥 Supabase response received:', {
                data: data,
                error: error,
                hasData: !!data,
                hasError: !!error
            });

            if (error) {
                console.error('❌ Supabase returned error:', {
                    message: error.message,
                    status: error.status,
                    statusText: error.statusText,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            logger.log('✅ SMS OTP request successful:', data);
            logger.log('🎉 SMS should have been sent to:', fullPhoneNumber);
            
            // Show OTP input modal
            this.showOTPModal(fullPhoneNumber);
            logger.log('📱 OTP modal displayed');
            
        } catch (error) {
            console.error('❌ ===== PHONE AUTHENTICATION FAILED =====');
            console.error('❌ Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details,
                hint: error.hint,
                status: error.status,
                statusText: error.statusText
            });
            
            // More specific error messages
            let errorMessage = 'Failed to send SMS. Please check your phone number and try again.';
            
            if (error.message?.includes('Invalid phone number')) {
                errorMessage = 'Invalid phone number format. Please check your number and country code.';
            } else if (error.message?.includes('rate limit')) {
                errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message?.includes('configuration')) {
                errorMessage = 'SMS service not configured. Please contact support.';
            }
            
            alert(errorMessage);
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
            logger.log('🔐 ===== OTP VERIFICATION STARTED =====');
            logger.log('📱 Verifying OTP for phone:', phoneNumber);
            
            const otpInputEl = document.getElementById('otpInput');
            logger.log('🔍 OTP input element found:', !!otpInputEl);
            
            if (!otpInputEl) {
                console.error('❌ OTP input element not found');
                alert('OTP form not found. Please try again.');
                return;
            }
            
            const otpCode = otpInputEl.value;
            logger.log('📋 OTP code entered:', otpCode ? `${otpCode.substring(0, 2)}****` : 'Empty');
            logger.log('📏 OTP code length:', otpCode?.length);
            
            if (!otpCode || otpCode.trim() === '') {
                console.error('❌ Empty OTP code');
                alert('Please enter the verification code');
                return;
            }
            
            if (otpCode.length < 4) {
                console.error('❌ OTP code too short:', otpCode.length);
                alert('Verification code seems too short. Please check and try again.');
                return;
            }

            logger.log('✅ OTP code validation passed');
            
            if (!this.supabase) {
                console.error('❌ Supabase not initialized');
                throw new Error('Supabase not initialized');
            }
            
            logger.log('✅ Supabase client is ready for verification');
            
            logger.log('📤 Sending OTP verification request...');
            logger.log('📤 Verification payload:', {
                phone: phoneNumber,
                token: otpCode,
                type: 'sms'
            });

            const { data, error } = await this.supabase.auth.verifyOtp({
                phone: phoneNumber,
                token: otpCode,
                type: 'sms'
            });

            logger.log('📥 Supabase verification response:', {
                data: data,
                error: error,
                hasData: !!data,
                hasError: !!error
            });

            if (error) {
                console.error('❌ Supabase verification error:', {
                    message: error.message,
                    status: error.status,
                    statusText: error.statusText,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            logger.log('✅ Phone verification successful:', data);
            logger.log('🎉 User authenticated successfully!');
            
            // Close modal
            const modal = document.querySelector('.modal');
            if (modal) {
                modal.remove();
                logger.log('📱 OTP modal closed');
            }
            
        } catch (error) {
            console.error('❌ ===== OTP VERIFICATION FAILED =====');
            console.error('❌ Verification error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code,
                details: error.details,
                hint: error.hint,
                status: error.status,
                statusText: error.statusText
            });
            
            // More specific error messages
            let errorMessage = 'Invalid verification code. Please try again.';
            
            if (error.message?.includes('expired')) {
                errorMessage = 'Verification code has expired. Please request a new code.';
            } else if (error.message?.includes('invalid')) {
                errorMessage = 'Invalid verification code. Please check the code and try again.';
            } else if (error.message?.includes('rate limit')) {
                errorMessage = 'Too many verification attempts. Please wait before trying again.';
            } else if (error.message?.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            alert(errorMessage);
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
            
            logger.log('👋 User signed out successfully');
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

    // Convert base64 data URL to Blob
    async base64ToBlob(base64DataUrl) {
        try {
            const response = await fetch(base64DataUrl);
            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('❌ Error converting base64 to blob:', error);
            throw error;
        }
    }

    // Upload image to Supabase Storage and return public URL
    async uploadImageToStorage(blob, fileName, folder = 'generated-images') {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to upload images');
            }

            // Create file path: user_id/timestamp_filename
            const timestamp = Date.now();
            const filePath = `${this.user.id}/${timestamp}_${fileName}`;

            logger.log(`📤 Uploading image to storage: ${filePath}`);

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(folder)
                .upload(filePath, blob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('❌ Storage upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from(folder)
                .getPublicUrl(filePath);

            logger.log('✅ Image uploaded to storage:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error) {
            console.error('❌ Failed to upload image to storage:', error);
            throw error;
        }
    }

    // Save generated image to database (using Supabase Storage)
    async saveGeneratedImage(imageData) {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to save images');
            }

            logger.log('💾 Saving image with Supabase Storage...');

            // Upload original image to storage if it's base64
            let originalImageUrl = imageData.originalUrl || '';
            if (originalImageUrl.startsWith('data:image')) {
                logger.log('📤 Uploading original image to storage...');
                const originalBlob = await this.base64ToBlob(originalImageUrl);
                originalImageUrl = await this.uploadImageToStorage(originalBlob, 'original.jpg', 'generated-images');
            }

            // Upload generated image to storage if it's base64
            let generatedImageUrl = imageData.generatedUrl || '';
            if (generatedImageUrl.startsWith('data:image')) {
                logger.log('📤 Uploading generated image to storage...');
                const generatedBlob = await this.base64ToBlob(generatedImageUrl);
                generatedImageUrl = await this.uploadImageToStorage(generatedBlob, 'generated.jpg', 'generated-images');
            }

            // Validate and clean data before sending to Supabase
            const insertData = {
                user_id: this.user.id,
                original_image_url: originalImageUrl,
                generated_image_url: generatedImageUrl,
                prompt: imageData.prompt || 'Home Upgrade',
                upgrade_type: imageData.upgradeType || 'Home Upgrade',
                property_address: imageData.propertyAddress || 'Property Address',
                property_price: imageData.propertyPrice || 0,
                property_bedrooms: imageData.propertyBedrooms || 0,
                property_bathrooms: imageData.propertyBathrooms || 0,
                property_sqft: imageData.propertySqft || 0,
                generation_status: 'completed'
            };

            logger.log('💾 Supabase insert data (with storage URLs):', {
                ...insertData,
                original_image_url: originalImageUrl.substring(0, 100) + '...',
                generated_image_url: generatedImageUrl.substring(0, 100) + '...'
            });

            const { data, error } = await this.supabase
                .from('generated_images')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase insert error:', error);
                throw error;
            }

            // Clear cache after saving new image
            this.clearUserImagesCache();

            logger.log('✅ Image saved to database with storage URLs');
            return data;
        } catch (error) {
            console.error('❌ Failed to save image:', error);
            throw error;
        }
    }

    // Get user's generated images with caching
    async getUserImages(forceRefresh = false) {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to get images');
            }

            // Check cache first (5 minute cache) - with safety check
            if (typeof CONFIG !== 'undefined' && CONFIG.generatedImageCache) {
                const cacheKey = `userImages_${this.user.id}`;
                const cacheExpiry = 5 * 60 * 1000; // 5 minutes
                
                if (!forceRefresh && CONFIG.generatedImageCache.has(cacheKey)) {
                    const cached = CONFIG.generatedImageCache.get(cacheKey);
                    if (Date.now() - cached.timestamp < cacheExpiry) {
                        logger.log('📦 Using cached user images');
                        return cached.data;
                    } else {
                        logger.log('⏰ Cache expired for user images');
                        CONFIG.generatedImageCache.delete(cacheKey);
                    }
                }
            } else {
                logger.log('⚠️ CONFIG not available, skipping cache check');
            }

            logger.log('🔍 Fetching fresh user images from database (with pagination)');
            logger.log('👤 User ID:', this.user.id);
            
            // Check session for logging (using correct API)
            try {
                const { data: { session } } = await this.supabase.auth.getSession();
                logger.log('🔐 Auth token present:', !!session);
            } catch (e) {
                logger.log('🔐 Auth session check failed:', e);
            }
            
            // Optimized query: Select only needed columns and use efficient ordering
            // The composite index (user_id, created_at DESC) makes this fast
            // Reduced limit for faster initial load - pagination can load more
            // Note: Existing base64 images may still cause slow queries
            const limit = 12; // Load 12 images initially for faster response (reduced from 20)
            
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Query timeout after 15 seconds')), 15000);
            });
            
            // Race between query and timeout
            const queryPromise = this.supabase
                .from('generated_images')
                .select('id, user_id, original_image_url, generated_image_url, prompt, upgrade_type, property_address, property_price, property_bedrooms, property_bathrooms, property_sqft, generation_status, created_at, updated_at')
                .eq('user_id', this.user.id)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

            if (error) {
                // Enhanced error logging for RLS issues
                console.error('❌ Supabase query error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    status: error.status || 'N/A'
                });
                
                // Provide helpful error messages for common issues
                if (error.code === '57014' || error.message?.includes('statement timeout') || error.message?.includes('canceling statement')) {
                    console.error('⏱️ QUERY TIMEOUT: Database query took too long');
                    console.error('💡 Solution: Run the performance fix script in Supabase SQL Editor');
                    console.error('📄 Script location: supabase-performance-fix.sql');
                    console.error('🔧 This creates optimized indexes to speed up queries');
                    throw new Error('Query timeout - database is taking too long to respond. Please try again in a moment, or contact support if this persists.');
                } else if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('row-level security')) {
                    console.error('🚨 RLS POLICY ERROR: Row Level Security is blocking this query');
                    console.error('💡 Solution: Run the RLS fix script in Supabase SQL Editor');
                    console.error('📄 Script location: supabase-rls-fix.sql');
                    throw new Error('Database security policy error. Please contact support if this persists.');
                } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
                    console.error('🚨 TABLE ERROR: generated_images table may not exist');
                    throw new Error('Database table not found. Please contact support.');
                } else if (error.status === 500) {
                    console.error('🚨 SERVER ERROR: Supabase returned 500');
                    if (error.message?.includes('timeout')) {
                        console.error('💡 This is a timeout error - run supabase-performance-fix.sql');
                    } else {
                        console.error('💡 Solution: Check RLS policies in Supabase dashboard');
                    }
                    throw new Error('Database server error. Please try again or contact support.');
                }
                
                throw error;
            }

            const images = data || [];
            
            // Cache the results (with safety check)
            if (typeof CONFIG !== 'undefined' && CONFIG.generatedImageCache) {
                const cacheKey = `userImages_${this.user.id}`;
                CONFIG.generatedImageCache.set(cacheKey, {
                    data: images,
                    timestamp: Date.now()
                });

                // Periodic cache cleanup (every 10th request)
                if (Math.random() < 0.1) {
                    this.cleanupImageCache();
                }
            } else {
                logger.log('⚠️ CONFIG not available, skipping cache storage');
            }

            return images;
        } catch (error) {
            console.error('❌ Failed to get user images:', error);
            throw error;
        }
    }

    // Clear user images cache (call after add/delete operations)
    clearUserImagesCache() {
        if (this.user && typeof CONFIG !== 'undefined' && CONFIG.generatedImageCache) {
            const cacheKey = `userImages_${this.user.id}`;
            CONFIG.generatedImageCache.delete(cacheKey);
            logger.log('🗑️ Cleared user images cache');
        } else {
            logger.log('⚠️ Cannot clear cache - CONFIG not available');
        }
    }

    // Clean up old cache entries to prevent memory issues
    cleanupImageCache() {
        if (typeof CONFIG === 'undefined' || !CONFIG.generatedImageCache) {
            logger.log('⚠️ Cannot cleanup cache - CONFIG not available');
            return;
        }
        
        const maxCacheSize = 20; // Maximum number of cached image sets
        const maxAge = 30 * 60 * 1000; // 30 minutes max age
        
        if (CONFIG.generatedImageCache.size > maxCacheSize) {
            // Remove oldest entries
            const entries = Array.from(CONFIG.generatedImageCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            const toRemove = entries.slice(0, CONFIG.generatedImageCache.size - maxCacheSize);
            toRemove.forEach(([key]) => {
                CONFIG.generatedImageCache.delete(key);
            });
            
            logger.log(`🧹 Cleaned up ${toRemove.length} old image cache entries`);
        }
        
        // Remove expired entries
        const now = Date.now();
        for (const [key, value] of CONFIG.generatedImageCache.entries()) {
            if (now - value.timestamp > maxAge) {
                CONFIG.generatedImageCache.delete(key);
                logger.log(`⏰ Removed expired cache entry: ${key}`);
            }
        }
    }

    // Delete user's generated image (and from storage)
    async deleteUserImage(imageId) {
        try {
            if (!this.user) {
                throw new Error('User must be authenticated to delete images');
            }

            // First, get the image to find storage paths
            const { data: imageData, error: fetchError } = await this.supabase
                .from('generated_images')
                .select('original_image_url, generated_image_url')
                .eq('id', imageId)
                .eq('user_id', this.user.id)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            // Delete from storage if URLs are from Supabase Storage
            const storageBaseUrl = 'https://blreysdjzzildmekblfj.supabase.co/storage/v1/object/public/generated-images/';
            
            if (imageData.original_image_url && imageData.original_image_url.startsWith(storageBaseUrl)) {
                const originalPath = imageData.original_image_url.replace(storageBaseUrl, '');
                try {
                    await this.supabase.storage
                        .from('generated-images')
                        .remove([originalPath]);
                    logger.log('🗑️ Deleted original image from storage');
                } catch (storageError) {
                    logger.log('⚠️ Could not delete original from storage (may not exist):', storageError);
                }
            }

            if (imageData.generated_image_url && imageData.generated_image_url.startsWith(storageBaseUrl)) {
                const generatedPath = imageData.generated_image_url.replace(storageBaseUrl, '');
                try {
                    await this.supabase.storage
                        .from('generated-images')
                        .remove([generatedPath]);
                    logger.log('🗑️ Deleted generated image from storage');
                } catch (storageError) {
                    logger.log('⚠️ Could not delete generated from storage (may not exist):', storageError);
                }
            }

            // Delete from database
            const { data, error } = await this.supabase
                .from('generated_images')
                .delete()
                .eq('id', imageId)
                .eq('user_id', this.user.id)
                .select();

            if (error) {
                throw error;
            }

            // Clear cache after deletion
            this.clearUserImagesCache();
            
            logger.log('✅ Image deleted successfully from database and storage');
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

            logger.log('✅ Image uploaded successfully:', urlData.publicUrl);
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
            logger.log('⏳ Auth not initialized yet, waiting...');
            return false;
        }

        if (!this.isAuthenticated()) {
            logger.log('❌ User not authenticated, redirecting to index...');
            // Redirect to landing page if not authenticated
            window.location.href = 'index.html';
            return false;
        }
        
        logger.log('✅ User authenticated successfully');
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
    logger.log('🔍 Current URL:', window.location.href);
    logger.log('🔍 Redirect URL will be:', currentUrl);
    logger.log('🔍 Hostname:', window.location.hostname);
    logger.log('🔍 Port:', window.location.port || '3001');
    return currentUrl;
};

// Debug function to check Supabase configuration
window.debugSupabaseConfig = () => {
    logger.log('🔍 ===== SUPABASE CONFIGURATION DEBUG =====');
    
    if (!window.supabaseAuth) {
        console.error('❌ SupabaseAuth instance not found');
        return;
    }
    
    const auth = window.supabaseAuth;
    logger.log('✅ SupabaseAuth instance found');
    
    logger.log('🔧 Initialization status:', {
        isInitialized: auth.isInitialized,
        hasSupabaseClient: !!auth.supabase,
        hasUser: !!auth.user,
        isAuthenticated: auth.isAuthenticated()
    });
    
    if (auth.supabase) {
        logger.log('🔧 Supabase client details:', {
            url: auth.supabase.supabaseUrl,
            key: auth.supabase.supabaseKey ? 'Present' : 'Missing',
            authModule: !!auth.supabase.auth,
            storageModule: !!auth.supabase.storage,
            databaseModule: !!auth.supabase.from
        });
        
        // Check auth configuration
        if (auth.supabase.auth) {
            logger.log('🔧 Auth module available');
        }
    } else {
        console.error('❌ Supabase client not initialized');
    }
    
    logger.log('🔍 ===== END SUPABASE CONFIG DEBUG =====');
    return {
        isInitialized: auth.isInitialized,
        hasClient: !!auth.supabase,
        hasUser: !!auth.user,
        isAuthenticated: auth.isAuthenticated()
    };
};

// Debug function to test phone number format
window.debugPhoneFormat = (phoneNumber) => {
    logger.log('🔍 ===== PHONE NUMBER FORMAT DEBUG =====');
    logger.log('📱 Input phone number:', phoneNumber);
    
    if (!phoneNumber) {
        console.error('❌ No phone number provided');
        return false;
    }
    
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phoneNumber);
    
    logger.log('📏 Phone number length:', phoneNumber.length);
    logger.log('🔍 Regex test result:', isValid);
    logger.log('📋 Phone number breakdown:', {
        hasPlus: phoneNumber.startsWith('+'),
        countryCode: phoneNumber.substring(0, phoneNumber.length - 10), // Assume 10 digits for local number
        localNumber: phoneNumber.substring(phoneNumber.length - 10)
    });
    
    if (!isValid) {
        console.error('❌ Invalid phone format');
        logger.log('💡 Expected format: +[country code][number] (e.g., +1234567890)');
    } else {
        logger.log('✅ Phone number format is valid');
    }
    
    logger.log('🔍 ===== END PHONE FORMAT DEBUG =====');
    return isValid;
};

