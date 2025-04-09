// Define the car-types-json custom element
class CarTypesJson extends HTMLElement {
  constructor() {
    super();
    // Do not use shadow DOM to allow direct styling and content insertion
    // this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    console.log('[CAR-TYPES-JSON] Element connected to the DOM');
    
    // Initialize the element when it's added to the DOM
    setTimeout(() => this.initializeElement(), 100);
    
    // Listen for car type related events to update the textarea
    document.addEventListener('carTypeAdded', () => this.updateTextarea());
    document.addEventListener('carTypeRemoved', () => this.updateTextarea());
    document.addEventListener('carTypeUpdated', () => this.updateTextarea());
    document.addEventListener('cart:refresh', () => this.updateTextarea());
    document.addEventListener('cart:added', () => this.updateTextarea());
  }
  
  initializeElement() {
    console.log('[CAR-TYPES-JSON] Initializing element');
    this.updateTextarea();
  }
  
  updateTextarea() {
    console.log('[CAR-TYPES-JSON] Updating textarea with car types data');
    
    try {
      // Find the textarea element
      const textarea = this.querySelector('#car-types-input');
      
      if (!textarea) {
        console.log('[CAR-TYPES-JSON] Textarea element not found');
        return;
      }
      
      // Get the current cart details cookie
      const cookieValue = this.getCookie('cart_details');
      
      if (!cookieValue) {
        console.log('[CAR-TYPES-JSON] No cart_details cookie found');
        textarea.value = '';
        return;
      }
      
      try {
        // Parse the cookie value to ensure it's valid JSON
        const cartDetails = JSON.parse(cookieValue);
        
        if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
          console.log('[CAR-TYPES-JSON] No product details found');
          textarea.value = 'No car types selected yet.';
          return;
        }
        
        // Format the data in a human-readable format
        let formattedText = '';
        
        cartDetails.product_details.forEach((product, index) => {
          // Get product name or ID
          const productName = product.product_name || `Product ${product.product_id}`;
          
          formattedText += `Product: ${productName}\n`;
          
          // Check if product has car types
          if (product.car_types && product.car_types.length > 0) {
            formattedText += 'Selected Car Types:\n';
            
            // Process car types to handle duplicates and quantities
            const normalizedCarTypes = normalizeCarTypes(product.car_types);
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
            
            // Add each car type with its quantity
            processedCarTypes.forEach(carType => {
              formattedText += `  - ${carType.type}: ${carType.quantity}\n`;
            });
          } else {
            formattedText += 'No car types selected for this product.\n';
          }
          
          // Add a separator between products
          if (index < cartDetails.product_details.length - 1) {
            formattedText += '\n-----------------------------------\n\n';
          }
        });
        
        console.log('[CAR-TYPES-JSON] Setting textarea value to human-readable format');
        textarea.value = formattedText;
        
        // Helper function to normalize car types
        function normalizeCarTypes(carTypes) {
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
        
        // Dispatch change event to ensure Shopify's cart system picks up the change
        const changeEvent = new Event('change', { bubbles: true });
        textarea.dispatchEvent(changeEvent);
        
        console.log('[CAR-TYPES-JSON] Textarea value updated successfully');
      } catch (jsonError) {
        console.error('[CAR-TYPES-JSON] Error parsing JSON from cookie:', jsonError);
        
        // If parsing fails, use the raw cookie value
        textarea.value = cookieValue;
      }
    } catch (error) {
      console.error('[CAR-TYPES-JSON] Error updating textarea:', error);
    }
  }
  
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
}

// Register the custom element
if (!customElements.get('car-types-json')) {
  customElements.define('car-types-json', CarTypesJson);
}

// Initialize all existing car-types-json elements when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('[CAR-TYPES-JSON] DOM content loaded, initializing components');
  
  // The custom elements should initialize themselves via connectedCallback
  const elements = document.querySelectorAll('car-types-json');
  console.log(`[CAR-TYPES-JSON] Found ${elements.length} car-types-json elements`);
});



