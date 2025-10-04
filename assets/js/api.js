// API utilities and functions
class APIHandler {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
    }

    // Test API connectivity
    async testAPIs() {
        try {
            console.log('Testing API connectivity...');
            
            // Test Gemini first (primary service)
            console.log('Testing Gemini connectivity...');
            const response = await fetch(`${this.baseUrl}/api/test-gemini`);
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Gemini API is accessible');
                console.log('Model:', result.result?.modelVersion || 'gemini-2.5-flash');
                console.log('Region:', result.region);
                return true;
            } else {
                console.log('❌ Gemini API test failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('API test failed:', error);
            console.log('💡 Make sure to start the server: npm start');
            return false;
        }
    }

    // Load homes from Realtor16 API
    async loadHomes(location = 'New York, NY', page = 1, sort = 'relevant') {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const homesGrid = document.getElementById('homesGrid');
        
        loadingState.style.display = 'block';
        errorState.style.display = 'none';
        homesGrid.style.display = 'none';
        
        // Update global state
        CONFIG.currentPage = page;
        CONFIG.currentSort = sort;
        CONFIG.currentLocation = location;
        
        try {
            console.log('🚀 Optimized Property Loading - Location:', location, 'Page:', page, 'Sort:', sort);
            
            const encodedLocation = encodeURIComponent(location);
            const proxyUrl = `${this.baseUrl}/api/realtor/image-counts?location=${encodedLocation}&search_radius=0&page=${page}&limit=6&sort=${sort}`;
            
            console.log('📡 Fetching properties with preview images from:', proxyUrl);
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                
                if (response.status === 504) {
                    throw new Error(`API timeout: Realtor16 API took too long to respond. Please try again or search in a different location.`);
                }
                
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }
            
            const proxyResponse = await response.json();
            console.log('✅ Properties response received:', proxyResponse);
            
            if (!proxyResponse.success) {
                throw new Error(`Proxy API error: ${proxyResponse.error}`);
            }
            
            const properties = proxyResponse.properties || [];
            const imageCounts = proxyResponse.imageCounts || [];
            
            console.log(`📊 Received ${properties.length} properties with ${imageCounts.length} image counts`);
            
            if (properties && Array.isArray(properties) && properties.length > 0) {
                const recentProperties = properties;
                
                // Calculate total pages based on total count  
                const totalCount = properties.total || properties.count || properties.length || 0;
                CONFIG.totalPages = Math.ceil(totalCount / 6);
                
                console.log(`✅ Properties found: ${recentProperties.length}, Total pages: ${CONFIG.totalPages}`);
                
                // Process homes with optimized image handling
                const homes = this.processProperties(recentProperties, imageCounts);
                
                // Display the homes immediately with preview images
                console.log(`✅ Displaying ${homes.length} properties with preview images`);
                window.homeDisplay.displayHomes(homes);
                window.pagination.updatePaginationControls();
                
                // Phase 2: Fetch high-quality images for properties that need them
                this.handleHighQualityImages(homes);
                
                return homes;
            } else {
                console.log('⚠️ No properties array found in response');
                errorState.style.display = 'block';
                loadingState.style.display = 'none';
                return [];
            }
            
        } catch (error) {
            console.error('❌ Error loading homes from Realtor16 API:', error);
            errorState.style.display = 'block';
            loadingState.style.display = 'none';
            return [];
        }
    }

    // Process properties into home objects
    processProperties(properties, imageCounts) {
        return properties.map((property, index) => {
            const imageData = imageCounts[index] || {};
            
            // Build address from location.address.line (primary field)
            let address = '';
            if (property.location && property.location.address && property.location.address.line) {
                address = property.location.address.line;
            } else if (property.address) {
                address = property.address;
            } else if (property.street_number && property.street_name) {
                address = `${property.street_number} ${property.street_name}`;
            } else if (property.street_address) {
                address = property.street_address;
            } else if (property.line) {
                address = property.line;
            }
            
            // Add city, state, zip from location.address
            const city = property.location?.address?.city || property.city || property.locality || 'New York';
            const state = property.location?.address?.state_code || property.state || property.state_code || 'NY';
            const zip = property.location?.address?.postal_code || property.postal_code || property.postal_code_plus4 || property.zip || '10001';
            
            if (address) {
                address = `${address}, ${city}, ${state} ${zip}`;
            } else {
                address = `${city}, ${state} ${zip}`;
            }
            
            // Get bedrooms and bathrooms from description object
            const bedrooms = property.description?.beds || property.beds || property.bedrooms || property.bed_count || property.bedrooms_total || 0;
            const bathrooms = property.description?.baths_consolidated || property.baths || property.bathrooms || property.bath_count || property.bathrooms_total || 0;
            
            // Get description, handling object case
            let description = property.description?.text || property.description?.value || property.remarks || "Beautiful home with great potential for upgrades.";
            if (typeof description === 'object') {
                description = description.text || description.value || "Beautiful home with great potential for upgrades.";
            }
            
            // Use preview images from the optimized response
            const previewImages = imageData.previewImages || property.preview_images || [];
            const estimatedCount = imageData.estimatedCount || 1;
            
            console.log(`🏠 Property ${index + 1}: ${address} - ${previewImages.length} preview images, estimated ${estimatedCount} total`);
            
            return {
                id: property.property_id || property.id || index + 1,
                address: address,
                price: property.list_price || property.price || property.list_price_min || 0,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                yearBuilt: property.description?.year_built || property.year_built || property.year || property.year_constructed || 0,
                description: description,
                images: previewImages, // Start with preview images
                imageCount: estimatedCount, // Estimated total count
                lazyLoaded: false, // Mark as not yet lazily loaded
                property_data: property, // Store original property data for lazy loading
                sqft: property.description?.sqft || property.sqft || property.square_feet || property.living_area || property.gross_sqft || 0,
                zestimate: property.zestimate || property.estimated_value || property.list_price || property.price || 0,
                daysOnMarket: property.days_on_market || property.dom || 0,
                propertyType: property.description?.type || property.property_type || property.type || property.class || 'Residential',
                hasHighQualityPhotos: imageData.hasHighQualityPhotos || false
            };
        });
    }

    // Handle high-quality image fetching
    async handleHighQualityImages(homes) {
        const propertiesNeedingHighQuality = homes.filter(home => home.hasHighQualityPhotos);
        
        if (propertiesNeedingHighQuality.length > 0) {
            console.log(`🚀 Phase 2: Fetching high-quality images for ${propertiesNeedingHighQuality.length} properties (delayed to avoid rate limits)`);
            
            // Show loading states immediately for properties that need high-quality images
            propertiesNeedingHighQuality.forEach(home => {
                const card = document.querySelector(`[data-home-id="${home.id}"]`);
                if (card && !home.lazyLoaded) {
                    window.imageHandler.showCardLoadingState(card);
                }
            });
            
            // Add delay before fetching high-quality images to avoid overwhelming the API
            setTimeout(async () => {
                try {
                    const batchResponse = await fetch(`${this.baseUrl}/api/realtor/batch-high-quality-images`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            properties: propertiesNeedingHighQuality.map(home => home.property_data)
                        })
                    });
                    
                    if (batchResponse.ok) {
                        const batchData = await batchResponse.json();
                        console.log('✅ Batch high-quality images response:', batchData);
                        
                        if (batchData.success && batchData.results) {
                            this.updateHomesWithHighQualityImages(batchData.results, propertiesNeedingHighQuality, homes);
                        }
                    } else {
                        console.log('⚠️ Failed to fetch high-quality images, using preview images');
                    }
                } catch (error) {
                    console.error('❌ Error fetching high-quality images:', error);
                    console.log('⚠️ Continuing with preview images');
                }
            }, 3000); // Wait 3 seconds before starting high-quality image fetch to respect rate limits
        } else {
            console.log('ℹ️ No properties need high-quality image fetching');
        }
    }

    // Update homes with high-quality images
    updateHomesWithHighQualityImages(results, propertiesNeedingHighQuality, homes) {
        results.forEach((result, index) => {
            const home = propertiesNeedingHighQuality.find(h => h.id == result.propertyId);
            if (home && result.images && result.images.length > 0 && !result.rateLimited) {
                console.log(`🖼️ Updating ${home.address} with ${result.images.length} high-quality images`);
                home.images = result.images;
                home.imageCount = result.imageCount;
                home.lazyLoaded = true;
                
                // Update the displayed card
                window.imageHandler.updateHomeCardImages(home, homes.indexOf(home));
            } else if (result.rateLimited) {
                console.log(`⏳ Property ${home.address} was rate limited, keeping preview images`);
                // Hide loading state for rate-limited properties
                const card = document.querySelector(`[data-home-id="${home.id}"]`);
                if (card) {
                    window.imageHandler.hideCardLoadingState(card);
                }
            }
        });
        
        const successful = results.filter(r => r.images && r.images.length > 0 && !r.rateLimited).length;
        const rateLimited = results.filter(r => r.rateLimited).length;
        const needsRetry = results.filter(r => r.needsRetry).length;
        
        console.log(`✅ Successfully updated ${successful} properties with high-quality images (${rateLimited} rate limited, ${needsRetry} need retry)`);
        
        // Mark homes as rate limited for tracking
        results.forEach((result, index) => {
            const home = homes.find(h => h.id == result.propertyId);
            if (home && result.rateLimited) {
                home.rateLimited = true;
                home.needsRetry = result.needsRetry;
            }
        });
        
        // If there are properties that need retry, schedule a retry attempt
        if (needsRetry > 0) {
            console.log(`🔄 Scheduling retry for ${needsRetry} rate-limited properties in 15 seconds...`);
            setTimeout(async () => {
                const propertiesNeedingRetry = homes.filter(h => h.rateLimited && h.needsRetry);
                if (propertiesNeedingRetry.length > 0) {
                    console.log(`🔄 Starting retry for ${propertiesNeedingRetry.length} properties`);
                    await this.retryFailedHighQualityImages(propertiesNeedingRetry);
                }
            }, 15000); // Retry after 15 seconds
        }
    }

    // Retry failed high-quality image requests
    async retryFailedHighQualityImages(homes) {
        const propertiesNeedingRetry = homes.filter(home => 
            home.hasHighQualityPhotos && 
            (!home.lazyLoaded || home.rateLimited) &&
            home.property_data
        );

        if (propertiesNeedingRetry.length === 0) {
            console.log('ℹ️ No properties need retry for high-quality images');
            return;
        }

        console.log(`🔄 Retrying high-quality images for ${propertiesNeedingRetry.length} properties`);
        
        try {
            const response = await fetch(`${this.baseUrl}/api/realtor/retry-high-quality-images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    properties: propertiesNeedingRetry.map(home => home.property_data)
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Retry high-quality images response:', data);

                if (data.success && data.results) {
                    // Show loading states for retry attempts
                    propertiesNeedingRetry.forEach(home => {
                        const card = document.querySelector(`[data-home-id="${home.id}"]`);
                        if (card) {
                            window.imageHandler.showCardLoadingState(card);
                        }
                    });

                    data.results.forEach((result, index) => {
                        const home = propertiesNeedingRetry.find(h => h.id == result.propertyId);
                        if (home && result.images && result.images.length > 0 && result.retrySuccess) {
                            console.log(`🖼️ Retry successful: Updating ${home.address} with ${result.images.length} high-quality images`);
                            home.images = result.images;
                            home.imageCount = result.imageCount;
                            home.lazyLoaded = true;
                            home.rateLimited = false;
                            
                            // Update the displayed card
                            const cardIndex = CONFIG.homesList.indexOf(home);
                            window.imageHandler.updateHomeCardImages(home, cardIndex);
                        } else if (result.rateLimited) {
                            console.log(`⏳ Property ${home.address} still rate limited after retry`);
                            // Hide loading state for still rate-limited properties
                            const card = document.querySelector(`[data-home-id="${home.id}"]`);
                            if (card) {
                                window.imageHandler.hideCardLoadingState(card);
                            }
                        }
                    });
                    
                    const retrySuccesses = data.results.filter(r => r.retrySuccess).length;
                    const stillRateLimited = data.results.filter(r => r.rateLimited).length;
                    console.log(`✅ Retry complete: ${retrySuccesses} successful, ${stillRateLimited} still rate limited`);
                }
            } else {
                console.log('⚠️ Failed to retry high-quality images');
            }
        } catch (error) {
            console.error('❌ Error retrying high-quality images:', error);
        }
    }

    // Load prompts from API
    async loadPrompts() {
        try {
            console.log('Loading prompts from API...');
            const response = await fetch(`${this.baseUrl}/api/prompts`);
            const data = await response.json();
            
            if (data.success) {
                CONFIG.promptsConfig = data;
                console.log(`✅ Loaded ${data.metadata.totalPrompts} prompts from configuration`);
                window.upgradeUI.renderUpgradePills();
            } else {
                console.error('Failed to load prompts:', data.error);
                window.upgradeUI.renderFallbackPills();
            }
        } catch (error) {
            console.error('Error loading prompts:', error);
            window.upgradeUI.renderFallbackPills();
        }
    }

    // Model switching functionality
    async loadModelInfo() {
        try {
            const response = await fetch(`${this.baseUrl}/api/model-info`);
            const data = await response.json();
            CONFIG.currentModel = data.currentProvider;
            window.modelSwitcher.updateModelDisplay();
        } catch (error) {
            console.error('Failed to load model info:', error);
        }
    }

    // Switch between models
    async switchModel(provider) {
        try {
            const response = await fetch(`${this.baseUrl}/api/switch-model`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ provider })
            });
            
            const data = await response.json();
            if (data.success) {
                CONFIG.currentModel = provider;
                window.modelSwitcher.updateModelDisplay();
                window.notifications.showNotification(`Switched to ${provider.toUpperCase()} model`, 'success');
            } else {
                window.notifications.showNotification(`Failed to switch model: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Failed to switch model:', error);
            window.notifications.showNotification('Failed to switch model', 'error');
        }
    }
}

// Create and export API handler instance
window.apiHandler = new APIHandler();
