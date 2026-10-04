// ==========================================
// YOUR RATION — MAIN APP
// ==========================================

let currentCategory = "All";
let currentSearch = "";
let currentSort = "recommended";

// ---------- DOM ----------
const productGrid = document.getElementById("productGrid");
const categoryContainer = document.getElementById("categoryContainer");
const searchInput = document.getElementById("searchInput");
const cartCount = document.getElementById("cartCount");

// ---------- START APP ----------
document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    renderProducts();
    updateCartCount();
    setupSearch();
    setupCartButton();
});

// ---------- CATEGORIES ----------
function renderCategories() {
    if (!categoryContainer) return;

    const categories = [
        "All",
        ...new Set(PRODUCTS.map(product => product.category))
    ];

    categoryContainer.innerHTML = categories.map(category => `
        <button
            class="category-chip ${category === "All" ? "active" : ""}"
            onclick="selectCategory('${escapeHTML(category)}')"
        >
            ${category}
        </button>
    `).join("");
}

function selectCategory(category) {
    currentCategory = category;

    document.querySelectorAll(".category-chip").forEach(button => {
        button.classList.toggle(
            "active",
            button.textContent.trim() === category
        );
    });

    renderProducts();
}

// ---------- SEARCH ----------
function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener("input", event => {
        currentSearch = event.target.value.toLowerCase().trim();
        renderProducts();
    });
}

// ---------- FILTER PRODUCTS ----------
function getFilteredProducts() {
    let products = [...PRODUCTS];

    // Category
    if (currentCategory !== "All") {
        products = products.filter(
            product => product.category === currentCategory
        );
    }

    // Search
    if (currentSearch) {
        products = products.filter(product => {
            const searchableText = `
                ${product.name}
                ${product.brand || ""}
                ${product.category}
                ${product.tags ? product.tags.join(" ") : ""}
                ${product.weight || ""}
            `.toLowerCase();

            return searchableText.includes(currentSearch);
        });
    }

    // Sorting
    switch (currentSort) {
        case "popular":
            products.sort((a, b) => b.sold - a.sold);
            break;

        case "price-low":
            products.sort((a, b) => a.price - b.price);
            break;

        case "price-high":
            products.sort((a, b) => b.price - a.price);
            break;

        case "discount":
            products.sort(
                (a, b) => getDiscount(b) - getDiscount(a)
            );
            break;

        case "rating":
            products.sort((a, b) => b.rating - a.rating);
            break;

        default:
            // Recommended
            products.sort((a, b) => {
                const scoreA =
                    (a.sold * 0.5) +
                    (a.rating * 100) +
                    (getDiscount(a) * 10);

                const scoreB =
                    (b.sold * 0.5) +
                    (b.rating * 100) +
                    (getDiscount(b) * 10);

                return scoreB - scoreA;
            });
    }

    return products;
}

// ---------- DISCOUNT ----------
function getDiscount(product) {
    if (!product.mrp || product.mrp <= product.price) {
        return 0;
    }

    return Math.round(
        ((product.mrp - product.price) / product.mrp) * 100
    );
}

// ---------- RENDER PRODUCTS ----------
function renderProducts() {
    if (!productGrid) return;

    const products = getFilteredProducts();

    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-products">
                <div class="empty-icon">🔎</div>
                <h3>No products found</h3>
                <p>Try another search or category.</p>
                <button onclick="resetFilters()">
                    Show all products
                </button>
            </div>
        `;

        updateProductCount(0);
        return;
    }

    productGrid.innerHTML = products
        .map(product => createProductCard(product))
        .join("");

    updateProductCount(products.length);
}

// ---------- PRODUCT CARD ----------
function createProductCard(product) {
    const discount = getDiscount(product);

    const stockStatus =
        product.stock <= 0
            ? `<span class="stock-out">Out of stock</span>`
            : product.stock <= 5
                ? `<span class="stock-low">Only ${product.stock} left</span>`
                : "";

    return `
        <article class="product-card">

            <div
                class="product-image"
                onclick="openProduct('${product.id}')"
            >
                ${
                    product.image
                        ? `<img src="${product.image}" alt="${escapeHTML(product.name)}">`
                        : `<span class="product-icon">${product.icon || "🛒"}</span>`
                }

                ${
                    discount > 0
                        ? `<span class="discount-badge">${discount}% OFF</span>`
                        : ""
                }
            </div>

            <div class="product-info">

                <div class="product-brand">
                    ${escapeHTML(product.brand || "Your Ration")}
                </div>

                <h3
                    class="product-name"
                    onclick="openProduct('${product.id}')"
                >
                    ${escapeHTML(product.name)}
                </h3>

                <div class="product-weight">
                    ${escapeHTML(product.weight || "")}
                </div>

                <div class="product-rating">
                    ⭐ ${product.rating || "4.5"}
                </div>

                <div class="product-price-row">

                    <div>
                        <span class="product-price">
                            ${formatPrice(product.price)}
                        </span>

                        ${
                            product.mrp > product.price
                                ? `
                                    <span class="product-mrp">
                                        ${formatPrice(product.mrp)}
                                    </span>
                                `
                                : ""
                        }
                    </div>

                    ${
                        product.stock > 0
                            ? `
                                <button
                                    class="add-button"
                                    onclick="addToCart('${product.id}')"
                                >
                                    +
                                </button>
                            `
                            : `
                                <button class="add-button disabled" disabled>
                                    —
                                </button>
                            `
                    }

                </div>

                ${stockStatus}

            </div>

        </article>
    `;
}

// ---------- PRODUCT MODAL ----------
function openProduct(productId) {
    const product = findProduct(productId);

    if (!product) return;

    const discount = getDiscount(product);

    const modal = document.createElement("div");

    modal.className = "product-modal-overlay";

    modal.innerHTML = `
        <div class="product-modal">

            <button
                class="modal-close"
                onclick="this.closest('.product-modal-overlay').remove()"
            >
                ×
            </button>

            <div class="modal-product-image">
                ${
                    product.image
                        ? `<img src="${product.image}" alt="${escapeHTML(product.name)}">`
                        : `<span>${product.icon || "🛒"}</span>`
                }
            </div>

            <div class="modal-product-content">

                <div class="product-brand">
                    ${escapeHTML(product.brand || "Your Ration")}
                </div>

                <h2>${escapeHTML(product.name)}</h2>

                <div class="modal-rating">
                    ⭐ ${product.rating || "4.5"} · Popular choice
                </div>

                <p class="modal-weight">
                    ${escapeHTML(product.weight || "")}
                </p>

                ${
                    discount > 0
                        ? `<span class="modal-discount">${discount}% OFF</span>`
                        : ""
                }

                <div class="modal-price">
                    ${formatPrice(product.price)}

                    ${
                        product.mrp > product.price
                            ? `
                                <del>${formatPrice(product.mrp)}</del>
                            `
                            : ""
                    }
                </div>

                <p class="modal-stock">
                    ${
                        product.stock > 0
                            ? "✓ Available for delivery"
                            : "Currently out of stock"
                    }
                </p>

                <button
                    class="modal-add-button"
                    ${
                        product.stock <= 0
                            ? "disabled"
                            : ""
                    }
                    onclick="
                        addToCart('${product.id}');
                        this.closest('.product-modal-overlay').remove();
                    "
                >
                    ${
                        product.stock > 0
                            ? "Add to Cart"
                            : "Out of Stock"
                    }
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

// ---------- CART COUNT ----------
function updateCartCount() {
    const count = getCartItemCount();

    if (!cartCount) return;

    cartCount.textContent = count;

    cartCount.classList.toggle("has-items", count > 0);
}

// ---------- CART BUTTON ----------
function setupCartButton() {
    const cartButtons = document.querySelectorAll(
        "[data-cart-button], .cart-button, #cartButton"
    );

    cartButtons.forEach(button => {
        button.addEventListener("click", openCart);
    });
}

// ---------- CART UI ----------
function openCart() {
    renderCart();

    const drawer = document.getElementById("cartDrawer");

    if (drawer) {
        drawer.classList.add("open");
    }
}

function closeCart() {
    const drawer = document.getElementById("cartDrawer");

    if (drawer) {
        drawer.classList.remove("open");
    }
}

function renderCart() {
    const cartDrawer = document.getElementById("cartDrawer");

    if (!cartDrawer) return;

    const cart = getCart();

    const itemsHTML = cart.length
        ? cart.map(item => {

            const product = findProduct(item.id);

            if (!product) return "";

            return `
                <div class="cart-item">

                    <div class="cart-item-image">
                        ${
                            product.image
                                ? `<img src="${product.image}" alt="">`
                                : `<span>${product.icon || "🛒"}</span>`
                        }
                    </div>

                    <div class="cart-item-details">

                        <h4>${escapeHTML(product.name)}</h4>

                        <span>${escapeHTML(product.weight || "")}</span>

                        <strong>
                            ${formatPrice(product.price * item.quantity)}
                        </strong>

                        <div class="quantity-control">

                            <button
                                onclick="decreaseCartItem('${product.id}')"
                            >
                                −
                            </button>

                            <span>${item.quantity}</span>

                            <button
                                onclick="increaseCartItem('${product.id}')"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        class="remove-cart-item"
                        onclick="removeFromCart('${product.id}')"
                        aria-label="Remove item"
                    >
                        ×
                    </button>

                </div>
            `;
        }).join("")
        : `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some ration items to get started.</p>
                <button onclick="closeCart()">
                    Start Shopping
                </button>
            </div>
        `;

    const subtotal = getCartSubtotal();
    const savings = getCartSavings();
    const itemCount = getCartItemCount();

    cartDrawer.innerHTML = `
        <div class="cart-header">

            <div>
                <span class="cart-label">YOUR CART</span>
                <h2>${itemCount} ${itemCount === 1 ? "item" : "items"}</h2>
            </div>

            <button
                class="cart-close"
                onclick="closeCart()"
            >
                ×
            </button>

        </div>

        <div class="cart-items">
            ${itemsHTML}
        </div>

        ${
            cart.length
                ? `
                    <div class="cart-summary">

                        <div class="summary-row">
                            <span>Subtotal</span>
                            <strong>${formatPrice(subtotal)}</strong>
                        </div>

                        <div class="summary-row savings">
                            <span>You save</span>
                            <strong>−${formatPrice(savings)}</strong>
                        </div>

                        <div class="summary-row delivery">
                            <span>Delivery</span>
                            <span>Calculated at checkout</span>
                        </div>

                        <div class="summary-total">
                            <span>Total</span>
                            <strong>${formatPrice(subtotal)}</strong>
                        </div>

                        <button
                            class="checkout-button"
                            onclick="startCheckout()"
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            class="continue-shopping"
                            onclick="closeCart()"
                        >
                            Continue Shopping
                        </button>

                    </div>
                `
                : ""
        }
    `;
}

// ---------- CHECKOUT PLACEHOLDER ----------
function startCheckout() {
    showToast("Checkout will be connected in the next phase.");
}

// ---------- PRODUCT COUNT ----------
function updateProductCount(count) {
    const element = document.getElementById("productCount");

    if (element) {
        element.textContent = `${count} products`;
    }
}

// ---------- RESET ----------
function resetFilters() {
    currentCategory = "All";
    currentSearch = "";

    if (searchInput) {
        searchInput.value = "";
    }

    document.querySelectorAll(".category-chip").forEach(button => {
        button.classList.toggle(
            "active",
            button.textContent.trim() === "All"
        );
    });

    renderProducts();
}

// ---------- SORT ----------
function changeSort(value) {
    currentSort = value;
    renderProducts();
}

// ---------- TOAST ----------
function showToast(message) {
    let toast = document.getElementById("rationToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "rationToast";
        toast.className = "ration-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

// ---------- SECURITY / HTML ----------
function escapeHTML(value) {
    if (typeof value !== "string") {
        return value;
    }

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
