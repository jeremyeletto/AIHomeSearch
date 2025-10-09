# AWS Bedrock Setup Guide

## Prerequisites
1. AWS Account
2. AWS CLI installed and configured
3. Node.js and npm

## Step 1: Sign up for AWS Bedrock

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click "Get Started" or "Request model access"
3. Request access to "Amazon Titan Image Generator G1 v2"

## Step 2: Configure AWS Credentials

### Option A: AWS CLI (Recommended)
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### Option C: IAM Role (for EC2/ECS)
If running on AWS infrastructure, use IAM roles instead of credentials.

## Step 3: Enable Model Access

1. In AWS Bedrock Console, go to "Model access"
2. Find "Amazon Titan Image Generator v1"
3. Click "Request model access"
4. Wait for approval (usually instant for Titan models)

## Step 4: Test the Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Test Bedrock connectivity:
```bash
curl http://localhost:3001/api/test-bedrock
```

## Step 5: Configure Your Application

Update the region in `server.js` if needed:
```javascript
const BEDROCK_REGION = 'us-east-1'; // Change to your preferred region
```

## Troubleshooting

### Common Issues:

1. **"Access Denied" Error**
   - Check if model access is granted
   - Verify AWS credentials
   - Ensure region is correct

2. **"Model not found" Error**
   - Check model ID: `amazon.titan-image-generator-v1`
   - Verify region supports the model

3. **"Invalid credentials" Error**
   - Re-run `aws configure`
   - Check environment variables
   - Verify IAM permissions

### Required IAM Permissions:
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
                "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-image-generator-v2:0",
                "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-image-generator-v1",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-control-structure-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-inpaint-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-search-replace-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-erase-object-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-remove-background-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-search-recolor-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-image-style-guide-v1:0",
                "arn:aws:bedrock:us-east-1:221723377368:inference-profile/us.stability.stable-style-transfer-v1:0"
            ]
        }
    ]
}
```

## Pricing

- **Titan Image Generator G1 v2**: ~$0.008 per image
- **API Calls**: Standard AWS API pricing
- **Data Transfer**: Standard AWS data transfer pricing

## Next Steps

1. Test with a sample image
2. Monitor usage in AWS CloudWatch
3. Set up billing alerts
4. Optimize prompts for better results

## Support

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Titan Image Generator G1 v2 Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-image-models.html)
- [AWS Support](https://console.aws.amazon.com/support/)
