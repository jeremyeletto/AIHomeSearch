// Upgrade UI functionality and AI generation
class UpgradeUI {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for upgrade functionality
    }

    // Render upgrade pills dynamically by category
    renderUpgradePills() {
        if (!CONFIG.promptsConfig) return;
        
        // Get category containers
        const exteriorContainer = document.getElementById('exteriorPillsContainer');
        const extensionsContainer = document.getElementById('extensionsPillsContainer');
        const interiorContainer = document.getElementById('interiorPillsContainer');
        
        if (!exteriorContainer || !extensionsContainer || !interiorContainer) return;
        
        // Clear all containers
        exteriorContainer.innerHTML = '';
        extensionsContainer.innerHTML = '';
        interiorContainer.innerHTML = '';
        
        // Group prompts by category
        const promptsByCategory = {
            exterior: [],
            extensions: [],
            interior: []
        };
        
        Object.entries(CONFIG.promptsConfig.prompts).forEach(([key, prompt]) => {
            if (promptsByCategory[prompt.category]) {
                promptsByCategory[prompt.category].push([key, prompt]);
            }
        });
        
        // Sort each category by priority
        Object.keys(promptsByCategory).forEach(category => {
            promptsByCategory[category].sort(([,a], [,b]) => a.priority - b.priority);
        });
        
        // Render each category
        Object.entries(promptsByCategory).forEach(([category, prompts]) => {
            let container;
            switch(category) {
                case 'exterior':
                    container = exteriorContainer;
                    break;
                case 'extensions':
                    container = extensionsContainer;
                    break;
                case 'interior':
                    container = interiorContainer;
                    break;
                default:
                    return;
            }
            
            if (prompts.length === 0) {
                container.innerHTML = '<div class="text-center text-muted py-3">No upgrades available in this category</div>';
                return;
            }
            
            prompts.forEach(([key, prompt]) => {
                const pill = document.createElement('button');
                pill.className = 'upgrade-pill';
                pill.setAttribute('data-upgrade', key);
                pill.setAttribute('data-prompt-id', prompt.id);
                pill.innerHTML = `
                    <i class="${prompt.icon}"></i>
                    <span>${prompt.name}</span>
                `;
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleUpgradePillClick(pill);
                });
                container.appendChild(pill);
            });
        });
        
        console.log(`✅ Rendered categorized upgrade pills:`, {
            exterior: promptsByCategory.exterior.length,
            extensions: promptsByCategory.extensions.length,
            interior: promptsByCategory.interior.length
        });
    }
    
    // Fallback pills if API fails
    renderFallbackPills() {
        const exteriorContainer = document.getElementById('exteriorPillsContainer');
        const extensionsContainer = document.getElementById('extensionsPillsContainer');
        const interiorContainer = document.getElementById('interiorPillsContainer');
        
        if (!exteriorContainer || !extensionsContainer || !interiorContainer) return;
        
        const fallbackPrompts = {
            exterior: [
                { key: 'stone-walkway', icon: 'fas fa-walking', name: 'Stone Walkway' },
                { key: 'black-windows', icon: 'fas fa-window-restore', name: 'Modern Black Windows' },
                { key: 'white-siding', icon: 'fas fa-home', name: 'White Vinyl Siding' }
            ],
            extensions: [
                { key: 'add-extension', icon: 'fas fa-expand-arrows-alt', name: 'Add Extension' }
            ],
            interior: [
                { key: 'modern-kitchen', icon: 'fas fa-utensils', name: 'Modern Kitchen' }
            ]
        };
        
        // Clear all containers
        exteriorContainer.innerHTML = '';
        extensionsContainer.innerHTML = '';
        interiorContainer.innerHTML = '';
        
        // Render fallback prompts by category
        Object.entries(fallbackPrompts).forEach(([category, prompts]) => {
            let container;
            switch(category) {
                case 'exterior':
                    container = exteriorContainer;
                    break;
                case 'extensions':
                    container = extensionsContainer;
                    break;
                case 'interior':
                    container = interiorContainer;
                    break;
                default:
                    return;
            }
            
            prompts.forEach(prompt => {
                const pill = document.createElement('button');
                pill.className = 'upgrade-pill';
                pill.setAttribute('data-upgrade', prompt.key);
                pill.innerHTML = `
                    <i class="${prompt.icon}"></i>
                    <span>${prompt.name}</span>
                `;
                container.appendChild(pill);
            });
        });
        
        console.log('⚠️ Using fallback upgrade pills');
    }

    // Handle upgrade pill clicks with debug information
    async handleUpgradePillClick(pillButton) {
        const upgradeType = pillButton.getAttribute('data-upgrade');
        const originalImageSrc = document.getElementById('originalImage').src;
        const currentValue = parseInt(document.getElementById('currentValue').textContent.replace(/\D/g, ''));
        
        // Store original image src for mobile view and save functionality
        CONFIG.originalImageSrc = originalImageSrc;
        
        console.log('=== UPGRADE PILL CLICKED ===');
        console.log('Upgrade type:', upgradeType);
        console.log('Original image src:', originalImageSrc);
        console.log('Current value:', currentValue);
        
        // Test if image URL is accessible
        try {
            const testResponse = await fetch(originalImageSrc, {method: 'HEAD'});
            console.log('Image accessibility test:', testResponse.status, testResponse.ok);
        } catch (error) {
            console.error('Image accessibility test failed:', error);
        }
        
        // Remove active class from all pills
        document.querySelectorAll('.upgrade-pill').forEach(pill => {
            pill.classList.remove('active');
        });
        
        // Add active class to clicked pill
        pillButton.classList.add('active');
        
        // Disable all pills during generation
        document.querySelectorAll('.upgrade-pill').forEach(pill => {
            pill.disabled = true;
        });
        
        // Disable image navigation during generation
        this.disableImageNavigation();
        
        try {
            console.log('Starting image generation process...');
            
            // Generate the upgrade image using the currently displayed modal image
            const currentImageSrc = this.getCurrentModalImage();
            console.log('🎯 Using currently displayed modal image for AI generation:', currentImageSrc);
            const generatedImageUrl = await this.generateUpgradeImage(currentImageSrc, upgradeType);
            
            if (!generatedImageUrl) {
                console.log('❌ Image generation failed - no URL returned');
                // Hide loading state on failure
                this.showGenerationLoading(false);
                // Error is already displayed by generateUpgradeImage function
                // Reset UI
                document.getElementById('mobileToggleGroup').style.display = 'none';
                document.getElementById('saveUpgrade').disabled = true;
                
                // Enable pills again
                document.querySelectorAll('.upgrade-pill').forEach(pill => {
                    pill.disabled = false;
                });
                return;
            }
            
            console.log('✅ Upgrade analysis successful, updating UI...');
            
            // Display the generated image from AWS Bedrock
            const upgradedImage = document.getElementById('upgradedImage');
            const upgradeDescriptionDiv = document.getElementById('upgradeDescription');
            
            // Store upgraded image src for mobile view and save functionality
            CONFIG.upgradedImageSrc = generatedImageUrl;
            
            // Hide text description and show image
            if (upgradeDescriptionDiv) {
                upgradeDescriptionDiv.style.display = 'none';
            }
            
            // Show the generated image
            upgradedImage.style.display = 'block';
            upgradedImage.src = generatedImageUrl;
            
            // Set a timeout to hide loading state if image doesn't load within 30 seconds
            const loadingTimeout = setTimeout(() => {
                console.log('⏰ Loading timeout reached, hiding loading state');
                this.showGenerationLoading(false);
            }, 30000);
            
            upgradedImage.onload = () => {
                console.log('✅ Generated image loaded successfully from AWS Bedrock');
                
                // Clear the timeout since image loaded successfully
                clearTimeout(loadingTimeout);
                
                // Hide loading state
                this.showGenerationLoading(false);
                
                // Hide all placeholders and get the generated image
                document.getElementById('desktopInstructionPlaceholder').style.display = 'none';
                document.getElementById('desktopMagicalLoadingCard').style.display = 'none';
                upgradedImage.style.display = 'block';
                
                // Enable mobile toggle and save button
                document.getElementById('mobileToggleGroup').style.display = 'block';
                document.getElementById('saveUpgrade').disabled = false;
                
                // Show "Generate New Image" button (navigation stays disabled)
                document.getElementById('generateNewImageBtn').style.display = 'inline-block';
                
                // Auto-switch to "after" view on mobile once image is loaded
                window.mobileView.showMobileView('after');
            };
            upgradedImage.onerror = () => {
                console.error('❌ Generated image failed to load');
                
                // Clear the timeout since we're handling the error
                clearTimeout(loadingTimeout);
                
                // Show "Generate New Image" button even on error (navigation stays disabled)
                document.getElementById('generateNewImageBtn').style.display = 'inline-block';
                
                this.showGenerationError('Generated image failed to load');
            };
            
            // Enable pills again
            document.querySelectorAll('.upgrade-pill').forEach(pill => {
                pill.disabled = false;
            });
            
            console.log('🎉 Upgrade generation completed successfully');
            
        } catch (error) {
            console.error('❌ Error handling upgrade:', error);
            console.error('Error stack:', error.stack);
            
            // Hide loading state on error
            this.showGenerationLoading(false);
            
            // Reset UI on error
            document.getElementById('mobileToggleGroup').style.display = 'none';
            document.getElementById('saveUpgrade').disabled = true;
            
            // Enable pills again
            document.querySelectorAll('.upgrade-pill').forEach(pill => {
                pill.disabled = false;
            });
            
            // Show "Generate New Image" button even on error (navigation stays disabled)
            document.getElementById('generateNewImageBtn').style.display = 'inline-block';
            
            // Show error message with more details
            const errorMessage = `${error.message || error.toString()} (Check console for full details)`;
            this.showGenerationError(errorMessage);
        }
    }

    // Handle custom upgrade text input
    async handleCustomUpgrade() {
        const customInput = document.getElementById('customUpgradeInput');
        const customText = customInput.value.trim();
        
        if (!customText) {
            alert('Please enter a description of your custom upgrade.');
            return;
        }
        
        const originalImageSrc = document.getElementById('originalImage').src;
        const currentValue = parseInt(document.getElementById('currentValue').textContent.replace(/\D/g, ''));
        
        // Store original image src for mobile view and save functionality
        CONFIG.originalImageSrc = originalImageSrc;
        
        console.log('=== CUSTOM UPGRADE REQUESTED ===');
        console.log('Custom text:', customText);
        console.log('Original image src:', originalImageSrc);
        console.log('Current value:', currentValue);
        
        // Disable custom input and button during generation
        customInput.disabled = true;
        document.getElementById('customUpgradeBtn').disabled = true;
        
        // Disable all pills during generation
        document.querySelectorAll('.upgrade-pill').forEach(pill => {
            pill.disabled = true;
        });
        
        // Disable image navigation during generation
        this.disableImageNavigation();
        
        try {
            console.log('Starting custom upgrade generation...');
            
            // Generate the upgrade image using the currently displayed modal image
            const currentImageSrc = this.getCurrentModalImage();
            console.log('🎯 Using currently displayed modal image for custom AI generation:', currentImageSrc);
            const generatedImageUrl = await this.generateCustomUpgradeImage(currentImageSrc, customText);
            
            if (!generatedImageUrl) {
                console.log('❌ Custom upgrade generation failed - no URL returned');
                // Hide loading state on failure
                this.showGenerationLoading(false);
                // Reset UI
                document.getElementById('mobileToggleGroup').style.display = 'none';
                document.getElementById('saveUpgrade').disabled = true;
                
                // Enable inputs again
                customInput.disabled = false;
                document.getElementById('customUpgradeBtn').disabled = false;
                document.querySelectorAll('.upgrade-pill').forEach(pill => {
                    pill.disabled = false;
                });
                return;
            }
            
            console.log('✅ Custom upgrade successful, updating UI...');
            
            // Display the generated image
            const upgradedImage = document.getElementById('upgradedImage');
            const upgradeDescriptionDiv = document.getElementById('upgradeDescription');
            
            // Store upgraded image src for mobile view and save functionality
            CONFIG.upgradedImageSrc = generatedImageUrl;
            
            // Hide text description and show image
            if (upgradeDescriptionDiv) {
                upgradeDescriptionDiv.style.display = 'none';
            }
            
            // Show the generated image
            upgradedImage.style.display = 'block';
            upgradedImage.src = generatedImageUrl;
            
            // Set a timeout to hide loading state if image doesn't load within 30 seconds
            const customLoadingTimeout = setTimeout(() => {
                console.log('⏰ Custom loading timeout reached, hiding loading state');
                this.showGenerationLoading(false);
            }, 30000);
            
            upgradedImage.onload = () => {
                console.log('✅ Custom upgrade image loaded successfully');
                
                // Clear the timeout since image loaded successfully
                clearTimeout(customLoadingTimeout);
                
                // Hide loading state
                this.showGenerationLoading(false);
                
                // Hide all placeholders and show the generated image
                document.getElementById('desktopInstructionPlaceholder').style.display = 'none';
                document.getElementById('desktopMagicalLoadingCard').style.display = 'none';
                upgradedImage.style.display = 'block';
                
                // Enable mobile toggle and save button
                document.getElementById('mobileToggleGroup').style.display = 'block';
                document.getElementById('saveUpgrade').disabled = false;
                
                // Show "Generate New Image" button (navigation stays disabled)
                document.getElementById('generateNewImageBtn').style.display = 'inline-block';
                
                // Auto-switch to "after" view on mobile once image is loaded
                window.mobileView.showMobileView('after');
            };
            upgradedImage.onerror = () => {
                console.error('❌ Custom upgrade image failed to load');
                
                // Clear the timeout since we're handling the error
                clearTimeout(customLoadingTimeout);
                
                // Show "Generate New Image" button even on error (navigation stays disabled)
                document.getElementById('generateNewImageBtn').style.display = 'inline-block';
                
                this.showGenerationError('Custom upgrade image failed to load');
            };
            
            // Enable inputs again
            customInput.disabled = false;
            document.getElementById('customUpgradeBtn').disabled = false;
            document.querySelectorAll('.upgrade-pill').forEach(pill => {
                pill.disabled = false;
            });
            
            console.log('🎉 Custom upgrade generation completed successfully');
            
        } catch (error) {
            console.error('❌ Error handling custom upgrade:', error);
            console.error('Error stack:', error.stack);
            
            // Hide loading state on error
            this.showGenerationLoading(false);
            
            // Reset UI on error
            document.getElementById('mobileToggleGroup').style.display = 'none';
            document.getElementById('saveUpgrade').disabled = true;
            
            // Enable inputs again
            customInput.disabled = false;
            document.getElementById('customUpgradeBtn').disabled = false;
            document.querySelectorAll('.upgrade-pill').forEach(pill => {
                pill.disabled = false;
            });
            
            // Show "Generate New Image" button even on error (navigation stays disabled)
            document.getElementById('generateNewImageBtn').style.display = 'inline-block';
            
            // Show error message with more details
            const errorMessage = `${error.message || error.toString()} (Check console for full details)`;
            this.showGenerationError(errorMessage);
        }
    }

    // Generate upgrade image using AWS Bedrock
    async generateUpgradeImage(originalImageUrl, upgradeType) {
        const cacheKey = `${originalImageUrl}_${upgradeType}`;
        
        // Check cache first
        if (CONFIG.generatedImageCache.has(cacheKey)) {
            console.log('Using cached generated image');
            return CONFIG.generatedImageCache.get(cacheKey);
        }
        
        try {
            console.log('Generating upgrade image with AWS Bedrock for:', upgradeType);
            
            // Show loading state
            this.showGenerationLoading(true);
            this.resetGenerationLoading();
            
            // Convert original image to base64
            const base64Image = await window.imageHandler.imageUrlToBase64(originalImageUrl);
            console.log('Image converted to base64, length:', base64Image.length);
            
            // Make request to our server's Bedrock endpoint
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/generate-upgrade-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base64Image: base64Image,
                    upgradeType: upgradeType
                })
            });
            
            console.log('Bedrock response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Bedrock API Error:', response.status, errorData);
                throw new Error(`Bedrock API request failed: ${response.status} - ${errorData}`);
            }
            
            const result = await response.json();
            console.log('Bedrock API Response:', result);
            
            if (result.success && result.imageUrl) {
                console.log('✅ Image generated successfully with AWS Bedrock');
                
                // Cache the result
                CONFIG.generatedImageCache.set(cacheKey, result.imageUrl);
                
                return result.imageUrl;
            } else {
                throw new Error(result.error || 'No image data in Bedrock response');
            }
            
        } catch (error) {
            console.error('Error generating upgrade image with Bedrock:', error);
            const errorMessage = error.message || error.toString();
            this.showGenerationError(errorMessage);
            
            // Don't re-throw, just show error in UI
            console.log('Showing error in UI instead of throwing');
            return null;
        }
    }

    // Generate custom upgrade image using AWS Bedrock
    async generateCustomUpgradeImage(originalImageUrl, customText) {
        const cacheKey = `custom_${originalImageUrl}_${customText}`;
        
        // Check cache first
        if (CONFIG.generatedImageCache.has(cacheKey)) {
            console.log('Using cached custom generated image');
            return CONFIG.generatedImageCache.get(cacheKey);
        }
        
        try {
            console.log('Generating custom upgrade image with AWS Bedrock for:', customText);
            
            // Show loading state
            this.showGenerationLoading(true);
            this.resetGenerationLoading();
            
            // Convert original image to base64
            const base64Image = await window.imageHandler.imageUrlToBase64(originalImageUrl);
            console.log('Image converted to base64, length:', base64Image.length);
            
            // Make request to our server's custom upgrade endpoint
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/generate-custom-upgrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base64Image: base64Image,
                    customText: customText
                })
            });
            
            console.log('Custom upgrade response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Custom upgrade API Error:', response.status, errorData);
                throw new Error(`Custom upgrade API request failed: ${response.status} - ${errorData}`);
            }
            
            const result = await response.json();
            console.log('Custom upgrade API Response:', result);
            
            if (result.success && result.imageUrl) {
                console.log('✅ Custom upgrade image generated successfully');
                
                // Cache the result
                CONFIG.generatedImageCache.set(cacheKey, result.imageUrl);
                
                return result.imageUrl;
            } else {
                throw new Error(result.error || 'No image data in custom upgrade response');
            }
            
        } catch (error) {
            console.error('Error generating custom upgrade image:', error);
            const errorMessage = error.message || error.toString();
            this.showGenerationError(errorMessage);
            
            // Don't re-throw, just show error in UI
            console.log('Showing error in UI instead of throwing');
            return null;
        }
    }

    // Get the currently displayed image in the modal
    getCurrentModalImage() {
        const modalImg = document.getElementById('originalImage');
        if (modalImg && modalImg.src) {
            console.log('📷 Current modal image URL:', modalImg.src);
            return modalImg.src;
        }
        
        // Fallback to stored original image
        const fallback = CONFIG.originalImageSrc;
        console.log('📷 Fallback image URL:', fallback);
        return fallback;
    }

    // Reset modal for new generation (called by "Generate New Image" button)
    resetModalForNewGeneration() {
        console.log('🔄 Modal reset for new generation');
        
        // Re-enable image navigation
        this.enableImageNavigation();
        
        // Hide the "Generate New Image" button
        document.getElementById('generateNewImageBtn').style.display = 'none';
        
        // Reset desktop view to instruction placeholder
        if (window.innerWidth >= 768) {
            document.getElementById('desktopInstructionPlaceholder').style.display = 'flex';
            document.getElementById('desktopMagicalLoadingCard').style.display = 'none';
        }
        
        // Hide upgraded image
        const upgradedImage = document.getElementById('upgradedImage');
        upgradedImage.style.display = 'none';
        upgradedImage.src = '';
        
        // Hide mobile toggle group and save button
        document.getElementById('mobileToggleGroup').style.display = 'none';
        document.getElementById('saveUpgrade').disabled = true;
        
        // Reset upgrade pills (enable all, remove active state)
        document.querySelectorAll('.upgrade-pill').forEach(pill => {
            pill.classList.remove('active');
            pill.disabled = false;
        });
        
        // Reset custom input
        const customInput = document.getElementById('customUpgradeInput');
        const customBtn = document.getElementById('customUpgradeBtn');
        if (customInput) {
            customInput.value = '';
            customInput.disabled = false;
        }
        if (customBtn) {
            customBtn.disabled = false;
        }
        
        // Reset mobile view
        window.mobileView.showMobileView('before');
        
        console.log('✅ Modal reset complete - ready for new generation');
    }

    // Show/hide generation loading state
    showGenerationLoading(show) {
        const loadingDiv = document.getElementById('generationLoading');
        const upgradedImage = document.getElementById('upgradedImage');
        const desktopInstructionPlaceholder = document.getElementById('desktopInstructionPlaceholder');
        const desktopMagicalLoadingCard = document.getElementById('desktopMagicalLoadingCard');
        const mobileMagicalLoading = document.getElementById('mobileMagicalLoading');
        
        if (show) {
            // Hide old loading and upgraded image
            loadingDiv.style.display = 'none';
            upgradedImage.style.display = 'none';
            
            // Show magical loading for desktop (only on desktop)
            if (window.innerWidth >= 768) {
                // Hide instruction placeholder completely
                desktopInstructionPlaceholder.style.display = 'none';
                
                // Show loading card with absolute positioning overlay
                desktopMagicalLoadingCard.style.display = 'flex';
            }
            
            // Show magical loading for mobile overlay (only on mobile)
            if (window.innerWidth < 768) {
                mobileMagicalLoading.style.display = 'flex';
                mobileMagicalLoading.style.flexDirection = 'column';
                mobileMagicalLoading.style.alignItems = 'center';
                mobileMagicalLoading.style.justifyContent = 'center';
            }
            
            // Hide mobile toggle group while loading
            document.getElementById('mobileToggleGroup').style.display = 'none';
        } else {
            // Hide all loading states
            loadingDiv.style.display = 'none';
            desktopMagicalLoadingCard.style.display = 'none';
            mobileMagicalLoading.style.display = 'none';
        }
    }

    // Disable image navigation during generation (modal-only)
    disableImageNavigation() {
        // Hide only MODAL image navigation arrows
        document.querySelectorAll('#upgradeModal .image-nav-arrow').forEach(arrow => {
            arrow.style.display = 'none';
        });
        
        // Hide only MODAL image counters
        document.querySelectorAll('#upgradeModal .image-counter').forEach(counter => {
            counter.style.display = 'none';
        });
        
        // Disable MODAL swipe areas
        document.querySelectorAll('#upgradeModal .swipe-area').forEach(swipeArea => {
            swipeArea.style.pointerEvents = 'none';
            swipeArea.style.cursor = 'notAllowed';
        });
        
        // Disable keyboard navigation
        document.removeEventListener('keydown', window.imageHandler.handleKeyboardNavigation);
        
        console.log('🔒 Modal image navigation hidden during generation');
    }
    
    // Re-enable image navigation after generation (modal-only)
    enableImageNavigation() {
        // Show only MODAL image navigation arrows
        document.querySelectorAll('#upgradeModal .image-nav-arrow').forEach(arrow => {
            arrow.style.display = 'flex';
            arrow.style.pointerEvents = 'auto';
            arrow.style.opacity = '';
            arrow.style.cursor = '';
        });
        
        // Show only MODAL image counters
        document.querySelectorAll('#upgradeModal .image-counter').forEach(counter => {
            counter.style.display = 'block';
        });
        
        // Re-enable only MODAL swipe areas
        document.querySelectorAll('#upgradeModal .swipe-area').forEach(swipeArea => {
            swipeArea.style.pointerEvents = 'auto';
            swipeArea.style.cursor = '';
        });
        
        // Re-enable keyboard navigation
        document.addEventListener('keydown', window.imageHandler.handleKeyboardNavigation);
        
        console.log('🔓 Modal image navigation re-enabled');
    }

    // Show generation error with specific message
    showGenerationError(errorMessage = 'Unknown error occurred') {
        const loadingDiv = document.getElementById('generationLoading');
        
        loadingDiv.innerHTML = `
            <div class="text-danger text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <p class="mb-0"><strong>Failed to generate upgrade image</strong></p>
                <small class="text-muted">Error: ${errorMessage}</small>
                <br><small class="text-muted mt-2 d-block">Check browser console for more details</small>
            </div>
        `;
    }
    
    // Reset loading state
    resetGenerationLoading() {
        const loadingDiv = document.getElementById('generationLoading');
        
        loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Generating upgrade...</span>
            </div>
            <p class="mt-2 text-muted">AI is imagining your upgrade...</p>
        `;
    }
}

// Create and export upgrade UI instance
window.upgradeUI = new UpgradeUI();
