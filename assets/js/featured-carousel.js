// Featured Images Carousel Component
class FeaturedCarousel {
    constructor() {
        this.supabase = null;
        this.featuredImages = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds
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

        const slides = images.map((image, index) => {
            const isActive = index === 0 ? 'active' : '';
            const category = image.image_category || 'other';
            const upgradeType = image.upgrade_type || 'Upgrade';
            
            return `
                <div class="carousel-item ${isActive}" data-index="${index}">
                    <div class="before-after-container">
                        <div class="before-section">
                            <div class="label-badge">BEFORE</div>
                            <img src="${image.original_image_url}" 
                                 alt="Before ${upgradeType}" 
                                 class="before-after-image"
                                 loading="lazy"
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300%27%3E%3Crect fill=\'%23e2e8f0\' width=\'400\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%2394a3b8\' font-family=\'Arial\' font-size=\'18\'%3EImage not available%3C/text%3E%3C/svg%3E'">
                        </div>
                        <div class="after-section">
                            <div class="label-badge">AFTER</div>
                            <img src="${image.generated_image_url}" 
                                 alt="After ${upgradeType}" 
                                 class="before-after-image"
                                 loading="lazy"
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 400 300%27%3E%3Crect fill=\'%23e2e8f0\' width=\'400\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%2394a3b8\' font-family=\'Arial\' font-size=\'18\'%3EImage not available%3C/text%3E%3C/svg%3E'">
                        </div>
                    </div>
                    <div class="carousel-caption">
                        <div class="upgrade-type-badge">${this.escapeHtml(upgradeType)}</div>
                        ${image.property_address ? `<p class="property-address">${this.escapeHtml(image.property_address)}</p>` : ''}
                        ${category !== 'other' ? `<span class="category-badge category-${category}">${category}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        const indicators = images.map((_, index) => 
            `<button type="button" data-bs-target="#featuredCarousel" data-bs-slide-to="${index}" ${index === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${index + 1}"></button>`
        ).join('');

        return `
            <div id="featuredCarousel" class="carousel slide featured-carousel" data-bs-ride="carousel" data-bs-interval="5000">
                <div class="carousel-indicators">
                    ${indicators}
                </div>
                <div class="carousel-inner">
                    ${slides}
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#featuredCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#featuredCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
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
                
                // Initialize Bootstrap carousel if available
                if (typeof bootstrap !== 'undefined') {
                    const carouselElement = document.getElementById('featuredCarousel');
                    if (carouselElement) {
                        new bootstrap.Carousel(carouselElement, {
                            interval: this.autoPlayDelay,
                            wrap: true,
                            keyboard: true
                        });
                    }
                }
            } else {
                container.innerHTML = '<div class="featured-carousel-empty"><p>No featured images available yet. Check back soon!</p></div>';
            }
        } catch (error) {
            console.error('Error loading carousel:', error);
            container.innerHTML = '<div class="featured-carousel-error"><p>Unable to load featured images. Please try again later.</p></div>';
        }
    }
}

// Export for global use
window.FeaturedCarousel = FeaturedCarousel;

