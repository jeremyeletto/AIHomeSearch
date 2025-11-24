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
            if (!this.supabase) await this.init();
            if (!this.supabase) return [];

            const { data, error } = await this.supabase
                .from('generated_images')
                .select('id, original_image_url, generated_image_url, upgrade_type, image_category, property_address, display_order, created_at, prompt')
                .eq('is_featured', true)
                .order('display_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false })
                .limit(20);

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

        // Helper function to build item HTML
        const buildItemHtml = (image, index, isClone = false) => {
            const category = image.image_category || 'other';
            const upgradeType = image.upgrade_type || 'Upgrade';
            const escapedUpgradeType = this.escapeHtml(upgradeType);
            const fallbackSvg = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2394a3b8%22 font-family=%22Arial%22 font-size=%2218%22%3EImage not available%3C/text%3E%3C/svg%3E';
            
            const cloneClass = isClone ? ' carousel-item-clone' : '';
            let itemHtml = '<div class="carousel-item-card' + cloneClass + '" data-index="' + index + '">';
            itemHtml += '<div class="before-after-container">';
            itemHtml += '<div class="before-section">';
            itemHtml += '<div class="label-badge">BEFORE</div>';
            itemHtml += '<img src="' + (image.original_image_url || fallbackSvg) + '" ';
            itemHtml += 'alt="Before ' + escapedUpgradeType + '" class="before-after-image" loading="lazy" ';
            itemHtml += 'onerror="this.src=\'' + fallbackSvg + '\'">';
            itemHtml += '</div>';
            itemHtml += '<div class="after-section">';
            itemHtml += '<div class="label-badge">AFTER</div>';
            itemHtml += '<img src="' + (image.generated_image_url || fallbackSvg) + '" ';
            itemHtml += 'alt="After ' + escapedUpgradeType + '" class="before-after-image" loading="lazy" ';
            itemHtml += 'onerror="this.src=\'' + fallbackSvg + '\'">';
            itemHtml += '</div>';
            itemHtml += '<div class="carousel-caption">';
            itemHtml += '<div class="upgrade-type-badge">' + escapedUpgradeType + '</div>';
            if (category !== 'other') itemHtml += '<span class="category-badge category-' + category + '">' + category + '</span>';
            itemHtml += '</div></div></div>';
            
            return itemHtml;
        };

        // Build original items
        const originalItems = images.map((image, index) => buildItemHtml(image, index, false)).join('');
        
        // Build cloned items for infinite loop (clone last items at start, first items at end)
        const itemsToClone = Math.min(this.itemsPerView, images.length);
        const startClones = images.slice(-itemsToClone).map((image, index) => 
            buildItemHtml(image, images.length - itemsToClone + index, true)
        ).join('');
        const endClones = images.slice(0, itemsToClone).map((image, index) => 
            buildItemHtml(image, index, true)
        ).join('');

        return `
            <div class="featured-carousel-wrapper">
                <div class="carousel-container">
                    <div class="carousel-track" id="carouselTrack">
                        ${startClones}${originalItems}${endClones}
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
        if (!container) return;

        container.innerHTML = '<div class="featured-carousel-loading"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        try {
            const images = await this.fetchFeaturedImages();
            
            if (!images || images.length === 0) {
                container.innerHTML = '<div class="featured-carousel-empty"><p>No featured images available yet. Check back soon!</p></div>';
                return;
            }

            this.featuredImages = images;
            container.innerHTML = this.renderCarousel(images);
            this.updateItemsPerView();
            
            const itemsToClone = Math.min(this.itemsPerView, images.length);
            this.currentIndex = itemsToClone;
            this.initCarouselControls();
            this.updateCarousel();
            this.startAutoPlay();
            
            window.addEventListener('resize', () => {
                this.updateItemsPerView();
                this.currentIndex = Math.min(this.itemsPerView, images.length);
                this.updateCarousel();
            });
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
    updateCarousel(instant = false) {
        const track = document.getElementById('carouselTrack');
        if (!track) return;

        const itemWidth = 100 / this.itemsPerView;
        const translateX = -this.currentIndex * itemWidth;
        
        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = '';
        }
        
        track.style.transform = `translateX(${translateX}%)`;
        this.updateIndicators();
        
        // Restore transition after instant jump
        if (instant) {
            requestAnimationFrame(() => {
                track.style.transition = '';
            });
        }
    }

    // Go to next slide
    nextSlide() {
        if (this.isAnimating) return;
        
        const itemsToClone = Math.min(this.itemsPerView, this.featuredImages.length);
        const totalItems = this.featuredImages.length + (itemsToClone * 2);
        const realStartIndex = itemsToClone;
        const realEndIndex = itemsToClone + this.featuredImages.length - this.itemsPerView;
        
        this.currentIndex++;
        
        // If we've reached the end clones, jump to the beginning real items
        if (this.currentIndex > realEndIndex + 1) {
            this.currentIndex = realStartIndex;
            this.updateCarousel(true); // Instant jump
        } else {
            this.updateCarousel();
        }
    }

    // Go to previous slide
    prevSlide() {
        if (this.isAnimating) return;
        
        const itemsToClone = Math.min(this.itemsPerView, this.featuredImages.length);
        const realStartIndex = itemsToClone;
        const realEndIndex = itemsToClone + this.featuredImages.length - this.itemsPerView;
        
        this.currentIndex--;
        
        // If we've reached the start clones, jump to the end real items
        if (this.currentIndex < realStartIndex - 1) {
            this.currentIndex = realEndIndex;
            this.updateCarousel(true); // Instant jump
        } else {
            this.updateCarousel();
        }
    }

    // Update indicators
    updateIndicators() {
        const indicatorsContainer = document.getElementById('carouselIndicators');
        if (!indicatorsContainer) return;

        const totalSlides = Math.ceil(this.featuredImages.length / this.itemsPerView);
        const itemsToClone = Math.min(this.itemsPerView, this.featuredImages.length);
        const realStartIndex = itemsToClone;
        
        // Calculate which real slide we're on
        const realIndex = this.currentIndex - realStartIndex;
        const currentSlide = Math.floor(realIndex / this.itemsPerView);
        
        indicatorsContainer.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('button');
            indicator.className = `indicator-dot ${i === currentSlide ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
            indicator.addEventListener('click', () => {
                this.currentIndex = realStartIndex + (i * this.itemsPerView);
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

