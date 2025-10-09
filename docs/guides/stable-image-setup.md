# Stable Image Models Setup Guide

## Overview
Once your Stable Image model access is approved, you'll have access to several models that are specifically designed for structure-preserving image edits, which should give you results much closer to Gemini 2.5 Flash.

## Available Models

### 1. **Stable Image Control Structure** (Recommended)
- **Model ID**: `stability.stable-image-control-structure`
- **Best for**: Structure-preserving edits like siding changes, window updates
- **Key feature**: Maintains architectural elements while allowing content modifications

### 2. **Stable Image Inpaint**
- **Model ID**: `stability.stable-image-inpaint`
- **Best for**: Precise area-based edits using masks
- **Key feature**: Edit specific regions without affecting the rest of the image

### 3. **Stable Image Search and Replace**
- **Model ID**: `stability.stable-image-search-replace`
- **Best for**: Replacing specific objects or features
- **Key feature**: Find and replace specific elements in images

## Integration Steps

### Step 1: Update IAM Policy
Add these model ARNs to your IAM policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel"
            ],
            "Resource": [
                "arn:aws:bedrock:us-east-1::foundation-model/stability.stable-image-control-structure",
                "arn:aws:bedrock:us-east-1::foundation-model/stability.stable-image-inpaint",
                "arn:aws:bedrock:us-east-1::foundation-model/stability.stable-image-search-replace",
                "arn:aws:bedrock:us-east-1::foundation-model/stability.stable-image-style-transfer",
                "arn:aws:bedrock:us-east-1::foundation-model/stability.stable-image-erase-object"
            ]
        }
    ]
}
```

### Step 2: Update Server Code
Replace the current Titan model with Stable Image Control Structure:

```javascript
// In server.js, change:
const BEDROCK_MODEL_ID = 'stability.stable-image-control-structure';

// Update the request body:
const requestBody = {
  taskType: "STRUCTURE_CONTROL",
  structureControlParams: {
    text: prompt,
    image: base64Image,
    strength: 0.7, // How much to preserve structure (0.0-1.0)
    guidance: 7.5,  // How closely to follow prompt
    steps: 20,      // Quality vs speed
    seed: Math.floor(Math.random() * 1000000)
  }
};
```

### Step 3: Test the Integration
Use the test endpoint to verify connectivity:

```bash
curl http://localhost:3001/api/test-stable-image
```

## Expected Results

With Stable Image Control Structure, you should see:
- ✅ **Preserved architecture**: Same roof lines, window positions, garage doors
- ✅ **Targeted changes**: Only the requested feature is modified
- ✅ **High quality**: Professional-grade image editing results
- ✅ **Consistent structure**: No unexpected architectural changes

## Model Comparison

| Model | Structure Preservation | Quality | Speed | Best For |
|-------|----------------------|---------|-------|----------|
| Titan v2 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Basic edits |
| Stable Control Structure | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Structure-preserving edits |
| Stable Inpaint | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Precise area edits |

## Next Steps

1. **Wait for approval**: Stable Image models are currently "In Progress"
2. **Update IAM policy**: Add the new model ARNs
3. **Test connectivity**: Verify access to the models
4. **Update server code**: Switch from Titan to Stable Image
5. **Test with real images**: Compare results with current Titan output

## Troubleshooting

### Common Issues:
- **Access denied**: Ensure IAM policy includes the new model ARNs
- **Invalid model ID**: Check that the exact model ID is correct
- **Request format errors**: Verify the request body matches the expected format

### Support:
- AWS Bedrock Documentation
- Stability AI Documentation
- AWS Support (if needed)

## Cost Considerations

Stable Image models may have different pricing than Titan models. Check the AWS Bedrock pricing page for current rates.

---

**Note**: This setup will provide results much closer to Gemini 2.5 Flash's structure-preserving capabilities.
