// Home display and card creation functionality
class HomeDisplay {
    constructor() {
        // Initialize any needed properties
    }

    // Display homes in the grid
    displayHomes(homes) {
        const homesGrid = document.getElementById('homesGrid');
        const loadingState = document.getElementById('loadingState');

        // Store homes globally for lazy loading access
        CONFIG.homesList = homes;

        homesGrid.innerHTML = '';
        
        homes.forEach((home, index) => {
            const col = this.createHomeCard(home, index);
            homesGrid.appendChild(col);
        });
        
        // Make new cards interactive after DOM updates
        setTimeout(() => {
            const newCards = homesGrid.querySelectorAll('.swipe-area.image-carousel');
            newCards.forEach(swipeArea => {
                if (swipeArea) {
                    window.imageHandler.makeCardInteractive(swipeArea);
                }
            });
        }, 100);
        
        loadingState.style.display = 'none';
        homesGrid.style.display = 'flex';
    }

    // Create a home card
    createHomeCard(home, index) {
        logger.log(`🏠 Creating card for home:`, {
            id: home.id,
            address: home.address,
            images: home.images,
            imageCount: home.imageCount,
            hasMultipleImages: (home.images || []).length > 1
        });
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const images = home.images || [];
        const currentImage = images[0] || 'https://via.placeholder.com/400x250?text=No+Image';
        const totalImages = home.imageCount || images.length || 1;
        
        logger.log(`🏠 Card creation details:`, {
            imagesArray: images,
            currentImage: currentImage,
            totalImages: totalImages,
            showArrows: images.length > 1
        });
        
        col.innerHTML = `
            <div class="card home-card" data-home-id="${home.id}">
                <div class="position-relative">
                    <img src="${currentImage}" class="card-img-top" alt="${home.address}" loading="lazy">
                    
                    <!-- Navigation arrows -->
                    <button class="image-nav-arrow prev" onclick="logger.log('🖱️ PREV ARROW CLICKED for homeId: ${home.id}'); window.imageHandler.navigateImage('${home.id}', 'prev')" style="display: ${images.length > 1 ? 'flex' : 'none'};" aria-label="Previous image" title="Previous image">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="image-nav-arrow next" onclick="logger.log('🖱️ NEXT ARROW CLICKED for homeId: ${home.id}'); window.imageHandler.navigateImage('${home.id}', 'next')" style="display: ${images.length > 1 ? 'flex' : 'none'};" aria-label="Next image" title="Next image">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    
                    <div class="swipe-area image-carousel" data-image-index="0" data-home-id="${home.id}" onclick="window.imageHandler.makeCardInteractive(this)">
                        <!-- Swipe functionality will be handled by JavaScript -->
                    </div>
                    <div class="image-counter" data-image-index="0" data-total="${totalImages}">
                        1 of ${totalImages}
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${home.address}</h5>
                    <p class="card-text">
                        <strong>$${home.price.toLocaleString()}</strong><br>
                        ${home.bedrooms} bed • ${home.bathrooms} bath<br>
                        ${home.sqft ? home.sqft.toLocaleString() + ' sqft' : 'Size not available'}
                    </p>
                    <button class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#upgradeModal" 
                            data-original-image="${currentImage}" 
                            data-images='${JSON.stringify(images)}'
                            data-current-value="${home.price}"
                            data-upgraded-value="${Math.round(home.price * 1.15)}"
                            data-image-count="${totalImages}">
                        <i class="fas fa-magic me-2"></i>Imagine Upgrades
                    </button>
                </div>
            </div>
        `;
        
        return col;
    }

    // Get fallback images for properties
    getPropertyImages(propertyId) {
        const imageSets = {
            1: [
                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&auto=format&q=80'
            ],
            2: [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop&auto=format&q=80'
            ],
            3: [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80'
            ],
            4: [
                'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop&auto=format&q=80'
            ],
            5: [
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&auto=format&q=80'
            ],
            6: [
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format&q=80'
            ]
        };
        
        return imageSets[propertyId] || imageSets[1];
    }
}

// Create and export home display instance
window.homeDisplay = new HomeDisplay();
