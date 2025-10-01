const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Model Configuration - Easy switching between providers
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'gemini'; // 'gemini' or 'aws'

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

// Define upgrade prompts for both models
const upgradeDefinitions = {
  'stone-walkway': {
    request: 'Add Stone Walkway',
    definition: 'Add natural stone walkway with pavers leading to entrance. Keep exact house structure, roof, windows unchanged.'
  },
  'black-windows': {
    request: 'Add Modern Black Windows',
    definition: 'Update window frames to black. Keep exact house shape, roof angles, window positions unchanged.'
  },
  'white-siding': {
    request: 'Add White Vinyl Siding',
    definition: 'Replace siding with white vinyl. Keep exact house structure, roof, window positions unchanged.'
  },
  'wrap-porch': {
    request: 'Add Wrap-around Porch',
    definition: 'Add wrap-around porch with columns. Keep exact house structure, roof, window positions unchanged.'
  },
  'brick-exterior': {
    request: 'Add Brick Exterior',
    definition: 'Replace siding with brick facade. Keep exact house structure, roof, window positions unchanged.'
  }
};

// Gemini 2.5 Flash Image (Nano Banana) image generation
async function generateWithGemini(req, res, base64Image, upgradeType) {
  try {
    console.log('Using Gemini 2.5 Flash Image (Nano Banana) for image generation');

    // Generate dynamic prompt based on upgrade type
    const upgradeInfo = upgradeDefinitions[upgradeType];
    const prompt = upgradeInfo ? 
      `Modern exterior renovation: ${upgradeInfo.request}. ${upgradeInfo.definition} Bright daylight, natural blue sky.` :
      'Enhance this house with modern upgrades';

    // Gemini 2.5 Flash Image request format for text-to-image generation
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a high-quality architectural image: ${prompt}. Create a realistic house exterior with modern upgrades while maintaining architectural integrity. Professional photography style, bright daylight, natural blue sky.`
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

    // Generate dynamic prompt based on upgrade type
    const upgradeInfo = upgradeDefinitions[upgradeType];
    const prompt = upgradeInfo ? 
      `Modern exterior renovation: ${upgradeInfo.request}. ${upgradeInfo.definition} Bright daylight, natural blue sky.` :
      'Enhance this house with modern upgrades';

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

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Serving files from: ${process.cwd()}`);
  console.log(`🔗 Access your app at: http://localhost:${port}/homes.html`);
  console.log(`🤖 Current model: ${MODEL_PROVIDER.toUpperCase()} (${MODEL_PROVIDER === 'gemini' ? GEMINI_MODEL : BEDROCK_MODEL_ID})`);
  console.log(`🔄 Switch models: POST /api/switch-model with {"provider": "gemini"|"aws"}`);
});

module.exports = app;
