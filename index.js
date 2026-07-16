// ── SCROLL ANIMATIONS ──
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fu').forEach(el => obs.observe(el));

// ── NAV ──
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 60);
});

// ── MOBILE MENU ──
function toggleMob() { document.getElementById('mobMenu').classList.toggle('open'); }
function closeMob() { document.getElementById('mobMenu').classList.remove('open'); }
document.addEventListener('click', e => {
  if (!e.target.closest('#mainNav') && !e.target.closest('#mobMenu'))
    document.getElementById('mobMenu').classList.remove('open');
});

// ── PARTICLES ──
(function () {
  const p = document.getElementById('particles');
  if (p) {
    for (let i = 0; i < 18; i++) {
      const d = document.createElement('div');
      d.className = 'particle';
      const s = Math.random() * 4 + 2;
      d.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;bottom:${Math.random() * 30}%;animation-duration:${Math.random() * 8 + 6}s;animation-delay:${Math.random() * 8}s;`;
      p.appendChild(d);
    }
  }
})();

// ── MENU TABS ──
function showTab(id, btn) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

// ── LIGHTBOX & GALLERY ──
const DEFAULT_IMAGES = [
  { src: "./images/html_img_2_2.jpeg", caption: "Pink Butterfly Cake" },
  { src: "./images/html_img_3_3.jpeg", caption: "Maa — With Love" },
  { src: "./images/html_img_4_4.jpeg", caption: "Cute Lamb Cake" },
  { src: "./images/html_img_8_8.jpeg", caption: "Graduation Cake" },
  { src: "./images/html_img_9_9.jpeg", caption: "Custom Story Cake" },
  { src: "./images/html_img_10_10.jpeg", caption: "Abdulwasay Birthday Cake" },
  { src: "./images/html_img_11_11.jpeg", caption: "KitKat Chocolate Drip Cake" },
  { src: "./images/html_img_12_12.jpeg", caption: "2-Tier Floral Cake" },
  { src: "./images/html_img_13_13.jpeg", caption: "Hello Kitty 1st Birthday Cake" },
  { src: "./images/html_img_14_14.jpeg", caption: "Cute Bunny Roses Cake" },
  { src: "./images/html_img_15_15.jpeg", caption: "Chocolate Heart Curls Cake" },
  { src: "./images/html_img_16_16.jpeg", caption: "Happy Anniversary Cupcakes" },
  { src: "./images/html_img_17_17.jpeg", caption: "Lightning McQueen Car Cake" }
];

let lbData = [...DEFAULT_IMAGES];
let lbIdx = 0;

function openLb(i) { 
  lbIdx = i; 
  renderLb(); 
  document.getElementById('lightbox').classList.add('open'); 
  document.body.style.overflow = 'hidden'; 
}
function closeLb() { 
  document.getElementById('lightbox').classList.remove('open'); 
  document.body.style.overflow = ''; 
}
function closeLbOutside(e) { 
  if (e.target === document.getElementById('lightbox')) closeLb(); 
}
function lbNav(dir) { 
  lbIdx = (lbIdx + dir + lbData.length) % lbData.length; 
  renderLb(); 
}
function renderLb() {
  const img = document.getElementById('lbImg');
  img.style.opacity = 0;
  setTimeout(() => { 
    img.src = lbData[lbIdx].src; 
    img.style.opacity = 1; 
  }, 80);
  document.getElementById('lbCaption').textContent = lbData[lbIdx].caption;
  document.getElementById('lbDots').innerHTML = lbData.map((_, i) => `<div class="lb-dot${i === lbIdx ? ' active' : ''}" onclick="openLb(${i})"></div>`).join('');
}
document.getElementById('lbImg').style.transition = 'opacity 0.2s';
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lbNav(-1);
  else if (e.key === 'ArrowRight') lbNav(1);
  else if (e.key === 'Escape') closeLb();
});

// Render the grids dynamically based on lbData
function renderGalleryGrid() {
  const grid = document.querySelector('#gallery .gal-grid');
  const previewGrid = document.querySelector('#gallery-preview .preview-grid');
  
  if (grid) {
    let gridHtml = '';
    lbData.forEach((item, index) => {
      gridHtml += `
        <div class="gi" onclick="openLb(${index})">
          <img src="${item.src}" alt="${item.caption}" loading="lazy" />
          <div class="gi-ov"><span class="gi-tag">${item.caption}</span></div>
        </div>
      `;
    });
    gridHtml += `
      <div class="gi gi-ph" onclick="document.getElementById('contact').scrollIntoView({behavior:'smooth'})">
        <div class="gi-ph-icon">🎂</div>
        <div class="gi-ph-text">Your cake<br>next?</div>
        <div class="gi-ph-sub">DM to Order</div>
      </div>
    `;
    grid.innerHTML = gridHtml;
  }
  
  if (previewGrid) {
    let previewHtml = '';
    const highlights = lbData.slice(0, 3);
    highlights.forEach((item, index) => {
      previewHtml += `
        <div class="gi" onclick="openLb(${index})">
          <img src="${item.src}" alt="${item.caption}" loading="lazy" />
          <div class="gi-ov"><span class="gi-tag">${item.caption}</span></div>
        </div>
      `;
    });
    previewGrid.innerHTML = previewHtml;
  }
}

// Fetch dynamic designs from Supabase Gallery Table
async function loadDynamicGallery() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      const dbImages = data.map(item => ({
        src: item.src,
        caption: item.caption
      }));
      lbData = [...dbImages, ...DEFAULT_IMAGES];
    }
  } catch (err) {
    console.warn("Supabase gallery load failed, using local images:", err.message);
  } finally {
    renderGalleryGrid();
  }
}

// ══════════════════════════════════════
// REVIEWS SYSTEM
// ══════════════════════════════════════
let selectedStars = 5;

const PRELOADED_REVIEWS = [
  { name: "Ayesha Malik", city: "Lahore", date: "May 2025", stars: 5, text: "Ordered a custom birthday cake — it looked exactly like I described. Everyone at the party loved it." },
  { name: "Sana Tariq", city: "Lahore", date: "March 2025", stars: 5, text: "Bohot acha cake tha yaar, red velvet liya tha — taste bilkul fresh tha aur delivery bhi time pe thi. Definitely order karungi dobara." },
  { name: "Usman Ahmed", city: "Lahore", date: "April 2025", stars: 5, text: "Got the chocolate fudge cake for my wife's birthday. She was really happy. Great taste and great design." },
  { name: "Mahnoor Baig", city: "Lahore", date: "January 2025", stars: 5, text: "2-tier cake order ki thi engagement ke liye — wallah itni sundar thi ke sab ne photos li. Taste bhi mast tha." },
  { name: "Zainab Raza", city: "Lahore", date: "February 2025", stars: 4, text: "The butterfly cake was exactly what I wanted for my daughter. Very creative and the cream was light and fresh." },
  { name: "Hamza Qureshi", city: "Lahore", date: "May 2025", stars: 5, text: "Brownie pack mangwaya tha — yaar seriously itna acha tha. Fudgy, rich, not too sweet. Har hafte order karna chahta hun." },
  { name: "Nadia Hussain", city: "Lahore", date: "April 2025", stars: 5, text: "Ordered a custom theme cake for my son's birthday. The fondant figures were so detailed. Loved every bit of it." }
];

function setStars(n) {
  selectedStars = n;
  document.querySelectorAll('.star-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i < n);
  });
}
setStars(5);

function starsToHTML(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function renderDynamicReviews(reviews) {
  const container = document.getElementById('reviewsGrid');
  if (!container) return;
  
  let html = '';
  reviews.forEach((rv, idx) => {
    const initial = rv.name ? rv.name[0].toUpperCase() : '?';
    html += `
      <div class="rv-card">
        <div class="rv-stars">${starsToHTML(rv.stars)}</div>
        <p class="rv-text">"${escapeHtml(rv.text)}"</p>
        <div class="rv-footer">
          <div class="rv-avatar ${idx % 2 === 0 ? 'rv-f' : 'rv-m'}">${initial}</div>
          <div>
            <div class="rv-name">${escapeHtml(rv.name)}</div>
            <div class="rv-date">${escapeHtml(rv.city)} · ${rv.date}</div>
          </div>
          <div class="rv-verified">✦ Verified</div>
        </div>
      </div>
    `;
  });
  
  // Inject into slider container
  container.innerHTML = html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadSupabaseReviews() {
  if (!window.supabaseClient) {
    renderDynamicReviews(PRELOADED_REVIEWS);
    return;
  }
  try {
    const { data, error } = await window.supabaseClient
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      const formatted = data.map(item => ({
        name: item.name,
        city: item.city || 'Pakistan',
        date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        stars: item.stars,
        text: item.text
      }));
      renderDynamicReviews([...formatted, ...PRELOADED_REVIEWS]);
    } else {
      renderDynamicReviews(PRELOADED_REVIEWS);
    }
  } catch (err) {
    console.warn("Reviews load failed, showing offline defaults:", err.message);
    renderDynamicReviews(PRELOADED_REVIEWS);
  }
}

async function submitReview() {
  const name = document.getElementById('rvName').value.trim();
  const city = document.getElementById('rvCity').value.trim();
  const text = document.getElementById('rvText').value.trim();
  const btn = document.getElementById('rvSubmitBtn');

  if (!name) { document.getElementById('rvName').focus(); return; }
  if (!text || text.length < 10) { document.getElementById('rvText').focus(); return; }

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    if (!window.supabaseClient) throw new Error("Supabase client offline");
    const { error } = await window.supabaseClient
      .from('reviews')
      .insert([{
        name: name,
        city: city || 'Pakistan',
        text: text,
        stars: selectedStars,
        approved: false // Moderation by default
      }]);

    if (error) throw error;

    document.getElementById('rvSuccess').classList.add('show');
    document.getElementById('rvName').value = '';
    document.getElementById('rvCity').value = '';
    document.getElementById('rvText').value = '';
    setStars(5);

    setTimeout(() => {
      document.getElementById('rvSuccess').classList.remove('show');
    }, 5000);
  } catch (err) {
    alert("Review submission failed: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Review ♡';
  }
}

// ══════════════════════════════════════
// CAKE CALCULATOR
// ══════════════════════════════════════
const calcPrices = {
  vanilla: { '½ lb': 600, '1 lb': 1000, '2 lb': 1800, '3 lb': 2600 },
  chocolate: { '½ lb': 650, '1 lb': 1100, '2 lb': 2000, '3 lb': 2800 },
  caramel: { '½ lb': 650, '1 lb': 1100, '2 lb': 2000, '3 lb': 2800 },
  pineapple: { '½ lb': 600, '1 lb': 1000, '2 lb': 1800, '3 lb': 2600 },
  redvelvet: { '½ lb': 1000, '1 lb': 2000, '2 lb': 3500, '3 lb': 5000 },
  fudge: { '½ lb': 800, '1 lb': 1500, '2 lb': 2600, '3 lb': 3600 },
  walmond: { '½ lb': 900, '1 lb': 1600, '2 lb': 2800, '3 lb': 3800 },
  oreo: { '½ lb': 750, '1 lb': 1000, '2 lb': 1800, '3 lb': 2600 },
};

const calcNames = {
  vanilla: 'Vanilla Cake', chocolate: 'Chocolate Cream Cake', caramel: 'Caramel Cake',
  pineapple: 'Pineapple Cake', redvelvet: 'Red Velvet Cake',
  fudge: 'Chocolate Fudge Cake', walmond: 'Walmond Fudge Cake', oreo: 'Oreo Drip Cake'
};

let calcState = { size: '½ lb', flavour: 'vanilla' };

function calcSelect(type, btn, val) {
  calcState[type] = val;
  btn.closest('.pill-row').querySelectorAll('.calc-pill').forEach(p => p.classList.remove('selected'));
  btn.classList.add('selected');
  updateCalc();
}

function updateCalc() {
  const { size, flavour } = calcState;
  const price = calcPrices[flavour]?.[size] || 600;
  const name = calcNames[flavour] || 'Cake';

  const priceEl = document.getElementById('calcPrice');
  if (priceEl) {
    priceEl.style.transform = 'scale(0.8)';
    priceEl.style.opacity = '0.4';
    setTimeout(() => {
      priceEl.textContent = price.toLocaleString();
      document.getElementById('calcDesc').textContent = name + ' · ' + size;
      priceEl.style.transform = 'scale(1)';
      priceEl.style.opacity = '1';
      priceEl.style.transition = 'all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)';
    }, 120);
  }
}

// Update the pricing inside the static Menu section
function updateMenuPrices() {
  document.querySelectorAll('.menu-card').forEach(card => {
    const titleEl = card.querySelector('.mc-name');
    if (!titleEl) return;
    const name = titleEl.textContent.trim();
    const rows = card.querySelectorAll('.mc-row');
    
    if (name === 'Vanilla Cake' && calcPrices.vanilla) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.vanilla['1 lb'].toLocaleString();
    } else if (name === 'Chocolate Cream Cake' && calcPrices.chocolate) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.chocolate['1 lb'].toLocaleString();
    } else if (name === 'Caramel Cake' && calcPrices.caramel) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.caramel['1 lb'].toLocaleString();
    } else if (name === 'Pineapple Cake' && calcPrices.pineapple) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.pineapple['1 lb'].toLocaleString();
    } else if (name === 'Red Velvet Cake' && calcPrices.redvelvet) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.redvelvet['½ lb'].toLocaleString();
      rows[1].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.redvelvet['1 lb'].toLocaleString();
    } else if (name === 'Chocolate Fudge' && calcPrices.fudge) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.fudge['½ lb'].toLocaleString();
      rows[1].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.fudge['1 lb'].toLocaleString();
    } else if (name === 'Walmond Fudge Cake' && calcPrices.walmond) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.walmond['½ lb'].toLocaleString();
      rows[1].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.walmond['1 lb'].toLocaleString();
    } else if (name === 'Oreo Choc Drip Cake' && calcPrices.oreo) {
      rows[0].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.oreo['½ lb'].toLocaleString();
      rows[1].querySelector('.mc-price').textContent = 'Rs. ' + calcPrices.oreo['1 lb'].toLocaleString();
    }
  });
}

// Fetch prices dynamically from Supabase
async function loadSupabasePricing() {
  if (!window.supabaseClient) return;
  try {
    const { data, error } = await window.supabaseClient.from('cakes_pricing').select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      data.forEach(item => {
        calcPrices[item.id] = {
          '½ lb': item.price_half_lb,
          '1 lb': item.price_1_lb,
          '2 lb': item.price_2_lb,
          '3 lb': item.price_3_lb,
        };
      });
      updateCalc();
      updateMenuPrices();
    }
  } catch (err) {
    console.warn("Pricing load failed, using local defaults:", err.message);
  }
}

// ══════════════════════════════════════
// FAQ ACCORDION
// ══════════════════════════════════════
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  const allItems = document.querySelectorAll('.faq-item');
  
  allItems.forEach(i => {
    i.classList.remove('open');
    const ans = i.querySelector('.faq-a');
    if (ans) ans.style.maxHeight = '0px';
  });
  
  if (!isOpen) {
    item.classList.add('open');
    const ans = item.querySelector('.faq-a');
    if (ans) {
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  }
}

// Back to Top
const bttBtn = document.getElementById('btt');
window.addEventListener('scroll', () => {
  if (bttBtn) bttBtn.classList.toggle('show', window.scrollY > 500);
});

function showCalculator(event) {
  if (event) event.preventDefault();
  const calc = document.getElementById('calculator');
  calc.classList.add('active');
  setTimeout(() => {
    calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function closeCalculator() {
  const calc = document.getElementById('calculator');
  calc.classList.remove('active');
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

function showReviews(event) {
  if (event) event.preventDefault();
  const reviews = document.getElementById('reviews');
  reviews.classList.add('active');
  setTimeout(() => {
    reviews.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resetSlider();
  }, 50);
}

function closeReviews() {
  const reviews = document.getElementById('reviews');
  reviews.classList.remove('active');
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

function showGallery(event) {
  if (event) event.preventDefault();
  const gallery = document.getElementById('gallery');
  gallery.classList.add('active');
  gallery.querySelectorAll('.fu').forEach(el => el.classList.add('on'));
  setTimeout(() => {
    gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

function closeGallery() {
  const gallery = document.getElementById('gallery');
  gallery.classList.remove('active');
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

// ── THEME SWITCHER ──
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
})();

// ── REVIEWS SLIDER ──
let rvIndex = 0;
function slideReviews(dir) {
  const grid = document.getElementById('reviewsGrid');
  const container = grid.parentElement;
  const cards = grid.querySelectorAll('.rv-card');
  if (cards.length === 0) return;
  
  const cardWidth = cards[0].offsetWidth + 20;
  const visibleWidth = container.offsetWidth;
  const totalWidth = cards.length * cardWidth - 20;
  const maxOffset = totalWidth - visibleWidth;
  
  if (maxOffset <= 0) {
    grid.style.transform = 'translateX(0px)';
    return;
  }
  
  const cardsInView = Math.max(1, Math.floor(visibleWidth / cardWidth));
  rvIndex += dir * cardsInView;
  const maxIndex = cards.length - cardsInView;
  
  if (rvIndex < 0) rvIndex = 0;
  if (rvIndex > maxIndex) rvIndex = maxIndex;
  
  let translateX = rvIndex * cardWidth;
  if (translateX > maxOffset) translateX = maxOffset;
  
  grid.style.transform = `translateX(-${translateX}px)`;
}

function resetSlider() {
  rvIndex = 0;
  const grid = document.getElementById('reviewsGrid');
  if (grid) grid.style.transform = 'translateX(0px)';
}

window.addEventListener('resize', resetSlider);

// INITIALIZATION ON LOAD
window.addEventListener('DOMContentLoaded', () => {
  // Fade out loader
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('fade-out');
  }, 1500);
  
  // Load dynamic Supabase assets
  loadDynamicGallery();
  loadSupabasePricing();
  loadSupabaseReviews();
});
