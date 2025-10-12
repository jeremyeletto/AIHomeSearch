// Image handling and navigation functionality
class ImageHandler {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add keyboard navigation support
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    // Navigate images using arrow buttons
    navigateImage(homeId, direction) {
        console.log(`🔍 ARROW CLICK DEBUG - Starting navigation for homeId: ${homeId}, direction: ${direction}`);
        
        const card = document.querySelector(`[data-home-id="${homeId}"]`);
        console.log(`🔍 Card found:`, card);
        if (!card) {
            console.log(`❌ No card found with data-home-id="${homeId}"`);
            return;
        }
            
        const img = card.querySelector('.card-img-top');
        const counter = card.querySelector('.image-counter');
        const swipeArea = card.querySelector('.swipe-area');
        
        console.log(`🔍 Elements found:`, {
            img: img,
            counter: counter,
            swipeArea: swipeArea,
            imgSrc: img ? img.src : 'N/A',
            counterText: counter ? counter.textContent : 'N/A'
        });
        
        if (!img || !counter || !swipeArea) {
            console.log(`❌ Missing required elements:`, {
                hasImg: !!img,
                hasCounter: !!counter,
                hasSwipeArea: !!swipeArea
            });
            return;
        }
        
        // Get current image index and total images
        const currentIndex = parseInt(counter.getAttribute('data-image-index')) || 0;
        const totalImages = parseInt(counter.getAttribute('data-total')) || 1;
        
        console.log(`🔍 Current state:`, {
            currentIndex: currentIndex,
            totalImages: totalImages,
            counterAttributes: {
                'data-image-index': counter.getAttribute('data-image-index'),
                'data-total': counter.getAttribute('data-total')
            }
        });
        
        if (totalImages <= 1) {
            console.log(`⚠️ Only ${totalImages} image(s), no navigation needed`);
            return; // No navigation needed for single image
        }
        
        // Calculate new index
        let newIndex;
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1; // Loop to last image
        } else if (direction === 'next') {
            newIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0; // Loop to first image
        } else {
            console.log(`❌ Invalid direction: ${direction}`);
            return;
        }
        
        console.log(`🔍 Calculated new index: ${newIndex} (from ${currentIndex} with direction ${direction})`);
        
        // Find the processed home object that has the high-quality images
        const home = CONFIG.homesList.find(h => h.id == homeId);
        
        console.log(`🔍 Found processed home structure:`, {
            id: home?.id,
            address: home?.address,
            images: home?.images,
            imageCount: home?.imageCount,
            hasImages: !!home?.images,
            imagesLength: home?.images?.length || 0,
            availableProps: home ? Object.keys(home).slice(0, 15) : []
        });
        
        // The processed home object should have the high-quality images in the 'images' array
        let images = home?.images || [];
        let imageCount = home?.imageCount || images.length;
        
        console.log(`🔍 Extracted images:`, {
            images: images.slice(0, 3), // Show first 3 images
            imageCount: imageCount,
            hasImages: imageCount > 0
        });
        
        if (!home || imageCount === 0) {
            console.log(`❌ No home object or images found for homeId: ${homeId}`);
            return;
        }
        
        // Update image source
        const newImageSrc = images[newIndex] || images[0];
        console.log(`🔍 Updating image source:`, {
            oldSrc: img.src,
            newSrc: newImageSrc,
            newIndex: newIndex,
            totalImages: imageCount
        });
        
        img.src = newImageSrc;
        
        // Update counter
        const newCounterText = `${newIndex + 1} of ${imageCount}`;
        console.log(`🔍 Updating counter:`, {
            oldText: counter.textContent,
            newText: newCounterText,
            newIndex: newIndex,
            totalImages: imageCount
        });
        
        counter.textContent = newCounterText;
        counter.setAttribute('data-image-index', newIndex);
        counter.setAttribute('data-total', imageCount);
        
        // Update swipe area
        console.log(`🔍 Updating swipe area data-image-index to: ${newIndex}`);
        swipeArea.setAttribute('data-image-index', newIndex);
        
        // Update modal data attributes for when user opens the modal
        console.log(`🔍 Updating card data-current-image to: ${newIndex}`);
        card.setAttribute('data-current-image', newIndex);
        
        // Update modal data attributes with current image
        this.updateModalDataAttributes(card, home);
        
        console.log(`✅ Successfully navigated to image ${newIndex + 1}/${totalImages} for property ${homeId}`);
        console.log(`🔍 Final state:`, {
            imgSrc: img.src,
            counterText: counter.textContent,
            counterDataIndex: counter.getAttribute('data-image-index'),
            swipeAreaDataIndex: swipeArea.getAttribute('data-image-index'),
            cardDataCurrent: card.getAttribute('data-current-image')
        });
    }

    // Navigate images in modal using arrow buttons
    navigateModalImage(direction) {
        console.log(`🔍 MODAL ARROW CLICK - Direction: ${direction}`);
        
        // Use stored property data instead of querying DOM
        if (!CONFIG.currentPropertyData) {
            console.log('❌ No current property data stored');
            return;
        }
        
        const images = CONFIG.currentPropertyData.images || [];
        const imageCount = CONFIG.currentPropertyData.imageCount || images.length || 1;
        
        console.log(`🔍 Modal images from stored data:`, { 
            propertyId: CONFIG.currentPropertyData.id,
            imageCount: imageCount,
            firstImage: images[0]
        });
        
        if (imageCount <= 1) {
            console.log(`⚠️ No navigation needed for single image (imageCount: ${imageCount})`);
            return;
        }
        
        // Get current image index from desktop counter (preferred) or mobile counter
        const desktopCounter = document.getElementById('originalImageCounter');
        const mobileCounter = document.getElementById('mobileImageCounter');
        const counter = desktopCounter || mobileCounter;
        
        if (!counter) {
            console.log('❌ No image counter found in modal');
            return;
        }
        
        const currentIndex = parseInt(counter.getAttribute('data-image-index')) || 0;
        
        console.log(`🔍 Current modal state:`, {
            currentIndex: currentIndex,
            imageCount: imageCount,
            counterElement: counter.id
        });
        
        // Calculate new index
        let newIndex;
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : imageCount - 1; // Loop to last image
        } else if (direction === 'next') {
            newIndex = currentIndex < imageCount - 1 ? currentIndex + 1 : 0; // Loop to first image
        } else {
            console.log(`❌ Invalid modal navigation direction: ${direction}`);
            return;
        }
        
        console.log(`🔍 Modal navigation: ${currentIndex} → ${newIndex} (direction: ${direction})`);
        
        // Update the stored current image index
        if (CONFIG.currentPropertyData) {
            CONFIG.currentPropertyData.currentImageIndex = newIndex;
        }
        
        // Update both desktop and mobile views
        const originalImage = document.getElementById('originalImage');
        const mobileImage = document.getElementById('mobileImage');
        const originalSwipeArea = document.getElementById('originalImageSwipe');
        const mobileSwipeArea = document.getElementById('mobileImageSwipe');
        
        const newImageSrc = images[newIndex] || images[0];
        
        // Update desktop view
        if (originalImage) {
            originalImage.src = newImageSrc;
            console.log(`🖥️ Updated desktop image: ${newImageSrc}`);
        }
        
        // Update mobile view
        if (mobileImage) {
            mobileImage.src = newImageSrc;
            console.log(`📱 Updated mobile image: ${newImageSrc}`);
        }
        
        // Update counters
        const newCounterText = `${newIndex + 1} of ${imageCount}`;
        
        if (desktopCounter) {
            desktopCounter.textContent = newCounterText;
            desktopCounter.setAttribute('data-image-index', newIndex);
            desktopCounter.setAttribute('data-total', imageCount);
        }
        
        if (mobileCounter) {
            mobileCounter.textContent = newCounterText;
            mobileCounter.setAttribute('data-image-index', newIndex);
            mobileCounter.setAttribute('data-total', imageCount);
        }
        
        // Update swipe areas
        if (originalSwipeArea) {
            originalSwipeArea.setAttribute('data-image-index', newIndex);
        }
        
        if (mobileSwipeArea) {
            mobileSwipeArea.setAttribute('data-image-index', newIndex);
        }
        
        console.log(`✅ Modal navigation complete: ${newIndex + 1}/${imageCount}`);
    }

    // Shared function to get current image index from a card
    getCurrentImageIndex(card) {
        const counter = card.querySelector('.image-counter');
        if (counter) {
            const currentIndex = parseInt(counter.getAttribute('data-image-index')) || 0;
            return currentIndex;
        }
        return 0; // Default to first image if no counter found
    }
    
    // Shared function to update modal data attributes with current image
    updateModalDataAttributes(card, home) {
        const modalButton = card.querySelector('[data-bs-target="#upgradeModal"]');
        if (modalButton && home && home.images && home.images.length > 0) {
            const currentIndex = this.getCurrentImageIndex(card);
            const currentImage = home.images[currentIndex] || home.images[0];
            
            modalButton.setAttribute('data-original-image', currentImage);
            modalButton.setAttribute('data-images', JSON.stringify(home.images));
            modalButton.setAttribute('data-image-count', home.imageCount);
            modalButton.setAttribute('data-current-image-index', currentIndex);
            
            console.log(`🔄 Updated modal data for ${home.address}: image ${currentIndex + 1}/${home.imageCount}`);
        }
    }

    // Update home card with new images (optimized version)
    updateHomeCardImages(home, index) {
        const card = document.querySelector(`[data-home-id="${home.id}"]`);
        if (card && home.images && home.images.length > 0) {
            const img = card.querySelector('.card-img-top');
            if (img) {
                img.src = home.images[0];
                img.alt = home.address;
            }
            
            // Update image counter
            const counter = card.querySelector('.image-counter');
            if (counter) {
                counter.textContent = `1 of ${home.imageCount}`;
                counter.setAttribute('data-total', home.imageCount);
                counter.setAttribute('data-image-index', '0');
            }
            
            // Update navigation arrows visibility
            const prevArrow = card.querySelector('.image-nav-arrow.prev');
            const nextArrow = card.querySelector('.image-nav-arrow.next');
            
            if (prevArrow && nextArrow) {
                const showArrows = home.images.length > 1;
                prevArrow.style.display = showArrows ? 'flex' : 'none';
                nextArrow.style.display = showArrows ? 'flex' : 'none';
            }
            
            // Make card interactive for swipe functionality if multiple images
            const swipeArea = card.querySelector('.swipe-area');
            if (swipeArea && home.images.length > 1) {
                this.makeCardInteractive(swipeArea);
                swipeArea.setAttribute('data-image-index', '0');
            }
            
            // Update modal data attributes
            const modalButton = card.querySelector('[data-bs-target="#upgradeModal"]');
            if (modalButton) {
                modalButton.setAttribute('data-original-image', home.images[0]);
                modalButton.setAttribute('data-images', JSON.stringify(home.images));
                modalButton.setAttribute('data-image-count', home.imageCount);
            }
            
            // Hide loading state
            this.hideCardLoadingState(card);
            
            console.log(`✅ Updated card for ${home.address} with ${home.images.length} images`);
        }
    }

    // Show loading state for a card
    showCardLoadingState(card) {
        const img = card.querySelector('.card-img-top');
        const counter = card.querySelector('.image-counter');
        
        console.log('🔄 Showing loading state for card:', card.getAttribute('data-home-id'));
        
        if (img) {
            // Add loading class for styling
            img.classList.add('loading');
            
            // Add loading overlay - ensure it perfectly matches the image dimensions
            let loadingOverlay = card.querySelector('.loading-overlay');
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay';
                loadingOverlay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status" style="width: 2.5rem; height: 2.5rem;">
                            <span class="visually-hidden">Loading high-quality images...</span>
                        </div>
                        <div class="loading-text">Loading...</div>
                    </div>
                `;
                
                // Get the image bounding rect to match exact dimensions
                const imgRect = img.getBoundingClientRect();
                const imgContainer = img.parentElement;
                
                // Ensure the image container has relative positioning
                imgContainer.style.position = 'relative';
                
                // Position overlay exactly over the image
                const containerRect = imgContainer.getBoundingClientRect();
                loadingOverlay.style.position = 'absolute';
                loadingOverlay.style.top = '0';
                loadingOverlay.style.left = '0';
                loadingOverlay.style.width = '100%';
                loadingOverlay.style.height = '100%';
                loadingOverlay.style.borderRadius = 'inherit'; // Inherit parent's border radius
                
                imgContainer.appendChild(loadingOverlay);
            }
            
            // Show overlay with smooth transition
            loadingOverlay.style.display = 'flex';
            
            console.log('✅ Loading overlay displayed for card');
        }
        
        if (counter) {
            counter.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
    }

    // Hide loading state for a card
    hideCardLoadingState(card) {
        const img = card.querySelector('.card-img-top');
        const counter = card.querySelector('.image-counter');
        const loadingOverlay = card.querySelector('.loading-overlay');
        
        console.log('✅ Hiding loading state for card:', card.getAttribute('data-home-id'));
        
        if (loadingOverlay) {
            // Smooth fade out transition
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                loadingOverlay.style.opacity = '1'; // Reset for next time
            }, 300);
        }
        
        if (img) {
            img.classList.remove('loading');
        }
        
        if (counter) {
            // Counter will be updated by updateHomeCardImages
        }
    }

    // Make card interactive with swipe functionality
    makeCardInteractive(swipeArea) {
        const card = swipeArea.closest('.card');
        const homeId = card.getAttribute('data-home-id');
        const home = CONFIG.homesList.find(h => h.id == homeId);
        const images = JSON.parse(card.querySelector('[data-bs-target="#upgradeModal"]').getAttribute('data-images'));
        const currentIndex = parseInt(swipeArea.getAttribute('data-image-index'));
        
        // Trigger lazy loading on first interaction if not already loaded
        if (home && !home.lazyLoaded) {
            console.log('🗂️ First interaction detected, triggering lazy load...');
            this.lazyLoadImagesForCard(card, home);
        }
        
        if (images.length <= 1) return; // No need for interaction if only one image
        
        // Touch events for mobile
        swipeArea.addEventListener('touchstart', this.handleSwipeStart.bind(this), { passive: true });
        swipeArea.addEventListener('touchmove', this.handleSwipeMove.bind(this), { passive: true });
        swipeArea.addEventListener('touchend', this.handleSwipeEnd.bind(this), { passive: true });
        
        // Mouse events for desktop
        swipeArea.addEventListener('mousedown', this.handleSwipeStart.bind(this));
        swipeArea.addEventListener('mousemove', this.handleSwipeMove.bind(this));
        swipeArea.addEventListener('mouseup', this.handleSwipeEnd.bind(this));
        swipeArea.addEventListener('mouseleave', this.handleSwipeEnd.bind(this));
    }

    // Swipe event handlers
    handleSwipeStart(e) {
        CONFIG.isDrag = true;
        CONFIG.startX = e.touches ? e.touches[0].clientX : e.clientX;
        e.target.style.cursor = 'grabbing';
    }

    handleSwipeMove(e) {
        if (!CONFIG.isDrag) return;
        
        CONFIG.currentX = e.touches ? e.touches[0].clientX : e.clientX;
        
        // On desktop, only process if mouse button is pressed
        if (e.type === 'mousemove' && !(e.buttons & 1)) {
            CONFIG.isDrag = false;
            e.target.style.cursor = 'grab';
            return;
        }
    }

    handleSwipeEnd(e) {
        if (!CONFIG.isDrag) return;
        
        const deltaX = CONFIG.currentX - CONFIG.startX;
        const absDeltaX = Math.abs(deltaX);
        
        e.target.style.cursor = 'grab';
        CONFIG.isDrag = false;
        
        const swipeArea = e.target;
        const card = swipeArea.closest('.card');
        const images = JSON.parse(card.querySelector('[data-bs-target="#upgradeModal"]').getAttribute('data-images'));
        const currentIndex = parseInt(swipeArea.getAttribute('data-image-index'));
        
        if (absDeltaX > CONFIG.dragThreshold && absDeltaX < CONFIG.swipeSensitivity) {
            if (deltaX > 0) {
                // Swipe right - previous image
                this.switchImage(card, Math.max(0, currentIndex - 1));
            } else {
                // Swipe left - next image
                this.switchImage(card, Math.min(images.length - 1, currentIndex + 1));
            }
        } else if (absDeltaX >= CONFIG.swipeSensitivity) {
            // Long swipe - scroll multiple images
            const imagesToSkip = Math.floor(absDeltaX / CONFIG.swipeSensitivity);
            const newIndex = deltaX > 0 
                ? Math.max(0, currentIndex - imagesToSkip)
                : Math.min(images.length - 1, currentIndex + imagesToSkip);
            this.switchImage(card, newIndex);
        }
    }

    // Switch image in a card
    switchImage(card, imageIndex) {
        const homeId = card.getAttribute('data-home-id');
        const modalButton = card.querySelector('[data-bs-target="#upgradeModal"]');
        const images = JSON.parse(modalButton.getAttribute('data-images'));
        
        if (images && images[imageIndex]) {
            const img = card.querySelector('.card-img-top');
            img.src = images[imageIndex];
            
            // Update swipe area data
            const swipeArea = card.querySelector('.swipe-area');
            swipeArea.setAttribute('data-image-index', imageIndex);
            
            // Update counter
            const counter = card.querySelector('.image-counter');
            const totalImages = counter.getAttribute('data-total') || images.length;
            counter.textContent = `${imageIndex + 1} of ${totalImages}`;
            counter.setAttribute('data-image-index', imageIndex);
            
            // Update modal data
            modalButton.setAttribute('data-original-image', images[imageIndex]);
        }
    }

    // Lazy load images when user interacts with a card (optimized version)
    async lazyLoadImagesForCard(card, home) {
        if (home.lazyLoaded || !home.property_data || !home.hasHighQualityPhotos) {
            return; // Already loaded, no property data, or no high-quality photos available
        }
        
        console.log('🔄 Lazy loading high-quality images for property:', home.id);
        
        try {
            // Use the optimized batch endpoint for single property
            const batchResponse = await fetch(`${CONFIG.API_BASE_URL}/api/realtor/batch-high-quality-images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    properties: [home.property_data]
                })
            });
            
            if (batchResponse.ok) {
                const batchData = await batchResponse.json();
                
                if (batchData.success && batchData.results && batchData.results.length > 0) {
                    const result = batchData.results[0];
                    
                    if (result.images && result.images.length > 0) {
                        // Update the home object
                        home.images = result.images;
                        home.imageCount = result.imageCount;
                        home.lazyLoaded = true;
                        
                        // Update the modal button data
                        const modalButton = card.querySelector('[data-bs-target="#upgradeModal"]');
                        if (modalButton) {
                            modalButton.setAttribute('data-images', JSON.stringify(result.images));
                            modalButton.setAttribute('data-original-image', result.images[0]);
                            modalButton.setAttribute('data-image-count', result.imageCount);
                        }
                        
                        console.log('✅ Lazy loaded high-quality images for property:', home.id, result.images.length);
                    }
                }
            } else {
                console.log('⚠️ Failed to lazy load high-quality images for property:', home.id);
            }
        } catch (error) {
            console.error('❌ Failed to lazy load images for property:', home.id, error);
        }
    }

    // Handle keyboard navigation separately to control enabling/disabling
    handleKeyboardNavigation(event) {
        // Handle card navigation
        if (event.target.closest('.card') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            const card = event.target.closest('.card');
            const homeId = card.getAttribute('data-home-id');
            if (homeId) {
                this.navigateImage(homeId, event.key === 'ArrowLeft' ? 'prev' : 'next');
            }
        }
        
        // Handle modal navigation
        if (event.target.closest('#upgradeModal') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            event.preventDefault();
            this.navigateModalImage(event.key === 'ArrowLeft' ? 'prev' : 'next');
        }
    }

    // Convert image URL to base64
    async imageUrlToBase64(imageUrl) {
        try {
            console.log('Converting image to base64:', imageUrl);
            
            // Handle CORS issues by creating a canvas
            const response = await fetch(imageUrl, {
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`Image fetch failed: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            console.log('Image blob size:', blob.size, 'bytes');
            console.log('Image blob type:', blob.type);
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result.split(',')[1]; // Remove data:image/... prefix
                    console.log('Base64 conversion completed, length:', result.length);
                    resolve(result);
                };
                reader.onerror = (error) => {
                    console.error('FileReader error:', error);
                    reject(error);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            console.error('Image URL was:', imageUrl);
            throw error;
        }
    }
}

// Create and export image handler instance
window.imageHandler = new ImageHandler();
