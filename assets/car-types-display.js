// Define the car-types-display custom element
class CarTypesDisplay extends HTMLElement {
  constructor() {
    super();
    // Do not use shadow DOM to allow direct styling and content insertion
    // this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Initialize the display when the element is added to the DOM
    this.initializeDisplay();
    
    // Listen for cart type updates
    document.addEventListener('carTypeUpdated', () => this.updateDisplay());
    document.addEventListener('carTypeAdded', () => this.updateDisplay());
    document.addEventListener('carTypeRemoved', () => this.updateDisplay());
    document.addEventListener('cart:refresh', () => this.updateDisplay());
  }
  
  initializeDisplay() {
    this.updateDisplay();
  }
  
  updateDisplay() {
    try {
      // Clear existing content
      this.innerHTML = '';
      
      // Get product ID from parent container or data attribute
      let productId = this.dataset.productId;
      
      // If not found in data attribute, try to get from parent container
      if (!productId) {
        const parentContainer = this.closest('[data-product-id]');
        if (parentContainer) {
          productId = parentContainer.dataset.productId;
        }
      }
      
      if (!productId) {
        console.log('[INFO] No product ID found for car types display');
        return;
      }
      
      console.log('[INFO] Displaying car types for product ID:', productId);
      
      // Get cart details cookie
      const cartDetailsCookie = this.getCookie('cart_details');
      if (!cartDetailsCookie) {
        console.log('[INFO] No cart_details cookie found');
        return;
      }
      
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        console.log('[INFO] No product details found in cart_details cookie');
        return;
      }
      
      // Find the product in the cart details
      const product = cartDetails.product_details.find(item => item.product_id == productId);
      if (!product || !product.car_types || product.car_types.length === 0) {
        console.log('[INFO] No car types found for product ID:', productId);
        return;
      }
      
      // Create heading
      const heading = document.createElement('div');
      heading.className = 'cart-item__car-types-heading';
      heading.textContent = 'Selected Car Types:';
      this.appendChild(heading);
      
      // Create a list element for the car types
      const carTypesList = document.createElement('ul');
      carTypesList.classList.add('cart-item__car-types-list');
      
      // Process car types to handle duplicates and quantities
      const normalizedCarTypes = this.normalizeCarTypes(product.car_types);
      const processedCarTypes = [];
      
      // Group car types by type and sum quantities
      normalizedCarTypes.forEach(item => {
        const existingType = processedCarTypes.find(processed => processed.type === item.type);
        if (existingType) {
          // If this type already exists, just update the quantity
          existingType.quantity = (existingType.quantity || 1) + (item.quantity || 1);
        } else {
          // Otherwise add it to the processed list
          processedCarTypes.push({...item});
        }
      });
      
      // Create list items for each car type
      processedCarTypes.forEach(carTypeItem => {
        const carTypeElement = document.createElement('li');
        carTypeElement.classList.add('cart-item__car-type');
        carTypeElement.dataset.carType = carTypeItem.type;
        
        carTypeElement.innerHTML = `
          <div class="cart-item__car-type-info">
            <span class="cart-item__car-type-name">${carTypeItem.type}</span>
            <div class="cart-item__car-type-quantity">
              <quantity-controls class="quantity cart-item__car-type-quantity-wrapper">
                <button 
                  class="quantity__button no-js-hidden" 
                  name="minus" 
                  type="button"
                  data-action="decrease"
                  data-product-id="${productId}"
                  data-car-type="${carTypeItem.type}"
                >
                  <span class="visually-hidden">Decrease quantity for ${carTypeItem.type}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="icon icon-minus" fill="none" viewBox="0 0 10 2">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z" fill="currentColor">
                    </path>
                  </svg>
                </button>
                <input 
                  class="quantity__input cart-item__car-type-quantity-input" 
                  type="number" 
                  name="quantity" 
                  id="Quantity-${productId}-${carTypeItem.type.replace(/\s+/g, '-')}" 
                  min="1" 
                  value="${carTypeItem.quantity || 1}" 
                  data-product-id="${productId}"
                  data-car-type="${carTypeItem.type}"
                >
                <button 
                  class="quantity__button no-js-hidden" 
                  name="plus" 
                  type="button"
                  data-action="increase"
                  data-product-id="${productId}"
                  data-car-type="${carTypeItem.type}"
                >
                  <span class="visually-hidden">Increase quantity for ${carTypeItem.type}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="icon icon-plus" fill="none" viewBox="0 0 10 10">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z" fill="currentColor">
                    </path>
                  </svg>
                </button>
              </quantity-controls>
            </div>
            <button 
              class="cart-item__car-type-remove" 
              aria-label="Remove ${carTypeItem.type}" 
              data-product-id="${productId}" 
              data-car-type="${carTypeItem.type}">
              <span class="visually-hidden">Remove ${carTypeItem.type}</span>
              ×
            </button>
          </div>
        `;
        
        carTypesList.appendChild(carTypeElement);
      });
      
      this.appendChild(carTypesList);
      
      // Add event listeners for remove buttons
      this.querySelectorAll('.cart-item__car-type-remove').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('[TRACE] Remove button clicked');
          
          const productId = button.dataset.productId;
          const carType = button.dataset.carType;
          console.log('[DATA] Product ID:', productId, 'Car Type:', carType);
          
          this.updateCarTypeCookies(productId, carType, 'remove');
        });
      });
      
      // Add event listeners for quantity buttons
      this.querySelectorAll('.quantity__button').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const action = button.dataset.action;
          console.log(`[TRACE] Quantity ${action} button clicked`);
          
          const productId = button.dataset.productId;
          const carType = button.dataset.carType;
          console.log('[DATA] Product ID:', productId, 'Car Type:', carType, 'Action:', action);
          
          this.updateCarTypeCookies(productId, carType, action);
          
          // Update button states
          this.validateQtyRules(button.closest('quantity-controls'));
        });
      });
      
      // Add event listeners for quantity input changes
      this.querySelectorAll('.cart-item__car-type-quantity-input').forEach(input => {
        // Create a change event to dispatch when value changes
        const changeEvent = new Event('change', { bubbles: true });
        
        // Handle both change and direct input events
        ['change', 'input'].forEach(eventType => {
          input.addEventListener(eventType, (e) => {
            console.log(`[TRACE] Quantity input ${eventType} event triggered`);
            
            const productId = input.dataset.productId;
            const carType = input.dataset.carType;
            const newQuantity = parseInt(input.value, 10);
            console.log('[DATA] Product ID:', productId, 'Car Type:', carType, 'New Quantity:', newQuantity);
            
            if (isNaN(newQuantity) || newQuantity < 0) {
              console.warn('[WARNING] Invalid quantity value:', input.value);
              return;
            }
            
            this.updateCarTypeCookies(productId, carType, 'setQuantity', newQuantity);
            
            // Update button states
            this.validateQtyRules(input.closest('quantity-controls'));
          });
        });
        
        // Initialize button states
        this.validateQtyRules(input.closest('quantity-controls'));
      });
      
    } catch (error) {
      console.error('Error displaying car types:', error);
      this.innerHTML = '<div class="cart-item__car-types-error">Error displaying car types</div>';
    }
  }
  
  // Helper method to get car types from cookies
  getCarTypesFromCookies() {
    // Get product ID from data attribute
    const productId = this.dataset.productId;
    if (!productId) {
      console.log('[INFO] No product ID found in data attribute');
      return [];
    }
    
    // Get cart details cookie
    const cartDetailsCookie = this.getCookie('cart_details');
    if (!cartDetailsCookie) {
      console.log('[INFO] No cart_details cookie found');
      return [];
    }
    
    try {
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        console.log('[INFO] No product details found in cart_details cookie');
        return [];
      }
      
      // Find the product in the cart details
      const product = cartDetails.product_details.find(item => item.product_id == productId);
      if (!product || !product.car_types || product.car_types.length === 0) {
        console.log('[INFO] No car types found for product ID:', productId);
        return [];
      }
      
      return product.car_types;
    } catch (error) {
      console.error('[ERROR] Error parsing cart_details cookie:', error);
      return [];
    }
  }
  
  // Helper method to normalize car types (convert strings to objects with quantity)
  normalizeCarTypes(carTypes) {
    if (!carTypes || !Array.isArray(carTypes)) {
      return [];
    }
    
    // Convert any legacy format (strings) to objects with quantity
    return carTypes.map(item => {
      if (typeof item === 'string') {
        return { type: item, quantity: 1 };
      }
      return item;
    });
  }
  
  // Validate quantity buttons based on input value, min, and max
  validateQtyRules(container) {
    if (!container) return;
    
    const input = container.querySelector('.quantity__input');
    if (!input) return;
    
    const value = parseInt(input.value);
    
    // Validate minimum value
    if (input.min) {
      const min = parseInt(input.min);
      const buttonMinus = container.querySelector(".quantity__button[name='minus']");
      if (buttonMinus) {
        buttonMinus.classList.toggle('disabled', value <= min);
      }
    }
    
    // Validate maximum value
    if (input.max) {
      const max = parseInt(input.max);
      const buttonPlus = container.querySelector(".quantity__button[name='plus']");
      if (buttonPlus) {
        buttonPlus.classList.toggle('disabled', value >= max);
      }
    }
  }
  
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  updateCarTypeCookies(productId, carType, action, quantity = 1) {
    const selector = this.getCarTypeSelector();
    
    if (selector && typeof selector.updateCarTypeCookies === 'function') {
      console.log(`[ACTION] Calling updateCarTypeCookies with action: ${action}`);
      const result = selector.updateCarTypeCookies(productId, carType, action, quantity);
      
      // Dispatch events for other components to listen to
      console.log('[EVENT] Dispatching carTypeUpdated event');
      document.dispatchEvent(new CustomEvent('carTypeUpdated', {
        detail: { productId, carType, action, quantity }
      }));
      
      // Trigger cart update event to match cart drawer behavior
      console.log('[EVENT] Triggering cart:refresh event');
      document.dispatchEvent(new CustomEvent('cart:refresh'));
      
      // Update the actual cart quantity on the server if needed
      this.updateServerCartQuantity(productId, action, quantity);
      
      return result;
    } else {
      console.log('[INFO] Using fallback cookie handling for action:', action);
      
      // Fallback implementation for cookie handling
      try {
        // Get current cookie
        const getCookie = (name) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : null;
        };
        
        // Set cookie
        const setCookie = (name, value, days) => {
          const date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          const expires = `expires=${date.toUTCString()}`;
          document.cookie = `${name}=${value}; ${expires}; path=/`;
        };
        
        // Get existing cart details
        const cartDetailsCookie = getCookie('cart_details');
        let carTypeData = {
          cart_id: getCookie('cart') || '',
          product_details: []
        };
        
        if (cartDetailsCookie) {
          try {
            carTypeData = JSON.parse(cartDetailsCookie);
          } catch (e) {
            console.error('[ERROR] Error parsing cart details in fallback:', e);
          }
        }
        
        // Process the action
        if (action === 'remove' || (action === 'setQuantity' && quantity <= 0)) {
          // Handle remove action
          const productIndex = carTypeData.product_details.findIndex(item => item.product_id == productId);
          if (productIndex !== -1) {
            carTypeData.product_details[productIndex].car_types = 
              carTypeData.product_details[productIndex].car_types.filter(item => 
                typeof item === 'string' ? item !== carType : item.type !== carType
              );
            
            if (carTypeData.product_details[productIndex].car_types.length === 0) {
              carTypeData.product_details.splice(productIndex, 1);
            }
          }
        } else if (action === 'setQuantity') {
          // Handle set quantity action
          this.handleQuantityUpdate(carTypeData, productId, carType, quantity, false);
        } else if (action === 'increase' || action === 'add') {
          // Handle increase action
          this.handleQuantityUpdate(carTypeData, productId, carType, 1, true);
        } else if (action === 'decrease') {
          // Handle decrease action
          const productIndex = carTypeData.product_details.findIndex(item => item.product_id == productId);
          if (productIndex !== -1) {
            const carTypeIndex = carTypeData.product_details[productIndex].car_types.findIndex(
              item => typeof item === 'string' ? item === carType : item.type === carType
            );
            
            if (carTypeIndex !== -1) {
              const carTypeItem = carTypeData.product_details[productIndex].car_types[carTypeIndex];
              const currentQuantity = typeof carTypeItem === 'string' ? 1 : (carTypeItem.quantity || 1);
              const newQuantity = Math.max(0, currentQuantity - 1);
              
              if (newQuantity === 0) {
                carTypeData.product_details[productIndex].car_types = 
                  carTypeData.product_details[productIndex].car_types.filter(item => 
                    typeof item === 'string' ? item !== carType : item.type !== carType
                  );
                
                if (carTypeData.product_details[productIndex].car_types.length === 0) {
                  carTypeData.product_details.splice(productIndex, 1);
                }
              } else {
                if (typeof carTypeItem === 'string') {
                  carTypeData.product_details[productIndex].car_types[carTypeIndex] = { 
                    type: carType, 
                    quantity: newQuantity 
                  };
                } else {
                  carTypeData.product_details[productIndex].car_types[carTypeIndex].quantity = newQuantity;
                }
              }
            }
          }
        }
        
        // Save updated data
        setCookie('cart_details', JSON.stringify(carTypeData), 31);
        
        // Dispatch events for other components to listen to
        console.log('[EVENT] Dispatching carTypeUpdated event from fallback');
        document.dispatchEvent(new CustomEvent('carTypeUpdated', {
          detail: { productId, carType, action, quantity }
        }));
        
        // Trigger cart update event to match cart drawer behavior
        console.log('[EVENT] Triggering cart:refresh event from fallback');
        document.dispatchEvent(new CustomEvent('cart:refresh'));
        
        // Update the actual cart quantity on the server if needed
        this.updateServerCartQuantity(productId, action, quantity);
        
        // Refresh all car-types-display elements
        document.querySelectorAll('car-types-display').forEach(display => {
          if (display !== this && typeof display.updateDisplay === 'function') {
            display.updateDisplay();
          }
        });
        
        // Update this display
        this.updateDisplay();
        
        return carTypeData;
      } catch (e) {
        console.error('[ERROR] Fallback cookie handling failed:', e);
        return null;
      }
    }
  }
  
  // Helper method to handle quantity updates in the fallback implementation
  handleQuantityUpdate(carTypeData, productId, carType, quantity, isIncrement) {
    const productIndex = carTypeData.product_details.findIndex(item => item.product_id == productId);
    
    if (productIndex === -1) {
      // Add new product
      carTypeData.product_details.push({
        product_id: productId,
        product_name: this.getProductName(productId),
        car_types: [{ type: carType, quantity: quantity }]
      });
    } else {
      const carTypeIndex = carTypeData.product_details[productIndex].car_types.findIndex(
        item => typeof item === 'string' ? item === carType : item.type === carType
      );
      
      if (carTypeIndex === -1) {
        // Add new car type
        carTypeData.product_details[productIndex].car_types.push({ 
          type: carType, 
          quantity: quantity 
        });
      } else {
        // Update existing car type
        const carTypeItem = carTypeData.product_details[productIndex].car_types[carTypeIndex];
        
        if (typeof carTypeItem === 'string') {
          carTypeData.product_details[productIndex].car_types[carTypeIndex] = { 
            type: carType, 
            quantity: isIncrement ? 1 + quantity : quantity 
          };
        } else {
          carTypeData.product_details[productIndex].car_types[carTypeIndex].quantity = 
            isIncrement ? (carTypeItem.quantity || 1) + quantity : quantity;
        }
      }
    }
  }
  
  // Helper to get product name
  getProductName(productId) {
    // Try to get product name from the page
    const productTitle = document.querySelector('.product__title h1, .product__title h2');
    if (productTitle) {
      return productTitle.textContent.trim();
    }
    
    // Fallback: Try to get from meta tags
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) {
      return metaTitle.getAttribute('content');
    }
    
    // Second fallback: Use product ID as name
    return `Product ${productId}`;
  }
  
  // Update the server-side cart quantity when car type quantity changes
  updateServerCartQuantity(productId, action, quantity) {
    console.log('[SERVER] Updating server cart quantity for product:', productId);
    
    // Get the cart item line number for this product
    const cartItemLine = this.getCartItemLineForProduct(productId);
    if (!cartItemLine) {
      console.log('[SERVER] Could not find cart item line for product:', productId);
      return;
    }
    
    // Find cart-items or cart-drawer-items component
    const cartItems = document.querySelector('cart-items') || document.querySelector('cart-drawer-items');
    if (!cartItems || typeof cartItems.updateQuantity !== 'function') {
      console.log('[SERVER] Could not find cart-items component or updateQuantity method');
      return;
    }
    
    // Get current quantity from the cart item
    const currentQuantityInput = document.querySelector(`#Quantity-${cartItemLine}`) || 
                               document.querySelector(`#Drawer-quantity-${cartItemLine}`);
    if (!currentQuantityInput) {
      console.log('[SERVER] Could not find quantity input for line:', cartItemLine);
      return;
    }
    
    const currentQuantity = parseInt(currentQuantityInput.value, 10);
    if (isNaN(currentQuantity)) {
      console.log('[SERVER] Invalid current quantity:', currentQuantityInput.value);
      return;
    }
    
    // Calculate new quantity based on action
    let newQuantity = currentQuantity;
    let actionName = null
    if (action === 'increase' || action === 'add') {
      newQuantity = currentQuantity + 1;
      actionName = 'plus';
    } else if (action === 'decrease') {
      newQuantity = Math.max(1, currentQuantity - 1); // Ensure minimum of 1
      actionName = 'minus';
    } else if (action === 'setQuantity') {
      newQuantity = Math.max(1, quantity); // Ensure minimum of 1
      actionName = 'set';
    } else if (action === 'remove') {
      // For remove action, check if this is the last car type
      // If it is, remove the product from cart (set quantity to 0)
      const carTypes = this.getCarTypesForProduct(productId);
      if (carTypes.length <= 1) {
        newQuantity = 0; // Remove product from cart
      }
    }
    
    // Only update if quantity has changed
    if (newQuantity !== currentQuantity) {
      console.log('[SERVER] Updating quantity from', currentQuantity, 'to', newQuantity);
      
      const quantityElement =
          document.getElementById(`Quantity-${cartItemLine}`) || document.getElementById(`Drawer-quantity-${cartItemLine}`);

      quantityElement.value = newQuantity;
      
      // The third parameter is the name of the input that triggered the update
      // This is used to focus the correct element after the update
      // and to avoid showing error messages for programmatic updates
      cartItems.updateQuantity(cartItemLine, String(newQuantity), actionName);
    } else {
      console.log('[SERVER] No quantity change needed');
    }
  }
  
  // Get the cart item line number for a product
  getCartItemLineForProduct(productId) {
    // Look for cart items with data-product-id attribute
    const cartItems = document.querySelectorAll('.cart-item');
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const itemProductId = item.dataset.productId;
      
      if (itemProductId == productId) {
        // Get the line number from the cart item
        return item.dataset.index;
      }
    }
    
    return null;
  }
  
  // Get all car types for a product
  getCarTypesForProduct(productId) {
    const cartDetailsCookie = this.getCookie('cart_details');
    if (!cartDetailsCookie) return [];
    
    try {
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        return [];
      }
      
      // Find the product in the cart details
      const product = cartDetails.product_details.find(item => item.product_id == productId);
      if (!product || !product.car_types || product.car_types.length === 0) {
        return [];
      }
      
      return product.car_types;
    } catch (error) {
      console.error('[ERROR] Error parsing cart details cookie:', error);
      return [];
    }
  }
  
  // Helper method to safely access the car-type-selector component
  getCarTypeSelector() {
    // Try to find the car-type-selector component
    let selector = document.querySelector('car-type-selector');
    
    if (!selector) {
      console.log('[WORKAROUND] Car-type-selector component not found, using fallback methods');
      
      // We'll just use the fallback methods instead of trying to load the component
      // This avoids unnecessary network requests and 404 errors
    }
    
    return selector;
  }
}

// Register the custom element
if (!customElements.get('car-types-display')) {
  customElements.define('car-types-display', CarTypesDisplay);
}

// Initialize all existing car-types-display elements
document.addEventListener('DOMContentLoaded', function() {
  // The custom elements should initialize themselves
  console.log('Car types display initialized');
});
