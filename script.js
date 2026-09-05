/* NutriMarc storefront + NAIS registration application */

const API_BASE_URL = window.NUTRIMARC_API_BASE_URL || "/api";

const PRODUCT_CATALOG = [
  {id:"nv-chicken", category:"Non-Veg Pickles", name:"Chicken Pickle", tag:"Non-Veg", sizes:{"250g":249,"500g":499,"1kg":999}},
  {id:"nv-chicken-boneless", category:"Non-Veg Pickles", name:"Chicken Boneless Pickle", tag:"Non-Veg", sizes:{"250g":299,"500g":599,"1kg":1200}},
  {id:"nv-chicken-gongura", category:"Non-Veg Pickles", name:"Chicken Gongura Pickle", tag:"Non-Veg", sizes:{"250g":375,"500g":750,"1kg":1500}},
  {id:"nv-mutton", category:"Non-Veg Pickles", name:"Mutton Pickle", tag:"Non-Veg", sizes:{"250g":425,"500g":850,"1kg":1700}},
  {id:"nv-prawns", category:"Non-Veg Pickles", name:"Prawns Pickle", tag:"Non-Veg", sizes:{"250g":500,"500g":950,"1kg":1900}},
  {id:"nv-prawns-gongura", category:"Non-Veg Pickles", name:"Prawns Gongura Pickle", tag:"Non-Veg", sizes:{"250g":400,"500g":800,"1kg":1600}},
  {id:"v-tomato", category:"Veg Pickles", name:"Tomato Pickle", tag:"Veg", sizes:{"250g":149,"500g":299,"1kg":550}},
  {id:"v-gongura", category:"Veg Pickles", name:"Gongura Pickle", tag:"Veg", sizes:{"250g":149,"500g":299,"1kg":550}},
  {id:"s-kaju", category:"Savoury", name:"Kaju Masala", tag:"Savoury", sizes:{"250g":300,"500g":600,"1kg":1200}},
  {id:"s-peanuts", category:"Savoury", name:"Masala Peanuts", tag:"Savoury", sizes:{"250g":125,"500g":249,"1kg":499}},
  {id:"s-makhana", category:"Savoury", name:"Makhana", tag:"Savoury", sizes:{"250g":249,"500g":499,"1kg":1000}},
  {id:"sw-sunundalu", category:"Sweets", name:"Sunundalu", tag:"Sweet", sizes:{"500g":449,"1kg":849}},
  {id:"sw-ragi-laddu", category:"Sweets", name:"Ragi Dryfruit Laddu", tag:"Sweet", sizes:{"500g":449,"1kg":849}},
  {id:"sw-dryfruit-laddu", category:"Sweets", name:"Dryfruit Laddu", tag:"Sweet", sizes:{"500g":500,"1kg":999}},
  {id:"sw-gavvalu", category:"Sweets", name:"Bellam Gavvalu", tag:"Sweet", sizes:{"500g":225,"1kg":449}},
  {id:"p-flaxseed", category:"Podulu", name:"Flaxseed Powder", tag:"Veg", sizes:{"200g":185}},
  {id:"p-idli-karam", category:"Podulu", name:"Idli Karam", tag:"Veg", sizes:{"200g":115}},
  {id:"p-munagaku-karam", category:"Podulu", name:"Munagaku Karam", tag:"Veg", sizes:{"200g":185}},
  {id:"muffin-chocochip", category:"Chocochip Muffins", name:"Chocochip Muffins", tag:"Baked", sizes:{"1 piece":30,"4 pieces":99}},
  {id:"cookie-chocochip", category:"Cookies", name:"Jowar/Ragi Chocochip Cookies", tag:"Cookie", sizes:{"250g":249,"500g":449}},
  {id:"cookie-almond", category:"Cookies", name:"Jowar/Ragi Almond Cookies", tag:"Cookie", sizes:{"250g":259,"500g":499}},
  {id:"cookie-double", category:"Cookies", name:"Jowar/Ragi Double Chocochip Cookies", tag:"Cookie", sizes:{"250g":259,"500g":599}},
  {id:"cookie-plain", category:"Cookies", name:"Jowar Ragi Plain Cookies", tag:"Cookie", sizes:{"250g":169,"500g":349}},
  {id:"special-cake", category:"NutriMarc Special", name:"NutriMarc Special Cake Tin (Healthy Chocolate Cake)", tag:"Special", sizes:{"1 tin":159}}
];

const OFFER = { code: "NUTRI10", percent: 10, maxDiscount: 200, minSubtotal: 499 };
let cart = [];
let appliedCoupon = "";

function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function initApp() {
  const greeting = document.getElementById("dynamic-greeting");
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = hour < 12 ? "Good Morning — Welcome to NutriMarc" : hour < 18 ? "Good Afternoon — Welcome to NutriMarc" : "Good Evening — Welcome to NutriMarc";
  }
  renderProducts();
  renderCart();
  initCounters();
}

document.addEventListener("DOMContentLoaded", initApp);

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  const groups = [];
  PRODUCT_CATALOG.forEach(product => {
    let group = groups.find(g => g.name === product.category);
    if (!group) { group = {name: product.category, products: []}; groups.push(group); }
    group.products.push(product);
  });
  grid.innerHTML = groups.map(group => `
    <div class="product-category">
      <div class="category-heading"><h4>${escapeHtml(group.name)}</h4><span>${group.products.length} items</span></div>
      <div class="category-products">
        ${group.products.map(renderProductCard).join("")}
      </div>
    </div>`).join("");
}

function renderProductCard(product) {
  const sizeOptions = Object.entries(product.sizes).map(([size, price]) =>
    `<option value="${escapeHtml(size)}">${escapeHtml(size)} — ${money(price)}</option>`).join("");
  return `
    <article class="product-card">
      <div class="product-topline"><span class="menu-tag ${product.tag === "Non-Veg" ? "tag-nonveg" : "tag-veg"}">${escapeHtml(product.tag)}</span></div>
      <h5>${escapeHtml(product.name)}</h5>
      <div class="product-purchase-row">
        <select class="product-size" id="size-${product.id}" aria-label="Pack size for ${escapeHtml(product.name)}">${sizeOptions}</select>
        <div class="product-qty">
          <button type="button" onclick="changeProductQty('${product.id}', -1)">−</button>
          <input id="qty-${product.id}" type="number" min="0" value="0" aria-label="Quantity">
          <button type="button" onclick="changeProductQty('${product.id}', 1)">+</button>
        </div>
      </div>
      <button type="button" class="btn btn-primary add-product-btn" onclick="addProduct('${product.id}')">Add to Cart</button>
    </article>`;
}

function changeProductQty(productId, delta) {
  const input = document.getElementById(`qty-${productId}`);
  if (!input) return;
  input.value = Math.max(0, (parseInt(input.value, 10) || 0) + delta);
}

function addProduct(productId) {
  const product = PRODUCT_CATALOG.find(p => p.id === productId);
  const size = document.getElementById(`size-${productId}`).value;
  const qtyInput = document.getElementById(`qty-${productId}`);
  const qty = Math.max(1, parseInt(qtyInput.value, 10) || 0);
  if (!product || qty <= 0) return;
  const key = `${productId}::${size}`;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty += qty;
  else cart.push({key, productId, name: product.name, size, unitPrice: product.sizes[size], qty});
  qtyInput.value = 0;
  renderCart();
  document.getElementById("cart-rows-container")?.scrollIntoView({behavior:"smooth", block:"center"});
}

function updateCartItem(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  renderCart();
}

function removeCartItem(key) {
  cart = cart.filter(i => i.key !== key);
  renderCart();
}

function cartSubtotal() { return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0); }
function calculateDiscount() {
  const subtotal = cartSubtotal();
  if (appliedCoupon !== OFFER.code || subtotal < OFFER.minSubtotal) return 0;
  return Math.min(Math.round(subtotal * OFFER.percent / 100), OFFER.maxDiscount);
}
function cartTotal() { return Math.max(0, cartSubtotal() - calculateDiscount()); }

function renderCart() {
  const container = document.getElementById("cart-rows-container");
  if (!container) return;
  const subtotal = cartSubtotal(), discount = calculateDiscount(), total = cartTotal();
  const count = cart.reduce((n, i) => n + i.qty, 0);
  document.getElementById("cart-indicator").textContent = `${count} ${count === 1 ? "item" : "items"} • ${money(total)}`;
  document.getElementById("cart-items-count").textContent = `${count} ${count === 1 ? "item" : "items"}`;
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-discount").textContent = `- ${money(discount)}`;
  document.getElementById("cart-grand-total").textContent = money(total);
  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty. Select a product and pack size above to begin.</p>';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.size)} • ${money(item.unitPrice)} each</small></div>
        <div class="cart-row-controls"><button onclick="updateCartItem('${item.key}', -1)">−</button><strong>${item.qty}</strong><button onclick="updateCartItem('${item.key}', 1)">+</button><span>${money(item.unitPrice * item.qty)}</span><button class="remove-cart" onclick="removeCartItem('${item.key}')" aria-label="Remove">×</button></div>
      </div>`).join("");
  }
  const message = document.getElementById("coupon-message");
  if (message && appliedCoupon) message.textContent = calculateDiscount() > 0 ? `Coupon ${appliedCoupon} applied.` : `Coupon ${appliedCoupon} needs a minimum subtotal of ${money(OFFER.minSubtotal)}.`;
}

function copyCouponCode() {
  navigator.clipboard?.writeText(OFFER.code).then(() => {
    const btn = document.querySelector(".copy-coupon-btn");
    if (btn) { const old = btn.textContent; btn.textContent = "✓ Copied"; setTimeout(() => btn.textContent = old, 1400); }
  });
}

function applyCoupon() {
  const input = document.getElementById("coupon-input");
  const code = input.value.trim().toUpperCase();
  const msg = document.getElementById("coupon-message");
  if (!code) { appliedCoupon = ""; msg.textContent = "Enter a coupon code."; renderCart(); return; }
  if (code !== OFFER.code) { appliedCoupon = ""; msg.textContent = "That coupon code is not valid."; renderCart(); return; }
  appliedCoupon = code;
  msg.textContent = cartSubtotal() >= OFFER.minSubtotal ? `✓ ${code} applied.` : `Add ${money(OFFER.minSubtotal - cartSubtotal())} more to unlock this offer.`;
  renderCart();
}

function openCheckoutForm() {
  if (!cart.length) { alert("Please add at least one item to your cart before checkout."); return; }
  if (cartTotal() <= 0) { alert("Please check your cart total before checkout."); return; }
  document.getElementById("checkout-review").innerHTML = `<strong>Order total: ${money(cartTotal())}</strong><br><small>${cart.map(i => `${escapeHtml(i.name)} (${escapeHtml(i.size)}) × ${i.qty}`).join(" • ")}</small>`;
  document.getElementById("checkout-error").textContent = "";
  openModal("checkout-customer-modal");
}

async function startOnlinePayment(event) {
  event.preventDefault();
  const button = document.getElementById("pay-now-btn");
  const error = document.getElementById("checkout-error");
  button.disabled = true; button.textContent = "Creating secure payment…"; error.textContent = "";
  const customer = {
    name: document.getElementById("customer-name").value.trim(),
    phone: document.getElementById("customer-phone").value.trim(),
    email: document.getElementById("customer-email").value.trim(),
    pincode: document.getElementById("customer-pincode").value.trim(),
    address: document.getElementById("customer-address").value.trim()
  };
  try {
    const response = await fetch(`${API_BASE_URL}/orders/create`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({items: cart.map(i => ({productId:i.productId, size:i.size, qty:i.qty})), coupon: appliedCoupon, customer})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to create the payment order.");
    closeModal("checkout-customer-modal");
    if (!window.Razorpay) throw new Error("Secure payment checkout could not be loaded. Please try again.");
    const rzp = new Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "NutriMarc Healthy Food Services",
      description: `NHFS Order ${data.receipt}`,
      order_id: data.orderId,
      image: "logo.jpg",
      prefill: {name:customer.name, email:customer.email, contact:customer.phone},
      notes: {receipt:data.receipt},
      theme: {color:"#059669"},
      handler: async function(payment) { await verifyPayment(payment, data.receipt); },
      modal: { ondismiss: () => showOrderStatus(false, "Payment window closed", "Your order has not been marked as paid. You can return to the cart and try again.") }
    });
    rzp.on("payment.failed", failure => showOrderStatus(false, "Payment not completed", failure?.error?.description || "The payment could not be completed. Please try again."));
    rzp.open();
  } catch (e) {
    error.textContent = e.message || "Something went wrong. Please try again or call/WhatsApp NutriMarc.";
    button.disabled = false; button.textContent = "Proceed to Payment";
    openModal("checkout-customer-modal");
  }
}

async function verifyPayment(payment, receipt) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/verify`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({...payment, receipt})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Payment verification failed.");
    cart = []; appliedCoupon = ""; document.getElementById("coupon-input").value = ""; renderCart();
    showOrderStatus(true, "Payment successful", `Thank you. Your NutriMarc order ${data.orderReference} has been verified successfully. We have received your payment and order details.`);
  } catch (e) {
    showOrderStatus(false, "Payment needs verification", e.message || "We could not verify the payment yet. Please contact NutriMarc with your payment reference before making another payment.");
  }
}

function showOrderStatus(success, title, body) {
  document.getElementById("order-status-icon").textContent = success ? "✓" : "!";
  document.getElementById("order-status-header").textContent = title;
  document.getElementById("order-status-body").textContent = body;
  document.getElementById("order-status-actions").innerHTML = `<a class="btn whatsapp-btn" target="_blank" rel="noopener" href="https://wa.me/918919394401">💬 WhatsApp Advisor</a><a class="btn quick-call-btn" href="tel:+918919394401">📞 +91-8919394401</a>`;
  openModal("order-status-modal");
}

async function submitBootcampRegistration(event) {
  event.preventDefault();
  const selected = [...document.querySelectorAll('input[name="bootcamp"]:checked')].map(i => i.value);
  const msg = document.getElementById("bootcamp-selection-message");
  if (!selected.length) { msg.textContent = "Please select at least one bootcamp program."; msg.className = "inline-form-message error"; return; }
  msg.textContent = "Submitting registration…"; msg.className = "inline-form-message";
  const payload = {
    programs: selected,
    name: document.getElementById("boot-name").value.trim(),
    phone: document.getElementById("boot-phone").value.trim(),
    email: document.getElementById("boot-email").value.trim(),
    requestDetails: document.getElementById("boot-request").value.trim()
  };
  try {
    const response = await fetch(`${API_BASE_URL}/bootcamps/register`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to submit your registration.");
    document.getElementById("bootcamp-status-body").textContent = `Thank you, ${payload.name}. Your registration request has been received. Our advisor will get back to you shortly.`;
    document.getElementById("bootcamp-registration-form").reset();
    msg.textContent = "";
    openModal("bootcamp-status-modal");
  } catch (e) {
    msg.textContent = e.message || "We could not submit your request. Please call or WhatsApp +91-8919394401.";
    msg.className = "inline-form-message error";
  }
}

function openModal(id) { const el = document.getElementById(id); if (el) { el.style.display = "flex"; el.setAttribute("aria-hidden","false"); } }
function closeModal(id) { const el = document.getElementById(id); if (el) { el.style.display = "none"; el.setAttribute("aria-hidden","true"); } }

function handleSubscribe(event) { event.preventDefault(); const msg=document.getElementById("sub-msg"); if(msg) msg.textContent="✓ Success! You're on NutriMarc's update notification list."; event.target.reset(); }
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.getAttribute('data-target')) || 0; let count = 0;
    const update = () => { count += Math.ceil(target / 100); if (count < target) { entry.target.innerText = count; setTimeout(update,20); } else entry.target.innerText = target; };
    update(); observer.unobserve(entry.target);
  }), {threshold:0.5});
  counters.forEach(counter => observer.observe(counter));
}
