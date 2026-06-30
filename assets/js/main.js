// Main JavaScript for the Cafe Order System

// Run when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set up + and - buttons for quantity selectors
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        setupQuantitySelector(selector);
    });
    
    // Add click event to all 'Add to Cart' buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
    
    // If we're on the cart page, update the display
    if (document.querySelector('.cart-items')) {
        updateCartDisplay();
        setupCartEventListeners();
    }
    
    // Set up mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navCenter = document.querySelector('.nav-center');
    
    if (hamburger && navCenter) {
        hamburger.addEventListener('click', function() {
            navCenter.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navCenter.contains(e.target)) {
                navCenter.classList.remove('active');
            }
        });
    }
});

// When someone clicks 'Add to Cart'
function addToCart(event) {
    // Find the button and menu item that was clicked
    const button = event.target.closest('button');
    const itemCard = button.closest('.menu-item');
    
    // Create an item object with the product details
    const item = {
        id: itemCard.dataset.id,  // Get item ID from data attribute
        name: itemCard.querySelector('h3').textContent,  // Get item name
        price: parseFloat(itemCard.querySelector('.price').textContent.replace('₱', '')),  // Get price and remove peso sign
        quantity: parseInt(itemCard.querySelector('.quantity-selector input').value) || 1  // Get quantity, default to 1
    };

    updateCart(item);
}

// Update the cart in local storage
function updateCart(item) {
    // Get current cart or start with empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already in cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
        // If item exists, add to its quantity
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // If new item, add to cart
        cart.push(item);
    }
    
    // Save updated cart to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart icon in the header
    updateCartUI();
}

// Update the cart icon with item count
function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.getElementById('cart-count');
    
    if (cartCount) {
        // Calculate total number of items in cart
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        // Only show count if there are items
        cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Show all items in the cart
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    
    if (!cartItemsContainer) return;
    
    // If cart is empty, show message
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        updateCartSummary(cart);
        return;
    }
    
    // Create HTML for each item in cart
    const cartHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image">` : ''}
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>₱${item.price.toFixed(2)} x ${item.quantity}</p>
                <p class="item-total">₱${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <button class="btn btn-remove" data-id="${item.id}">Remove</button>
        </div>
    `).join('');

    // Update the page with cart items
    cartItemsContainer.innerHTML = cartHTML;
    updateCartSummary(cart);
    updateCartUI();
}

// Update the order summary (subtotal, tax, total)
function updateCartSummary(cart) {
    const cartSummary = document.querySelector('.cart-summary');
    if (!cartSummary) return;
    
    // Calculate prices
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    // Update the HTML with calculated prices
    cartSummary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>₱${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (10%):</span>
            <span>₱${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <strong>Total:</strong>
            <strong>₱${total.toFixed(2)}</strong>
        </div>
        <a href="checkout.html" class="btn btn-accent btn-block">Proceed to Checkout</a>
    `;
}

// Set up event listeners for the cart page
function setupCartEventListeners() {
    // Handle remove item button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove') || e.target.classList.contains('remove-item')) {
            const itemId = e.target.dataset.id;
            removeFromCart(itemId);
        }
    });
    
    // Handle quantity changes in the cart
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-quantity') || e.target.classList.contains('update-quantity')) {
            const itemId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value) || 1;
            
            // If quantity is less than 1, remove the item
            if (newQuantity < 1) {
                removeFromCart(itemId);
                return;
            }
            
            // Otherwise update the quantity
            updateCartItem(itemId, newQuantity);
        }
    });
}

// Set up + and - buttons for quantity selector
function setupQuantitySelector(container) {
    const input = container.querySelector('input');
    const minusBtn = container.querySelector('.quantity-minus') || container.querySelector('.minus');
    const plusBtn = container.querySelector('.quantity-plus') || container.querySelector('.plus');
    
    // Handle minus button click
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const value = parseInt(input.value) || 1;
            if (value > 1) {
                input.value = value - 1;
            }
        });
    }
    
    // Handle plus button click
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const value = parseInt(input.value) || 1;
            input.value = value + 1;
        });
    }
    
    // Make sure quantity is never less than 1
    input.addEventListener('change', () => {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1) {
            input.value = 1;
        }
    });
}

// Remove an item from the cart
function removeFromCart(itemId) {
    // Get cart from local storage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Remove the item with matching ID
    cart = cart.filter(item => item.id !== itemId);
    // Save back to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    // Update the display
    updateCartDisplay();
}

// Update quantity of an item in the cart
function updateCartItem(itemId, newQuantity) {
    // Get cart from local storage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Find the item to update
    const item = cart.find(item => item.id === itemId);
    
    if (item) {
        // Update the quantity
        item.quantity = newQuantity;
        // Save back to local storage
        localStorage.setItem('cart', JSON.stringify(cart));
        // Update the display
        updateCartDisplay();
    }
}