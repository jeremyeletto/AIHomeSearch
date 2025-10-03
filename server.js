const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Smart caching system
const cache = {
  properties: new Map(), // Cache property listings
  images: new Map(),     // Cache high-quality images
  metadata: new Map()    // Cache metadata like image counts
};

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  properties: 5 * 60 * 1000,    // 5 minutes for property listings
  images: 30 * 60 * 1000,       // 30 minutes for images
  metadata: 10 * 60 * 1000      // 10 minutes for metadata
};

// Helper function to check if cache entry is valid
function isCacheValid(entry) {
  return entry && (Date.now() - entry.timestamp) < entry.ttl;
}

// Helper function to get cached data
function getCachedData(type, key) {
  const entry = cache[type].get(key);
  if (isCacheValid(entry)) {
    console.log(`✅ Cache hit for ${type}: ${key}`);
    return entry.data;
  }
  if (entry) {
    console.log(`⏰ Cache expired for ${type}: ${key}`);
    cache[type].delete(key);
  }
  return null;
}

// Helper function to set cached data
function setCachedData(type, key, data, ttl = CACHE_TTL[type]) {
  cache[type].set(key, {
    data: data,
    timestamp: Date.now(),
    ttl: ttl
  });
  console.log(`💾 Cached ${type}: ${key} (TTL: ${ttl}ms)`);
}

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Environment validation for production
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  const requiredVars = ['RAPIDAPI_KEY'];
  const optionalVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'GEMINI_API_KEY'];
  
  const missing = [];
  const warnings = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName].substring(0, 8)}...`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName].substring(0, 8)}...`);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('💡 Production deployment needs these variables configured!');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Optional environment variables missing:', warnings.join(', '));
    console.warn('💡 AWS features may not work without these variables');
  }
  
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🏠 Server port:', port);
}

// Validate environment on startup
validateEnvironment();

// Model Configuration - Easy switching between providers
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'gemini'; // 'gemini' or 'aws' - Default to Gemini Nano Banana

// Gemini API configuration - SECURE: Use environment variables only
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_PROJECT = process.env.GEMINI_PROJECT || '549560236821';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Validate Gemini API key - REQUIRED for security
if (!GEMINI_API_KEY) {
  console.error('🚨 SECURITY ERROR: GEMINI_API_KEY environment variable is required!');
  console.error('🚨 Action required: Set GEMINI_API_KEY environment variable with your rotated key');
  console.error('🚨 AI generation will not work without this variable');
}

// AWS Bedrock configuration
const BEDROCK_REGION = 'us-east-1'; // Stable Image models available in us-east-1
const BEDROCK_MODEL_ID = 'amazon.titan-image-generator-v2:0'; // Titan Image Generator v2 - reliable and working

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
  region: BEDROCK_REGION,
  // AWS credentials will be loaded from environment variables or AWS config
});

// Proxy endpoint for Gemini API
app.post('/api/generate-image', async (req, res) => {
  try {
    const { base64Image, prompt } = req.body;

    if (!base64Image || !prompt) {
      return res.status(400).json({ error: 'Missing base64Image or prompt' });
    }

    console.log('Generating image with prompt:', prompt);

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "image/png"
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Gemini API failed: ${response.status}`, 
        details: errorText 
      });
    }

    const result = await response.json();
    console.log('Gemini API Response received');

    // Extract the generated image
    if (result.candidates && result.candidates[0] && result.candidates[0].content &&
        result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
      
      const part = result.candidates[0].content.parts[0];
      const inlineData = part.inlineData || part.inline_data;
      
      if (inlineData && inlineData.data) {
        const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/png';
        const generatedImageData = inlineData.data;
        const generatedImageUrl = `data:${mimeType};base64,${generatedImageData}`;
        
        console.log('Image generated successfully');
        return res.json({ 
          success: true, 
          imageUrl: generatedImageUrl,
          imageData: generatedImageData
        });
      }
    }

    return res.status(500).json({ error: 'No image data in Gemini response' });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Retry failed high-quality image requests
app.post('/api/realtor/retry-high-quality-images', async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Properties array is required' 
      });
    }

    console.log(`🔄 Retrying high-quality images for ${properties.length} properties`);
    
    // Process properties sequentially with proper rate limiting (2 req/sec = 500ms between requests)
    const DELAY_BETWEEN_REQUESTS = 600; // 600ms between individual requests (more conservative)
    const results = [];
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`📦 Retrying property ${i + 1}/${properties.length}: ${property.property_id || property.id}`);
      
      // Add delay between requests to respect 2 req/sec rate limit
      if (i > 0) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_REQUESTS}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
      
      try {
        const propertyId = property.property_id || property.id;
        const propertyUrl = property.url || property.property_url || property.rdc_web_url;
        
        // Create cache key for this property
        const cacheKey = propertyUrl ? `url_${encodeURIComponent(propertyUrl)}` : `id_${propertyId}`;
        
        // For retry endpoint, always make a fresh request (don't use cache)
        console.log(`🔄 Making fresh retry request for property ${propertyId}`);
        
        let apiUrl;
        if (propertyUrl) {
          apiUrl = `https://realtor16.p.rapidapi.com/property/photos?url=${encodeURIComponent(propertyUrl)}`;
        } else {
          apiUrl = `https://realtor16.p.rapidapi.com/property/photos?property_id=${propertyId}`;
        }
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          console.log(`⚠️ Retry failed for ${propertyId}: ${response.status}`);
          
          if (response.status === 429) {
            const fallbackResult = { 
              propertyId, 
              images: property.preview_images || [], 
              imageCount: property.preview_images?.length || 1,
              error: `Still rate limited (429)`,
              rateLimited: true,
              needsRetry: true
            };
            results.push(fallbackResult);
            continue;
          }
          
          const fallbackResult = { 
            propertyId, 
            images: property.preview_images || [], 
            imageCount: property.preview_images?.length || 1,
            error: `Retry failed: ${response.status}` 
          };
          results.push(fallbackResult);
          continue;
        }

        const data = await response.json();
        
        // Extract high-quality images from response
        let images = [];
        let imageCount = 1;
        
        if (data && Array.isArray(data)) {
          images = data.map(photo => photo.href || photo.url).filter(Boolean);
          imageCount = images.length;
        } else if (data && data.photos && Array.isArray(data.photos)) {
          images = data.photos.map(photo => photo.href || photo.url).filter(Boolean);
          imageCount = images.length;
        } else if (data && data.media && Array.isArray(data.media)) {
          images = data.media
            .filter(media => media.type === 'realtordotcom_mls_listing_image' || media.type === 'photo')
            .map(media => media.url || media.href)
            .filter(Boolean);
          imageCount = images.length;
        }
        
        // Fallback to preview images if no high-quality images found
        if (images.length === 0 && property.preview_images) {
          images = property.preview_images;
        }
        
        const result = { 
          propertyId, 
          images: images,
          imageCount: imageCount,
          highQuality: images.length > 0,
          cached: false,
          retrySuccess: true
        };
        
        // Cache the result
        setCachedData('images', cacheKey, result);
        
        console.log(`✅ Retry successful: Got ${imageCount} high-quality images for property ${propertyId}`);
        
        results.push(result);
        
      } catch (error) {
        console.error(`❌ Retry error for property ${property.property_id || property.id}:`, error);
        const errorResult = { 
          propertyId: property.property_id || property.id, 
          images: property.preview_images || [],
          imageCount: property.preview_images?.length || 1,
          error: error.message,
          retryFailed: true
        };
        
        results.push(errorResult);
      }
    }
    
    console.log(`✅ Retry processing complete: ${results.length} properties processed`);

    res.json({
      success: true,
      results: results,
      metadata: {
        totalProcessed: results.length,
        successful: results.filter(r => !r.error && !r.rateLimited).length,
        withHighQualityImages: results.filter(r => r.highQuality).length,
        retrySuccesses: results.filter(r => r.retrySuccess).length,
        stillRateLimited: results.filter(r => r.rateLimited).length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in retry endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during retry' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test Gemini connectivity
app.get('/api/test-gemini', async (req, res) => {
  try {
    const testResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: "Hello, can you respond with 'API test successful'?" }]
          }
        ]
      })
    });

    if (!testResponse.ok) {
      throw new Error(`Test failed: ${testResponse.status}`);
    }

    const result = await testResponse.json();
    res.json({ 
      success: true, 
      message: 'Gemini API is accessible',
      result: result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Image generation endpoint with model switching
app.post('/api/generate-upgrade-image', async (req, res) => {
  try {
    const { base64Image, upgradeType } = req.body;

    if (!base64Image || !upgradeType) {
      return res.status(400).json({ error: 'Missing base64Image or upgradeType' });
    }

    console.log(`Generating upgrade image with ${MODEL_PROVIDER.toUpperCase()} for type:`, upgradeType);
    console.log('Base64 image length:', base64Image.length);
    console.log('Base64 image preview:', base64Image.substring(0, 100) + '...');

    // Route to appropriate model based on configuration
    if (MODEL_PROVIDER === 'gemini') {
      return await generateWithGemini(req, res, base64Image, upgradeType);
    } else {
      return await generateWithAWS(req, res, base64Image, upgradeType);
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: 'Image generation failed', 
      details: error.message 
    });
  }
});

// Load prompts configuration from JSON file
let promptsConfig = null;

function loadPromptsConfig() {
  try {
    const configPath = path.join(__dirname, 'prompts-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    promptsConfig = JSON.parse(configData);
    console.log(`✅ Loaded ${promptsConfig.metadata.totalPrompts} prompts from configuration`);
    return promptsConfig;
  } catch (error) {
    console.error('❌ Error loading prompts configuration:', error);
    // Fallback to basic prompts
    return {
      prompts: {
        'stone-walkway': {
          id: 'STONE_WALKWAY_001',
          name: 'Add Stone Walkway',
          request: 'Add Stone Walkway',
          definition: 'Add natural stone walkway with pavers leading to entrance. Keep exact house structure, roof, windows unchanged.',
          prompt: 'Modern exterior renovation: Add Stone Walkway. Add natural stone walkway with pavers leading to entrance. Keep exact house structure, roof, windows unchanged. Bright daylight, natural blue sky.',
          negativePrompt: 'Do NOT change the building\'s fundamental shape, roof angles, number of stories, window count/general position, or the overall structural footprint.',
          valueIncrease: 0.08
        }
      }
    };
  }
}

// Initialize prompts configuration
loadPromptsConfig();

// Helper function to get upgrade info by ID or key
function getUpgradeInfo(upgradeType) {
  if (!promptsConfig || !promptsConfig.prompts) {
    return null;
  }
  
  // Try to find by key first (for backward compatibility)
  if (promptsConfig.prompts[upgradeType]) {
    return promptsConfig.prompts[upgradeType];
  }
  
  // Try to find by ID
  for (const [key, prompt] of Object.entries(promptsConfig.prompts)) {
    if (prompt.id === upgradeType) {
      return prompt;
    }
  }
  
  return null;
}

// Gemini 2.5 Flash Image (Nano Banana) image generation
async function generateWithGemini(req, res, base64Image, upgradeType) {
  try {
    console.log('Using Gemini 2.5 Flash Image (Nano Banana) for image generation');
    console.log(`Processing upgrade type: ${upgradeType}`);

    // Get upgrade info from new prompts system
    const upgradeInfo = getUpgradeInfo(upgradeType);
    
    if (!upgradeInfo) {
      console.error(`❌ No upgrade info found for: ${upgradeType}`);
      return res.status(400).json({
        success: false,
        error: `Unknown upgrade type: ${upgradeType}`,
        availablePrompts: Object.keys(promptsConfig?.prompts || {})
      });
    }

    console.log(`✅ Using prompt ID: ${upgradeInfo.id} - ${upgradeInfo.name}`);
    
    // Use the pre-formatted prompt from configuration
    const prompt = upgradeInfo.prompt || 
      `Modern exterior renovation: ${upgradeInfo.request}. ${upgradeInfo.definition} Bright daylight, natural blue sky.`;

    // Gemini 2.5 Flash Image request format for image-to-image generation
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            },
            {
              text: `Transform this house image: ${prompt}. Maintain the exact same architectural structure, roof lines, window positions, and overall building footprint. Only modify the specified elements while preserving all structural details. Professional photography style, bright daylight, natural blue sky.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    console.log('Sending request to Gemini 2.5 Flash Image (Nano Banana)...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Gemini response received');

    if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
      const content = responseData.candidates[0].content;
      
      // Look for image data in the response
      if (content.parts && content.parts.length > 0) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            
            console.log('Image generated successfully with Gemini Nano Banana');
            return res.json({ 
              success: true, 
              imageUrl: generatedImageUrl,
              imageData: part.inlineData.data,
              upgradeType: upgradeType,
              model: 'gemini-2.5-flash-image-preview'
            });
          }
        }
      }
    }

    // If no image data, return the text response for debugging
    console.log('No image data found, returning text response:', JSON.stringify(responseData, null, 2));
    throw new Error('No image data in Gemini response');

  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
}

// AWS Bedrock image generation
async function generateWithAWS(req, res, base64Image, upgradeType) {
  try {
    console.log('Using AWS Bedrock Titan Image Generator v2 for image generation');
    console.log(`Processing upgrade type: ${upgradeType}`);

    // Get upgrade info from new prompts system
    const upgradeInfo = getUpgradeInfo(upgradeType);
    
    if (!upgradeInfo) {
      console.error(`❌ No upgrade info found for: ${upgradeType}`);
      return res.status(400).json({
        success: false,
        error: `Unknown upgrade type: ${upgradeType}`,
        availablePrompts: Object.keys(promptsConfig?.prompts || {})
      });
    }

    console.log(`✅ Using prompt ID: ${upgradeInfo.id} - ${upgradeInfo.name}`);
    
    // Use the pre-formatted prompt from configuration
    const prompt = upgradeInfo.prompt || 
      `Modern exterior renovation: ${upgradeInfo.request}. ${upgradeInfo.definition} Bright daylight, natural blue sky.`;

    // Prepare the request for Titan Image Generator v2
    const requestBody = {
      taskType: "IMAGE_VARIATION",
      imageVariationParams: {
        text: prompt,
        images: [base64Image],
        negativeText: "Do NOT change building shape, roof angles, stories, window count, or structural footprint. No additions, porch changes, chimney moves, or redesigns. No art, cartoons, distortions, poor quality, missing elements, blurry images, or structural modifications. Keep exact house structure unchanged."
      }
    };

    console.log('Sending request to Bedrock Titan Image Generator v2...');

    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log('Bedrock response received');

    if (responseBody.images && responseBody.images.length > 0) {
      const generatedImageData = responseBody.images[0];
      const generatedImageUrl = `data:image/png;base64,${generatedImageData}`;
      
      console.log('Image generated successfully with AWS');
      return res.json({ 
        success: true, 
        imageUrl: generatedImageUrl,
        imageData: generatedImageData,
        upgradeType: upgradeType,
        model: 'aws-titan-v2'
      });
    } else {
      throw new Error('No image data in Bedrock response');
    }

  } catch (error) {
    console.error('AWS Bedrock Error:', error);
    throw error;
  }
}

// Test model connectivity
app.get('/api/test-model', async (req, res) => {
  try {
    console.log(`Testing ${MODEL_PROVIDER.toUpperCase()} connectivity...`);
    
    if (MODEL_PROVIDER === 'gemini') {
      // Test Gemini API
      const testResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: "Hello, this is a test message." }]
          }]
        })
      });

      if (testResponse.ok) {
        res.json({ 
          success: true, 
          message: 'Gemini 2.5 Flash Image (Nano Banana) API is accessible',
          model: GEMINI_MODEL,
          provider: 'gemini'
        });
      } else {
        throw new Error(`Gemini API error: ${testResponse.status}`);
      }
    } else {
      // Test AWS Bedrock
      const testRequestBody = {
        taskType: "TEXT_IMAGE",
        textToImageParams: {
          text: "A simple test house",
          negativeText: "blurry, low quality"
        }
      };

      const command = new InvokeModelCommand({
        modelId: BEDROCK_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(testRequestBody)
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      res.json({ 
        success: true, 
        message: 'AWS Bedrock API is accessible',
        modelId: BEDROCK_MODEL_ID,
        region: BEDROCK_REGION,
        provider: 'aws'
      });
    }
  } catch (error) {
    console.error(`${MODEL_PROVIDER.toUpperCase()} test failed:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: `Check ${MODEL_PROVIDER.toUpperCase()} credentials and access`,
      provider: MODEL_PROVIDER
    });
  }
});

// Serve static files
app.use(express.static('.'));

// Model switching endpoint
app.post('/api/switch-model', (req, res) => {
  const { provider } = req.body;
  
  if (provider === 'gemini' || provider === 'aws') {
    // Update environment variable for current session
    process.env.MODEL_PROVIDER = provider;
    
    res.json({
      success: true,
      message: `Switched to ${provider.toUpperCase()} model`,
      currentProvider: provider
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid provider. Use "gemini" or "aws"'
    });
  }
});

// Get current model info
app.get('/api/model-info', (req, res) => {
  res.json({
    currentProvider: MODEL_PROVIDER,
    geminiModel: GEMINI_MODEL,
    awsModel: BEDROCK_MODEL_ID,
    availableProviders: ['gemini', 'aws']
  });
});

// Get available prompts endpoint
app.get('/api/prompts', (req, res) => {
  try {
    if (!promptsConfig) {
      loadPromptsConfig();
    }
    
    res.json({
      success: true,
      prompts: promptsConfig.prompts,
      categories: promptsConfig.categories,
      metadata: promptsConfig.metadata
    });
  } catch (error) {
    console.error('Error getting prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load prompts configuration'
    });
  }
});

// Custom Gemini generation function
async function generateCustomWithGemini(base64Image, customPrompt, negativePrompt) {
  try {
    console.log('Using Gemini 2.5 Flash Image (Nano Banana) for custom upgrade generation');
    
    // Gemini 2.5 Flash Image request format for image-to-image generation
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: customPrompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    console.log('Making request to Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', response.status, errorText);
      return {
        success: false,
        error: `Gemini API request failed: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json();
    console.log('Gemini API Response received');
    console.log('Full Gemini response structure:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const parts = data.candidates[0].content.parts;
      console.log('Found parts in response:', parts.length);
      
      // Look for image data in the response
      for (const part of parts) {
        console.log('Checking part:', JSON.stringify(part, null, 2));
        if (part.inline_data && part.inline_data.data) {
          const imageData = part.inline_data.data;
          const imageUrl = `data:image/jpeg;base64,${imageData}`;
          
          console.log('✅ Custom upgrade image generated successfully with Gemini');
          return {
            success: true,
            imageUrl: imageUrl
          };
        }
      }
    }

    console.error('❌ No image data found in Gemini response');
    console.error('Response structure:', {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length,
      firstCandidate: data.candidates?.[0],
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partsLength: data.candidates?.[0]?.content?.parts?.length
    });
    
    return {
      success: false,
      error: 'No image data found in Gemini response'
    };

  } catch (error) {
    console.error('Error in custom Gemini generation:', error);
    return {
      success: false,
      error: `Gemini generation failed: ${error.message}`
    };
  }
}

// Gemini generation function for custom upgrades (returns data instead of sending response)
async function generateWithGeminiForCustom(base64Image, upgradeType) {
  try {
    console.log('Using Gemini 2.5 Flash Image (Nano Banana) for custom upgrade generation');
    console.log(`Processing upgrade type: ${upgradeType}`);

    // Get upgrade info from new prompts system
    const upgradeInfo = getUpgradeInfo(upgradeType);
    
    if (!upgradeInfo) {
      console.error(`❌ No upgrade info found for: ${upgradeType}`);
      return {
        success: false,
        error: `Unknown upgrade type: ${upgradeType}`
      };
    }

    console.log(`✅ Using prompt ID: ${upgradeInfo.id} - ${upgradeInfo.name}`);
    
    // Use the pre-formatted prompt from configuration
    const prompt = upgradeInfo.prompt || 
      `Modern exterior renovation: ${upgradeInfo.request}. ${upgradeInfo.definition} Bright daylight, natural blue sky.`;

    // Gemini 2.5 Flash Image request format for image-to-image generation
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            },
            {
              text: `Transform this house image: ${prompt}. Maintain the exact same architectural structure, roof lines, window positions, and overall building footprint. Only modify the specified elements while preserving all structural details. Professional photography style, bright daylight, natural blue sky.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    console.log('Sending request to Gemini 2.5 Flash Image (Nano Banana)...');

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Gemini response received');

    if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
      const content = responseData.candidates[0].content;
      
      // Look for image data in the response
      if (content.parts && content.parts.length > 0) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            
            console.log('Image generated successfully with Gemini Nano Banana');
            return { 
              success: true, 
              imageUrl: generatedImageUrl,
              imageData: part.inlineData.data,
              upgradeType: upgradeType,
              model: 'gemini-2.5-flash-image-preview'
            };
          }
        }
      }
    }

    // If no image data, return the text response for debugging
    console.log('No image data found, returning text response:', JSON.stringify(responseData, null, 2));
    return {
      success: false,
      error: 'No image data in Gemini response'
    };

  } catch (error) {
    console.error('Gemini Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Custom AWS generation function
async function generateCustomWithAWS(base64Image, customPrompt, negativePrompt) {
  try {
    console.log('Using AWS Bedrock Titan Image Generator v2 for custom upgrade generation');
    
    const bedrock = new AWS.BedrockRuntime({ region: AWS_REGION });
    
    const requestBody = {
      taskType: "IMAGE_VARIATION",
      imageVariationParams: {
        text: customPrompt,
        negativeText: negativePrompt,
        images: [base64Image]
      },
      imageGenerationConfig: {
        numberOfImages: 1,
        quality: "premium",
        height: 1024,
        width: 1024,
        cfgScale: 8.0,
        seed: Math.floor(Math.random() * 1000000)
      }
    };

    console.log('Making request to AWS Bedrock...');
    const response = await bedrock.invokeModel({
      modelId: BEDROCK_MODEL_ID,
      contentType: 'application/json',
      body: JSON.stringify(requestBody)
    }).promise();

    console.log('AWS Bedrock response received');
    const responseBody = JSON.parse(response.body.toString());
    
    if (responseBody.images && responseBody.images.length > 0) {
      const imageData = responseBody.images[0];
      const imageUrl = `data:image/jpeg;base64,${imageData}`;
      
      console.log('✅ Custom upgrade image generated successfully with AWS Bedrock');
      return {
        success: true,
        imageUrl: imageUrl
      };
    } else {
      console.error('❌ No image data found in AWS Bedrock response');
      return {
        success: false,
        error: 'No image data found in AWS Bedrock response'
      };
    }

  } catch (error) {
    console.error('Error in custom AWS generation:', error);
    return {
      success: false,
      error: `AWS Bedrock generation failed: ${error.message}`
    };
  }
}

// Custom upgrade endpoint
app.post('/api/generate-custom-upgrade', async (req, res) => {
  try {
    const { base64Image, customText } = req.body;
    
    if (!base64Image || !customText) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: base64Image and customText'
      });
    }
    
    console.log('Custom upgrade request received:', {
      customText: customText,
      imageSize: base64Image.length,
      provider: MODEL_PROVIDER
    });
    
    // Create custom prompt with professional designer context
    const customPrompt = `You are a professional interior and exterior designer. I will provide an image of an existing home with a specific renovation request. Your job is to transform the home while preserving its fundamental architectural integrity.

RENOVATION REQUEST: ${customText}

DESIGN BRIEF: ${customText}

CRITICAL REQUIREMENTS:
- Preserve the exact building structure, roof lines, window positions, and overall architectural footprint where possible
- Only modify the elements specified in the request
- Maintain professional photography quality with bright daylight and natural blue sky
- Ensure realistic materials and construction methods
- Create a cohesive design that complements the existing architecture

Transform this home according to the custom request: ${customText}`;

    const negativePrompt = "Do NOT change the building's fundamental shape, roof angles, number of stories, window count/general position, or the overall structural footprint unless specifically requested. Avoid adding unrealistic additions, altering the core structure, or completely redesigning the architecture unless explicitly asked. No stylized art, cartoons, distorted perspectives, or poor quality textures. No missing elements.";

    let result;
    
    // Use the same approach as single prompts - create a temporary upgrade type
    const tempUpgradeType = 'custom-upgrade';
    
    // Create a temporary upgrade info object for the custom request
    const tempUpgradeInfo = {
      id: 'CUSTOM_UPGRADE_001',
      name: 'Custom Upgrade',
      request: customText,
      prompt: customPrompt,
      negativePrompt: negativePrompt,
      valueIncrease: 0.15
    };
    
    // Temporarily add to prompts config
    if (!promptsConfig.prompts) {
      promptsConfig.prompts = {};
    }
    promptsConfig.prompts[tempUpgradeType] = tempUpgradeInfo;
    
    // Use the existing generateWithGemini function but don't pass res to avoid double response
    result = await generateWithGeminiForCustom(base64Image, tempUpgradeType);
    
    // Clean up temporary prompt
    delete promptsConfig.prompts[tempUpgradeType];
    
    if (result.success) {
      console.log('✅ Custom upgrade generated successfully');
      res.json({
        success: true,
        imageUrl: result.imageUrl,
        provider: MODEL_PROVIDER,
        customText: customText
      });
    } else {
      console.error('❌ Custom upgrade generation failed:', result.error);
      res.status(500).json({
        success: false,
        error: result.error || 'Custom upgrade generation failed'
      });
    }
    
  } catch (error) {
    console.error('Error in custom upgrade endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during custom upgrade generation'
    });
  }
});

// Realtor API Proxy endpoint to avoid CORS issues
app.get('/api/realtor/search', async (req, res) => {
  try {
    const { location, search_radius = 0, page = 1, limit = 6, sort = 'relevant' } = req.query;
    
    console.log('Realtor Search Proxy - Request params:', { location, search_radius, page, limit, sort });
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    const encodedLocation = encodeURIComponent(location);
    const apiUrl = `https://realtor16.p.rapidapi.com/search/forsale?location=${encodedLocation}&search_radius=${search_radius}&page=${page}&limit=${limit}&sort=${sort}`;
    
    console.log('Realtor Search Proxy - API URL:', apiUrl);
    console.log('Realtor Search Proxy - API Key available:', !!process.env.RAPIDAPI_KEY);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
      }
    });

    console.log('Realtor Search Proxy - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Realtor Search Proxy - API Error:', errorText);
      throw new Error(`Realtor API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Realtor Search Proxy - Data received:', data ? Object.keys(data) : 'null');
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error proxying Realtor API request:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch property data from Realtor API: ${error.message}`
    });
  }
});

// Realtor API Photos Proxy endpoint
app.get('/api/realtor/photos', async (req, res) => {
  try {
    const { property_id, url } = req.query;
    
    if (!property_id && !url) {
      return res.status(400).json({
        success: false,
        error: 'Either property_id or url parameter is required'
      });
    }

    let apiUrl;
    if (url) {
      apiUrl = `https://realtor16.p.rapidapi.com/property/photos?url=${encodeURIComponent(url)}`;
    } else {
      apiUrl = `https://realtor16.p.rapidapi.com/property/photos?property_id=${property_id}`;
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Realtor Photos API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error proxying Realtor Photos API request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch photos from Realtor API'
    });
  }
});

// Optimized endpoint for getting properties with smart image counts and caching
app.get('/api/realtor/image-counts', async (req, res) => {
  try {
    const { location, search_radius = 0, page = 1, limit = 6, sort = 'relevant' } = req.query;
    
    console.log('🚀 Optimized Property Loader - Request params:', { location, search_radius, page, limit, sort });
    
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    // Check for required API key
    if (!process.env.RAPIDAPI_KEY) {
      console.error('❌ RAPIDAPI_KEY environment variable not configured');
      return res.status(500).json({
        success: false,
        error: 'Property API not configured - missing RAPIDAPI_KEY',
        troubleshooting: 'Check environment variables in production deployment'
      });
    }

    // Create cache key for this request
    const cacheKey = `${location}_${search_radius}_${page}_${limit}_${sort}`;
    
    // Check cache first
    const cachedData = getCachedData('properties', cacheKey);
    if (cachedData) {
      console.log('⚡ Returning cached property data');
      return res.json(cachedData);
    }

    // First get the property listings
    const encodedLocation = encodeURIComponent(location);
    const apiUrl = `https://realtor16.p.rapidapi.com/search/forsale?location=${encodedLocation}&search_radius=${search_radius}&page=${page}&limit=${limit}&sort=${sort}`;
    
    console.log('📡 Fetching property listings from:', apiUrl);
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Property listings API Error:', errorText);
      throw new Error(`Property listings request failed: ${response.status} - ${errorText}`);
    }

    const listingsData = await response.json();
    console.log('✅ Got listings:', listingsData && listingsData.properties ? listingsData.properties.length : 'no properties');
    
    if (!listingsData || !listingsData.properties) {
      const emptyResponse = {
        success: true,
        properties: [],
        imageCounts: []
      };
      setCachedData('properties', cacheKey, emptyResponse);
      return res.json(emptyResponse);
    }

    // Smart image count extraction with preview images
    const properties = listingsData.properties.map(property => {
      const propertyId = property.property_id || property.id;
      let previewImages = [];
      let estimatedCount = 1;
      
      // Extract preview images and estimate count from various fields
      if (property.photos && Array.isArray(property.photos)) {
        previewImages = property.photos.slice(0, 3).map(photo => photo.href || photo.url);
        estimatedCount = property.photos.length;
      } else if (property.media && Array.isArray(property.media)) {
        previewImages = property.media
          .filter(media => media.type === 'photo' || media.category === 'Photo')
          .slice(0, 3)
          .map(media => media.url || media.href);
        estimatedCount = property.media.length;
      } else if (property.images && Array.isArray(property.images)) {
        previewImages = property.images.slice(0, 3).map(img => img.href || img.url);
        estimatedCount = property.images.length;
      } else if (property.photo && Array.isArray(property.photo)) {
        previewImages = property.photo.slice(0, 3).map(photo => photo.href || photo.url);
        estimatedCount = property.photo.length;
      } else if (property.photos_list && Array.isArray(property.photos_list)) {
        previewImages = property.photos_list.slice(0, 3).map(photo => photo.href || photo.url);
        estimatedCount = property.photos_list.length;
      } else if (property.photos_count) {
        estimatedCount = parseInt(property.photos_count) || 1;
      } else if (property.total_photos) {
        estimatedCount = parseInt(property.total_photos) || 1;
      }
      
      // Add preview images to property object for immediate display
      property.preview_images = previewImages.filter(img => img && img.startsWith('http'));
      
      return {
        propertyId: propertyId,
        estimatedCount: estimatedCount,
        previewImages: property.preview_images,
        hasHighQualityPhotos: estimatedCount > 1, // Flag for lazy loading
        property: property
      };
    });

    console.log('📊 Processed properties with image estimates:', properties.length);

    const responseData = {
      success: true,
      properties: listingsData.properties,
      imageCounts: properties,
      metadata: {
        totalProperties: listingsData.properties.length,
        hasHighQualityPhotos: properties.some(p => p.hasHighQualityPhotos)
      }
    };

    // Cache the response
    setCachedData('properties', cacheKey, responseData);

    res.json(responseData);

  } catch (error) {
    console.error('❌ Error in optimized property loader:', error);
    
    // Handle specific timeout errors
    if (error.name === 'AbortError') {
      res.status(504).json({
        success: false,
        error: 'Request timeout - External API took too long to respond',
        timeout: true
      });
    } else {
      res.status(500).json({
        success: false,
        error: `Failed to get properties: ${error.message}`
      });
    }
  }
});

// Optimized endpoint for fetching high-quality images with smart batching and caching
app.post('/api/realtor/batch-high-quality-images', async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'properties array is required'
      });
    }

    console.log(`🚀 Batch High-Quality Images - Processing ${properties.length} properties`);
    
    // Process properties with intelligent batching, rate limiting, and caching
    // Rate limit: 2 requests per second = 500ms between requests
    const MAX_CONCURRENT = 1; // Only 1 concurrent request to respect 2 req/sec limit
    const DELAY_BETWEEN_REQUESTS = 600; // 600ms between individual requests (more conservative)
    
    const results = [];
    
    // Process properties sequentially with proper rate limiting (2 req/sec = 500ms between requests)
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(`📦 Processing property ${i + 1}/${properties.length}: ${property.property_id || property.id}`);
      
      // Add delay between requests to respect 2 req/sec rate limit
      if (i > 0) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_REQUESTS}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
      }
      
      try {
        const propertyId = property.property_id || property.id;
        const propertyUrl = property.url || property.property_url || property.rdc_web_url;
        
        // Create cache key for this property
        const cacheKey = propertyUrl ? `url_${encodeURIComponent(propertyUrl)}` : `id_${propertyId}`;
        
        // Check cache first, but skip if it's a rate-limited result that needs retry
        const cachedImages = getCachedData('images', cacheKey);
        if (cachedImages && !cachedImages.needsRetry) {
          console.log(`⚡ Cache hit for property ${propertyId}`);
          results.push({
            propertyId,
            images: cachedImages.images,
            imageCount: cachedImages.imageCount,
            highQuality: cachedImages.highQuality,
            cached: true
          });
          continue; // Move to next property
        }
        
        if (cachedImages && cachedImages.needsRetry) {
          console.log(`🔄 Retrying cached rate-limited property ${propertyId}`);
        }
          
          let apiUrl;
          if (propertyUrl) {
            apiUrl = `https://realtor16.p.rapidapi.com/property/photos?url=${encodeURIComponent(propertyUrl)}`;
          } else {
            apiUrl = `https://realtor16.p.rapidapi.com/property/photos?property_id=${propertyId}`;
          }
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
            }
          });

          if (!response.ok) {
            console.log(`⚠️ Photo request failed for ${propertyId}: ${response.status}`);
            
            // Handle rate limiting (429) with longer retry delay
            if (response.status === 429) {
              console.log(`🔄 Rate limited for ${propertyId}, will retry later`);
              const fallbackResult = { 
                propertyId, 
                images: property.preview_images || [], 
                imageCount: property.preview_images?.length || 1,
                error: `Rate limited (429) - will retry`,
                rateLimited: true,
                needsRetry: true
              };
              
              // Cache rate limit results for shorter time to allow retries
              setCachedData('images', cacheKey, fallbackResult, 2 * 60 * 1000); // 2 minutes
              
              results.push(fallbackResult);
              continue;
            }
            
            const fallbackResult = { 
              propertyId, 
              images: property.preview_images || [], 
              imageCount: property.preview_images?.length || 1,
              error: `API request failed: ${response.status}` 
            };
            
            // Cache other errors for shorter time
            setCachedData('images', cacheKey, fallbackResult, 2 * 60 * 1000); // 2 minutes
            
            results.push(fallbackResult);
            continue;
          }

          const data = await response.json();
          
          // Extract high-quality images from response
          let images = [];
          let imageCount = 1;
          
          if (data && Array.isArray(data)) {
            images = data.map(photo => photo.href || photo.url).filter(Boolean);
            imageCount = images.length;
          } else if (data && data.photos && Array.isArray(data.photos)) {
            images = data.photos.map(photo => photo.href || photo.url).filter(Boolean);
            imageCount = images.length;
          } else if (data && data.media && Array.isArray(data.media)) {
            images = data.media
              .filter(media => media.type === 'realtordotcom_mls_listing_image' || media.type === 'photo')
              .map(media => media.url || media.href)
              .filter(Boolean);
            imageCount = images.length;
          }
          
          // Fallback to preview images if no high-quality images found
          if (images.length === 0 && property.preview_images) {
            images = property.preview_images;
          }
          
          const result = { 
            propertyId, 
            images: images,
            imageCount: imageCount,
            highQuality: images.length > 0,
            cached: false
          };
          
          // Cache the result
          setCachedData('images', cacheKey, result);
          
          console.log(`✅ Got ${imageCount} high-quality images for property ${propertyId}`);
          
          results.push(result);
          
      } catch (error) {
        console.error(`❌ Error fetching images for ${property.property_id || property.id}:`, error);
        const errorResult = { 
          propertyId: property.property_id || property.id, 
          images: property.preview_images || [],
          imageCount: property.preview_images?.length || 1,
          error: error.message 
        };
        
        // Cache error result with short TTL to avoid repeated failures
        const cacheKey = property.url ? `url_${encodeURIComponent(property.url)}` : `id_${property.property_id || property.id}`;
        setCachedData('images', cacheKey, errorResult, 1 * 60 * 1000); // 1 minute
        
        results.push(errorResult);
      }
    }
    
    console.log(`✅ Batch processing complete: ${results.length} properties processed`);

    res.json({
      success: true,
      results: results,
      metadata: {
        totalProcessed: results.length,
        successful: results.filter(r => !r.error).length,
        withHighQualityImages: results.filter(r => r.highQuality).length,
        cachedResults: results.filter(r => r.cached).length
      }
    });

  } catch (error) {
    console.error('❌ Error in batch high-quality images:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch high-quality images: ${error.message}`
    });
  }
});

// Lightweight endpoint for getting just photo counts from individual properties
app.post('/api/realtor/batch-photo-counts', async (req, res) => {
  try {
    const { propertyIds } = req.body;
    
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'propertyIds array is required'
      });
    }

    console.log(`Batch Photo Counts - Fetching counts for ${propertyIds.length} properties`);
    
    // Make concurrent requests for photo counts (using rapidapi limits)
    const photoCountPromises = propertyIds.map(async (propertyId, index) => {
      try {
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, index * 100)); // 100ms between requests
        
        const apiUrl = `https://realtor16.p.rapidapi.com/property/photos?property_id=${propertyId}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'realtor16.p.rapidapi.com'
          }
        });

        if (!response.ok) {
          console.log(`Photo count request failed for ${propertyId}: ${response.status}`);
          return { propertyId, photoCount: 1, error: `API request failed: ${response.status}` };
        }

        const data = await response.json();
        
        // Extract photo count from response
        let photoCount = 1;
        if (data && Array.isArray(data)) {
          photoCount = data.length;
        } else if (data && data.photos && Array.isArray(data.photos)) {
          photoCount = data.photos.length;
        } else if (data && data.media && Array.isArray(data.media)) {
          photoCount = data.media.length;
        }
        
        console.log(`Got ${photoCount} photos for property ${propertyId}`);
        
        return { propertyId, photoCount };
        
      } catch (error) {
        console.error(`Error fetching photo count for ${propertyId}:`, error);
        return { propertyId, photoCount: 1, error: error.message };
      }
    });

    const results = await Promise.all(photoCountPromises);
    
    console.log('Batch Photo Counts response:', results);

    res.json({
      success: true,
      photoCounts: results
    });

  } catch (error) {
    console.error('Error in batch photo counts:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch photo counts: ${error.message}`
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Serving files from: ${process.cwd()}`);
  console.log(`🔗 Access your app at: http://localhost:${port}/homes.html`);
  console.log(`🤖 Current model: ${MODEL_PROVIDER.toUpperCase()} (${MODEL_PROVIDER === 'gemini' ? GEMINI_MODEL : BEDROCK_MODEL_ID})`);
  console.log(`🔄 Switch models: POST /api/switch-model with {"provider": "gemini"|"aws"}`);
});

module.exports = app;
