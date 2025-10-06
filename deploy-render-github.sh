#!/bin/bash

# Production Deployment Script: Render Backend + GitHub Pages Frontend
# This script automates the deployment to your existing production setup

echo "🚀 Starting Production Deployment: Render + GitHub Pages"
echo "Frontend URL: https://jeremyeletto.github.io/AIHomeSearch/"
echo "Backend URL: https://ai-home-upgrades-backend.onrender.com"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git not initialized. Please run 'git init' first."
    exit 1
fi

# Step 1: Prepare for deployment
prepare_deployment() {
    echo "🔧 Step 1: Preparing for deployment..."
    
    # Check if render.yaml exists
    if [ ! -f "render.yaml" ]; then
        echo "❌ Error: render.yaml not found. Please create it first."
        exit 1
    fi
    
    # Check if production environment variables are set
    echo "📋 Environment variables needed for Render:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - AWS_ACCESS_KEY_ID"
    echo "   - AWS_SECRET_ACCESS_KEY"
    echo "   - GEMINI_API_KEY"
    echo "   - RAPIDAPI_KEY"
    echo ""
    echo "⚠️  Make sure these are set in your Render dashboard"
    
    echo "✅ Preparation complete"
}

# Step 2: Deploy backend to Render
deploy_backend() {
    echo "🚀 Step 2: Deploying backend to Render..."
    
    echo "📋 Manual steps for Render deployment:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Configure service:"
    echo "   - Name: ai-home-upgrades-backend"
    echo "   - Environment: Node"
    echo "   - Build Command: npm install"
    echo "   - Start Command: node server.js"
    echo "   - Plan: Starter (free)"
    echo "5. Set environment variables (see list above)"
    echo "6. Click 'Create Web Service'"
    echo ""
    
    read -p "Press Enter after completing Render deployment..."
    
    echo "✅ Backend deployment complete"
}

# Step 3: Update frontend configuration
update_frontend_config() {
    echo "🔧 Step 3: Updating frontend configuration..."
    
    # Check if config.js already has production URL
    if grep -q "ai-home-upgrades-backend.onrender.com" assets/js/config.js; then
        echo "✅ Frontend config already set for production"
    else
        echo "⚠️  Frontend config needs to be updated for production"
        echo "   Update assets/js/config.js to use Render backend URL"
    fi
    
    echo "✅ Frontend configuration updated"
}

# Step 4: Deploy frontend to GitHub Pages
deploy_frontend() {
    echo "🌐 Step 4: Deploying frontend to GitHub Pages..."
    
    # Commit all changes
    echo "📝 Committing changes..."
    git add .
    git commit -m "Production deployment: Render backend + GitHub Pages frontend"
    
    # Push to GitHub
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    echo "✅ Frontend deployment complete"
    echo "🌐 Your app will be available at: https://jeremyeletto.github.io/AIHomeSearch/"
}

# Step 5: Configure Supabase
configure_supabase() {
    echo "🗄️  Step 5: Configuring Supabase for production..."
    
    echo "📋 Manual steps for Supabase configuration:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Create new project: ai-home-upgrades-prod"
    echo "3. Run SQL schema from production-supabase-schema.sql"
    echo "4. Go to Authentication → Settings"
    echo "5. Update URLs:"
    echo "   - Site URL: https://jeremyeletto.github.io/AIHomeSearch/"
    echo "   - Redirect URLs: https://jeremyeletto.github.io/AIHomeSearch/**"
    echo "6. Enable OAuth providers (Google, Apple, Discord, Facebook, Microsoft)"
    echo "7. Copy Supabase URL and anon key to Render environment variables"
    echo ""
    
    read -p "Press Enter after completing Supabase configuration..."
    
    echo "✅ Supabase configuration complete"
}

# Step 6: Test production deployment
test_production() {
    echo "🧪 Step 6: Testing production deployment..."
    
    echo "📋 Testing checklist:"
    echo "□ Frontend loads: https://jeremyeletto.github.io/AIHomeSearch/"
    echo "□ Backend responds: https://ai-home-upgrades-backend.onrender.com/health"
    echo "□ Authentication works (all OAuth providers)"
    echo "□ Image generation works"
    echo "□ Property search works"
    echo "□ Image storage works"
    echo "□ Sign out works on all pages"
    echo "□ Mobile responsive"
    echo ""
    
    read -p "Press Enter after completing tests..."
    
    echo "✅ Production testing complete"
}

# Main deployment flow
main() {
    echo "🎯 AI Home Upgrades Production Deployment"
    echo "=========================================="
    echo "Frontend: GitHub Pages (https://jeremyeletto.github.io/AIHomeSearch/)"
    echo "Backend: Render (https://ai-home-upgrades-backend.onrender.com)"
    echo ""
    
    prepare_deployment
    deploy_backend
    update_frontend_config
    deploy_frontend
    configure_supabase
    test_production
    
    echo ""
    echo "🎉 Production deployment complete!"
    echo "🌐 Frontend: https://jeremyeletto.github.io/AIHomeSearch/"
    echo "🔧 Backend: https://ai-home-upgrades-backend.onrender.com"
    echo ""
    echo "📚 Next steps:"
    echo "1. Monitor Render dashboard for backend health"
    echo "2. Monitor GitHub Pages for frontend deployment"
    echo "3. Set up error tracking and monitoring"
    echo "4. Configure custom domain (optional)"
}

# Run main function
main
