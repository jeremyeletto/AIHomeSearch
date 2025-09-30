// Stable Image Models Integration for AWS Bedrock
// This file contains the integration code for Stability AI models once access is approved

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Stable Image Models Configuration
const STABLE_MODELS = {
  CONTROL_STRUCTURE: 'stability.stable-image-control-structure',
  INPAINT: 'stability.stable-image-inpaint',
  SEARCH_REPLACE: 'stability.stable-image-search-replace',
  STYLE_TRANSFER: 'stability.stable-image-style-transfer',
  ERASE_OBJECT: 'stability.stable-image-erase-object'
};

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
  region: 'us-east-1'
});

/**
 * Generate upgrade image using Stable Image Control Structure
 * This model is specifically designed to preserve structure while making edits
 */
async function generateUpgradeWithStableStructure(base64Image, upgradeType) {
  const upgradePrompts = {
    'stone-walkway': 'Add a natural stone walkway leading to the front door with stone pavers',
    'black-windows': 'Change window frames to black while preserving window structure',
    'white-siding': 'Change exterior siding to white vinyl while preserving architecture',
    'wrap-porch': 'Add a wrap-around porch with white columns',
    'brick-exterior': 'Change exterior to brick facade while preserving structure'
  };

  const prompt = upgradePrompts[upgradeType] || 'Enhance this house with modern upgrades';

  // Stable Image Control Structure request format
  const requestBody = {
    taskType: "STRUCTURE_CONTROL",
    structureControlParams: {
      text: prompt,
      image: base64Image,
      strength: 0.7, // Control how much the structure is preserved (0.0-1.0)
      guidance: 7.5,  // How closely to follow the prompt
      steps: 20,      // Number of denoising steps
      seed: Math.floor(Math.random() * 1000000)
    }
  };

  try {
    const command = new InvokeModelCommand({
      modelId: STABLE_MODELS.CONTROL_STRUCTURE,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.images && responseBody.images.length > 0) {
      return {
        success: true,
        imageUrl: `data:image/png;base64,${responseBody.images[0]}`,
        imageData: responseBody.images[0],
        upgradeType: upgradeType
      };
    } else {
      throw new Error('No image data in Stable Image response');
    }
  } catch (error) {
    console.error('Stable Image Error:', error);
    throw error;
  }
}

/**
 * Generate upgrade image using Stable Image Inpaint
 * This model allows for precise area-based edits
 */
async function generateUpgradeWithStableInpaint(base64Image, maskImage, upgradeType) {
  const upgradePrompts = {
    'stone-walkway': 'Natural stone walkway with stone pavers',
    'black-windows': 'Black window frames',
    'white-siding': 'White vinyl siding',
    'wrap-porch': 'Wrap-around porch with white columns',
    'brick-exterior': 'Brick facade'
  };

  const prompt = upgradePrompts[upgradeType] || 'Modern upgrade';

  // Stable Image Inpaint request format
  const requestBody = {
    taskType: "INPAINT",
    inpaintParams: {
      text: prompt,
      image: base64Image,
      mask: maskImage, // Base64 mask image showing areas to edit
      strength: 0.8,
      guidance: 7.0,
      steps: 20,
      seed: Math.floor(Math.random() * 1000000)
    }
  };

  try {
    const command = new InvokeModelCommand({
      modelId: STABLE_MODELS.INPAINT,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    if (responseBody.images && responseBody.images.length > 0) {
      return {
        success: true,
        imageUrl: `data:image/png;base64,${responseBody.images[0]}`,
        imageData: responseBody.images[0],
        upgradeType: upgradeType
      };
    } else {
      throw new Error('No image data in Stable Image Inpaint response');
    }
  } catch (error) {
    console.error('Stable Image Inpaint Error:', error);
    throw error;
  }
}

/**
 * Test Stable Image model connectivity
 */
async function testStableImageConnectivity() {
  try {
    // Test with Control Structure model
    const testRequestBody = {
      taskType: "STRUCTURE_CONTROL",
      structureControlParams: {
        text: "A simple test house",
        image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        strength: 0.5,
        guidance: 7.0,
        steps: 10,
        seed: 12345
      }
    };

    const command = new InvokeModelCommand({
      modelId: STABLE_MODELS.CONTROL_STRUCTURE,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(testRequestBody)
    });

    const response = await bedrockClient.send(command);
    
    return {
      success: true,
      message: 'Stable Image Control Structure is accessible',
      modelId: STABLE_MODELS.CONTROL_STRUCTURE
    };
  } catch (error) {
    console.error('Stable Image test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Check AWS credentials and Stable Image access'
    };
  }
}

module.exports = {
  generateUpgradeWithStableStructure,
  generateUpgradeWithStableInpaint,
  testStableImageConnectivity,
  STABLE_MODELS
};
