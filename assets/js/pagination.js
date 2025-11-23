// Pagination and sorting functionality
class Pagination {
    constructor() {
        // Initialize pagination controls
    }

    // Pagination and sorting functions
    changePage(direction) {
        // Safety check for CONFIG
        if (typeof CONFIG === 'undefined') {
            console.error('❌ CONFIG not available for pagination');
            return;
        }
        
        const newPage = CONFIG.currentPage + direction;
        console.log(`🔄 Pagination: Current page: ${CONFIG.currentPage}, Direction: ${direction}, New page: ${newPage}, Total pages: ${CONFIG.totalPages}`);
        
        if (newPage >= 1 && newPage <= CONFIG.totalPages) {
            console.log(`✅ Loading page ${newPage}...`);
            window.apiHandler.loadHomes(CONFIG.currentLocation, newPage, CONFIG.currentSort);
        } else {
            console.warn(`⚠️ Cannot navigate to page ${newPage} - out of bounds (1-${CONFIG.totalPages})`);
        }
    }
    
    changeSort() {
        // Safety check for CONFIG
        if (typeof CONFIG === 'undefined') {
            console.error('❌ CONFIG not available for sort change');
            return;
        }
        
        const sortSelect = document.getElementById('sortSelect');
        const newSort = sortSelect.value;
        window.apiHandler.loadHomes(CONFIG.currentLocation, 1, newSort); // Reset to page 1 when changing sort
    }
    
    updatePaginationControls() {
        // Safety check for CONFIG
        if (typeof CONFIG === 'undefined') {
            console.error('❌ CONFIG not available for pagination controls update');
            return;
        }
        
        const currentPageNumber = document.getElementById('currentPageNumber');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        
        console.log(`🔄 Updating pagination controls: Page ${CONFIG.currentPage} of ${CONFIG.totalPages}`);
        
        if (currentPageNumber) {
            currentPageNumber.textContent = CONFIG.currentPage;
        }
        
        // Enable/disable pagination buttons
        if (prevPageBtn) {
            const isFirstPage = CONFIG.currentPage <= 1;
            prevPageBtn.disabled = isFirstPage;
            if (isFirstPage) {
                prevPageBtn.classList.add('disabled');
            } else {
                prevPageBtn.classList.remove('disabled');
            }
            console.log(`   Previous button: ${isFirstPage ? 'disabled' : 'enabled'}`);
        }
        
        if (nextPageBtn) {
            const isLastPage = CONFIG.currentPage >= CONFIG.totalPages;
            nextPageBtn.disabled = isLastPage;
            if (isLastPage) {
                nextPageBtn.classList.add('disabled');
            } else {
                nextPageBtn.classList.remove('disabled');
            }
            console.log(`   Next button: ${isLastPage ? 'disabled' : 'enabled'}`);
        }
        
        // Update sort select to match current sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = CONFIG.currentSort;
        }
    }
}

// Create and export pagination instance
window.pagination = new Pagination();
