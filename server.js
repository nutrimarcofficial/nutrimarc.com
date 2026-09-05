import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Resend } from 'resend';

const app = express();
app.use(express.json({limit:'100kb'}));

const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@nutrimarc.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'NutriMarc Website <no-reply@nutrimarc.com>';
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({key_id:process.env.RAZORPAY_KEY_ID, key_secret:process.env.RAZORPAY_KEY_SECRET}) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Canonical prices are kept on the server so a customer cannot change prices in browser tools.
const CATALOG = {
  'nv-chicken': {'250g':249,'500g':499,'1kg':999},
  'nv-chicken-boneless': {'250g':299,'500g':599,'1kg':1200},
  'nv-chicken-gongura': {'250g':375,'500g':750,'1kg':1500},
  'nv-mutton': {'250g':425,'500g':850,'1kg':1700},
  'nv-prawns': {'250g':500,'500g':950,'1kg':1900},
  'nv-prawns-gongura': {'250g':400,'500g':800,'1kg':1600},
  'v-tomato': {'250g':149,'500g':299,'1kg':550},
  'v-gongura': {'250g':149,'500g':299,'1kg':550},
  's-kaju': {'250g':300,'500g':600,'1kg':1200},
  's-peanuts': {'250g':125,'500g':249,'1kg':499},
  's-makhana': {'250g':249,'500g':499,'1kg':1000},
  'sw-sunundalu': {'500g':449,'1kg':849},
  'sw-ragi-laddu': {'500g':449,'1kg':849},
  'sw-dryfruit-laddu': {'500g':500,'1kg':999},
  'sw-gavvalu': {'500g':225,'1kg':449},
  'p-flaxseed': {'200g':185},
  'p-idli-karam': {'200g':115},
  'p-munagaku-karam': {'200g':185},
  'muffin-chocochip': {'1 piece':30,'4 pieces':99},
  'cookie-chocochip': {'250g':249,'500g':449},
  'cookie-almond': {'250g':259,'500g':499},
  'cookie-double': {'250g':259,'500g':599},
  'cookie-plain': {'250g':169,'500g':349},
  'special-cake': {'1 tin':159}
};
const NAMES = {
  'nv-chicken':'Chicken Pickle','nv-chicken-boneless':'Chicken Boneless Pickle','nv-chicken-gongura':'Chicken Gongura Pickle','nv-mutton':'Mutton Pickle','nv-prawns':'Prawns Pickle','nv-prawns-gongura':'Prawns Gongura Pickle','v-tomato':'Tomato Pickle','v-gongura':'Gongura Pickle','s-kaju':'Kaju Masala','s-peanuts':'Masala Peanuts','s-makhana':'Makhana','sw-sunundalu':'Sunundalu','sw-ragi-laddu':'Ragi Dryfruit Laddu','sw-dryfruit-laddu':'Dryfruit Laddu','sw-gavvalu':'Bellam Gavvalu','p-flaxseed':'Flaxseed Powder','p-idli-karam':'Idli Karam','p-munagaku-karam':'Munagaku Karam','muffin-chocochip':'Chocochip Muffins','cookie-chocochip':'Jowar/Ragi Chocochip Cookies','cookie-almond':'Jowar/Ragi Almond Cookies','cookie-double':'Jowar/Ragi Double Chocochip Cookies','cookie-plain':'Jowar Ragi Plain Cookies','special-cake':'NutriMarc Special Cake Tin (Healthy Chocolate Cake)'
};
const COUPON = {code:'NUTRI10', percent:10, maxDiscount:200, minSubtotal:499};
const pendingOrders = new Map();

function allowOrigin(req,res,next){
  const origin = req.headers.origin;
  if (FRONTEND_ORIGIN === '*' || !origin || origin === FRONTEND_ORIGIN) res.setHeader('Access-Control-Allow-Origin', origin || FRONTEND_ORIGIN);
  else return res.status(403).json({message:'Origin not allowed'});
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}
app.use(allowOrigin);

function buildOrder(items, coupon) {
  if (!Array.isArray(items) || !items.length) throw new Error('Your cart is empty.');
  let subtotal = 0;
  const normalized = [];
  for (const raw of items) {
    const productId = String(raw.productId || '');
    const size = String(raw.size || '');
    const qty = Number(raw.qty);
    if (!CATALOG[productId] || !Object.hasOwn(CATALOG[productId], size) || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error('One or more cart items are invalid.');
    const unitPrice = CATALOG[productId][size];
    subtotal += unitPrice * qty;
    normalized.push({productId,size,qty,unitPrice,name:NAMES[productId]});
  }
  const validCoupon = String(coupon || '').toUpperCase() === COUPON.code && subtotal >= COUPON.minSubtotal;
  const discount = validCoupon ? Math.min(Math.round(subtotal * COUPON.percent / 100), COUPON.maxDiscount) : 0;
  return {items:normalized,subtotal,discount,total:subtotal-discount,coupon:validCoupon ? COUPON.code : ''};
}

function validateCustomer(customer){
  if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address || !/^[0-9]{6}$/.test(String(customer.pincode))) throw new Error('Please provide complete and valid customer/delivery details.');
  return {name:String(customer.name).trim(), phone:String(customer.phone).trim(), email:String(customer.email).trim(), address:String(customer.address).trim(), pincode:String(customer.pincode).trim()};
}

async function sendAdminEmail(subject, html, idempotencyKey, {required = true} = {}) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not configured; email was not sent.');
    if (required) throw new Error('Email service is not configured yet.');
    return {sent:false};
  }
  const result = await resend.emails.send({from:EMAIL_FROM,to:[ADMIN_EMAIL],subject,html},{idempotencyKey});
  if (result.error) {
    if (required) throw new Error(result.error.message || 'Email service error');
    console.error('Admin email failed:', result.error);
    return {sent:false};
  }
  return {sent:true};
}

app.get('/api/health', (_req,res) => res.json({ok:true, razorpayConfigured:Boolean(razorpay), emailConfigured:Boolean(resend)}));

app.post('/api/orders/create', async (req,res) => {
  try {
    if (!razorpay) return res.status(503).json({message:'Online payment is not configured yet. Please contact NutriMarc while the payment gateway is being activated.'});
    const customer = validateCustomer(req.body.customer);
    const order = buildOrder(req.body.items, req.body.coupon);
    const receipt = `NHFS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const razorOrder = await razorpay.orders.create({amount:order.total*100,currency:'INR',receipt,notes:{customer_name:customer.name,customer_phone:customer.phone}});
    pendingOrders.set(razorOrder.id,{receipt,customer,order,createdAt:Date.now()});
    setTimeout(()=>pendingOrders.delete(razorOrder.id), 30*60*1000);
    res.json({keyId:process.env.RAZORPAY_KEY_ID,orderId:razorOrder.id,amount:razorOrder.amount,currency:razorOrder.currency,receipt});
  } catch (e) { console.error(e); res.status(400).json({message:e.message || 'Could not create order.'}); }
});

app.post('/api/orders/verify', async (req,res) => {
  try {
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature,receipt} = req.body || {};
    const pending = pendingOrders.get(razorpay_order_id);
    if (!pending || pending.receipt !== receipt) return res.status(400).json({message:'Order session could not be found or has expired. Please contact NutriMarc before making another payment.'});
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const supplied = String(razorpay_signature || '');
    const validSignature = supplied.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
    if (!validSignature) return res.status(400).json({message:'Payment signature verification failed. The order was not marked as paid.'});
    // Keep the order fulfilled only after signature verification. Production deployments should also reconcile captured status/webhooks.
    await sendAdminEmail(`NEW PAID NHFS ORDER — ${pending.receipt}`, `<h2>NutriMarc Healthy Food Services — Paid Order</h2><p><b>Order:</b> ${pending.receipt}</p><p><b>Razorpay Payment:</b> ${razorpay_payment_id}</p><p><b>Customer:</b> ${escapeHtmlServer(pending.customer.name)}<br><b>Phone:</b> ${escapeHtmlServer(pending.customer.phone)}<br><b>Email:</b> ${escapeHtmlServer(pending.customer.email)}<br><b>Address:</b> ${escapeHtmlServer(pending.customer.address)}, ${escapeHtmlServer(pending.customer.pincode)}</p><p><b>Subtotal:</b> ₹${pending.order.subtotal}<br><b>Discount:</b> ₹${pending.order.discount}<br><b>Paid:</b> ₹${pending.order.total}</p><ul>${pending.order.items.map(i=>`<li>${escapeHtmlServer(i.name)} — ${escapeHtmlServer(i.size)} × ${i.qty} @ ₹${i.unitPrice}</li>`).join('')}</ul>`, `paid-order/${pending.receipt}`, {required:false});
    pendingOrders.delete(razorpay_order_id);
    res.json({verified:true,orderReference:pending.receipt});
  } catch (e) { console.error(e); res.status(500).json({message:e.message || 'Payment verification could not be completed.'}); }
});

app.post('/api/inquiries/nais', async (req,res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const service = String(req.body.service || '').trim();
    const timeline = String(req.body.timeline || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !service || !message) {
      return res.status(400).json({message:'Please provide your name, a valid email address, service area and inquiry details.'});
    }
    const reference = `NAIS-INQ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    await sendAdminEmail(
      `NAIS CORPORATE INQUIRY — ${reference}`,
      `<h2>New NAIS Corporate Inquiry</h2>
       <p><b>Reference:</b> ${escapeHtmlServer(reference)}</p>
       <p><b>Name / Organization:</b> ${escapeHtmlServer(name)}<br>
       <b>Email:</b> ${escapeHtmlServer(email)}<br>
       <b>Service:</b> ${escapeHtmlServer(service)}<br>
       <b>Timeline:</b> ${escapeHtmlServer(timeline)}</p>
       <p><b>Inquiry:</b><br>${escapeHtmlServer(message)}</p>
       <p><b>Advisor:</b> +91-8919394401</p>`,
      `nais-inquiry/${reference}`
    );
    res.json({received:true,reference});
  } catch (e) {
    console.error(e);
    res.status(500).json({message:'Your inquiry could not be submitted right now. Please call or WhatsApp +91-8919394401.'});
  }
});

app.post('/api/inquiries/general', async (req,res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const targetUnit = String(req.body.target_unit || '').trim();
    const preference = String(req.body.contact_preference || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
      return res.status(400).json({message:'Please provide your name, a valid email address and enquiry details.'});
    }
    const reference = `NM-ENQ-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    await sendAdminEmail(
      `NUTRIMARC GENERAL ENQUIRY — ${reference}`,
      `<h2>New NutriMarc General Enquiry</h2>
       <p><b>Reference:</b> ${escapeHtmlServer(reference)}</p>
       <p><b>Name:</b> ${escapeHtmlServer(name)}<br>
       <b>Email:</b> ${escapeHtmlServer(email)}<br>
       <b>Unit:</b> ${escapeHtmlServer(targetUnit)}<br>
       <b>Preferred contact:</b> ${escapeHtmlServer(preference)}</p>
       <p><b>Message:</b><br>${escapeHtmlServer(message)}</p>`,
      `general-enquiry/${reference}`
    );
    res.json({received:true,reference});
  } catch (e) {
    console.error(e);
    res.status(500).json({message:'Your enquiry could not be submitted right now. Please call or WhatsApp +91-8919394401.'});
  }
});

app.post('/api/bootcamps/register', async (req,res) => {
  try {
    const programs = Array.isArray(req.body.programs) ? req.body.programs.map(String).filter(Boolean) : [];
    const name = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim();
    const requestDetails = String(req.body.requestDetails || '').trim();
    if (!programs.length || !name || !phone || !email) return res.status(400).json({message:'Please select at least one program and provide your name, contact number and email address.'});
    const reference = `NAIS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    await sendAdminEmail(`NAIS BOOTCAMP REGISTRATION — ${reference}`, `<h2>New NAIS Bootcamp Registration</h2><p><b>Reference:</b> ${reference}</p><p><b>Name:</b> ${escapeHtmlServer(name)}<br><b>Contact:</b> ${escapeHtmlServer(phone)}<br><b>Email:</b> ${escapeHtmlServer(email)}</p><p><b>Selected program(s):</b></p><ul>${programs.map(p=>`<li>${escapeHtmlServer(p)}</li>`).join('')}</ul><p><b>Request details:</b><br>${escapeHtmlServer(requestDetails || 'Not provided')}</p><p><b>Advisor contact shown to subscriber:</b> +91-8919394401</p>`, `bootcamp/${reference}`);
    res.json({received:true,reference});
  } catch (e) { console.error(e); res.status(500).json({message:'Your request could not be submitted right now. Please call or WhatsApp +91-8919394401.'}); }
});

function escapeHtmlServer(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

app.listen(PORT,()=>console.log(`NutriMarc API listening on port ${PORT}`));
