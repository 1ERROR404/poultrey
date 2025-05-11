/**
 * Enhanced search functionality for Poultry Gear
 * This script provides real-time search capabilities with dropdown results
 * and proper support for Arabic language search.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize search on page load
  initializeSearch();
});

/**
 * Initialize the search functionality by finding and enhancing search inputs
 */
function initializeSearch() {
  // Find all search inputs in the document
  const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="search"], input[type="text"][placeholder*="بحث"]');
  
  // Enhanced each search input found
  searchInputs.forEach(input => {
    enhanceSearchInput(input);
  });
  
  // Watch for dynamically added search inputs (common in SPAs)
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1 && (node.nodeName === 'INPUT')) {
            if ((node.getAttribute('placeholder') || '').toLowerCase().includes('search') ||
                (node.getAttribute('placeholder') || '').includes('بحث')) {
              enhanceSearchInput(node);
            }
          } else if (node.nodeType === 1) {
            // Check if there are search inputs inside the added node
            const inputs = node.querySelectorAll('input[type="text"][placeholder*="search"], input[type="text"][placeholder*="بحث"]');
            inputs.forEach(input => enhanceSearchInput(input));
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Enhance a search input with dropdown results functionality
 * @param {HTMLInputElement} input - The search input element
 */
function enhanceSearchInput(input) {
  // Check if this input has already been enhanced
  if (input.dataset.enhanced === 'true') return;
  
  // Mark as enhanced to avoid duplicate processing
  input.dataset.enhanced = 'true';
  
  // Create dropdown container for search results
  const resultsDropdown = document.createElement('div');
  resultsDropdown.className = 'search-results-dropdown';
  resultsDropdown.style.display = 'none';
  resultsDropdown.style.position = 'absolute';
  resultsDropdown.style.zIndex = '1000';
  resultsDropdown.style.backgroundColor = 'white';
  resultsDropdown.style.border = '1px solid #ddd';
  resultsDropdown.style.borderRadius = '4px';
  resultsDropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  resultsDropdown.style.width = '100%';
  resultsDropdown.style.maxHeight = '400px';
  resultsDropdown.style.overflowY = 'auto';
  
  // Position the dropdown beneath the search input
  const inputRect = input.getBoundingClientRect();
  const offsetParent = input.offsetParent || document.body;
  const parentRect = offsetParent.getBoundingClientRect();
  
  // Insert the dropdown after the input in the DOM
  input.parentNode.style.position = 'relative';
  input.parentNode.appendChild(resultsDropdown);
  
  // Load products for search functionality
  fetchProducts().then(products => {
    setupSearchFunctionality(input, resultsDropdown, products);
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (e.target !== input && e.target !== resultsDropdown) {
      resultsDropdown.style.display = 'none';
    }
  });
}

/**
 * Fetch products from the API for search functionality
 * @returns {Promise<Array>} - Promise resolving to an array of products
 */
async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products for search:', error);
    return [];
  }
}

/**
 * Set up the search functionality for the enhanced input
 * @param {HTMLInputElement} input - The search input element
 * @param {HTMLElement} resultsDropdown - The dropdown element for displaying results
 * @param {Array} products - Array of product objects
 */
function setupSearchFunctionality(input, resultsDropdown, products) {
  // Determine the current language from HTML or body class
  let isArabic = false;
  if (document.documentElement.lang === 'ar' || 
      document.documentElement.dir === 'rtl' || 
      document.body.classList.contains('rtl') ||
      document.body.dir === 'rtl') {
    isArabic = true;
  }
  
  // Handle input changes to show search results
  input.addEventListener('input', function() {
    const query = input.value.trim().toLowerCase();
    
    if (query.length < 2) {
      resultsDropdown.style.display = 'none';
      return;
    }
    
    // Filter products based on query and language
    let matches = products.filter(product => {
      if (isArabic) {
        // When in Arabic mode, check Arabic fields first, then English
        return (
          (product.nameAr && product.nameAr.toLowerCase().includes(query)) ||
          (product.descriptionAr && product.descriptionAr.toLowerCase().includes(query)) ||
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
        );
      } else {
        // When in English mode, check English fields
        return (
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
        );
      }
    }).slice(0, 5); // Limit to 5 results
    
    updateSearchDropdown(matches, query, resultsDropdown, isArabic);
  });
  
  // Handle keydown for navigation within dropdown
  input.addEventListener('keydown', function(e) {
    if (resultsDropdown.style.display === 'none') return;
    
    const items = resultsDropdown.querySelectorAll('.search-result-item');
    if (!items.length) return;
    
    let focusedItem = resultsDropdown.querySelector('.search-result-item.focused');
    let focusedIndex = -1;
    
    // Find the currently focused item index
    if (focusedItem) {
      items.forEach((item, index) => {
        if (item === focusedItem) focusedIndex = index;
      });
    }
    
    // Handle arrow keys, enter, and escape
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + items.length) % items.length;
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedItem) {
          focusedItem.click();
        } else if (input.value.trim().length >= 2) {
          // Redirect to search results page
          window.location.href = `/products?search=${encodeURIComponent(input.value.trim())}`;
        }
        return;
      case 'Escape':
        e.preventDefault();
        resultsDropdown.style.display = 'none';
        return;
    }
    
    // Update the focused item
    items.forEach(item => item.classList.remove('focused'));
    if (focusedIndex >= 0) {
      items[focusedIndex].classList.add('focused');
    }
  });
}

/**
 * Update the search dropdown with matching products
 * @param {Array} matches - Array of matching product objects
 * @param {string} query - The search query
 * @param {HTMLElement} dropdown - The dropdown element to update
 * @param {boolean} isArabic - Whether the current language is Arabic
 */
function updateSearchDropdown(matches, query, dropdown, isArabic) {
  // Clear previous results
  dropdown.innerHTML = '';
  
  if (matches.length === 0) {
    dropdown.style.display = 'block';
    const noResults = document.createElement('div');
    noResults.className = 'search-no-results';
    noResults.style.padding = '12px';
    noResults.style.textAlign = 'center';
    noResults.style.color = '#666';
    noResults.textContent = isArabic ? 'لا توجد منتجات' : 'No products found';
    dropdown.appendChild(noResults);
    return;
  }
  
  dropdown.style.display = 'block';
  
  // Create and append result items
  matches.forEach(product => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.padding = '10px';
    item.style.borderBottom = '1px solid #eee';
    item.style.cursor = 'pointer';
    
    // Add hover effect
    item.onmouseover = () => {
      item.style.backgroundColor = '#f5f5f5';
      // Remove focused class from all items
      dropdown.querySelectorAll('.search-result-item').forEach(i => i.classList.remove('focused'));
      // Add focused class to this item
      item.classList.add('focused');
    };
    item.onmouseout = () => {
      item.style.backgroundColor = '';
      item.classList.remove('focused');
    };
    
    // Image container
    const imgContainer = document.createElement('div');
    imgContainer.style.width = '50px';
    imgContainer.style.height = '50px';
    imgContainer.style.marginRight = isArabic ? '0' : '12px';
    imgContainer.style.marginLeft = isArabic ? '12px' : '0';
    
    if (product.imageUrl) {
      const img = document.createElement('img');
      img.src = product.imageUrl;
      img.alt = isArabic && product.nameAr ? product.nameAr : product.name;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '4px';
      imgContainer.appendChild(img);
    }
    
    // Product details
    const details = document.createElement('div');
    details.style.flex = '1';
    
    const productName = document.createElement('div');
    productName.style.fontWeight = 'bold';
    productName.style.marginBottom = '4px';
    productName.textContent = isArabic && product.nameAr ? product.nameAr : product.name;
    
    const productPrice = document.createElement('div');
    productPrice.style.color = '#e63946'; // Primary red color
    productPrice.style.fontWeight = 'bold';
    productPrice.textContent = `$${product.price}`;
    
    details.appendChild(productName);
    details.appendChild(productPrice);
    
    // Set text alignment based on language
    if (isArabic) {
      details.style.textAlign = 'right';
      item.style.flexDirection = 'row-reverse';
    }
    
    item.appendChild(imgContainer);
    item.appendChild(details);
    
    // Navigate to product page on click
    item.addEventListener('click', () => {
      window.location.href = `/products/${product.slug}`;
    });
    
    dropdown.appendChild(item);
  });
  
  // Add "View all results" link at the bottom
  const viewAll = document.createElement('div');
  viewAll.className = 'search-view-all';
  viewAll.style.padding = '10px';
  viewAll.style.textAlign = 'center';
  viewAll.style.backgroundColor = '#f5f5f5';
  viewAll.style.color = '#e63946'; // Primary red color
  viewAll.style.fontWeight = 'bold';
  viewAll.style.cursor = 'pointer';
  viewAll.textContent = isArabic ? 'مشاهدة كل النتائج' : 'See all results';
  
  viewAll.addEventListener('click', () => {
    window.location.href = `/products?search=${encodeURIComponent(query)}`;
  });
  
  dropdown.appendChild(viewAll);
}

// Initialize search when the script loads
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeSearch();
} else {
  document.addEventListener('DOMContentLoaded', initializeSearch);
}