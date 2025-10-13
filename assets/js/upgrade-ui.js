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
        logger.log('🎨 Rendering upgrade pills from config...');
        logger.log('📋 CONFIG.promptsConfig:', CONFIG.promptsConfig);
        
        if (!CONFIG.promptsConfig) {
            logger.log('❌ No prompts config available, using fallback');
            this.renderFallbackPills();
            return;
        }
        
        // Get category containers
        const smartContainer = document.getElementById('smartPillsContainer');
        const exteriorContainer = document.getElementById('exteriorPillsContainer');
        const extensionsContainer = document.getElementById('extensionsPillsContainer');
        const interiorContainer = document.getElementById('interiorPillsContainer');
        
        if (!smartContainer || !exteriorContainer || !extensionsContainer || !interiorContainer) return;
        
        // Clear all containers
        smartContainer.innerHTML = '';
        exteriorContainer.innerHTML = '';
        extensionsContainer.innerHTML = '';
        interiorContainer.innerHTML = '';
        
        // Group prompts by category
        const promptsByCategory = {
            smart: [],
            exterior: [],
            extensions: [],
            interior: []
        };
        
        Object.entries(CONFIG.promptsConfig.prompts).forEach(([key, prompt]) => {
            logger.log(`📋 Processing prompt: ${key} -> category: ${prompt.category}`);
            if (promptsByCategory[prompt.category]) {
                promptsByCategory[prompt.category].push([key, prompt]);
                logger.log(`✅ Added ${key} to ${prompt.category} category`);
            } else {
                logger.log(`❌ Unknown category: ${prompt.category} for prompt: ${key}`);
            }
        });
        
        // Sort each category by priority
        Object.keys(promptsByCategory).forEach(category => {
            promptsByCategory[category].sort(([,a], [,b]) => a.priority - b.priority);
        });
        
        // Render each category
        Object.entries(promptsByCategory).forEach(([category, prompts]) => {
            logger.log(`🎯 Rendering category: ${category} with ${prompts.length} prompts`);
            let container;
            switch(category) {
                case 'smart':
                    container = smartContainer;
                    break;
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
                    logger.log(`⚠️ Unknown category: ${category}`);
                    return;
            }
            
            if (!container) {
                console.error(`❌ No container found for category: ${category}`);
                return;
            }
            
            if (prompts.length === 0) {
                logger.log(`📭 Category ${category} is empty, showing placeholder`);
                container.innerHTML = '<div class="text-center text-muted py-3">No upgrades available in this category</div>';
                return;
            }
            
            prompts.forEach(([key, prompt]) => {
                const pill = document.createElement('button');
                pill.className = 'upgrade-pill';
                
                // Add special styling for smart upgrades
                if (category === 'smart') {
                    pill.style.background = 'linear-gradient(135deg, #00bcf2 0%, #667eea 100%)';
                    pill.style.color = 'white';
                    pill.style.fontWeight = '600';
                    pill.style.boxShadow = '0 4px 15px rgba(0, 188, 242, 0.3)';
                }
                
                pill.setAttribute('data-upgrade', key);
                pill.setAttribute('data-prompt-id', prompt.id);
                pill.innerHTML = `
                    <i class="${prompt.icon}"></i>
                    <span>${prompt.name}</span>
                `;
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    logger.log('🔘 Pill clicked:', pill.getAttribute('data-upgrade'));
                    window.upgradeUI.handleUpgradePillClick(pill);
                });
                container.appendChild(pill);
            });
        });
        
        logger.log(`✅ Rendered categorized upgrade pills:`, {
            smart: promptsByCategory.smart.length,
            exterior: promptsByCategory.exterior.length,
            extensions: promptsByCategory.extensions.length,
            interior: promptsByCategory.interior.length
        });
    }
    
    // Fallback pills if API fails
    renderFallbackPills() {
        logger.log('🔧 Rendering fallback pills...');
        const smartContainer = document.getElementById('smartPillsContainer');
        const exteriorContainer = document.getElementById('exteriorPillsContainer');
        const extensionsContainer = document.getElementById('extensionsPillsContainer');
        const interiorContainer = document.getElementById('interiorPillsContainer');
        
        logger.log('📦 Container check:', {
            smart: !!smartContainer,
            exterior: !!exteriorContainer,
            extensions: !!extensionsContainer,
            interior: !!interiorContainer
        });
        
        if (!smartContainer || !exteriorContainer || !extensionsContainer || !interiorContainer) {
            console.error('❌ Missing containers for fallback pills');
            return;
        }
        
        const fallbackPrompts = {
            smart: [
                { key: 'instant-upgrade', icon: 'fas fa-magic', name: 'Instant Upgrade', isSmart: true }
            ],
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
        smartContainer.innerHTML = '';
        exteriorContainer.innerHTML = '';
        extensionsContainer.innerHTML = '';
        interiorContainer.innerHTML = '';
        
        // Render fallback prompts by category
        Object.entries(fallbackPrompts).forEach(([category, prompts]) => {
            let container;
            switch(category) {
                case 'smart':
                    container = smartContainer;
                    break;
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
                
                // Add special styling for smart upgrades
                if (prompt.isSmart) {
                    pill.style.background = 'linear-gradient(135deg, #00bcf2 0%, #667eea 100%)';
                    pill.style.color = 'white';
                    pill.style.fontWeight = '600';
                    pill.style.boxShadow = '0 4px 15px rgba(0, 188, 242, 0.3)';
                }
                
                pill.setAttribute('data-upgrade', prompt.key);
                pill.innerHTML = `
                    <i class="${prompt.icon}"></i>
                    <span>${prompt.name}</span>
                `;
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    logger.log('🔘 Fallback pill clicked:', pill.getAttribute('data-upgrade'));
                    window.upgradeUI.handleUpgradePillClick(pill);
                });
                container.appendChild(pill);
            });
        });
        
        logger.log('⚠️ Using fallback upgrade pills (including Instant Upgrade)');
    }

    // Handle upgrade pill clicks with debug information
    async handleUpgradePillClick(pillButton) {
        const upgradeType = pillButton.getAttribute('data-upgrade');
        const originalImageSrc = document.getElementById('originalImage').src;
        const currentValue = parseInt(document.getElementById('currentValue').textContent.replace(/\D/g, ''));
        
        // Store original image src for mobile view and save functionality
        CONFIG.originalImageSrc = originalImageSrc;
        
        logger.log('=== UPGRADE PILL CLICKED ===');
        logger.log('Upgrade type:', upgradeType);
        logger.log('Original image src:', originalImageSrc);
        logger.log('Current value:', currentValue);
        
        // Test if image URL is accessible
        try {
            const testResponse = await fetch(originalImageSrc, {method: 'HEAD'});
            logger.log('Image accessibility test:', testResponse.status, testResponse.ok);
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
            logger.log('Starting image generation process...');
            
            // Generate the upgrade image using the currently displayed modal image
            const currentImageSrc = this.getCurrentModalImage();
            logger.log('🎯 Using currently displayed modal image for AI generation:', currentImageSrc);
            const generatedImageUrl = await this.generateUpgradeImage(currentImageSrc, upgradeType);
            
            if (!generatedImageUrl) {
                logger.log('❌ Image generation failed - no URL returned');
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
            
            logger.log('✅ Upgrade analysis successful, updating UI...');
            
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
                logger.log('⏰ Loading timeout reached, hiding loading state');
                this.showGenerationLoading(false);
            }, 30000);
            
            upgradedImage.onload = () => {
                logger.log('✅ Generated image loaded successfully');
                
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
                
                // Also update mobile image to show the generated image
                const mobileImage = document.getElementById('mobileImage');
                if (mobileImage) {
                    mobileImage.src = generatedImageUrl;
                }
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
            
            logger.log('🎉 Upgrade generation completed successfully');
            
            // Show success message with view options
            this.showGenerationSuccess(upgradeType, generatedImageUrl);
            
            // Automatically save the generated image to Supabase
            await this.saveGeneratedImageToSupabase(upgradeType, generatedImageUrl);
            
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
        
        logger.log('=== CUSTOM UPGRADE REQUESTED ===');
        logger.log('Custom text:', customText);
        logger.log('Original image src:', originalImageSrc);
        logger.log('Current value:', currentValue);
        
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
            logger.log('Starting custom upgrade generation...');
            
            // Generate the upgrade image using the currently displayed modal image
            const currentImageSrc = this.getCurrentModalImage();
            logger.log('🎯 Using currently displayed modal image for custom AI generation:', currentImageSrc);
            const generatedImageUrl = await this.generateCustomUpgradeImage(currentImageSrc, customText);
            
            if (!generatedImageUrl) {
                logger.log('❌ Custom upgrade generation failed - no URL returned');
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
            
            logger.log('✅ Custom upgrade successful, updating UI...');
            
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
                logger.log('⏰ Custom loading timeout reached, hiding loading state');
                this.showGenerationLoading(false);
            }, 30000);
            
            upgradedImage.onload = () => {
                logger.log('✅ Custom upgrade image loaded successfully');
                
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
            
            logger.log('🎉 Custom upgrade generation completed successfully');
            
            // Show success message with view options
            this.showGenerationSuccess('custom-upgrade', generatedImageUrl, customText);
            
            // Automatically save the generated image to Supabase
            await this.saveGeneratedImageToSupabase('custom-upgrade', generatedImageUrl, customText);
            
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
            logger.log('Using cached generated image');
            return CONFIG.generatedImageCache.get(cacheKey);
        }
        
        try {
            logger.log('Generating upgrade image with AWS Bedrock for:', upgradeType);
            
            // Show loading state
            this.showGenerationLoading(true);
            this.resetGenerationLoading();
            
            // Convert original image to base64
            const base64Image = await window.imageHandler.imageUrlToBase64(originalImageUrl);
            logger.log('Image converted to base64, length:', base64Image.length);
            
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
            
            logger.log('Bedrock response status:', response.status);
            
            if (!response.ok) {
                // Handle rate limiting
                if (response.status === 429) {
                    const errorData = await response.json();
                    const message = errorData.message || 'Rate limit reached. Please try again later.';
                    const retryAfter = errorData.retryAfter || 'some time';
                    throw new Error(`⏱️ ${message} (Retry after: ${retryAfter})`);
                }
                
                const errorData = await response.text();
                console.error('Bedrock API Error:', response.status, errorData);
                throw new Error(`Bedrock API request failed: ${response.status} - ${errorData}`);
            }
            
            const result = await response.json();
            logger.log('Bedrock API Response:', result);
            
            if (result.success && result.imageUrl) {
                logger.log('✅ Image generated successfully with AWS Bedrock');
                
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
            logger.log('Showing error in UI instead of throwing');
            return null;
        }
    }

    // Generate custom upgrade image using AWS Bedrock
    async generateCustomUpgradeImage(originalImageUrl, customText) {
        const cacheKey = `custom_${originalImageUrl}_${customText}`;
        
        // Check cache first
        if (CONFIG.generatedImageCache.has(cacheKey)) {
            logger.log('Using cached custom generated image');
            return CONFIG.generatedImageCache.get(cacheKey);
        }
        
        try {
            logger.log('Generating custom upgrade image with AWS Bedrock for:', customText);
            
            // Show loading state
            this.showGenerationLoading(true);
            this.resetGenerationLoading();
            
            // Convert original image to base64
            const base64Image = await window.imageHandler.imageUrlToBase64(originalImageUrl);
            logger.log('Image converted to base64, length:', base64Image.length);
            
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
            
            logger.log('Custom upgrade response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('Custom upgrade API Error:', response.status, errorData);
                throw new Error(`Custom upgrade API request failed: ${response.status} - ${errorData}`);
            }
            
            const result = await response.json();
            logger.log('Custom upgrade API Response:', result);
            
            if (result.success && result.imageUrl) {
                logger.log('✅ Custom upgrade image generated successfully');
                
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
            logger.log('Showing error in UI instead of throwing');
            return null;
        }
    }

    // Get the currently displayed image in the modal
    getCurrentModalImage() {
        const modalImg = document.getElementById('originalImage');
        if (modalImg && modalImg.src) {
            logger.log('📷 Current modal image URL:', modalImg.src);
            return modalImg.src;
        }
        
        // Fallback to stored original image
        const fallback = CONFIG.originalImageSrc;
        logger.log('📷 Fallback image URL:', fallback);
        return fallback;
    }

    // Reset modal for new generation (called by "Generate New Image" button)
    resetModalForNewGeneration() {
        logger.log('🔄 Modal reset for new generation');
        
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
        
        logger.log('✅ Modal reset complete - ready for new generation');
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
        
        logger.log('🔒 Modal image navigation hidden during generation');
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
        
        logger.log('🔓 Modal image navigation re-enabled');
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

    // Save generated image to Supabase
    async saveGeneratedImageToSupabase(upgradeType, generatedImageUrl, customText = null) {
        try {
            logger.log('💾 Saving generated image to Supabase...');
            
            // Check if user is authenticated
            if (!window.supabaseAuth || !window.supabaseAuth.isAuthenticated()) {
                logger.log('⚠️ User not authenticated, skipping save');
                return;
            }

            // Get property information from stored data
            let propertyData = CONFIG.currentPropertyData || this.getPropertyDataFromModal();
            
            // Try to fetch detailed property information from Realtor16 API
            try {
                const propertyId = propertyData?.id;
                if (propertyId) {
                    logger.log('🔍 Fetching detailed property data for:', propertyId);
                    const detailedData = await this.fetchPropertyDetails(propertyId);
                    if (detailedData) {
                        propertyData = detailedData;
                        logger.log('✅ Got detailed property data:', detailedData);
                    }
                }
            } catch (error) {
                logger.warn('⚠️ Failed to fetch detailed property data, using stored data:', error);
                // Continue with stored data as fallback
            }
            
            // Get the upgrade name/prompt
            let upgradeName = upgradeType;
            if (upgradeType === 'custom-upgrade' && customText) {
                upgradeName = customText;
            } else if (CONFIG.promptsConfig && CONFIG.promptsConfig.prompts[upgradeType]) {
                upgradeName = CONFIG.promptsConfig.prompts[upgradeType].name;
            }

            // Prepare image data
            const imageData = {
                originalUrl: CONFIG.originalImageSrc,
                generatedUrl: generatedImageUrl,
                prompt: customText || upgradeName,
                upgradeType: upgradeName,
                propertyAddress: propertyData.address,
                propertyPrice: propertyData.price,
                propertyBedrooms: propertyData.bedrooms,
                propertyBathrooms: propertyData.bathrooms,
                propertySqft: propertyData.sqft
            };

            logger.log('📊 Image data to save:', imageData);

            // Save to Supabase
            const savedImage = await window.supabaseAuth.saveGeneratedImage(imageData);
            
            if (savedImage) {
                logger.log('✅ Image saved successfully to Supabase:', savedImage);
                
                // Show success notification
                this.showSaveNotification('Image saved to My Images!');
            } else {
                console.error('❌ Failed to save image to Supabase');
                this.showSaveNotification('Failed to save image', 'error');
            }

        } catch (error) {
            console.error('❌ Error saving image to Supabase:', error);
            this.showSaveNotification('Failed to save image', 'error');
        }
    }

    // Get property data from modal
    getPropertyDataFromModal() {
        const modal = document.getElementById('upgradeModal');
        const card = modal.querySelector('.card');
        
        if (!card) {
            return {
                address: 'Property Address',
                price: 0,
                bedrooms: 0,
                bathrooms: 0,
                sqft: 0
            };
        }

        // Extract property information from the modal
        const address = card.querySelector('.card-title')?.textContent || 'Property Address';
        const priceText = card.querySelector('.card-text strong')?.textContent || '$0';
        const price = parseInt(priceText.replace(/\D/g, '')) || 0;
        
        // Try to extract bedrooms, bathrooms, and sqft from card text
        const cardText = card.querySelector('.card-text')?.textContent || '';
        const bedroomMatch = cardText.match(/(\d+)\s*bed/i);
        const bathroomMatch = cardText.match(/(\d+)\s*bath/i);
        const sqftMatch = cardText.match(/([\d,]+)\s*sqft/i);
        
        return {
            address: address,
            price: price,
            bedrooms: bedroomMatch ? parseInt(bedroomMatch[1]) : 0,
            bathrooms: bathroomMatch ? parseInt(bathroomMatch[1]) : 0,
            sqft: sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, '')) : 0
        };
    }

    // Show generation success with view options
    showGenerationSuccess(upgradeType, generatedImageUrl, customText = null) {
        // Get upgrade name
        let upgradeName = upgradeType;
        if (upgradeType === 'custom-upgrade' && customText) {
            upgradeName = customText;
        } else if (CONFIG.promptsConfig && CONFIG.promptsConfig.prompts[upgradeType]) {
            upgradeName = CONFIG.promptsConfig.prompts[upgradeType].name;
        }

        // Create success notification with action buttons
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <i class="fas fa-check-circle me-2 text-success"></i>
                <strong>${upgradeName} Generated Successfully!</strong>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary" onclick="viewGeneratedImage('${generatedImageUrl}', '${upgradeName}')">
                    <i class="fas fa-eye me-1"></i>View Image
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="window.open('my-images.html', '_blank')">
                    <i class="fas fa-images me-1"></i>My Images
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds (longer for success)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Show save notification
    showSaveNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Fetch detailed property information from Realtor16 API
    async fetchPropertyDetails(propertyId) {
        try {
            // Use the stored property data
            const propertyData = CONFIG.currentPropertyData;
            if (!propertyData) {
                throw new Error('No current property data available');
            }
            
            // Use the stored href or construct from property ID
            const propertyUrl = propertyData.href || `https://www.realtor.com/realestateandhomes-detail/${propertyId}`;
            
            logger.log('🔍 Fetching property details from:', propertyUrl);
            
            // Make request to Realtor16 property details API
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/realtor/property-details?url=${encodeURIComponent(propertyUrl)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.data) {
                throw new Error('No property data in response');
            }
            
            const property = data.data;
            
            // Extract address components
            const addressLine = property.location?.address?.line || '';
            const city = property.location?.address?.city || '';
            const state = property.location?.address?.state_code || '';
            const zip = property.location?.address?.postal_code || '';
            
            // Construct full address
            let fullAddress = '';
            if (addressLine) {
                fullAddress = `${addressLine}, ${city}, ${state} ${zip}`.trim();
            } else {
                fullAddress = `${city}, ${state} ${zip}`.trim();
            }
            
            // Extract property details
            const bedrooms = property.description?.beds || 0;
            const bathrooms = property.description?.baths || 0;
            const sqft = property.description?.sqft || 0;
            const price = property.list_price || 0;
            
            logger.log('🏠 Extracted property details:', {
                fullAddress,
                bedrooms,
                bathrooms,
                sqft,
                price
            });
            
            return {
                id: propertyId,
                address: fullAddress,
                price: price,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                sqft: sqft,
                href: propertyData.href
            };
            
        } catch (error) {
            console.error('❌ Error fetching property details:', error);
            throw error;
        }
    }
}

// Create and export upgrade UI instance
window.upgradeUI = new UpgradeUI();
