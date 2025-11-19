// Sample product data
const products = [
    { id: 1, name: "Premium Laptop", price: 1200.00 },
    { id: 2, name: "Wireless Headphones", price: 150.00 },
    { id: 3, name: "Ergonomic Mouse", price: 45.00 },
    { id: 4, name: "4K Monitor", price: 450.00 }
];

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElement = document.getElementById('cart-count');
const cartSubtotalElement = document.getElementById('cart-subtotal');
const cartSection = document.getElementById('cart-section');

let cart = []; // Array to hold cart items

// --- Storage & Calculation ---

const saveCart = () => {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
};

const loadCart = () => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
};

const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// --- UI Rendering ---

const renderProducts = () => {
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        productsContainer.appendChild(productCard);
    });
};

const updateCartUI = () => {
    cartItemsContainer.innerHTML = '';
    let totalItems = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; margin-top: 20px;">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <span>${item.name} ($${item.price.toFixed(2)})</span>
                <div class="item-controls">
                    <input type="number" 
                           value="${item.quantity}" 
                           min="1" 
                           data-id="${item.id}"
                           class="cart-quantity-input">
                    <button data-id="${item.id}" class="remove-item-btn">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
            totalItems += item.quantity;
        });
    }

    cartCountElement.textContent = totalItems;
    cartSubtotalElement.textContent = `$${calculateSubtotal().toFixed(2)}`;
    saveCart();
};

// --- Core Logic & GA4 Events ---

const addToCart = (productId) => {
    const product = products.find(p => p.id == productId);
    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // ⭐ GA4 Event: Add to Cart
    if (typeof gtag === 'function') {
        gtag('event', 'add_to_cart', {
            currency: "USD",
            value: product.price,
            items: [{
                item_id: product.id.toString(),
                item_name: product.name,
                price: product.price,
                quantity: 1
            }]
        });
    }

    updateCartUI();
};

const handleCheckout = () => {
    if (cart.length > 0) {
        const subtotal = calculateSubtotal();
        
        // ⭐ GA4 Event: Purchase (Simulated Conversion)
        if (typeof gtag === 'function') {
            gtag('event', 'purchase', {
                transaction_id: "T-" + Date.now(), // Unique ID for transaction
                value: subtotal,
                currency: "USD",
                tax: 0.00,
                shipping: 0.00,
                items: cart.map(item => ({
                    item_id: item.id.toString(),
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            });
        }
        
        alert(`Checkout initiated! Total amount: $${subtotal.toFixed(2)}. (GA4 Purchase event sent!)`);
        cart = []; // Clear cart after "checkout"
        updateCartUI();
        toggleCartView(); 
    } else {
        alert('Your cart is empty!');
    }
};

// --- Utility Functions ---

const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.id == productId);
    if (item && newQuantity > 0) {
        item.quantity = newQuantity;
        updateCartUI();
    } else if (item && newQuantity <= 0) {
        cart = cart.filter(item => item.id != productId); // Remove if quantity is 0
        updateCartUI();
    }
};

const toggleCartView = () => {
    cartSection.classList.toggle('hidden');
    // Hide/Show product list
    productsContainer.style.display = cartSection.classList.contains('hidden') ? 'flex' : 'none';
};

// --- Event Listeners ---

const setupEventListeners = () => {
    // Add to Cart Buttons
    productsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(e.target.dataset.id);
        }
    });

    // Cart Quantity change
    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-quantity-input')) {
            updateQuantity(e.target.dataset.id, parseInt(e.target.value));
        }
    });

    // Remove Item button
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            updateQuantity(e.target.dataset.id, 0); // Quantity to 0 removes the item
        }
    });

    // Toggle Cart View
    document.getElementById('cart-icon').addEventListener('click', toggleCartView);
    document.getElementById('close-cart-button').addEventListener('click', toggleCartView);

    // Checkout Button
    document.getElementById('checkout-button').addEventListener('click', handleCheckout);
};

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    updateCartUI();
    setupEventListeners();
});
