// Pagination and sorting functionality
class Pagination {
    constructor() {
        // Initialize pagination controls
    }

    // Pagination and sorting functions
    changePage(direction) {
        const newPage = CONFIG.currentPage + direction;
        if (newPage >= 1 && newPage <= CONFIG.totalPages) {
            window.apiHandler.loadHomes(CONFIG.currentLocation, newPage, CONFIG.currentSort);
        }
    }
    
    changeSort() {
        const sortSelect = document.getElementById('sortSelect');
        const newSort = sortSelect.value;
        window.apiHandler.loadHomes(CONFIG.currentLocation, 1, newSort); // Reset to page 1 when changing sort
    }
    
    updatePaginationControls() {
        const currentPageNumber = document.getElementById('currentPageNumber');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        
        if (currentPageNumber) {
            currentPageNumber.textContent = CONFIG.currentPage;
        }
        
        // Enable/disable pagination buttons
        if (prevPageBtn) {
            prevPageBtn.disabled = CONFIG.currentPage <= 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = CONFIG.currentPage >= CONFIG.totalPages;
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
