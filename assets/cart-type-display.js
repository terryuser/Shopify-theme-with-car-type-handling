// Define the car-types-display custom element
class CarTypesDisplay extends HTMLElement {
  constructor() {
    super();
    // Do not use shadow DOM to allow direct styling and content insertion
    // this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Initialize the display when the element is added to the DOM
    setTimeout(() => this.initializeDisplay(), 100);
    
    // Listen for direct events not handled by cart-type-display.js
    document.addEventListener('carTypeRemoved', () => this.updateDisplay());
    document.addEventListener('carTypeUpdated', () => this.updateDisplay());
  }
  
  initializeDisplay() {
    this.updateDisplay();
  }
  
  updateDisplay() {
    console.log('[INFO] Updating car types display');
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
      
      // Check if we need to delay (only on first check and when cart cookie is empty)
      const cartCookie = this.getCookie('cart');
      console.log('[INFO] Cart cookie on updateDisplay():', cartCookie);
      if (!cartCookie) {
        console.log('[INFO] Cart cookie is empty, waiting 1 second before checking for cart_details cookie');
        setTimeout(() => {
          this.updateDisplay();
        }, 1000);
        return;
      }
      
      // Get cart details cookie after delay
      const cartDetailsCookie = this.getCookie('cart_details');
      if (!cartDetailsCookie) {
        console.log('[INFO] No cart_details cookie found after delay');
        
        // Show a simple message when no car types are available
        const heading = document.createElement('div');
        heading.className = 'cart-item__car-types-heading';
        heading.textContent = 'Car Types for the product:';
        this.appendChild(heading);
        
        const noTypesElement = document.createElement('div');
        noTypesElement.className = 'cart-item__car-types-empty';
        noTypesElement.textContent = 'No car types selected yet';
        this.appendChild(noTypesElement);
        return;
      }
      
      // Parse the cart details
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
      heading.textContent = 'Car Types for the product:';
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
          existingType.quantity += item.quantity;
        } else {
          processedCarTypes.push({
            type: item.type,
            quantity: item.quantity
          });
        }
      });
      
      // Create list items for each car type
      processedCarTypes.forEach(carTypeObj => {
        const carType = carTypeObj.type;
        const quantity = carTypeObj.quantity;
        
        const listItem = document.createElement('li');
        listItem.classList.add('cart-item__car-type');
        listItem.dataset.carType = carType;
        
        // Create the car type info container with the HTML structure from the original implementation
        const carTypeInfo = document.createElement('div');
        carTypeInfo.classList.add('cart-item__car-type-info');
        
        // Use the exact HTML structure from the original implementation
        carTypeInfo.innerHTML = `
          <span class="cart-item__car-type-name">${carType}</span>
          
          <div class="cart-item__car-type-controls">
            <div class="cart-item__car-type-quantity">
              <quantity-controls class="quantity cart-item__car-type-quantity-wrapper">
                <button 
                  class="quantity__button no-js-hidden" 
                  name="minus" 
                  type="button"
                  data-action="decrease"
                  data-product-id="${productId}"
                  data-car-type="${carType}"
                >
                  <span class="visually-hidden">Decrease quantity for ${carType}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="icon icon-minus" fill="none" viewBox="0 0 10 2">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z" fill="currentColor">
                    </path>
                  </svg>
                </button>
                <input 
                  class="quantity__input cart-item__car-type-quantity-input" 
                  type="number" 
                  name="quantity" 
                  id="Quantity-${productId}-${carType.replace(/\s+/g, '-')}" 
                  min="1" 
                  value="${quantity || 1}" 
                  data-product-id="${productId}"
                  data-car-type="${carType}"
                  disabled
                >
                <button 
                  class="quantity__button no-js-hidden" 
                  name="plus" 
                  type="button"
                  data-action="increase"
                  data-product-id="${productId}"
                  data-car-type="${carType}"
                >
                  <span class="visually-hidden">Increase quantity for ${carType}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="icon icon-plus" fill="none" viewBox="0 0 10 10">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z" fill="currentColor">
                    </path>
                  </svg>
                </button>
              </quantity-controls>
            </div>
            <button 
              class="cart-item__car-type-remove" 
              aria-label="Remove ${carType}" 
              data-product-id="${productId}" 
              data-car-type="${carType}">
              <span class="visually-hidden">Remove ${carType}</span>
              ×
            </button>
          </div>
        `;
        
        // Add the car type info to the list item
        listItem.appendChild(carTypeInfo);
        
        // Add the list item to the car types list
        carTypesList.appendChild(listItem);
        
        // Add event listeners after the HTML is added to the DOM
        const decreaseButton = carTypeInfo.querySelector('button[name="minus"]');
        if (decreaseButton) {
          decreaseButton.addEventListener('click', () => {
            this.updateCarTypeCookies(productId, carType, 'minus');
          });
        }
        
        const quantityInput = carTypeInfo.querySelector('input[name="quantity"]');
        if (quantityInput) {
          quantityInput.addEventListener('change', (event) => {
            const newQuantity = parseInt(event.target.value, 10);
            if (!isNaN(newQuantity) && newQuantity >= 1) {
              this.updateCarTypeCookies(productId, carType, 'remove', newQuantity);
            } else {
              // Reset to previous value if invalid
              event.target.value = quantity;
            }
          });
        }
        
        const increaseButton = carTypeInfo.querySelector('button[name="plus"]');
        if (increaseButton) {
          increaseButton.addEventListener('click', () => {
            this.updateCarTypeCookies(productId, carType, 'add');
          });
        }
        
        const removeButton = carTypeInfo.querySelector('.cart-item__car-type-remove');
        if (removeButton) {
          removeButton.addEventListener('click', () => {
            this.updateCarTypeCookies(productId, carType, 'remove');
          });
        }
        
        // Validate quantity buttons based on input value
        const quantityControls = carTypeInfo.querySelector('.cart-item__car-type-quantity');
        if (quantityControls) {
          this.validateQtyRules(quantityControls);
        }
      });
      
      // Add the car types list to the display
      this.appendChild(carTypesList);
    } catch (error) {
      console.error('[ERROR] Error updating car types display:', error);
    }
  }
  
  // Helper method to get car types from cookies
  getCarTypesFromCookies() {
    // Try to get car types from the car-type-selector component first
    const selector = this.getCarTypeSelector();
    if (selector && typeof selector.getCarTypes === 'function') {
      return selector.getCarTypes();
    }
    
    // Fallback to directly reading cookies
    const cartDetailsCookie = this.getCookie('cart_details');
    if (!cartDetailsCookie) {
      return [];
    }
    
    try {
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        return [];
      }
      
      // Collect all car types from all products
      const allCarTypes = [];
      cartDetails.product_details.forEach(product => {
        if (product.car_types && product.car_types.length > 0) {
          allCarTypes.push(...product.car_types);
        }
      });
      
      return allCarTypes;
    } catch (error) {
      console.error('[ERROR] Error parsing cart details cookie:', error);
      return [];
    }
  }
  
  // Helper method to normalize car types (convert strings to objects with quantity)
  normalizeCarTypes(carTypes) {
    if (!carTypes || !Array.isArray(carTypes)) {
      return [];
    }
    
    return carTypes.map(item => {
      if (typeof item === 'string') {
        return { type: item, quantity: 1 };
      } else if (typeof item === 'object' && item.type) {
        return {
          type: item.type,
          quantity: parseInt(item.quantity || 1, 10)
        };
      }
      return { type: String(item), quantity: 1 };
    });
  }
  
  // Validate quantity buttons based on input value, min, and max
  validateQtyRules(container) {
    const quantityInput = container.querySelector('input[name="quantity"]');
    const minusButton = container.querySelector('button[name="minus"]');
    const plusButton = container.querySelector('button[name="plus"]');
    
    if (!quantityInput || !minusButton || !plusButton) {
      return;
    }
    
    const currentValue = parseInt(quantityInput.value, 10);
    const minValue = parseInt(quantityInput.getAttribute('min') || 1, 10);
    const maxValue = parseInt(quantityInput.getAttribute('max') || Infinity, 10);
    
    // Disable minus button if at min value
    if (currentValue <= minValue) {
      minusButton.setAttribute('disabled', '');
    } else {
      minusButton.removeAttribute('disabled');
    }
    
    // Disable plus button if at max value
    if (currentValue >= maxValue) {
      plusButton.setAttribute('disabled', '');
    } else {
      plusButton.removeAttribute('disabled');
    }
  }
  
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  updateCarTypeCookies(productId, carType, action, quantity = 1) {
    console.log(`[COOKIES] Updating car type cookies for product ${productId}, car type ${carType}, action ${action}, quantity ${quantity}`);
    
    try {
      // Try to use the car-type-selector component if available
      const selector = this.getCarTypeSelector();
      if (selector && typeof selector.updateCarType === 'function') {
        console.log('[COOKIES] Using car-type-selector component to update car type');
        selector.updateCarType(productId, carType, action, quantity);
        
        // Dispatch an event to notify other components that a car type has been updated
        const event = new CustomEvent('carTypeUpdated', {
          detail: { productId, carType, action, quantity }
        });
        document.dispatchEvent(event);
        
        // Update the server-side cart quantity
        this.updateServerCartQuantity(productId, action, quantity);
        
        return;
      }
      
      // Fallback implementation if car-type-selector component is not available
      console.log('[COOKIES] Using fallback implementation to update car type');
      
      // Define cookie helpers within the function scope
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      
      // Set cookie
      const setCookie = (name, value, days) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `; expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}${expires}; path=/`;
      };
      
      // Get current cart details cookie
      const cartDetailsCookie = getCookie('cart_details');
      let cartDetails = { product_details: [] };
      
      if (cartDetailsCookie) {
        try {
          cartDetails = JSON.parse(cartDetailsCookie);
          if (!cartDetails.product_details) {
            cartDetails.product_details = [];
          }
        } catch (error) {
          console.error('[ERROR] Error parsing cart details cookie:', error);
        }
      }
      
      // Get cart ID from cookies
      const cartId = getCookie('cart') || '';
      cartDetails.cart_id = cartId;
      
      // Find the product in the cart details
      let product = cartDetails.product_details.find(item => item.product_id == productId);
      
      if (!product) {
        // If product not found, add it to the cart details
        product = {
          product_id: productId,
          car_types: []
        };
        cartDetails.product_details.push(product);
      }
      
      // Ensure car_types is an array
      if (!product.car_types) {
        product.car_types = [];
      }
      
      // Handle the action
      if (action === 'add') {
        // Add car type or increase quantity
        this.handleQuantityUpdate(cartDetails, productId, carType, quantity, true);
      } else if (action === 'minus') {
        // Remove car type or decrease quantity
        this.handleQuantityUpdate(cartDetails, productId, carType, quantity, false);
      } else if (action === 'remove') {
        // Remove the entire car type record
        console.log(`[REMOVE] Removing car type ${carType} for product ${productId}`);
        const normalizedCarTypes = this.normalizeCarTypes(product.car_types);
        console.log(`[REMOVE] Normalized car types:`, normalizedCarTypes);
        const existingType = normalizedCarTypes.find(item => item.type === carType);
        
        if (existingType) {
          // Get the current quantity before removing
          const currentQuantity = existingType.quantity;
          console.log(`[REMOVE] Found car type ${carType} with quantity ${currentQuantity}`);
          
          // Use handleQuantityUpdate to remove the car type with its current quantity
          console.log(`[REMOVE] Calling handleQuantityUpdate to remove car type ${carType}`);
          this.handleQuantityUpdate(cartDetails, productId, carType, currentQuantity, false);
          console.log(`[REMOVE] Car type ${carType} should now be removed`);
        } else {
          console.log(`[REMOVE] Car type ${carType} not found for removal`);
        }
      }
      
      // Save updated cart details cookie
      setCookie('cart_details', JSON.stringify(cartDetails), 7);
      
      // Update the car-types-input element with the cookie value
      this.updateCarTypesInput(cartDetailsCookie);
      
      // Dispatch an event to notify other components that a car type has been updated
      const event = new CustomEvent('carTypeUpdated', {
        detail: { productId, carType, action, quantity }
      });
      document.dispatchEvent(event);
      
      // Update the server-side cart quantity
      this.updateServerCartQuantity(productId, action, quantity);
      
      // Update the display
      this.updateDisplay();
    } catch (error) {
      console.error('[ERROR] Error updating car type cookies:', error);
    }
  }
  
  // Helper method to handle quantity updates in the fallback implementation
  handleQuantityUpdate(carTypeData, productId, carType, quantity, isIncrement) {
    console.log(`[QUANTITY] Handling quantity update for product ${productId}, car type ${carType}, quantity ${quantity}, isIncrement: ${isIncrement}`);
    
    const product = carTypeData.product_details.find(item => item.product_id == productId);
    if (!product) {
      console.log(`[QUANTITY] Product ${productId} not found in cart data`);
      return;
    }
    
    console.log(`[QUANTITY] Current car types for product:`, product.car_types);
    
    // Normalize car types to ensure they all have a quantity property
    const normalizedCarTypes = this.normalizeCarTypes(product.car_types);
    console.log(`[QUANTITY] Normalized car types:`, normalizedCarTypes);
    
    // Find the car type in the normalized list
    const existingTypeIndex = normalizedCarTypes.findIndex(item => item.type === carType);
    console.log(`[QUANTITY] Existing type index: ${existingTypeIndex}`);
    
    if (existingTypeIndex >= 0) {
      // Car type exists, update quantity
      const oldQuantity = normalizedCarTypes[existingTypeIndex].quantity;
      
      if (isIncrement) {
        normalizedCarTypes[existingTypeIndex].quantity += quantity;
        console.log(`[QUANTITY] Increased quantity from ${oldQuantity} to ${normalizedCarTypes[existingTypeIndex].quantity}`);
      } else {
        normalizedCarTypes[existingTypeIndex].quantity -= quantity;
        console.log(`[QUANTITY] Decreased quantity from ${oldQuantity} to ${normalizedCarTypes[existingTypeIndex].quantity}`);
        
        // Remove car type if quantity is zero or less
        if (normalizedCarTypes[existingTypeIndex].quantity <= 0) {
          console.log(`[QUANTITY] Removing car type ${carType} as quantity is now ${normalizedCarTypes[existingTypeIndex].quantity}`);
          normalizedCarTypes.splice(existingTypeIndex, 1);
          
          // Dispatch an event to notify other components that a car type has been removed
          console.log(`[QUANTITY] Dispatching carTypeRemoved event`);
          const event = new CustomEvent('carTypeRemoved', {
            detail: { productId, carType }
          });
          document.dispatchEvent(event);
        }
      }
    } else if (isIncrement) {
      // Car type doesn't exist and we're incrementing, add it
      console.log(`[QUANTITY] Adding new car type ${carType} with quantity ${quantity}`);
      normalizedCarTypes.push({ type: carType, quantity });
    } else {
      console.log(`[QUANTITY] Car type ${carType} not found and not incrementing, so no action taken`);
    }
    
    // Update the product's car types with the normalized list
    product.car_types = normalizedCarTypes;
    console.log(`[QUANTITY] Updated car types for product:`, product.car_types);
  }
  
  // Helper to get product name
  getProductName(productId) {
    // Try to find the product name in the DOM first
    const productElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (productElement) {
      const nameElement = productElement.querySelector('.cart-item__name');
      if (nameElement) {
        return nameElement.textContent.trim();
      }
    }
    
    // Fallback to checking the cart details cookie
    const cartDetailsCookie = this.getCookie('cart_details');
    if (cartDetailsCookie) {
      try {
        const cartDetails = JSON.parse(cartDetailsCookie);
        if (cartDetails.product_details) {
          const product = cartDetails.product_details.find(item => item.product_id == productId);
          if (product && product.product_name) {
            return product.product_name;
          }
        }
      } catch (error) {
        console.error('[ERROR] Error parsing cart details cookie:', error);
      }
    }
    
    return `Product ${productId}`;
  }
  
  // Update the server-side cart quantity when car type quantity changes
  updateServerCartQuantity(productId, action, quantity) {
    console.log('[SERVER] Updating server cart quantity for product ID:', productId, 'action:', action, 'quantity:', quantity);
    
    // Get the cart item line number for the product
    const cartItemLine = this.getCartItemLineForProduct(productId);
    if (!cartItemLine) {
      console.log('[SERVER] No cart item line found for product ID:', productId);
      return;
    }
    
    console.log('[SERVER] Found cart item line:', cartItemLine);
    
    // Find cart-items or cart-drawer-items component
    const cartItems = document.querySelector('cart-items') || document.querySelector('cart-drawer-items');

    if (!cartItems) {
      console.log('[SERVER] No cart items object found');
      return;
    }
    
    // Get the current quantity input element
    const currentQuantityInput = document.getElementById(`Quantity-${cartItemLine}`) || 
                               document.getElementById(`Drawer-quantity-${cartItemLine}`);
    
    if (!currentQuantityInput) {
      console.log('[SERVER] No quantity input found for cart item line:', cartItemLine);
      return;
    }
    
    const currentQuantity = parseInt(currentQuantityInput.value, 10);
    if (isNaN(currentQuantity)) {
      console.log('[SERVER] Invalid current quantity:', currentQuantityInput.value);
      return;
    }
    
    // Calculate new quantity based on action
    let newQuantity = currentQuantity;
    let actionName = null;
    console.log(`[SERVER] Processing action: ${action} for product ${productId}`);
    
    if (action === 'increase' || action === 'add') {
      newQuantity = currentQuantity + 1;
      actionName = 'plus';
      console.log(`[SERVER] Increasing quantity to ${newQuantity}, actionName: ${actionName}`);
    } else if (action === 'decrease' || action === 'minus') {
      newQuantity = Math.max(1, currentQuantity - 1); // Ensure minimum of 1
      actionName = 'minus';
      console.log(`[SERVER] Decreasing quantity to ${newQuantity}, actionName: ${actionName}`);

      // For remove action, check if this is the last car type
      // If it is, remove the product from cart (set quantity to 0)
      const carTypes = this.getCarTypesForProduct(productId);
      console.log(`[SERVER] Remaining car types for product: ${carTypes.length}`);
      if (action === 'minus' && carTypes.length <= 1) {
        newQuantity = 0; // Remove product from cart
        console.log(`[SERVER] Last car type, setting quantity to 0 to remove product`);
      }
    } else if (action === 'remove') {
      // For direct removal, set quantity to 0
      newQuantity = currentQuantity - quantity;
      actionName = 'minus';
      console.log(`[SERVER] Direct removal, setting quantity to 0, actionName: ${actionName}`);
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
  
  // Update the car-types-input element with the cookie value
  updateCarTypesInput(cartDetailsCookie) {
    console.log('[INPUT] Updating car-types-input element with cookie value');
    
    try {
      // Find the car-types-input element
      const carTypesInput = document.querySelector('#car-types-input');
      
      if (!carTypesInput) {
        console.log('[INPUT] car-types-input element not found');
        return;
      }
      
      // Get the current cart details cookie
      const cookieValue = this.getCookie('cart_details');
      
      if (!cookieValue) {
        console.log('[INPUT] No cart_details cookie found');
        carTypesInput.value = '';
        return;
      }
      
      console.log('[INPUT] Setting car-types-input value to:', cookieValue);
      carTypesInput.value = cookieValue;
      
      // Dispatch change event to ensure Shopify's cart system picks up the change
      const changeEvent = new Event('change', { bubbles: true });
      carTypesInput.dispatchEvent(changeEvent);
      
      console.log('[INPUT] car-types-input value updated successfully');
    } catch (error) {
      console.error('[ERROR] Error updating car-types-input:', error);
    }
  }
}

// Register the custom element
if (!customElements.get('car-types-display')) {
  customElements.define('car-types-display', CarTypesDisplay);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("Cart type display script loaded");
  
  // Initial display of car types
  updateCartVehicleDisplay();
  
  // Initialize the car-types-input element with the current cookie value
  updateCarTypesInputFromCookie();
  
  // Listen for Shopify's cart:refresh event which is triggered when the cart is updated
  document.addEventListener('cart:refresh', function(event) {
    console.log("Cart refresh event detected");
    updateCartVehicleDisplay();
    
    // Update the car-types-input element
    updateCarTypesInputFromCookie();
    
    // Directly call updateDisplay() on all car-types-display elements
    setTimeout(() => {
      console.log("Directly calling updateDisplay() from cart:refresh event");
      document.querySelectorAll('car-types-display').forEach(display => {
        if (display && typeof display.updateDisplay === 'function') {
          display.updateDisplay();
        }
      });
    }, 100);
  });
  
  // Listen for Shopify's cart:added event which is triggered when an item is added to the cart
  document.addEventListener('cart:added', function(event) {
    console.log("Cart added event detected");
    updateCartVehicleDisplay();
    
    // Update the car-types-input element
    updateCarTypesInputFromCookie();
    
    // Directly call updateDisplay() on all car-types-display elements
    setTimeout(() => {
      console.log("Directly calling updateDisplay() from cart:added event");
      document.querySelectorAll('car-types-display').forEach(display => {
        if (display && typeof display.updateDisplay === 'function') {
          display.updateDisplay();
        }
      });
    }, 100);
  });
  
  // Listen for Shopify's drawer open event
  document.addEventListener('drawerOpen', function(event) {
    console.log("Drawer open event detected");
    updateCartVehicleDisplay();
    
    // Update the car-types-input element
    updateCarTypesInputFromCookie();
    
    // Directly call updateDisplay() on all car-types-display elements
    setTimeout(() => {
      console.log("Directly calling updateDisplay() from drawerOpen event");
      document.querySelectorAll('car-types-display').forEach(display => {
        if (display && typeof display.updateDisplay === 'function') {
          display.updateDisplay();
        }
      });
    }, 100);
  });
  
  // Listen for our custom event from car-type-selector.js
  document.addEventListener('carTypeAdded', function(event) {
    console.log("Car type added event detected", event.detail);
    updateCartVehicleDisplay();
    
    // Update the car-types-input element
    updateCarTypesInputFromCookie();
    
    // Directly call updateDisplay() on all car-types-display elements
    setTimeout(() => {
      console.log("Directly calling updateDisplay() from carTypeAdded event");
      document.querySelectorAll('car-types-display').forEach(display => {
        if (display && typeof display.updateDisplay === 'function') {
          display.updateDisplay();
        }
      });
    }, 100);
  });
  
  // Create a MutationObserver to watch for cart drawer changes
  const cartDrawerObserver = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const drawer = document.querySelector('cart-drawer');
        if (drawer && !drawer.classList.contains('is-empty')) {
          console.log("Cart drawer opened or updated");
          updateCartVehicleDisplay();
        }
      }
    }
  });
  
  // Start observing the cart drawer
  const cartDrawer = document.querySelector('cart-drawer');
  if (cartDrawer) {
    cartDrawerObserver.observe(cartDrawer, { attributes: true });
  }
  
  function updateCartVehicleDisplay() {
    console.log("Updating cart vehicle display");
    // Find all car type containers
    const containers = document.querySelectorAll('[data-car-type-container]');
    console.log("Found car type containers:", containers.length);
    
    containers.forEach(container => {
      const productId = container.dataset.productId;
      if (productId) {
        console.log("Processing container for product ID:", productId);
        const productData = getProductDataForProduct(productId);
        
        if (productData) {
          console.log("Found product data:", productData);
          // Create HTML for car types
          let html = '<dt>Vehicle:</dt><dd>';
          
          if (productData.car_types && productData.car_types.length > 0) {
            productData.car_types.forEach((carType, index) => {
              html += `<div data-car-type="${carType}">${carType}</div>`;
            });
          }
          
          html += '</dd>';
          
          // Insert HTML into container
          container.innerHTML = html;
          
          // Add product name as a data attribute for reference
          if (productData.product_name) {
            container.dataset.productName = productData.product_name;
          }
        } else {
          console.log("No product data found for product ID:", productId);
          container.innerHTML = ''; // Clear container if no data found
        }
      }
    });

    // Directly call updateDisplay() on all car-types-display elements
    console.log("Directly calling updateDisplay() on all car-types-display elements");
    document.querySelectorAll('car-types-display').forEach(display => {
      console.log("Calling updateDisplay() on", display);
      if (display && typeof display.updateDisplay === 'function') {
        display.updateDisplay();
      }
    });
  }
  
  function getProductDataForProduct(productId) {
    console.log("Getting product data for product ID:", productId);
    // Get cart ID from cookies
    const cartId = getCookie('cart') || '';
    const carTypeCookie = getCookie('cart_details');
    console.log("Cart ID:", cartId);
    console.log("Cart details cookie:", carTypeCookie);
    
    if (carTypeCookie) {
      try {
        const carTypeData = JSON.parse(carTypeCookie);
        console.log("Parsed cart details:", carTypeData);
        
        // Check if the cart ID matches and find the product in product_details
        if (carTypeData.cart_id === cartId && 
            Array.isArray(carTypeData.product_details)) {
          console.log("Looking for product in product_details array");
          const productDetails = carTypeData.product_details.find(
            item => item.product_id == productId
          );
          
          if (productDetails) {
            console.log("Found product details:", productDetails);
            return productDetails;
          }
        }
      } catch (e) {
        console.error('Error parsing car type cookie:', e);
      }
    }
    
    return null;
  }
  
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  // Helper function to update the car-types-input element with the current cookie value
  function updateCarTypesInputFromCookie() {
    console.log('[INPUT] Updating car-types-input element on page load/event');
    
    try {
      // Find the car-types-input element
      const carTypesInput = document.querySelector('#car-types-input');
      
      if (!carTypesInput) {
        console.log('[INPUT] car-types-input element not found');
        return;
      }
      
      // Get the current cart details cookie
      const cookieValue = getCookie('cart_details');
      
      if (!cookieValue) {
        console.log('[INPUT] No cart_details cookie found');
        carTypesInput.value = '';
        return;
      }
      
      console.log('[INPUT] Setting car-types-input value to:', cookieValue);
      carTypesInput.value = cookieValue;
      
      // Dispatch change event to ensure Shopify's cart system picks up the change
      const changeEvent = new Event('change', { bubbles: true });
      carTypesInput.dispatchEvent(changeEvent);
      
      console.log('[INPUT] car-types-input value updated successfully');
    } catch (error) {
      console.error('[ERROR] Error updating car-types-input:', error);
    }
  }
});
