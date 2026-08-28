/* NutriMarc Group — editable site data */
const CONFIG = {
  upiId: 'admn.chand@ibl',
  payeeName: 'NutriMarc Group',
  orderEmail: 'contact@nutrimarc.com',
  announcements: [
    'NHFS orders are open — call or WhatsApp +91-8919394401.',
    'Explore NAIS training in Agentic AI, AI Agents, Generative AI, Cloud, Data & more.',
    'NutriMarc Group: better living. smarter future.'
  ]
};

const menu = [
  {cat:'Non-Veg Pickles',name:'Chicken Pickle',prices:{'250gm':249,'500gm':499,'1kg':999}},
  {cat:'Non-Veg Pickles',name:'Chicken Boneless Pickle',prices:{'250gm':299,'500gm':599,'1kg':1200}},
  {cat:'Non-Veg Pickles',name:'Chicken Gongura Pickle',prices:{'250gm':375,'500gm':750,'1kg':1500}},
  {cat:'Non-Veg Pickles',name:'Mutton Pickle',prices:{'250gm':425,'500gm':850,'1kg':1700}},
  {cat:'Non-Veg Pickles',name:'Prawn Pickle',prices:{'250gm':400,'500gm':900,'1kg':1600}},
  {cat:'Non-Veg Pickles',name:'Prawn Gongura Pickle',prices:{'250gm':450,'500gm':900,'1kg':1800}},
  {cat:'Veg Pickles',name:'Tomato Pickle',prices:{'250gm':149,'500gm':299,'1kg':550}},
  {cat:'Veg Pickles',name:'Gongura Pickle',prices:{'250gm':149,'500gm':299,'1kg':550}},
  {cat:'Savoury',name:'Kaju Masala',prices:{'250gm':300,'500gm':600,'1kg':1200}},
  {cat:'Savoury',name:'Masala Peanuts',prices:{'250gm':125,'500gm':249,'1kg':499}},
  {cat:'Savoury',name:'Makhana',prices:{'250gm':249,'500gm':499,'1kg':1000}},
  {cat:'Sweets',name:'Sunundalu',prices:{'500gm':449,'1kg':849}},
  {cat:'Sweets',name:'Ragi Dryfruit Laddu',prices:{'500gm':449,'1kg':849}},
  {cat:'Sweets',name:'Dryfruit Laddu',prices:{'500gm':500,'1kg':999}},
  {cat:'Sweets',name:'Bellam Gavvalu',prices:{'500gm':225,'1kg':449}},
  {cat:'Podulu',name:'Flaxseed Powder',prices:{'200gm':185}},
  {cat:'Podulu',name:'Idli Karam',prices:{'200gm':115}},
  {cat:'Podulu',name:'Munagaku Karam',prices:{'200gm':185}},
  {cat:'Chocochip Muffins',name:'Chocochip Muffin — 1 piece',prices:{'1 piece':30}},
  {cat:'Chocochip Muffins',name:'Chocochip Muffin — 4 pieces',prices:{'4 pieces':99}},
  {cat:'Cookies',name:'Jowar/Ragi Chocochip',prices:{'250gm':249,'500gm':449}},
  {cat:'Cookies',name:'Jowar/Ragi Almond',prices:{'250gm':259,'500gm':499}},
  {cat:'Cookies',name:'Jowar/Ragi Double Chocochip',prices:{'250gm':259,'500gm':599}},
  {cat:'Cookies',name:'Jowar Ragi Plain',prices:{'250gm':169,'500gm':349}},
  {cat:'NutriMarc Special',name:'Special Cake Tin — Healthy Chocolate Cake',prices:{'1 tin':159}}
];

const courses = [
  {id:'agentic-ai',name:'Agentic AI & AI Agents',date:'To be announced',mode:'Industry-ready training',pdf:'course-details/agentic-ai-course-details.pdf',desc:'Build practical understanding of agentic workflows, tool use, orchestration and AI-agent architectures.'},
  {id:'genai',name:'Generative AI for Modern Teams',date:'To be announced',mode:'Industry-ready training',pdf:'course-details/generative-ai-course-details.pdf',desc:'Understand LLM foundations, prompting, RAG, evaluation and practical enterprise GenAI patterns.'},
  {id:'cloud-ai',name:'Cloud & AI/ML Architecture',date:'To be announced',mode:'Advanced systems training',pdf:'course-details/cloud-ai-architecture-course-details.pdf',desc:'Explore modern cloud architectures, AI/ML platforms, data foundations and production patterns.'}
];

let cart = JSON.parse(localStorage.getItem('nutrimarcCart') || '[]');
const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const saveCart = () => localStorage.setItem('nutrimarcCart', JSON.stringify(cart));
const cartTotal = () => cart.reduce((s,i)=>s+i.price*i.qty,0);
const cartCount = () => cart.reduce((s,i)=>s+i.qty,0);
const ref = prefix => `${prefix}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

function renderMenu(){
  const el=document.getElementById('menuGrid');
  el.innerHTML=menu.map((item,idx)=>{
    const variants=Object.entries(item.prices);
    const selected=variants[0];
    return `<article class="menu-card" data-index="${idx}"><span class="menu-cat">${item.cat}</span><h4>${item.name}</h4><div class="price-line"><div><span class="price">${money(selected[1])}</span><span class="unit-price">${selected[0]} · starting</span></div><div class="qty"><button data-action="add" aria-label="Add ${item.name}">+</button></div></div>${variants.length>1?`<select class="variant-select" aria-label="Choose size">${variants.map(([v,p])=>`<option value="${v}" data-price="${p}">${v} — ${money(p)}</option>`).join('')}</select>`:''}</article>`
  }).join('');
  el.querySelectorAll('.variant-select').forEach(s=>s.addEventListener('change',()=>{const card=s.closest('.menu-card'),idx=+card.dataset.index, v=s.value,p=+s.selectedOptions[0].dataset.price;card.querySelector('.price').textContent=money(p);card.querySelector('.unit-price').textContent=`${v}`;}));
  el.querySelectorAll('[data-action="add"]').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.menu-card'),idx=+card.dataset.index,item=menu[idx],sel=card.querySelector('.variant-select'),variant=sel?sel.value:Object.keys(item.prices)[0],price=sel?+sel.selectedOptions[0].dataset.price:item.prices[variant];addToCart({key:`${idx}-${variant}`,name:item.name,cat:item.cat,variant,price,qty:1});}));
}
function addToCart(item){const found=cart.find(x=>x.key===item.key);if(found)found.qty+=1;else cart.push(item);saveCart();renderCart();toast(`${item.name} added to cart`);}
function renderCart(){document.getElementById('cartCount').textContent=cartCount();document.getElementById('cartTotal').textContent=money(cartTotal());document.getElementById('drawerTotal').textContent=money(cartTotal());const el=document.getElementById('cartItems');el.innerHTML=cart.length?cart.map((i,n)=>`<div class="cart-row"><div><h4>${i.name}</h4><small>${i.variant} · ${money(i.price)} each</small></div><div class="qty"><button data-cart="minus" data-n="${n}">−</button><strong>${i.qty}</strong><button data-cart="plus" data-n="${n}">+</button></div></div>`).join(''):`<p class="muted">Your cart is empty. Add something delicious from the menu.</p>`;el.querySelectorAll('[data-cart]').forEach(b=>b.addEventListener('click',()=>{const n=+b.dataset.n;if(b.dataset.cart==='plus')cart[n].qty++;else cart[n].qty--;if(cart[n].qty<=0)cart.splice(n,1);saveCart();renderCart();}));}
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('cartDrawer').setAttribute('aria-hidden','false')}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('cartDrawer').setAttribute('aria-hidden','true')}
function checkout(){if(!cart.length){toast('Please add at least one item first.');return}closeCart();const orderRef=ref('NHFS');document.getElementById('checkoutRef').textContent=orderRef;document.getElementById('orderRefField').value=orderRef;document.getElementById('orderItemsField').value=cart.map(i=>`${i.name} (${i.variant}) x${i.qty} = ${money(i.price*i.qty)}`).join(' | ');document.getElementById('orderTotalField').value=money(cartTotal());document.getElementById('paymentAmount').textContent=money(cartTotal());document.getElementById('upiButton').href=`upi://pay?pa=${encodeURIComponent(CONFIG.upiId)}&pn=${encodeURIComponent(CONFIG.payeeName)}&am=${cartTotal().toFixed(2)}&cu=INR&tn=${encodeURIComponent('NHFS Order '+orderRef)}`;document.getElementById('checkoutModal').showModal()}
function renderCourses(){document.getElementById('courseSchedule').innerHTML=courses.map(c=>`<article class="course-card"><span class="date">START · ${c.date.toUpperCase()}</span><h4>${c.name}</h4><p>${c.desc}</p><small>${c.mode}</small><div class="course-actions"><a class="btn btn-ghost" href="${c.pdf}" download>Download PDF</a><button class="btn btn-primary" data-course="${c.id}">Subscribe</button></div></article>`).join('');document.querySelectorAll('[data-course]').forEach(b=>b.addEventListener('click',()=>openCourse(b.dataset.course)));}
function openCourse(id){const c=courses.find(x=>x.id===id);document.getElementById('courseModalTitle').textContent=c.name;document.getElementById('courseModalMeta').textContent=`Start date: ${c.date} · ${c.mode}`;document.getElementById('courseNameField').value=c.name;document.getElementById('courseRefField').value=ref('NAIS-SUB');document.getElementById('courseModal').showModal();}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)}
function handleFormSubmit(form, message){form.addEventListener('submit',e=>{e.preventDefault();if(form.id==='naisForm')document.getElementById('naisRef').value=ref('NAIS');const data=new FormData(form);fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error('Email service error');toast(message);form.reset();if(form.id==='naisForm')document.getElementById('naisRef').value='';}).catch(()=>{form.submit();});});}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('year').textContent=new Date().getFullYear();
  renderMenu();renderCart();renderCourses();
  let ai=0;setInterval(()=>{ai=(ai+1)%CONFIG.announcements.length;document.getElementById('announcementText').textContent=CONFIG.announcements[ai]},5000);
  document.getElementById('openCart').addEventListener('click',openCart);document.getElementById('closeCart').addEventListener('click',closeCart);document.getElementById('checkoutBtn').addEventListener('click',checkout);document.getElementById('closeCheckout').addEventListener('click',()=>document.getElementById('checkoutModal').close());document.getElementById('closeCourse').addEventListener('click',()=>document.getElementById('courseModal').close());
  document.getElementById('orderForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw 0;toast(`Order ${document.getElementById('checkoutRef').textContent} submitted successfully. Check your email for confirmation.`);cart=[];saveCart();renderCart();f.reset();document.getElementById('checkoutModal').close();}).catch(()=>{f.submit();});});
  handleFormSubmit(document.getElementById('naisForm'),'NAIS enquiry submitted successfully. Your reference has been emailed.');handleFormSubmit(document.getElementById('contactForm'),'Thank you — your enquiry has been submitted.');handleFormSubmit(document.getElementById('courseForm'),'Course subscription submitted successfully.');
  const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  document.getElementById('cartDrawer').addEventListener('click',e=>{if(e.target.id==='cartDrawer')closeCart()});
});
