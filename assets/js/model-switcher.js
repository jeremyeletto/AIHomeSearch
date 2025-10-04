// Model switching functionality (Debug only)
class ModelSwitcher {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for model switching
    }

    // Check for debug mode
    checkDebugMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === '1';
        const debugSwitcher = document.getElementById('debug-model-switcher');
        if (debugSwitcher) {
            debugSwitcher.style.display = debugMode ? 'block' : 'none';
        }
        return debugMode;
    }
    
    // Update model display in UI (Debug only)
    updateModelDisplay() {
        const modelBadge = document.getElementById('model-badge');
        if (modelBadge) {
            modelBadge.textContent = CONFIG.currentModel.toUpperCase();
            modelBadge.className = `badge ${CONFIG.currentModel === 'gemini' ? 'bg-primary' : 'bg-success'}`;
        }
    }
}

// Create and export model switcher instance
window.modelSwitcher = new ModelSwitcher();
