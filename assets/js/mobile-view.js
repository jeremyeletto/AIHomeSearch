// Mobile view and modal functionality
class MobileView {
    constructor() {
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        const upgradeModal = document.getElementById('upgradeModal');
        if (upgradeModal) {
            upgradeModal.addEventListener('show.bs.modal', this.handleModalOpen.bind(this));
        }
    }

    // Mobile view toggle functionality
    showMobileView(view) {
        CONFIG.currentMobileView = view;
        const mobileImage = document.getElementById('mobileImage');
        const beforeBtn = document.getElementById('beforeBtn');
        const afterBtn = document.getElementById('afterBtn');
        
        if (view === 'before') {
            mobileImage.src = CONFIG.originalImageSrc;
            beforeBtn.classList.add('active');
            afterBtn.classList.remove('active');
        } else {
            mobileImage.src = CONFIG.upgradedImageSrc;
            afterBtn.classList.add('active');
            beforeBtn.classList.remove('active');
        }
    }

    // Handle modal opening
    handleModalOpen(event) {
        const button = event.relatedTarget;
        const card = button.closest('.card');
        
        // Get the current image index from the card (which image is currently displayed)
        const currentImageIndex = window.imageHandler.getCurrentImageIndex(card);
        const currentValue = button.getAttribute('data-current-value');
        const images = JSON.parse(button.getAttribute('data-images') || '[]');
        const imageCount = parseInt(button.getAttribute('data-image-count') || images.length || 1);
        
        // Use the currently displayed image instead of always the first image
        const originalImage = images[currentImageIndex] || images[0] || button.getAttribute('data-original-image');
        
        console.log(`📸 Modal opening with current image ${currentImageIndex + 1}/${imageCount} for property`);
        
        // Trigger lazy loading when modal opens
        const homeId = card.getAttribute('data-home-id');
        const home = CONFIG.homesList.find(h => h.id == homeId);
        if (home && !home.lazyLoaded) {
            console.log('📸 Modal opened, triggering lazy load...');
            window.imageHandler.lazyLoadImagesForCard(card, home);
        }
        
        // If this property doesn't have high-quality images yet, try to retry
        if (home && home.hasHighQualityPhotos && (!home.lazyLoaded || home.rateLimited)) {
            console.log('🔄 Property needs high-quality images, triggering retry...');
            setTimeout(async () => {
                await window.apiHandler.retryFailedHighQualityImages([home]);
            }, 1000); // Small delay to let lazy load complete first
        }
        
        // Set original image and current value
        document.getElementById('originalImage').src = originalImage;
        document.getElementById('currentValue').textContent = `$${parseInt(currentValue).toLocaleString()}`;
        
        // Store original image for mobile view and save functionality
        CONFIG.originalImageSrc = originalImage;
        
        // Initialize global modal context for AI generation
        window.currentModalImageSrc = originalImage;
        
        // Set up image navigation and swipe functionality for modal
        const swipeArea = document.getElementById('originalImageSwipe');
        const counterContainer = document.getElementById('originalImageCounter');
        
        if (counterContainer) {
            counterContainer.textContent = `${currentImageIndex + 1} of ${imageCount}`;
            counterContainer.setAttribute('data-image-index', currentImageIndex);
            counterContainer.setAttribute('data-total', imageCount);
        }
        
        if (swipeArea && images.length > 1) {
            swipeArea.setAttribute('data-image-index', currentImageIndex);
            this.setupModalSwipe(swipeArea, images, 'switchModalImage');
        }
        
        // Show/hide modal navigation arrows based on number of images
        const modalArrows = document.querySelectorAll('#upgradeModal .image-nav-arrow');
        modalArrows.forEach(arrow => {
            arrow.style.display = images.length > 1 ? 'flex' : 'none';
        });
        
        // Set up mobile image navigation
        const mobileImage = document.getElementById('mobileImage');
        const mobileSwipeArea = document.getElementById('mobileImageSwipe');
        const mobileCounter = document.getElementById('mobileImageCounter');
        
        if (mobileImage) {
            mobileImage.src = originalImage;
        }
        
        if (mobileCounter) {
            mobileCounter.textContent = `${currentImageIndex + 1} of ${imageCount}`;
            mobileCounter.setAttribute('data-image-index', currentImageIndex);
            mobileCounter.setAttribute('data-total', imageCount);
        }
        
        if (mobileSwipeArea && images.length > 1) {
            mobileSwipeArea.setAttribute('data-image-index', currentImageIndex);
            this.setupModalSwipe(mobileSwipeArea, images, 'switchMobileImage');
        }
        
        // Reset upgraded image and controls
        const upgradedImage = document.getElementById('upgradedImage');
        const desktopInstructionPlaceholder = document.getElementById('desktopInstructionPlaceholder');
        const desktopMagicalLoadingCard = document.getElementById('desktopMagicalLoadingCard');
        
        upgradedImage.style.display = 'none';
        upgradedImage.src = '';
        
        // Show instruction placeholder by default (only on desktop)
        if (window.innerWidth >= 768) {
            desktopInstructionPlaceholder.style.display = 'flex';
            desktopMagicalLoadingCard.style.display = 'none';
        }
        
        // Reset upgrade state
        
        // Hide controls until upgrade is selected
        document.getElementById('mobileToggleGroup').style.display = 'none';
        
        // Hide "Generate New Image" button initially
        document.getElementById('generateNewImageBtn').style.display = 'none';
        document.getElementById('saveUpgrade').disabled = true;
        
        // Reset upgrade pills
        document.querySelectorAll('.upgrade-pill').forEach(pill => {
            pill.classList.remove('active');
            pill.disabled = false;
        });
        
        // Reset custom input
        const customInput = document.getElementById('customUpgradeInput');
        if (customInput) {
            customInput.value = '';
            customInput.disabled = false;
        }
        const customBtn = document.getElementById('customUpgradeBtn');
        if (customBtn) {
            customBtn.disabled = false;
        }
        
        // Show loading div
        window.upgradeUI.showGenerationLoading(false); // Reset to normal loading state
        document.getElementById('generationLoading').style.display = 'none';
        
        // Add debug info to modal
        console.log('Modal opened with original image:', originalImage);
        console.log('Modal opened with current value:', currentValue);
        console.log('Modal opened with images:', images);
    }

    // Setup swipe functionality for modal images
    setupModalSwipe(swipeArea, images, switchFunctionName) {
        let isDrag = false;
        let startX = 0;
        let currentX = 0;
        const dragThreshold = 50;
        const swipeSensitivity = 100;
        
        function handleSwipeStart(e) {
            isDrag = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            swipeArea.style.cursor = 'grabbing';
        }
        
        function handleSwipeMove(e) {
            if (!isDrag) return;
            
            currentX = e.touches ? e.touches[0].clientX : e.clientX;
            
            if (e.type === 'mousemove' && !(e.buttons & 1)) {
                isDrag = false;
                swipeArea.style.cursor = 'grab';
                return;
            }
        }
        
        function handleSwipeEnd(e) {
            if (!isDrag) return;
            
            const deltaX = currentX - startX;
            const absDeltaX = Math.abs(deltaX);
            
            swipeArea.style.cursor = 'grab';
            isDrag = false;
            
            if (absDeltaX > dragThreshold && absDeltaX < swipeSensitivity) {
                const currentIndex = parseInt(swipeArea.getAttribute('data-image-index'));
                if (deltaX > 0) {
                    // Swipe right - previous image
                    const newIndex = Math.max(0, currentIndex - 1);
                    window[switchFunctionName](newIndex);
                } else {
                    // Swipe left - next image
                    const newIndex = Math.min(images.length - 1, currentIndex + 1);
                    window[switchFunctionName](newIndex);
                }
            } else if (absDeltaX >= swipeSensitivity) {
                // Long swipe - scroll multiple images
                const currentIndex = parseInt(swipeArea.getAttribute('data-image-index'));
                const imagesToSkip = Math.floor(absDeltaX / swipeSensitivity);
                const newIndex = deltaX > 0 
                    ? Math.max(0, currentIndex - imagesToSkip)
                    : Math.min(images.length - 1, currentIndex + imagesToSkip);
                window[switchFunctionName](newIndex);
            }
        }
        
        // Touch events for mobile
        swipeArea.addEventListener('touchstart', handleSwipeStart, { passive: true });
        swipeArea.addEventListener('touchmove', handleSwipeMove, { passive: true });
        swipeArea.addEventListener('touchend', handleSwipeEnd, { passive: true });
        
        // Mouse events for desktop
        swipeArea.addEventListener('mousedown', handleSwipeStart);
        swipeArea.addEventListener('mousemove', handleSwipeMove);
        swipeArea.addEventListener('mouseup', handleSwipeEnd);
        swipeArea.addEventListener('mouseleave', handleSwipeEnd);
    }

    // Switch image in modal
    switchModalImage(imageIndex) {
        const modalButton = document.querySelector('[data-bs-target="#upgradeModal"]:not([style*="display: none"])');
        if (!modalButton) return;
        
        const images = JSON.parse(modalButton.getAttribute('data-images'));
        const originalImage = document.getElementById('originalImage');
        const counterContainer = document.getElementById('originalImageCounter');
        const swipeArea = document.getElementById('originalImageSwipe');
        
        if (images && images[imageIndex] && originalImage) {
            originalImage.src = images[imageIndex];
            
            // Update counter
            if (counterContainer) {
                counterContainer.textContent = `${imageIndex + 1} of ${images.length}`;
                counterContainer.setAttribute('data-image-index', imageIndex);
            }
            
            // Update swipe area data
            if (swipeArea) {
                swipeArea.setAttribute('data-image-index', imageIndex);
            }
            
            // Update modal data
            modalButton.setAttribute('data-original-image', images[imageIndex]);
            
            // Update stored original image for mobile view and save functionality
            CONFIG.originalImageSrc = images[imageIndex];
            
            // Update global modal context for AI generation
            window.currentModalImageSrc = images[imageIndex];
            console.log('🖼️ Modal image switched to:', images[imageIndex]);
        }
    }
    
    // Switch image in mobile view
    switchMobileImage(imageIndex) {
        const modalButton = document.querySelector('[data-bs-target="#upgradeModal"]:not([style*="display: none"])');
        if (!modalButton) return;
        
        const images = JSON.parse(modalButton.getAttribute('data-images'));
        const mobileImage = document.getElementById('mobileImage');
        const mobileCounter = document.getElementById('mobileImageCounter');
        const mobileSwipeArea = document.getElementById('mobileImageSwipe');
        
        if (images && images[imageIndex] && mobileImage) {
            mobileImage.src = images[imageIndex];
            
            // Update counter
            if (mobileCounter) {
                mobileCounter.textContent = `${imageIndex + 1} of ${images.length}`;
                mobileCounter.setAttribute('data-image-index', imageIndex);
            }
            
            // Update swipe area data
            if (mobileSwipeArea) {
                mobileSwipeArea.setAttribute('data-image-index', imageIndex);
            }
            
            // Update modal data
            modalButton.setAttribute('data-original-image', images[imageIndex]);
            
            // Update stored original image for mobile view and save functionality
            CONFIG.originalImageSrc = images[imageIndex];
            
            // Update global modal context for AI generation  
            window.currentModalImageSrc = images[imageIndex];
            console.log('📱 Mobile image switched to:', images[imageIndex]);
        
            // Update mobile view if currently showing before
            if (CONFIG.currentMobileView === 'before') {
                this.showMobileView('before');
            }
        }
    }

    // Save before and after image
    saveBeforeAfterImage() {
        const originalImg = CONFIG.originalImageSrc;
        const upgradedImg = CONFIG.upgradedImageSrc;
        
        if (!originalImg || !upgradedImg) {
            alert('No images to save. Please generate an upgrade first.');
            return;
        }
        
        try {
            // Create a canvas to combine the images side by side
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions for side-by-side layout
            const imageWidth = 600;
            const imageHeight = 400;
            const padding = 20;
            const totalWidth = (imageWidth * 2) + (padding * 3);
            const totalHeight = imageHeight + (padding * 2);
            
            canvas.width = totalWidth;
            canvas.height = totalHeight;
            
            // Fill background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, totalWidth, totalHeight);
            
            // Load and draw original image
            const originalImgElement = new Image();
            originalImgElement.crossOrigin = 'anonymous';
            originalImgElement.onload = function() {
                ctx.drawImage(originalImgElement, padding, padding, imageWidth, imageHeight);
                
                // Add "BEFORE" label
                ctx.fillStyle = '#007bff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('BEFORE', padding + (imageWidth / 2), padding - 10);
                
                // Load and draw upgraded image
                const upgradedImgElement = new Image();
                upgradedImgElement.crossOrigin = 'anonymous';
                upgradedImgElement.onload = function() {
                    ctx.drawImage(upgradedImgElement, padding * 2 + imageWidth, padding, imageWidth, imageHeight);
                    
                    // Add "AFTER" label
                    ctx.fillStyle = '#28a745';
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('AFTER', (padding * 2) + imageWidth + (imageWidth / 2), padding - 10);
                    
                    // Add image labels
                    ctx.fillStyle = '#333333';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('AI Home Upgrade', totalWidth / 2, totalHeight - 20);
                    
                    // Convert canvas to blob and download
                    canvas.toBlob(function(blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `home-upgrade-before-after-${Date.now()}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        // Show success message
                        window.notifications.showNotification('Before and after image saved successfully!', 'success');
                    }, 'image/png');
                };
                upgradedImgElement.src = upgradedImg;
            };
            originalImgElement.src = originalImg;
            
        } catch (error) {
            console.error('Error saving image:', error);
            window.notifications.showNotification('Error saving image. Please try again.', 'error');
        }
    }
}

// Create and export mobile view instance
window.mobileView = new MobileView();
