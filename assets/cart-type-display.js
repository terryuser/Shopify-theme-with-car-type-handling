document.addEventListener('DOMContentLoaded', function() {
  console.log("Cart type display script loaded");
  
  // Initial display of car types
  updateCartVehicleDisplay();
  
  // Listen for Shopify's cart:refresh event which is triggered when the cart is updated
  document.addEventListener('cart:refresh', function(event) {
    console.log("Cart refresh event detected");
    updateCartVehicleDisplay();
  });
  
  // Listen for Shopify's cart:added event which is triggered when an item is added to the cart
  document.addEventListener('cart:added', function(event) {
    console.log("Cart added event detected");
    updateCartVehicleDisplay();
  });
  
  // Listen for Shopify's drawer open event
  document.addEventListener('drawerOpen', function(event) {
    console.log("Drawer open event detected");
    updateCartVehicleDisplay();
  });
  
  // Listen for our custom event from car-type-selector.js
  document.addEventListener('carTypeAdded', function(event) {
    console.log("Car type added event detected", event.detail);
    updateCartVehicleDisplay();
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
});
