const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Model Configuration - Easy switching between providers
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'gemini'; // 'gemini' or 'aws' - Default to Gemini Nano Banana

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyBmIYwYoxphBKEmra76G_0lqj_hdDADrVM';
const GEMINI_PROJECT = '549560236821';
const GEMINI_MODEL = 'gemini-2.5-flash-image-preview'; // Nano Banana - Gemini 2.5 Flash Image Generation
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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
    
    // Use the existing generateWithGemini function
    result = await generateWithGemini(req, res, base64Image, tempUpgradeType);
    
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

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Serving files from: ${process.cwd()}`);
  console.log(`🔗 Access your app at: http://localhost:${port}/homes.html`);
  console.log(`🤖 Current model: ${MODEL_PROVIDER.toUpperCase()} (${MODEL_PROVIDER === 'gemini' ? GEMINI_MODEL : BEDROCK_MODEL_ID})`);
  console.log(`🔄 Switch models: POST /api/switch-model with {"provider": "gemini"|"aws"}`);
});

module.exports = app;
