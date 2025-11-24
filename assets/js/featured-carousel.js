// Featured Images Carousel Component
class FeaturedCarousel {
    constructor() {
        this.supabase = null;
        this.featuredImages = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 8000; // 8 seconds - slower animation
        this.itemsPerView = 3; // Desktop: 3 items
        this.isAnimating = false;
    }

    // Initialize Supabase client
    async init() {
        // Wait for supabase-auth to initialize if needed
        if (window.supabaseAuth) {
            // Wait for initialization with timeout
            let attempts = 0;
            while (attempts < 50 && !window.supabaseAuth.supabase) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (window.supabaseAuth.supabase) {
                this.supabase = window.supabaseAuth.supabase;
                return;
            }
        }
        
        // Fallback: create Supabase client directly using the same config as supabase-auth
        if (typeof supabase !== 'undefined') {
            const { createClient } = supabase;
            // Use the same URL and key that supabase-auth uses
            const supabaseUrl = 'https://blreysdjzzildmekblfj.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJscmV5c2RqenppbGRtZWtibGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODMzMDUsImV4cCI6MjA3NTI1OTMwNX0.n9pShYBUTIo2nwLcDcyUDex8NU1Xzpp9kPQKX2Y4BIs';
            this.supabase = createClient(supabaseUrl, supabaseKey);
        } else {
            console.error('Supabase client not available');
        }
    }

    // Fetch featured images from Supabase
    async fetchFeaturedImages() {
        try {
            if (!this.supabase) {
                await this.init();
            }

            const { data, error } = await this.supabase
                .from('generated_images')
                .select('id, original_image_url, generated_image_url, upgrade_type, image_category, property_address, display_order, created_at')
                .eq('is_featured', true)
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(20); // Limit to 20 featured images

            if (error) {
                console.error('Error fetching featured images:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in fetchFeaturedImages:', error);
            return [];
        }
    }

    // Render carousel HTML
    renderCarousel(images) {
        if (!images || images.length === 0) {
            return '<div class="featured-carousel-empty"><p>No featured images available yet.</p></div>';
        }

        const items = images.map((image, index) => {
            const category = image.image_category || 'other';
            const upgradeType = image.upgrade_type || 'Upgrade';
            const escapedUpgradeType = this.escapeHtml(upgradeType);
            const escapedAddress = image.property_address ? this.escapeHtml(image.property_address) : '';
            
            // Build the carousel item HTML explicitly
            let itemHtml = '<div class="carousel-item-card" data-index="' + index + '">';
            itemHtml += '<div class="before-after-container">';
            itemHtml += '<div class="before-section">';
            itemHtml += '<div class="label-badge">BEFORE</div>';
            itemHtml += '<img src="' + image.original_image_url + '" ';
            itemHtml += 'alt="Before ' + escapedUpgradeType + '" ';
            itemHtml += 'class="before-after-image" ';
            itemHtml += 'loading="lazy" ';
            itemHtml += 'onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 400 300%27%3E%3Crect fill=\\'%23e2e8f0\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%2394a3b8\\' font-family=\\'Arial\\' font-size=\\'18\\'%3EImage not available%3C/text%3E%3C/svg%3E\'">';
            itemHtml += '</div>';
            itemHtml += '<div class="after-section">';
            itemHtml += '<div class="label-badge">AFTER</div>';
            itemHtml += '<img src="' + image.generated_image_url + '" ';
            itemHtml += 'alt="After ' + escapedUpgradeType + '" ';
            itemHtml += 'class="before-after-image" ';
            itemHtml += 'loading="lazy" ';
            itemHtml += 'onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 400 300%27%3E%3Crect fill=\\'%23e2e8f0\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%2394a3b8\\' font-family=\\'Arial\\' font-size=\\'18\\'%3EImage not available%3C/text%3E%3C/svg%3E\'">';
            itemHtml += '</div>';
            itemHtml += '</div>';
            itemHtml += '<div class="carousel-caption">';
            itemHtml += '<div class="upgrade-type-badge">' + escapedUpgradeType + '</div>';
            if (escapedAddress) {
                itemHtml += '<p class="property-address">' + escapedAddress + '</p>';
            }
            if (category !== 'other') {
                itemHtml += '<span class="category-badge category-' + category + '">' + category + '</span>';
            }
            itemHtml += '</div>';
            itemHtml += '</div>';
            
            return itemHtml;
        }).join('');

        return `
            <div class="featured-carousel-wrapper">
                <div class="carousel-container">
                    <div class="carousel-track" id="carouselTrack">
                        ${items}
                    </div>
                </div>
                <button class="carousel-nav-btn carousel-prev" id="carouselPrev" aria-label="Previous">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="carousel-nav-btn carousel-next" id="carouselNext" aria-label="Next">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="carousel-indicators" id="carouselIndicators"></div>
            </div>
        `;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load and display carousel
    async loadCarousel(containerId = 'featuredCarouselContainer') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="featured-carousel-loading"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        try {
            const images = await this.fetchFeaturedImages();
            this.featuredImages = images;

            if (images.length > 0) {
                container.innerHTML = this.renderCarousel(images);
                this.initCarouselControls();
                this.updateItemsPerView();
                this.startAutoPlay();
                
                // Update on window resize
                window.addEventListener('resize', () => {
                    this.updateItemsPerView();
                    this.updateCarousel();
                });
            } else {
                container.innerHTML = '<div class="featured-carousel-empty"><p>No featured images available yet. Check back soon!</p></div>';
            }
        } catch (error) {
            console.error('Error loading carousel:', error);
            container.innerHTML = '<div class="featured-carousel-error"><p>Unable to load featured images. Please try again later.</p></div>';
        }
    }

    // Initialize carousel controls
    initCarouselControls() {
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        const track = document.getElementById('carouselTrack');
        
        if (!prevBtn || !nextBtn || !track) return;

        prevBtn.addEventListener('click', () => this.prevSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Touch/swipe support
        let startX = 0;
        let isDragging = false;
        
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });

        // Update indicators
        this.updateIndicators();
    }

    // Update items per view based on screen size
    updateItemsPerView() {
        const width = window.innerWidth;
        if (width >= 1200) {
            this.itemsPerView = 3; // Desktop: 3 items
        } else if (width >= 768) {
            this.itemsPerView = 2; // Tablet: 2 items
        } else {
            this.itemsPerView = 1; // Mobile: 1 item
        }
    }

    // Update carousel position
    updateCarousel() {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        const itemWidth = 100 / this.itemsPerView;
        const translateX = -this.currentIndex * itemWidth;
        
        track.style.transform = `translateX(${translateX}%)`;
        this.updateIndicators();
    }

    // Go to next slide
    nextSlide() {
        if (this.isAnimating) return;
        
        const maxIndex = Math.max(0, this.featuredImages.length - this.itemsPerView);
        this.currentIndex = (this.currentIndex >= maxIndex) ? 0 : this.currentIndex + 1;
        this.updateCarousel();
    }

    // Go to previous slide
    prevSlide() {
        if (this.isAnimating) return;
        
        const maxIndex = Math.max(0, this.featuredImages.length - this.itemsPerView);
        this.currentIndex = (this.currentIndex <= 0) ? maxIndex : this.currentIndex - 1;
        this.updateCarousel();
    }

    // Update indicators
    updateIndicators() {
        const indicatorsContainer = document.getElementById('carouselIndicators');
        if (!indicatorsContainer) return;

        const totalSlides = Math.ceil(this.featuredImages.length / this.itemsPerView);
        indicatorsContainer.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `indicator-dot ${i === Math.floor(this.currentIndex / this.itemsPerView) ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
            indicator.addEventListener('click', () => {
                this.currentIndex = i * this.itemsPerView;
                this.updateCarousel();
            });
            indicatorsContainer.appendChild(indicator);
        }
    }

    // Start auto-play
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }

    // Stop auto-play
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Export for global use
window.FeaturedCarousel = FeaturedCarousel;

