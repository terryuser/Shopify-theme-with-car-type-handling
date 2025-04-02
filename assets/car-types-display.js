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
    // Clear existing content but preserve any comments
    const comments = Array.from(this.childNodes).filter(node => node.nodeType === Node.COMMENT_NODE);
    this.innerHTML = '';
    comments.forEach(comment => this.appendChild(comment));
    
    // Get product ID from parent container
    const parentContainer = this.closest('.cart-item__car-types');
    if (!parentContainer) return;
    
    const productId = parentContainer.dataset.productId;
    if (!productId) return;
    
    // Get cart details cookie
    const cartDetailsCookie = this.getCookie('cart_details');
    if (!cartDetailsCookie) return;
    
    try {
      const cartDetails = JSON.parse(cartDetailsCookie);
      
      if (!cartDetails.product_details || cartDetails.product_details.length === 0) {
        return;
      }
      
      // Find the product in the cart details
      const product = cartDetails.product_details.find(item => item.product_id == productId);
      if (!product || !product.car_types || product.car_types.length === 0) return;
      
      // Create heading
      const heading = document.createElement('div');
      heading.className = 'cart-item__car-types-heading';
      heading.textContent = 'Selected Car Types:';
      this.appendChild(heading);
      
      // Create car types list
      const carTypesList = document.createElement('ul');
      carTypesList.className = 'cart-item__car-types-list';
      
      // Process car types to prevent duplicates
      const processedCarTypes = [];
      
      // First, convert any legacy format (strings) to objects with quantity
      const normalizedCarTypes = product.car_types.map(item => {
        if (typeof item === 'string') {
          return { type: item, quantity: 1 };
        }
        return item;
      });
      
      // Filter out duplicates while preserving the original quantities from the cookie
      normalizedCarTypes.forEach(item => {
        // Only add the item if it doesn't already exist in the processed list
        if (!processedCarTypes.some(processed => processed.type === item.type)) {
          processedCarTypes.push({...item});
        }
      });
      
      // Loop through processed car types (no duplicates)
      processedCarTypes.forEach(carTypeItem => {
        const carTypeElement = document.createElement('li');
        carTypeElement.className = 'cart-item__car-type';
        
        carTypeElement.innerHTML = `
          <span class="cart-item__car-type-name">${carTypeItem.type}</span>
          <div class="cart-item__car-type-controls">
            <span class="cart-item__car-type-quantity">Qty: ${carTypeItem.quantity || 1}</span>
            <button class="cart-item__car-type-remove" data-product-id="${product.product_id}" data-car-type="${carTypeItem.type}">×</button>
          </div>
        `;
        
        carTypesList.appendChild(carTypeElement);
      });
      
      this.appendChild(carTypesList);
      
      // Add event listeners for remove buttons
      this.querySelectorAll('.cart-item__car-type-remove').forEach(button => {
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
    } catch (e) {
      console.error('Error parsing car types data:', e);
      this.innerHTML = '<div class="cart-item__car-types-error">Error displaying car types</div>';
    }
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
