// Define the car-types-display custom element
class CarTypesDisplay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Initialize the display when the element is added to the DOM
    this.initializeDisplay();
    
    // Listen for car type added/removed events
    document.addEventListener('carTypeAdded', () => this.updateDisplay());
    document.addEventListener('carTypeRemoved', () => this.updateDisplay());
    document.addEventListener('cart:refresh', () => this.updateDisplay());
  }
  
  initializeDisplay() {
    // Initial display setup
    this.updateDisplay();
  }
  
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  updateDisplay() {
    // This method will be called to update all car type displays in the cart
    this.displayCarTypesForProducts();
  }
  
  displayCarTypesForProducts() {
    // Get cart details cookie
    const cartDetailsCookie = this.getCookie('cart_details');
    if (!cartDetailsCookie) return;
    
    try {
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        return;
      }
      
      // Loop through products in the cart details
      cartDetails.product_details.forEach(product => {
        // Find the corresponding product container in the cart
        const productContainers = document.querySelectorAll(`.cart-item__car-types[data-product-id="${product.product_id}"]`);
        
        if (productContainers.length === 0) return;
        
        // Process each container (there might be multiple instances of the same product in different views)
        productContainers.forEach(container => {
          // Clear previous content
          container.innerHTML = '';
          
          // Check if there are car types for this product
          if (!product.car_types || product.car_types.length === 0) return;
          
          // Create heading
          const heading = document.createElement('div');
          heading.className = 'cart-item__car-types-heading';
          heading.textContent = 'Selected Car Types:';
          container.appendChild(heading);
          
          // Create car types list
          const carTypesList = document.createElement('ul');
          carTypesList.className = 'cart-item__car-types-list';
          
          // Loop through car types
          product.car_types.forEach(carTypeItem => {
            const carTypeElement = document.createElement('li');
            carTypeElement.className = 'cart-item__car-type';
            
            // Handle both new format (object with type and quantity) and old format (string)
            if (typeof carTypeItem === 'object' && carTypeItem.type) {
              carTypeElement.innerHTML = `
                <span class="cart-item__car-type-name">${carTypeItem.type}</span>
                <span class="cart-item__car-type-quantity">Qty: ${carTypeItem.quantity || 1}</span>
                <button class="cart-item__car-type-remove" data-product-id="${product.product_id}" data-car-type="${carTypeItem.type}">×</button>
              `;
            } else {
              // Legacy format support
              carTypeElement.innerHTML = `
                <span class="cart-item__car-type-name">${carTypeItem}</span>
                <span class="cart-item__car-type-quantity">Qty: 1</span>
                <button class="cart-item__car-type-remove" data-product-id="${product.product_id}" data-car-type="${carTypeItem}">×</button>
              `;
            }
            
            carTypesList.appendChild(carTypeElement);
          });
          
          container.appendChild(carTypesList);
          
          // Add event listeners for remove buttons
          container.querySelectorAll('.cart-item__car-type-remove').forEach(button => {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              const productId = button.dataset.productId;
              const carType = button.dataset.carType;
              
              // Find car type selector component to use its methods
              const carTypeSelector = document.querySelector('car-type-selector');
              if (carTypeSelector && typeof carTypeSelector.updateCarTypeCookies === 'function') {
                carTypeSelector.updateCarTypeCookies(productId, carType, 'remove');
                
                // Dispatch event for other components to listen to
                document.dispatchEvent(new CustomEvent('carTypeRemoved', {
                  detail: { productId, carType }
                }));
              }
            });
          });
        });
      });
    } catch (e) {
      console.error('Error parsing car types data:', e);
    }
  }
}

// Register the custom element
if (!customElements.get('car-types-display')) {
  customElements.define('car-types-display', CarTypesDisplay);
}

// Also maintain the original functionality for backward compatibility
document.addEventListener('DOMContentLoaded', function() {
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function displayCarTypesForProducts() {
    // Get cart details cookie
    const cartDetailsCookie = getCookie('cart_details');
    if (!cartDetailsCookie) return;
    
    try {
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        return;
      }
      
      // Loop through products in the cart details
      cartDetails.product_details.forEach(product => {
        // Find the corresponding product container in the cart
        const productContainers = document.querySelectorAll(`.cart-item__car-types[data-product-id="${product.product_id}"]`);
        
        if (productContainers.length === 0) return;
        
        // Process each container (there might be multiple instances of the same product in different views)
        productContainers.forEach(container => {
          // Clear previous content
          container.innerHTML = '';
          
          // Check if there are car types for this product
          if (!product.car_types || product.car_types.length === 0) return;
          
          // Create heading
          const heading = document.createElement('div');
          heading.className = 'cart-item__car-types-heading';
          heading.textContent = 'Selected Car Types:';
          container.appendChild(heading);
          
          // Create car types list
          const carTypesList = document.createElement('ul');
          carTypesList.className = 'cart-item__car-types-list';
          
          // Loop through car types
          product.car_types.forEach(carTypeItem => {
            const carTypeElement = document.createElement('li');
            carTypeElement.className = 'cart-item__car-type';
            
            // Handle both new format (object with type and quantity) and old format (string)
            if (typeof carTypeItem === 'object' && carTypeItem.type) {
              carTypeElement.innerHTML = `
                <span class="cart-item__car-type-name">${carTypeItem.type}</span>
                <span class="cart-item__car-type-quantity">Qty: ${carTypeItem.quantity || 1}</span>
                <button class="cart-item__car-type-remove" data-product-id="${product.product_id}" data-car-type="${carTypeItem.type}">×</button>
              `;
            } else {
              // Legacy format support
              carTypeElement.innerHTML = `
                <span class="cart-item__car-type-name">${carTypeItem}</span>
                <span class="cart-item__car-type-quantity">Qty: 1</span>
                <button class="cart-item__car-type-remove" data-product-id="${product.product_id}" data-car-type="${carTypeItem}">×</button>
              `;
            }
            
            carTypesList.appendChild(carTypeElement);
          });
          
          container.appendChild(carTypesList);
        });
      });
      
      // Add event listeners for remove buttons
      document.querySelectorAll('.cart-item__car-type-remove').forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          const productId = this.dataset.productId;
          const carType = this.dataset.carType;
          
          // Find car type selector component to use its methods
          const carTypeSelector = document.querySelector('car-type-selector');
          if (carTypeSelector && typeof carTypeSelector.updateCarTypeCookies === 'function') {
            carTypeSelector.updateCarTypeCookies(productId, carType, 'remove');
            
            // Refresh display
            displayCarTypesForProducts();
            
            // Dispatch event for other components to listen to
            document.dispatchEvent(new CustomEvent('carTypeRemoved', {
              detail: { productId, carType }
            }));
          }
        });
      });
    } catch (e) {
      console.error('Error parsing car types data:', e);
    }
  }
  
  // Initial display
  displayCarTypesForProducts();
  
  // Listen for cart type added/removed events
  document.addEventListener('carTypeAdded', function() {
    displayCarTypesForProducts();
  });
  
  document.addEventListener('carTypeRemoved', function() {
    displayCarTypesForProducts();
  });
  
  // Also refresh when cart is updated
  document.addEventListener('cart:refresh', function() {
    displayCarTypesForProducts();
  });
});
