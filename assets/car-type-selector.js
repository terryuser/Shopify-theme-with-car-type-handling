class CarTypeSelector extends HTMLElement {
  constructor() {
    super();
    this.isThirdRowAlreadyDisabled = false;
    this.info = null;
    this.madeSelect = this.querySelector('[data-type="made"]');
    this.modelSelect = this.querySelector('[data-type="model"]');
    this.yearSelect = this.querySelector('[data-type="year"]');
    this.submitButton = this.parentElement.querySelector(
      'button[type="submit"][name="add"]'
    );

    // Bind event handlers
    this.handleMadeChange = this.handleMadeChange.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleYearChange = this.handleYearChange.bind(this);
    this.fetchMakes = this.fetchMakes.bind(this);
    this.fetchModels = this.fetchModels.bind(this);
    this.fetchYears = this.fetchYears.bind(this);
    this.fetchSeatRows = this.fetchSeatRows.bind(this);

    if (this.submitButton) {
      // Disable the submit button initially
      this.submitButton.disabled = true;
      this.handleProductAdd = this.handleProductAdd.bind(this);
    }
  }

  connectedCallback() {
    // Fetch makes when component is connected
    this.fetchMakes();
    
    // Add event listeners
    this.madeSelect.addEventListener("change", this.handleMadeChange);
    this.modelSelect.addEventListener("change", this.handleModelChange);
    this.yearSelect.addEventListener("change", this.handleYearChange);

    if (this.submitButton) {
      this.submitButton.addEventListener("click", this.handleProductAdd);
    }

    const thirdRowOptions = this.parentElement.querySelectorAll(
      `input[value="Full Set with 3rd Row (if applicable)"]`
    );

    console.log("Third row options", thirdRowOptions);

    if (thirdRowOptions[0] && thirdRowOptions[0].getAttribute("disabled") == true) {
      this.isThirdRowAlreadyDisabled = true;
    }
  }

  async fetchMakes() {
    try {
      // Show loading state
      this.madeSelect.disabled = true;
      
      // Clear existing options except the first one (placeholder)
      while (this.madeSelect.options.length > 1) {
        this.madeSelect.remove(1);
      }
      
      // Fetch makes from API
      const response = await fetch("https://mat-car-type-api.fly.dev/api/car_type_options/makes", {
        method: "GET"
      });
      console.log("response", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Makes data:", data);
      
      // Check if the response has the expected structure
      if (data && data.success && Array.isArray(data.makes)) {
        // Add options to the made select
        data.makes.forEach(make => {
          if (make && make !== "") {
            const option = document.createElement("option");
            option.value = make;
            option.textContent = make;
            this.madeSelect.appendChild(option);
          }
        });
      } else {
        console.error("Unexpected API response format for makes:", data);
      }
    } catch (error) {
      console.error("Error fetching makes:", error);
    } finally {
      // Enable select regardless of success/failure
      this.madeSelect.disabled = false;
    }
  }

  async fetchModels(make) {
    try {
      // Show loading state
      this.modelSelect.disabled = true;
      
      // Clear existing options except the first one (placeholder)
      while (this.modelSelect.options.length > 1) {
        this.modelSelect.remove(1);
      }
      
      // Fetch models for the selected make
      const response = await fetch(`https://mat-car-type-api.fly.dev/api/car_type_options/models/${encodeURIComponent(make)}`, {
        method: "GET"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Models data:", data);
      
      // Check if the response has the expected structure
      if (data && data.success && Array.isArray(data.models)) {
        // Add options to the model select
        data.models.forEach(model => {
          if (model && model !== "") {
            const option = document.createElement("option");
            option.value = model;
            option.textContent = model;
            // Store the make as a data attribute for reference
            option.dataset.made = make;
            this.modelSelect.appendChild(option);
          }
        });
        
        // Enable model select if there are models available
        if (data.models.length > 0) {
          this.modelSelect.disabled = false;
          this.modelSelect.parentElement.classList.remove("disabled");
        }
      } else {
        console.error("Unexpected API response format for models:", data);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  }

  async fetchYears(make, model) {
    try {
      // Show loading state
      this.yearSelect.disabled = true;
      
      // Clear existing options except the first one (placeholder)
      while (this.yearSelect.options.length > 1) {
        this.yearSelect.remove(1);
      }
      
      // Fetch years for the selected make and model
      const response = await fetch(`https://mat-car-type-api.fly.dev/api/car_type_options/years/${encodeURIComponent(make)}/${encodeURIComponent(model)}`, {
        method: "GET"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Years data:", data);
      
      // Check if the response has the expected structure
      if (data && data.success && Array.isArray(data.years)) {
        // Add options to the year select
        data.years.forEach(year => {
          if (year && year !== "") {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            // Store the make and model as data attributes for reference
            option.dataset.made = make;
            option.dataset.model = model;
            this.yearSelect.appendChild(option);
          }
        });
        
        // Enable year select if there are years available
        if (data.years.length > 0) {
          this.yearSelect.disabled = false;
          this.yearSelect.parentElement.classList.remove("disabled");
        }
      } else {
        console.error("Unexpected API response format for years:", data);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  }

  async fetchSeatRows(make, model, year) {
    console.log("Fetching seat rows for make:", make, "model:", model, "year:", year);
    try {
      // Fetch seat rows data for the selected make, model, and year
      const response = await fetch(`https://mat-car-type-api.fly.dev/api/car_type/seat_rows/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${encodeURIComponent(year)}`, {
        method: "GET"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Seat rows data:", data);
      
      // Check if the response has the expected structure
      if (data && data.success && data.seat_rows) {
        this.info = {
          seat_rows: data.seat_rows ?? 2
        };
        
        console.log("Seat rows info:", this.info);
        
        // Limit options based on seat rows
        this.limitOptionsBySeatRow(Number(this.info.seat_rows));
      } else {
        console.error("Unexpected API response format for seat rows:", data);
        this.info = {
          seat_rows: 2,  // Default to 2 rows if data is invalid
        };
        this.limitOptionsBySeatRow(2);
      }
      
      return this.info;
    } catch (error) {
      console.error("Error fetching seat rows data:", error);
      // Default to 2 rows in case of error
      this.info = {
        seat_rows: 2,
        special_handle_code: ''
      };
      this.limitOptionsBySeatRow(2);
      return this.info;
    }
  }

  async handleMadeChange(event) {
    console.log("Made selector changed");
    const selectedMade = event.target.value;

    // Reset and disable model select if no made selected
    if (!selectedMade) {
      this.modelSelect.value = "";
      this.modelSelect.disabled = true;
      this.modelSelect.parentElement.classList.add("disabled");
      this.yearSelect.value = "";
      this.yearSelect.disabled = true;
      this.yearSelect.parentElement.classList.add("disabled");
      this.submitButton.disabled = true; // Disable submit button
      return;
    }

    // Fetch models for the selected make
    await this.fetchModels(selectedMade);

    // Reset year selection
    this.yearSelect.value = "";
    this.yearSelect.disabled = true;
    this.yearSelect.parentElement.classList.add("disabled");
    this.submitButton.disabled = true; // Disable submit button
  }

  async handleModelChange(event) {
    const selectedModel = event.target.value;
    const selectedMade = this.madeSelect.value;

    // Reset and disable year select if no model selected
    if (!selectedModel) {
      this.yearSelect.value = "";
      this.yearSelect.disabled = true;
      this.yearSelect.parentElement.classList.add("disabled");
      this.submitButton.disabled = true; // Disable submit button
      return;
    }

    // Fetch years for the selected make and model
    await this.fetchYears(selectedMade, selectedModel);

    // Reset year selection
    this.yearSelect.value = "";
    this.submitButton.disabled = true; // Disable submit button
  }

  async handleYearChange(event) {
    const selectedModel = this.modelSelect.value;
    const selectedMade = this.madeSelect.value;
    const selectedYear = event.target.value;

    // Disable seat row selector if no year selected
    if (!selectedYear) {
      this.submitButton.disabled = true; // Disable submit button
      return;
    }

    // Fetch seat rows data for the selected make, model, and year
    await this.fetchSeatRows(selectedMade, selectedModel, selectedYear);

    // Enable submit button if all selections are made
    if (selectedMade && selectedModel && selectedYear) {
      this.submitButton.disabled = false; // Enable submit button
    }
  }

  limitOptionsBySeatRow(row_number) {
    const thirdRowOptions = this.parentElement.querySelectorAll(
      `input[value="Full Set with 3rd Row (if applicable)"]`
    );

    console.log(
      "Disable third row options",
      row_number,
      row_number < 3
    );

    if (thirdRowOptions.length > 0 && row_number < 3) {
      thirdRowOptions.forEach((option) => {
        option.disabled = true;
      });
    } else {
      thirdRowOptions.forEach((option) => {
        option.disabled = false;
      });
    }
  }

  // Helper function to get cookie by name
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // Helper function to set cookie with expiration
  setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  // Helper function to update car type cookies
  updateCarTypeCookies(productId, carType, action = 'add', quantity = 1) {
    // Get current cart ID
    const cartId = this.getCookie('cart') || '';
    
    // Get existing car type data
    let carTypeData = {
      cart_id: cartId,
      product_details: []
    };
    const carTypeCookie = this.getCookie('cart_details');
    
    if (carTypeCookie) {
      try {
        carTypeData = JSON.parse(carTypeCookie);
        // Ensure the structure is correct
        if (!carTypeData.cart_id) carTypeData.cart_id = cartId;
        if (!Array.isArray(carTypeData.product_details)) carTypeData.product_details = [];
        
        // Migrate old format if needed (where car_types were strings instead of objects)
        carTypeData.product_details.forEach(product => {
          if (Array.isArray(product.car_types) && product.car_types.length > 0 && typeof product.car_types[0] === 'string') {
            product.car_types = product.car_types.map(type => ({ type, quantity: 1 }));
          }
        });
      } catch (e) {
        console.error('Error parsing car type cookie:', e);
        carTypeData = {
          cart_id: cartId,
          product_details: []
        };
      }
    }
    
    // Get product name
    const productName = this.getProductName(productId);
    
    // Handle different actions
    if (action === 'add' || action === 'increase') {
      // Find product entry if it exists
      const productIndex = carTypeData.product_details.findIndex(
        item => item.product_id == productId
      );
      
      if (productIndex === -1) {
        // Add new product entry
        carTypeData.product_details.push({
          product_id: productId,
          product_name: productName,
          car_types: [{ type: carType, quantity: quantity }]
        });
      } else {
        console.log("Updating existing product in cart details");
        const carTypes = carTypeData.product_details[productIndex].car_types || [];
        
        // Convert any string-based car types to object format
        if (carTypes.length > 0 && typeof carTypes[0] === 'string') {
          carTypeData.product_details[productIndex].car_types = carTypes.map(type => ({ type, quantity: 1 }));
        }
        
        // Find car type by name
        const carTypeIndex = carTypeData.product_details[productIndex].car_types.findIndex(
          item => typeof item === 'string' ? item === carType : item.type === carType
        );
        console.log("Car type index:", carTypeIndex);

        if (carTypeIndex === -1) {
          console.log("Adding new car type to product");
          carTypeData.product_details[productIndex].car_types.push({ type: carType, quantity: quantity });
        } else {
          console.log("Car type already exists, incrementing quantity");
          // Get current car type
          const carTypeItem = carTypeData.product_details[productIndex].car_types[carTypeIndex];
          
          // If it's still a string (should not happen after conversion), replace it
          if (typeof carTypeItem === 'string') {
            carTypeData.product_details[productIndex].car_types[carTypeIndex] = { type: carType, quantity: quantity };
          } else {
            // Otherwise increment the quantity
            const currentQuantity = carTypeItem.quantity || 1;
            carTypeData.product_details[productIndex].car_types[carTypeIndex].quantity = currentQuantity + quantity;
          }
        }
        
        // Ensure product name is updated
        carTypeData.product_details[productIndex].product_name = productName;
      }
    } else if (action === 'remove') {
      // Find product entry
      const productIndex = carTypeData.product_details.findIndex(
        item => item.product_id == productId
      );
      
      if (productIndex !== -1) {
        // Remove car type
        carTypeData.product_details[productIndex].car_types = 
          carTypeData.product_details[productIndex].car_types.filter(item => 
            typeof item === 'string' ? item !== carType : item.type !== carType
          );
        
        // Remove product entry if no car types left
        if (carTypeData.product_details[productIndex].car_types.length === 0) {
          carTypeData.product_details.splice(productIndex, 1);
        }
      }
    } else if (action === 'decrease') {
      // Find product entry
      const productIndex = carTypeData.product_details.findIndex(
        item => item.product_id == productId
      );
      
      if (productIndex !== -1) {
        // Find car type
        const carTypeIndex = carTypeData.product_details[productIndex].car_types.findIndex(
          item => typeof item === 'string' ? item === carType : item.type === carType
        );
        
        if (carTypeIndex !== -1) {
          // Get current car type
          const carTypeItem = carTypeData.product_details[productIndex].car_types[carTypeIndex];
          
          // If it's a string, convert it first
          if (typeof carTypeItem === 'string') {
            carTypeData.product_details[productIndex].car_types[carTypeIndex] = { type: carType, quantity: 1 };
            carTypeItem = carTypeData.product_details[productIndex].car_types[carTypeIndex];
          }
          
          // Decrease quantity
          const currentQuantity = carTypeItem.quantity || 1;
          const newQuantity = Math.max(0, currentQuantity - 1);
          
          if (newQuantity === 0) {
            // Remove car type if quantity is 0
            carTypeData.product_details[productIndex].car_types = 
              carTypeData.product_details[productIndex].car_types.filter(item => 
                typeof item === 'string' ? item !== carType : item.type !== carType
              );
            
            // Remove product entry if no car types left
            if (carTypeData.product_details[productIndex].car_types.length === 0) {
              carTypeData.product_details.splice(productIndex, 1);
            }
          } else {
            // Update quantity
            carTypeData.product_details[productIndex].car_types[carTypeIndex].quantity = newQuantity;
          }
        }
      }
    }
    
    // Save updated data
    this.setCookie('cart_details', JSON.stringify(carTypeData), 31);
    
    // Refresh all car-types-display elements
    document.querySelectorAll('car-types-display').forEach(display => {
      if (typeof display.updateDisplay === 'function') {
        display.updateDisplay();
      }
    });
    
    return carTypeData;
  }
  
  // Helper function to get product name
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

  handleProductAdd() {
    console.log("handleProductAdd called");
    const productId = this.getAttribute("data-product-id");
    console.log("Product ID:", productId);

    const selectedMade = this.madeSelect.value;
    const selectedModel = this.modelSelect.value;
    const selectedYear = this.yearSelect.value;
    console.log("Selected car:", selectedMade, selectedModel, selectedYear);

    const displayName = selectedMade + " " + selectedModel + " " + selectedYear;
    
    // Get quantity if available (default to 1)
    const quantityInput = document.querySelector('input[name="quantity"]');
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;
    console.log("Product quantity:", quantity);
    
    // Update car type cookies using the modern method
    console.log("Updating car type cookies");
    const updatedCookieData = this.updateCarTypeCookies(productId, displayName, 'add', quantity);
    console.log("Updated cookie data:", updatedCookieData);
    
    // Trigger custom event for cart-type-display.js
    document.dispatchEvent(new CustomEvent('carTypeAdded', {
      detail: { productId, carType: displayName, quantity: quantity }
    }));
  }
}

// Define the custom element
if (!customElements.get("car-type-selector")) {
  console.log("Car type selector custom Element");
  customElements.define("car-type-selector", CarTypeSelector);
}

// Add event listener for cart item removal
document.addEventListener('DOMContentLoaded', function() {
  // Listen for clicks on cart item remove buttons
  document.addEventListener('click', function(event) {
    const removeButton = event.target.closest('.cart-item__remove-button');
    if (removeButton) {
      const cartItem = removeButton.closest('.cart-item');
      if (cartItem) {
        const productId = cartItem.dataset.productId;
        const carTypeContainer = cartItem.querySelector('[data-car-type-container]');
        
        if (productId && carTypeContainer) {
          const carTypeElements = carTypeContainer.querySelectorAll('[data-car-type]');
          if (carTypeElements.length > 0) {
            // Get car type selector instance
            const carTypeSelector = document.querySelector('car-type-selector');
            if (carTypeSelector) {
              // Remove each car type from cookies
              carTypeElements.forEach(element => {
                const carType = element.dataset.carType;
                if (carType) {
                  carTypeSelector.updateCarTypeCookies(productId, carType, 'remove');
                }
              });
            }
          }
        }
      }
    }
  });
});
