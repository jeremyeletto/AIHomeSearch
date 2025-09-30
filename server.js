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

// Your Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyBmIYwYoxphBKEmra76G_0lqj_hdDADrVM';
const GEMINI_PROJECT = '549560236821';
const GEMINI_MODEL = 'gemini-1.5-pro';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/projects/${GEMINI_PROJECT}/models/${GEMINI_MODEL}:generateContent`;

// AWS Bedrock configuration
const BEDROCK_REGION = 'us-east-1'; // Titan models only available in us-east-1
const BEDROCK_MODEL_ID = 'amazon.titan-image-generator-v2:0'; // Titan Image Generator v2 with enhanced structure preservation

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

// AWS Bedrock image generation endpoint
app.post('/api/generate-upgrade-image', async (req, res) => {
  try {
    const { base64Image, upgradeType } = req.body;

    if (!base64Image || !upgradeType) {
      return res.status(400).json({ error: 'Missing base64Image or upgradeType' });
    }

    console.log('Generating upgrade image with Bedrock for type:', upgradeType);
    console.log('Base64 image length:', base64Image.length);
    console.log('Base64 image preview:', base64Image.substring(0, 100) + '...');

    // Define upgrade prompts with robust structure preservation and dynamic request insertion
    // Optimized for Titan v2 512 character limit
    const upgradeDefinitions = {
      'stone-walkway': {
        request: 'Add Stone Walkway',
        definition: 'Add modern stone walkway with clean pavers and professional landscaping. Preserve exact house structure.'
      },
      'black-windows': {
        request: 'Add Modern Black Windows',
        definition: 'Install black-framed modern windows. All trim matte black. Preserve exact house structure.'
      },
      'white-siding': {
        request: 'Add White Vinyl Siding',
        definition: 'Replace siding with white vinyl. Black trim and modern windows. Preserve exact house structure.'
      },
      'wrap-porch': {
        request: 'Add Wrap-around Porch',
        definition: 'Add modern wrap-around porch with white columns. White siding, black trim. Preserve exact house structure.'
      },
      'brick-exterior': {
        request: 'Add Brick Exterior',
        definition: 'Replace siding with modern brick facade. Black trim and modern windows. Preserve exact house structure.'
      }
    };

    // Generate dynamic prompt based on upgrade type (optimized for 512 char limit)
    const upgradeInfo = upgradeDefinitions[upgradeType];
    const prompt = upgradeInfo ? 
      `Modern exterior renovation: ${upgradeInfo.request}. ${upgradeInfo.definition} Bright daylight, natural blue sky.` :
      'Enhance this house with modern upgrades';


    // Prepare the request for Titan Image Generator v2 with enhanced structure preservation
    const requestBody = {
      taskType: "IMAGE_VARIATION",
      imageVariationParams: {
        text: prompt,
        images: [base64Image],
        negativeText: "Do NOT change building shape, roof angles, stories, window count, or structural footprint. No additions, porch changes, chimney moves, or redesigns. No art, cartoons, distortions, poor quality, missing elements, blurry images, or structural modifications."
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
      
      console.log('Image generated successfully');
      return res.json({ 
        success: true, 
        imageUrl: generatedImageUrl,
        imageData: generatedImageData,
        upgradeType: upgradeType
      });
    } else {
      throw new Error('No image data in Bedrock response');
    }

  } catch (error) {
    console.error('Bedrock Error:', error);
    return res.status(500).json({ 
      error: 'Image generation failed', 
      details: error.message 
    });
  }
});

// Test Bedrock connectivity
app.get('/api/test-bedrock', async (req, res) => {
  try {
    console.log('Testing Bedrock connectivity...');
    
    // Simple test request for Titan Image Generator v2
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
      message: 'Bedrock API is accessible',
      modelId: BEDROCK_MODEL_ID,
      region: BEDROCK_REGION
    });
  } catch (error) {
    console.error('Bedrock test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Check AWS credentials and Bedrock access'
    });
  }
});

// Serve static files
app.use(express.static('.'));

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Serving files from: ${process.cwd()}`);
  console.log(`🔗 Access your app at: http://localhost:${port}/homes.html`);
});

module.exports = app;
