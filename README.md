# AI Home Upgrades

A web application that uses AWS Bedrock to generate AI-powered home exterior upgrades from real estate photos.

## Features

- Browse real estate listings from the Realtor API
- Generate AI-powered home upgrades using AWS Bedrock Titan Image Generator
- 5 predefined upgrade types:
  - Add Stone Walkway
  - Add Modern Black Windows
  - Add White Vinyl Siding
  - Add Wrap-around Porch
  - Add Brick Exterior

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **AI**: AWS Bedrock Titan Image Generator v2
- **Data**: Realtor API for property listings

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_DEFAULT_REGION=us-east-1
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the server: `npm start`
5. Open `http://localhost:3001/homes.html`

## 📚 Documentation

All project documentation is organized in the `docs/` folder:

- **📋 Requirements** - Project specifications and objectives
- **🔧 Fixes** - Bug fixes and implementation details  
- **📊 Analysis** - Performance analysis and optimization guides
- **🚀 Deployment** - Production deployment guides and scripts
- **📖 Guides** - Setup guides and troubleshooting

**Quick Links:**
- [📚 Documentation Index](docs/README.md)
- [🚀 Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [🔧 Troubleshooting](docs/guides/AUTHENTICATION_TROUBLESHOOTING_GUIDE.md)
- [📊 Performance Analysis](docs/analysis/IMAGE_LOADING_OPTIMIZATION_GUIDE.md)

## Deployment

### Current Production Setup
- **Backend**: Render (https://ai-home-upgrades-backend.onrender.com)
- **Frontend**: GitHub Pages (https://jeremyeletto.github.io/AIHomeSearch/)
- **Database**: Supabase (Production)

### Quick Deployment
See [📚 Deployment Documentation](docs/deployment/) for detailed guides:
- [Quick Deployment Guide](docs/deployment/QUICK_DEPLOYMENT_GUIDE.md)
- [Render + GitHub Pages](docs/deployment/RENDER_GITHUB_DEPLOYMENT.md)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/test-bedrock` - Test Bedrock connectivity
- `GET /api/test-gemini` - Test Gemini connectivity
- `POST /api/generate-upgrade-image` - Generate AI upgrade image

## License

MIT
