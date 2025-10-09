#!/bin/bash

# Production Deployment Script for AI Home Upgrades
# This script automates the deployment process

echo "🚀 Starting Production Deployment for AI Home Upgrades..."

# Check if required tools are installed
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    if ! command -v supabase &> /dev/null; then
        echo "❌ Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    
    echo "✅ Dependencies checked"
}

# Setup production environment
setup_production_env() {
    echo "🔧 Setting up production environment..."
    
    # Create production environment file if it doesn't exist
    if [ ! -f ".env.production" ]; then
        echo "📝 Creating .env.production from template..."
        cp production-env-template.txt .env.production
        echo "⚠️  Please edit .env.production with your production values"
        echo "   Required: Supabase URL, API keys, AWS credentials"
        read -p "Press Enter after updating .env.production..."
    fi
    
    echo "✅ Production environment setup complete"
}

# Deploy to Vercel
deploy_to_vercel() {
    echo "🚀 Deploying to Vercel..."
    
    # Login to Vercel if not already logged in
    if ! vercel whoami &> /dev/null; then
        echo "🔐 Logging into Vercel..."
        vercel login
    fi
    
    # Deploy to production
    echo "📦 Deploying to production..."
    vercel --prod --yes
    
    echo "✅ Vercel deployment complete"
}

# Setup Supabase production
setup_supabase_production() {
    echo "🗄️  Setting up Supabase production..."
    
    echo "📋 Manual steps required:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Create new project: ai-home-upgrades-prod"
    echo "3. Run the SQL schema from production-supabase-schema.sql"
    echo "4. Configure OAuth providers (Google, Apple, Discord, Facebook, Microsoft)"
    echo "5. Update redirect URLs to your production domain"
    echo "6. Copy Supabase URL and anon key to .env.production"
    
    read -p "Press Enter after completing Supabase setup..."
}

# Test production deployment
test_production() {
    echo "🧪 Testing production deployment..."
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url')
    echo "🌐 Testing deployment at: https://$DEPLOYMENT_URL"
    
    echo "📋 Manual testing checklist:"
    echo "□ Authentication (Google, Apple, Discord, Facebook, Microsoft)"
    echo "□ Sign out functionality"
    echo "□ Image generation"
    echo "□ Property search"
    echo "□ Image storage and retrieval"
    echo "□ Mobile responsiveness"
    
    read -p "Press Enter after completing manual tests..."
}

# Main deployment flow
main() {
    echo "🎯 AI Home Upgrades Production Deployment"
    echo "=========================================="
    
    check_dependencies
    setup_production_env
    setup_supabase_production
    deploy_to_vercel
    test_production
    
    echo ""
    echo "🎉 Production deployment complete!"
    echo "🌐 Your app is now live at: https://$(vercel ls --json | jq -r '.[0].url')"
    echo ""
    echo "📚 Next steps:"
    echo "1. Configure custom domain (optional)"
    echo "2. Set up monitoring and analytics"
    echo "3. Configure backup strategies"
    echo "4. Set up CI/CD pipeline"
}

# Run main function
main
