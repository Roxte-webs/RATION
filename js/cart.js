// YOUR RATION — CART
const CART_KEY = "yourRationCartV2";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent("cart:changed"));
}
function findProduct(id) { return PRODUCTS.find(p => p.id === id); }
function addToCart(id, qty = 1) {
  const product = findProduct(id);
  if (!product || product.stock <= 0) return false;
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) item.qty = Math.min(item.qty + qty, product.stock);
  else cart.push({id, qty: Math.min(qty, product.stock)});
  saveCart(cart); return true;
}
function updateCartQty(id, qty) {
  const product = findProduct(id);
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  if (qty <= 0) saveCart(cart.filter(x => x.id !== id));
  else item.qty = Math.min(qty, product ? product.stock : qty), saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(x => x.id !== id)); }
function clearCart() { saveCart([]); }
function getCartCount() { return getCart().reduce((n,x) => n + x.qty, 0); }
function getCartItems() { return getCart().map(x => ({...x, product: findProduct(x.id)})).filter(x => x.product); }
function getCartSubtotal() { return getCartItems().reduce((n,x) => n + x.product.price * x.qty, 0); }
function getCartMRP() { return getCartItems().reduce((n,x) => n + x.product.mrp * x.qty, 0); }
function getCartWeightKg() { return getCartItems().reduce((n,x) => n + (x.product.unitWeightKg || 0) * x.qty, 0); }
function money(v) { return "₹" + Math.round(v).toLocaleString("en-IN"); }
