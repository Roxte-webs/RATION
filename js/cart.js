// ==========================================
// YOUR RATION — CART SYSTEM
// ==========================================

const CART_STORAGE_KEY = "yourRationCart";

// Get cart from browser storage
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (error) {
        console.error("Could not load cart:", error);
        return [];
    }
}

// Save cart to browser storage
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Find a product by ID
function findProduct(productId) {
    return PRODUCTS.find(product => product.id === productId);
}

// Add product to cart
function addToCart(productId, quantity = 1) {
    const product = findProduct(productId);

    if (!product) {
        showToast("Product not found");
        return;
    }

    if (product.stock <= 0) {
        showToast("This product is currently out of stock");
        return;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            showToast(`Only ${product.stock} available`);
            return;
        }

        existingItem.quantity = newQuantity;
    } else {
        cart.push({
            id: productId,
            quantity: quantity
        });
    }

    saveCart(cart);

    // Refresh cart UI
    if (typeof renderCart === "function") {
        renderCart();
    }

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }

    showToast(`${product.name} added to cart`);
}

// Increase quantity
function increaseCartItem(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    const product = findProduct(productId);

    if (!item || !product) return;

    if (item.quantity >= product.stock) {
        showToast(`Only ${product.stock} available`);
        return;
    }

    item.quantity++;
    saveCart(cart);

    renderCart();
    updateCartCount();
}

// Decrease quantity
function decreaseCartItem(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart(cart);

    renderCart();
    updateCartCount();
}

// Remove item
function removeFromCart(productId) {
    let cart = getCart();

    cart = cart.filter(item => item.id !== productId);

    saveCart(cart);

    renderCart();
    updateCartCount();

    showToast("Item removed from cart");
}

// Empty entire cart
function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);

    renderCart();
    updateCartCount();

    showToast("Cart cleared");
}

// Number of individual items
function getCartItemCount() {
    const cart = getCart();

    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}

// Total product price
function getCartSubtotal() {
    const cart = getCart();

    return cart.reduce((total, item) => {
        const product = findProduct(item.id);

        if (!product) return total;

        return total + (product.price * item.quantity);
    }, 0);
}

// Total MRP
function getCartMRP() {
    const cart = getCart();

    return cart.reduce((total, item) => {
        const product = findProduct(item.id);

        if (!product) return total;

        return total + (product.mrp * item.quantity);
    }, 0);
}

// Total savings
function getCartSavings() {
    return getCartMRP() - getCartSubtotal();
}

// Total weight
function getCartWeight() {
    const cart = getCart();

    return cart.reduce((total, item) => {
        const product = findProduct(item.id);

        if (!product) return total;

        return total + ((product.weightKg || 0) * item.quantity);
    }, 0);
}

// Format Indian Rupee
function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
      }
