// YOUR RATION — MAIN APPLICATION

const state = {
  category: "All",
  search: "",
  sort: "recommended",
  visible: 24,
  price: "all",
  discount: "all",
  location: JSON.parse(localStorage.getItem("yourRationLocation") || "null"),
  orders: JSON.parse(localStorage.getItem("yourRationOrders") || "[]")
};

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", boot);

function boot() {
  renderCategories();
  renderProducts();
  renderCart();
  updateLocationUI();
  bindEvents();
  document.dispatchEvent(new CustomEvent("ration:ready"));
}

function bindEvents() {
  $("#cartButton").onclick = () => openPanel("cartPanel");
  $("#locationButton").onclick = openLocation;
  $("#heroLocationButton").onclick = openLocation;
  $("#heroShopButton").onclick = () => $("#productsSection").scrollIntoView({behavior:"smooth"});
  $("#viewAllButton").onclick = () => selectCategory("All");
  $("#sortSelect").onchange = e => { state.sort=e.target.value; state.visible=24; renderProducts(); };
  $("#filterButton").onclick = () => openPanel("filterPanel");
  $("#applyFilters").onclick = () => { closePanel("filterPanel"); state.visible=24; renderProducts(); };
  $("#clearFilters").onclick = clearFilters;
  $("#resetSearch").onclick = () => { state.search=""; state.category="All"; $("#searchInput").value=""; $("#mobileSearchInput").value=""; renderProducts(); };
  $("#loadMore").onclick = () => { state.visible += 24; renderProducts(); };
  $("#useLocationButton").onclick = useCurrentLocation;
  $("#saveLocationButton").onclick = saveLocation;
  $("#accountButton").onclick = () => openAccount();
  $("#accountAuthButton").onclick = () => { closeModal("accountModal"); if(window.openAuth) window.openAuth(); };
  $("#accountOrdersButton").onclick = () => { closeModal("accountModal"); openOrders(); };
  $("#footerLocation").onclick = openLocation;
  $("#footerOrders").onclick = openOrders;
  $("#footerAccount").onclick = openAccount;

  setupSearch("#searchInput");
  setupSearch("#mobileSearchInput");

  document.addEventListener("cart:changed", renderCart);
  $$(".category-strip").forEach(x => x.addEventListener("click", e => e.stopPropagation()));

  document.addEventListener("click", e => {
    const close = e.target.closest("[data-close-panel]");
    if (close) closePanel(close.dataset.closePanel);
    const closeModalBtn = e.target.closest("[data-close-modal]");
    if (closeModalBtn) closeModal(closeModalBtn.dataset.closeModal);

    const add = e.target.closest("[data-add]");
    if (add) quickAdd(add.dataset.add);

    const view = e.target.closest("[data-product]");
    if (view && !e.target.closest("[data-add]") && !e.target.closest(".qty-control")) openProduct(view.dataset.product);

    const qty = e.target.closest("[data-qty]");
    if (qty) updateCartQty(qty.dataset.id, Number(qty.dataset.qty));

    const remove = e.target.closest("[data-remove]");
    if (remove) removeFromCart(remove.dataset.remove);

    const promo = e.target.closest("[data-promo-category]");
    if (promo) selectCategory(promo.dataset.promoCategory);

    const footer = e.target.closest("[data-footer-category]");
    if (footer) selectCategory(footer.dataset.footerCategory);

    const nav = e.target.closest("[data-nav]");
    if (nav) handleMobileNav(nav.dataset.nav);
  });

  $("#overlay").onclick = closeAllPanels;
  window.addEventListener("scroll", updateProgress, {passive:true});

  $$('input[name="priceFilter"]').forEach(x => x.onchange = e => state.price = e.target.value);
  $$('input[name="discountFilter"]').forEach(x => x.onchange = e => state.discount = e.target.value);
}

function setupSearch(selector) {
  const input = $(selector);
  if (!input) return;
  input.oninput = e => {
    state.search = e.target.value.trim().toLowerCase();
    $("#searchInput").value = e.target.value;
    $("#mobileSearchInput").value = e.target.value;
    state.visible = 24;
    renderProducts();
  };
  input.onkeydown = e => {
    if (e.key === "Escape") {
      input.value="";
      state.search="";
      $("#searchInput").value="";
      $("#mobileSearchInput").value="";
      renderProducts();
    }
  };
}

function renderCategories() {
  const strip = $("#categoryStrip");
  const cards = $("#categoryCards");
  const icons = {"All":"✦","Rice":"🍚","Atta":"🌾","Dal":"🫘","Oil":"🫗","Masala":"🌶️","Sugar & Salt":"🧂","Snacks":"🥨","Biscuits":"🍪","Breakfast":"🥣","Beverages":"🥤","Dairy":"🥛","Personal Care":"🧴","Home Care":"🧹","Kitchen":"🍽️","Baby Care":"👶","Frozen":"❄️","Pooja":"🪔","Stationery":"✏️","Dry Fruits":"🥜","Noodles":"🍜","Sauces":"🥫"};
  strip.innerHTML = CATEGORIES.map(c => `<button class="category-chip ${state.category===c?"active":""}" data-category="${escapeHtml(c)}" type="button"><span>${icons[c]||"•"}</span>${escapeHtml(c)}</button>`).join("");
  cards.innerHTML = CATEGORIES.filter(c=>c!=="All").slice(0,10).map(c => `<button class="category-card" data-category="${escapeHtml(c)}" type="button"><span>${icons[c]||"•"}</span><b>${escapeHtml(c)}</b><small>${PRODUCTS.filter(p=>p.category===c).length} items</small></button>`).join("");
  $$(".category-chip,.category-card").forEach(b => b.onclick = () => selectCategory(b.dataset.category));
}

function selectCategory(category) {
  state.category = category;
  state.search = "";
  state.visible = 24;
  $("#searchInput").value = "";
  $("#mobileSearchInput").value = "";
  renderCategories();
  renderProducts();
  $("#productsSection").scrollIntoView({behavior:"smooth",block:"start"});
}

function getFilteredProducts() {
  let list = PRODUCTS.filter(p => {
    const text = (p.name+" "+p.brand+" "+p.category).toLowerCase();
    const searchOk = !state.search || text.includes(state.search);
    const catOk = state.category==="All" || p.category===state.category;
    const priceOk = state.price==="all" || (state.price==="under100" ? p.price<100 : state.price==="100to300" ? p.price>=100 && p.price<=300 : p.price>300);
    const discountOk = state.discount==="all" || p.discount >= Number(state.discount);
    return searchOk && catOk && priceOk && discountOk;
  });

  if (state.sort==="popular") list.sort((a,b)=>b.popularity-a.popularity);
  else if (state.sort==="discount") list.sort((a,b)=>b.discount-a.discount);
  else if (state.sort==="price-low") list.sort((a,b)=>a.price-b.price);
  else if (state.sort==="price-high") list.sort((a,b)=>b.price-a.price);
  else list.sort((a,b)=>(b.popularity+b.discount*10)-(a.popularity+a.discount*10));

  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  const shown = list.slice(0,state.visible);
  const grid = $("#productGrid");
  $("#productHeading").textContent = state.search ? `Results for “${escapeHtml(state.search)}”` : state.category==="All" ? "Popular near you" : state.category;
  $("#filterCount").textContent = activeFilterCount() ? activeFilterCount() : "";
  $("#activeFilters").innerHTML = renderActiveFilters();

  grid.innerHTML = shown.map(productCard).join("");
  $("#emptyState").classList.toggle("hidden", list.length!==0);
  $("#loadMore").classList.toggle("hidden", list.length<=shown.length);
  renderFilterCategories();
}

function productCard(p) {
  const cartItem = getCart().find(x=>x.id===p.id);
  return `<article class="product-card" data-product="${p.id}">
    <div class="product-visual">
      ${p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>`:""}
      <span class="discount-pill">${p.discount}% OFF</span>
      <span class="product-emoji">${p.emoji}</span>
      <button class="quick-view" type="button" aria-label="View ${escapeHtml(p.name)}">↗</button>
    </div>
    <div class="product-info">
      <small class="product-weight">${escapeHtml(p.weight)}</small>
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.brand)}</p>
      <div class="rating-row"><span>★ ${p.rating}</span><small>• ${p.popularity} bought</small></div>
      <div class="price-row"><div><b>${money(p.price)}</b><del>${money(p.mrp)}</del></div>
      ${cartItem ? `<div class="mini-qty"><button data-qty data-id="${p.id}" data-qty="${cartItem.qty-1}">−</button><b>${cartItem.qty}</b><button data-qty data-id="${p.id}" data-qty="${cartItem.qty+1}">+</button></div>` : `<button class="add-button" data-add="${p.id}" type="button">ADD</button>`}
      </div>
    </div>
  </article>`;
}

function quickAdd(id) {
  if (addToCart(id)) {
    const p=findProduct(id);
    showToast(`${p.name} added to cart`);
  }
}

function renderCart() {
  const items=getCartItems();
  $("#cartCount").textContent=getCartCount();
  if (!items.length) {
    $("#cartBody").innerHTML=`<div class="cart-empty"><div>🛒</div><h3>Your cart is empty</h3><p>Add everyday essentials and they will appear here.</p><button class="primary-button" data-close-panel="cartPanel" type="button">Start shopping</button></div>`;
    $("#cartFooter").innerHTML="";
    return;
  }
  $("#cartBody").innerHTML=items.map(x=>`<div class="cart-item">
    <div class="cart-item-icon">${x.product.emoji}</div>
    <div class="cart-item-copy"><b>${escapeHtml(x.product.name)}</b><small>${escapeHtml(x.product.weight)}</small><strong>${money(x.product.price*x.qty)}</strong></div>
    <div class="cart-item-actions"><button data-qty data-id="${x.id}" data-qty="${x.qty-1}">−</button><b>${x.qty}</b><button data-qty data-id="${x.id}" data-qty="${x.qty+1}">+</button><button class="remove-link" data-remove="${x.id}">Remove</button></div>
  </div>`).join("");
  const subtotal=getCartSubtotal(), savings=getCartMRP()-subtotal, delivery=deliveryCharge();
  $("#cartFooter").innerHTML=`<div class="cart-line"><span>Subtotal</span><b>${money(subtotal)}</b></div><div class="cart-line savings"><span>You save</span><b>−${money(savings)}</b></div><div class="cart-line"><span>Delivery</span><b>${delivery===0?"FREE":money(delivery)}</b></div><div class="cart-total"><span>Total</span><b>${money(subtotal+delivery)}</b></div><button class="primary-button full-button" id="checkoutButton" type="button">Proceed to checkout →</button>`;
  $("#checkoutButton").onclick=checkout;
}

function deliveryCharge() {
  const weight=getCartWeightKg();
  const floor=Number(state.location?.floor||0);
  const weightCharge=Math.max(0,Math.ceil(weight/10))*10;
  const floorCharge=Math.max(0,floor)*10;
  return getCartSubtotal()>=499 ? floorCharge+weightCharge : 20+floorCharge+weightCharge;
}

function checkout() {
  if (!getCartItems().length) return;
  if (!state.location) {
    showToast("Add your delivery location first.");
    closePanel("cartPanel");
    openLocation();
    return;
  }
  closePanel("cartPanel");
  renderCheckout();
  openModal("checkoutModal");
}

function renderCheckout() {
  const items=getCartItems();
  $("#checkoutItems").innerHTML=items.map(x=>`<div class="checkout-item"><span>${x.product.emoji}</span><div><b>${escapeHtml(x.product.name)}</b><small>${x.qty} × ${money(x.product.price)}</small></div><strong>${money(x.product.price*x.qty)}</strong></div>`).join("");
  const subtotal=getCartSubtotal(), delivery=deliveryCharge(), total=subtotal+delivery;
  $("#checkoutSummary").innerHTML=`<div class="summary-location"><small>DELIVER TO</small><b>${escapeHtml(state.location.label||state.location.address)}</b><span>Floor ${state.location.floor||0} · ${escapeHtml(state.location.landmark||"No landmark")}</span></div><div class="checkout-lines"><div><span>Items</span><b>${money(subtotal)}</b></div><div><span>Delivery</span><b>${delivery?money(delivery):"FREE"}</b></div><div class="total-line"><span>Payable</span><b>${money(total)}</b></div></div><div class="payment-box"><b>Payment</b><span>Online payment / UPI</span><small>Payment gateway can be connected when the merchant account is ready.</small></div><button class="primary-button full-button" id="placeOrderButton" type="button">Place order · ${money(total)}</button>`;
  $("#placeOrderButton").onclick=placeOrder;
}

function placeOrder() {
  const items=getCartItems();
  const order={id:"YR"+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),status:"Confirmed",items:items.map(x=>({id:x.id,name:x.product.name,qty:x.qty,price:x.product.price,emoji:x.product.emoji})),subtotal:getCartSubtotal(),delivery:deliveryCharge(),total:getCartSubtotal()+deliveryCharge(),location:state.location};
  state.orders.unshift(order);
  localStorage.setItem("yourRationOrders",JSON.stringify(state.orders));
  clearCart();
  closeModal("checkoutModal");
  openOrders();
  showToast("Order placed successfully.");
}

function openOrders() {
  renderOrders();
  openModal("ordersModal");
}
function renderOrders() {
  if(!state.orders.length){$("#ordersBody").innerHTML=`<div class="orders-empty"><div>📦</div><h3>No orders yet</h3><p>Your placed orders will appear here.</p><button class="primary-button" data-close-modal="ordersModal">Continue shopping</button></div>`;return;}
  $("#ordersBody").innerHTML=state.orders.map(o=>`<article class="order-card"><div class="order-head"><div><b>Order #${o.id}</b><small>${new Date(o.createdAt).toLocaleString("en-IN")}</small></div><span class="status-chip">${escapeHtml(o.status)}</span></div><div class="order-progress"><i class="done"></i><i class="done"></i><i></i><i></i></div><div class="order-stages"><span>Confirmed</span><span>Picking</span><span>On the way</span><span>Delivered</span></div><div class="order-products">${o.items.slice(0,3).map(i=>`<span title="${escapeHtml(i.name)}">${i.emoji}</span>`).join("")}<b>${o.items.reduce((n,i)=>n+i.qty,0)} items</b><strong>${money(o.total)}</strong></div></article>`).join("");
}

function openAccount() {
  const authUser=window.yourRationCurrentUser;
  $("#accountStatus").textContent=authUser ? `Signed in as ${authUser.email||authUser.displayName||"your account"}.` : "You are shopping as a guest.";
  $("#accountAuthButton").textContent=authUser?"Sign out":"Sign in / Create account";
  $("#accountAuthButton").onclick=authUser && window.logoutUser ? () => window.logoutUser() : () => { closeModal("accountModal"); if(window.openAuth) window.openAuth(); };
  openModal("accountModal");
}

function openLocation() {
  openModal("locationModal");
  if (state.location) {
    $("#addressInput").value=state.location.address||"";
    $("#landmarkInput").value=state.location.landmark||"";
    $("#floorInput").value=state.location.floor||0;
    $("#phoneInput").value=state.location.phone||"";
    checkDelivery(state.location.lat,state.location.lng);
  }
}
function useCurrentLocation() {
  if (!navigator.geolocation) { showToast("Location is not supported by this browser."); return; }
  $("#useLocationButton").textContent="Locating…";
  navigator.geolocation.getCurrentPosition(pos=>{
    $("#useLocationButton").textContent="⌖ Location found";
    checkDelivery(pos.coords.latitude,pos.coords.longitude);
    $("#addressInput").value=$("#addressInput").value || "Current location";
  },()=>{ $("#useLocationButton").textContent="⌖ Use my current location"; showToast("Location permission was not available."); },{enableHighAccuracy:true,timeout:10000});
}
function checkDelivery(lat,lng) {
  if(typeof lat!=="number"||typeof lng!=="number") return;
  const hubs=[{name:"Okhla Service Hub",lat:28.5355,lng:77.2730},{name:"South Delhi Service Hub",lat:28.5562,lng:77.2384}];
  const nearest=hubs.map(h=>({...h,distance:haversine(lat,lng,h.lat,h.lng)})).sort((a,b)=>a.distance-b.distance)[0];
  const supported=nearest.distance<=8;
  $("#deliveryCheck").className="delivery-check "+(supported?"available":"unavailable");
  $("#deliveryCheck").innerHTML=supported ? `<b>✓ Delivery available</b><span>Approx. ${Math.max(10,Math.round(nearest.distance*4))}–30 min from ${escapeHtml(nearest.name)}.</span>` : `<b>Outside our current delivery range</b><span>Nearest service hub is about ${nearest.distance.toFixed(1)} km away. You can still save this location and send feedback.</span>`;
  $("#saveLocationButton").disabled=!supported;
  window.__pendingLocation={lat,lng,hub:nearest.name,supported};
}
function saveLocation() {
  const pending=window.__pendingLocation;
  const address=$("#addressInput").value.trim();
  if(!address){showToast("Enter your building or street.");return;}
  if(pending && !pending.supported){showToast("This location is outside the current delivery range.");return;}
  state.location={label:address.split(",")[0],address,landmark:$("#landmarkInput").value.trim(),floor:Number($("#floorInput").value||0),phone:$("#phoneInput").value.trim(),lat:pending?.lat||null,lng:pending?.lng||null,hub:pending?.hub||"Service Hub"};
  localStorage.setItem("yourRationLocation",JSON.stringify(state.location));
  updateLocationUI(); closeModal("locationModal"); renderCart(); showToast("Delivery location saved.");
}
function updateLocationUI(){ $("#locationLabel").textContent=state.location?.label||"Choose location"; }

function renderFilterCategories(){
  $("#filterCategories").innerHTML=CATEGORIES.map(c=>`<label><input type="radio" name="categoryFilter" value="${escapeHtml(c)}" ${state.category===c?"checked":""}> ${escapeHtml(c)}</label>`).join("");
  $$('input[name="categoryFilter"]').forEach(x=>x.onchange=e=>state.category=e.target.value);
}
function activeFilterCount(){return (state.category!=="All"?1:0)+(state.price!=="all"?1:0)+(state.discount!=="all"?1:0);}
function renderActiveFilters(){
  const tags=[];
  if(state.category!=="All") tags.push([state.category,()=>{state.category="All";renderProducts();renderCategories();}]);
  if(state.price!=="all") tags.push([state.price==="under100"?"Under ₹100":state.price==="100to300"?"₹100–₹300":"Above ₹300",()=>{state.price="all";renderProducts();}]);
  if(state.discount!=="all") tags.push([`${state.discount}%+ off`,()=>{state.discount="all";renderProducts();}]);
  return tags.map(([t],i)=>`<span>${escapeHtml(t)} <button type="button" data-filter-index="${i}">×</button></span>`).join("");
}
function clearFilters(){state.category="All";state.price="all";state.discount="all";$$('input[name="priceFilter"]')[0].checked=true;$$('input[name="discountFilter"]')[0].checked=true;renderCategories();renderProducts();}

function openPanel(id){closeAllPanels();$("#"+id).classList.add("open");$("#"+id).setAttribute("aria-hidden","false");$("#overlay").classList.add("show");document.body.classList.add("no-scroll");}
function closePanel(id){$("#"+id)?.classList.remove("open");$("#"+id)?.setAttribute("aria-hidden","true");if(!$(".side-panel.open"))closeAllPanels();}
function closeAllPanels(){$$(".side-panel").forEach(x=>{x.classList.remove("open");x.setAttribute("aria-hidden","true")});$("#overlay").classList.remove("show");document.body.classList.remove("no-scroll");}
function openModal(id){$("#"+id).classList.add("open");$("#"+id).setAttribute("aria-hidden","false");document.body.classList.add("no-scroll");}
function closeModal(id){$("#"+id)?.classList.remove("open");$("#"+id)?.setAttribute("aria-hidden","true");if(!$(".side-panel.open"))document.body.classList.remove("no-scroll");}
function openProduct(id){const p=findProduct(id);if(!p)return;$("#productModalBody").innerHTML=`<div class="product-detail-visual">${p.emoji}<span>${p.discount}% OFF</span></div><div class="product-detail-copy"><small>${escapeHtml(p.category)} · ${escapeHtml(p.weight)}</small><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.brand)}</p><div class="detail-rating">★ ${p.rating} · ${p.popularity} bought</div><div class="detail-price"><b>${money(p.price)}</b><del>${money(p.mrp)}</del></div><p class="detail-note">Quality checked everyday essential. Stock is updated as orders are placed.</p><button class="primary-button full-button" data-add="${p.id}" data-close-modal="productModal">Add to cart</button></div>`;openModal("productModal");}
function handleMobileNav(nav){$$(".mobile-nav button").forEach(x=>x.classList.toggle("active",x.dataset.nav===nav));if(nav==="home")window.scrollTo({top:0,behavior:"smooth"});if(nav==="categories")$("#categoryCards").scrollIntoView({behavior:"smooth"});if(nav==="search"){window.scrollTo({top:0,behavior:"smooth"});$("#mobileSearchInput").focus();}if(nav==="orders")openOrders();if(nav==="account")openAccount();}
function updateProgress(){const h=document.documentElement.scrollHeight-innerHeight;$("#topProgress").style.width=(h>0?(scrollY/h)*100:0)+"%";}
function haversine(a,b,c,d){const R=6371,rad=Math.PI/180;const x=(c-a)*rad,y=(d-b)*rad;const q=Math.sin(x/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(y/2)**2;return R*2*Math.atan2(Math.sqrt(q),Math.sqrt(1-q));}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function showToast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2400);}
window.showToast=showToast;
