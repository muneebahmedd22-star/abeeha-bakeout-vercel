// ══════════════════════════════════════
// ADMIN PORTAL OPERATIONS
// ══════════════════════════════════════

let session = false;
let reviews = [];
let pricing = [];
let gallery = [];

// 1. Initial State Check
function initAdmin() {
  // Hide loader
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade-out');
    // Hide display completely after transition
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  }

  const localSession = localStorage.getItem('admin-session');
  if (localSession === 'true') {
    session = true;
    showDashboard();
  } else {
    showLogin();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

function showLogin() {
  document.getElementById('login-wrap').style.display = 'block';
  document.getElementById('admin-wrap').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-wrap').style.display = 'none';
  document.getElementById('admin-wrap').style.display = 'block';
  // Fetch dashboard items
  fetchReviews();
  fetchPricing();
  fetchGallery();
  fetchMenuItems();
  fetchInquiries();
}

// 2. Authentication handlers
function handleLogin(event) {
  event.preventDefault();
  const emailVal = document.getElementById('loginEmail').value.trim().toLowerCase();
  const passVal = document.getElementById('loginPassword').value;

  if ((emailVal === 'admin' || emailVal === 'admin@bakeout.com') && passVal === 'admin123') {
    localStorage.setItem('admin-session', 'true');
    session = true;
    showDashboard();
    alert('Logged in successfully!');
  } else {
    alert('Login failed: Invalid username or password.');
  }
}

function handleLogout() {
  localStorage.removeItem('admin-session');
  session = false;
  location.reload();
}

// 3. Switch Panel Tabs
function switchTab(tabId) {
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(tab => tab.classList.remove('active'));

  document.getElementById(`panel-${tabId}`).classList.add('active');
  document.getElementById(`tabBtn-${tabId}`).classList.add('active');
  
  if (tabId === 'menu') {
    fetchMenuItems();
  } else if (tabId === 'inquiries') {
    fetchInquiries();
  }
}

// ------------------ REVIEWS ACTIONS ------------------
async function fetchReviews() {
  const container = document.getElementById('reviews-list-container');
  if (!window.supabaseClient) {
    container.innerHTML = '<p>Database connection offline.</p>';
    return;
  }
  container.innerHTML = '<p>Loading reviews...</p>';

  try {
    const { data, error } = await window.supabaseClient
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    reviews = data || [];

    if (reviews.length === 0) {
      container.innerHTML = '<p>No reviews found in database.</p>';
      return;
    }

    let html = '';
    reviews.forEach(item => {
      const initial = item.name ? item.name[0].toUpperCase() : '?';
      html += `
        <div class="menu-card" id="rv-card-${item.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
              <span style="color: var(--gold);">${'★'.repeat(item.stars)}</span>
              <span class="${item.approved ? 'badge-approved' : 'badge-pending'}">
                ${item.approved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
            <p style="margin: 8px 0; font-style: italic; font-size: 14px;">"${item.text}"</p>
            <small style="color: var(--muted);">
              Submitted by <strong>${item.name}</strong> from <strong>${item.city || 'Pakistan'}</strong> on ${new Date(item.created_at).toLocaleDateString()}
            </small>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${!item.approved ? `
              <button class="cr-order-btn" onclick="approveReview('${item.id}')" style="padding: 8px 16px; background: linear-gradient(135deg, #4cc982, #2e995a);">
                Approve ✓
              </button>
            ` : ''}
            <button class="cr-order-btn" onclick="startEditReview('${item.id}')" style="padding: 8px 16px; border: 1px solid var(--gold); color: var(--gold); background: transparent;">
              Edit
            </button>
            <button class="close-calc-btn" onclick="deleteReview('${item.id}')" style="padding: 8px 16px; border: 1px solid var(--pink); color: var(--pink);">
              Delete
            </button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color: var(--pink);">Failed to fetch reviews: ${err.message}</p>`;
  }
}

function startEditReview(id) {
  const item = reviews.find(r => r.id === id);
  if (!item) return;

  const card = document.getElementById(`rv-card-${id}`);
  if (!card) return;

  card.innerHTML = `
    <div style="width: 100%;">
      <div style="font-weight: bold; font-size: 14px; color: var(--gold-l); margin-bottom: 12px;">Edit Review Details</div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="rv-field">
            <label style="font-size: 10px;">Name</label>
            <input type="text" id="edit-rv-name-${id}" value="${item.name}" required style="padding: 6px;" />
          </div>
          <div class="rv-field">
            <label style="font-size: 10px;">City</label>
            <input type="text" id="edit-rv-city-${id}" value="${item.city || ''}" style="padding: 6px;" />
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="rv-field">
            <label style="font-size: 10px;">Stars (1-5)</label>
            <input type="number" id="edit-rv-stars-${id}" min="1" max="5" value="${item.stars}" required style="padding: 6px; background: var(--dark2); color: var(--cream); border: 1px solid var(--gold); border-radius: 4px;" />
          </div>
          <div class="rv-field">
            <label style="font-size: 10px;">Status</label>
            <select id="edit-rv-approved-${id}" style="padding: 6px; background: var(--dark2); color: var(--cream); border: 1px solid var(--gold); border-radius: 4px; font-family: 'Montserrat', sans-serif;">
              <option value="true" ${item.approved ? 'selected' : ''}>Approved</option>
              <option value="false" ${!item.approved ? 'selected' : ''}>Pending</option>
            </select>
          </div>
        </div>
        <div class="rv-field" style="margin-top: 5px;">
          <label style="font-size: 10px;">Review Comment</label>
          <textarea id="edit-rv-text-${id}" class="rv-textarea" style="height: 60px; padding: 6px; margin: 0;" required>${item.text}</textarea>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="cr-order-btn" onclick="saveEditReview('${id}')" style="padding: 6px 16px;">Save Changes</button>
          <button class="close-calc-btn" onclick="fetchReviews()" style="padding: 6px 16px; border: 1px solid var(--muted); color: var(--muted);">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

async function saveEditReview(id) {
  const name = document.getElementById(`edit-rv-name-${id}`).value.trim();
  const city = document.getElementById(`edit-rv-city-${id}`).value.trim() || 'Pakistan';
  const stars = parseInt(document.getElementById(`edit-rv-stars-${id}`).value);
  const approved = document.getElementById(`edit-rv-approved-${id}`).value === 'true';
  const text = document.getElementById(`edit-rv-text-${id}`).value.trim();

  if (!name || !text) return;

  try {
    const { error } = await window.supabaseClient
      .from('reviews')
      .update({
        name,
        city,
        stars,
        approved,
        text
      })
      .eq('id', id);

    if (error) throw error;
    alert('Review updated successfully!');
    fetchReviews();
  } catch (err) {
    alert('Failed to update review: ' + err.message);
  }
}

async function approveReview(id) {
  try {
    const { error } = await window.supabaseClient
      .from('reviews')
      .update({ approved: true })
      .eq('id', id);
    if (error) throw error;
    fetchReviews();
  } catch (err) {
    alert('Error approving review: ' + err.message);
  }
}

async function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  try {
    const { error } = await window.supabaseClient
      .from('reviews')
      .delete()
      .eq('id', id);
    if (error) throw error;
    fetchReviews();
  } catch (err) {
    alert('Error deleting review: ' + err.message);
  }
}

async function adminAddReview(event) {
  event.preventDefault();
  const nameInput = document.getElementById('adRvName');
  const cityInput = document.getElementById('adRvCity');
  const starsInput = document.getElementById('adRvStars');
  const approvedInput = document.getElementById('adRvApproved');
  const textInput = document.getElementById('adRvText');
  const btn = document.getElementById('adRvBtn');

  const name = nameInput.value.trim();
  const city = cityInput.value.trim() || 'Pakistan';
  const stars = parseInt(starsInput.value);
  const approved = approvedInput.value === 'true';
  const text = textInput.value.trim();

  if (!name || !text) return;

  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const { error } = await window.supabaseClient
      .from('reviews')
      .insert([{
        name,
        city,
        stars,
        approved,
        text
      }]);

    if (error) throw error;
    alert('Review saved successfully!');
    
    // Clear inputs
    nameInput.value = '';
    cityInput.value = '';
    starsInput.value = '5';
    approvedInput.value = 'true';
    textInput.value = '';

    fetchReviews();
  } catch (err) {
    alert('Failed to save review: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Review ↗';
  }
}

// ------------------ PRICING ACTIONS ------------------
async function fetchPricing() {
  const container = document.getElementById('pricing-list-container');
  if (!window.supabaseClient) {
    container.innerHTML = '<p>Database connection offline.</p>';
    return;
  }
  container.innerHTML = '<p>Loading pricing list...</p>';

  try {
    const { data, error } = await window.supabaseClient
      .from('cakes_pricing')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    pricing = data || [];

    if (pricing.length === 0) {
      container.innerHTML = '<p>No pricing list records found. Run the schema.sql in Supabase SQL editor first.</p>';
      return;
    }

    let html = '';
    pricing.forEach(item => {
      html += `
        <div class="menu-card" style="display: flex; flexDirection: column; gap: 16px;">
          <div style="font-weight: bold; font-size: 18px; color: var(--gold-l); margin-bottom: 8px;">${item.name}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div class="rv-field">
              <label>½ Lb Price (Rs.)</label>
              <input type="number" id="p-half-${item.id}" value="${item.price_half_lb}" />
            </div>
            <div class="rv-field">
              <label>1 Lb Price (Rs.)</label>
              <input type="number" id="p-one-${item.id}" value="${item.price_1_lb}" />
            </div>
            <div class="rv-field">
              <label>2 Lb Price (Rs.)</label>
              <input type="number" id="p-two-${item.id}" value="${item.price_2_lb}" />
            </div>
            <div class="rv-field">
              <label>3 Lb Price (Rs.)</label>
              <input type="number" id="p-three-${item.id}" value="${item.price_3_lb}" />
            </div>
          </div>
          <button class="cr-order-btn" onclick="updatePriceRow('${item.id}')" style="align-self: flex-start; padding: 8px 24px;">
            Save Pricing
          </button>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color: var(--pink);">Failed to fetch prices: ${err.message}</p>`;
  }
}

async function updatePriceRow(id) {
  const half = document.getElementById(`p-half-${id}`).value;
  const one = document.getElementById(`p-one-${id}`).value;
  const two = document.getElementById(`p-two-${id}`).value;
  const three = document.getElementById(`p-three-${id}`).value;

  try {
    const { error } = await window.supabaseClient
      .from('cakes_pricing')
      .update({
        price_half_lb: parseInt(half),
        price_1_lb: parseInt(one),
        price_2_lb: parseInt(two),
        price_3_lb: parseInt(three)
      })
      .eq('id', id);

    if (error) throw error;
    alert('Prices updated successfully!');
    fetchPricing();
  } catch (err) {
    alert('Update failed: ' + err.message);
  }
}

// ------------------ GALLERY ACTIONS ------------------
async function fetchGallery() {
  const container = document.getElementById('gallery-list-container');
  if (!window.supabaseClient) {
    container.innerHTML = '<p>Database connection offline.</p>';
    return;
  }
  container.innerHTML = '<p>Loading gallery...</p>';

  try {
    const { data, error } = await window.supabaseClient
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    gallery = data || [];

    if (gallery.length === 0) {
      container.innerHTML = '<p style="grid-column: 1/-1;">No uploaded designs yet. Fallon back images display on landing page.</p>';
      return;
    }

    let html = '';
    gallery.forEach(item => {
      html += `
        <div class="menu-card" id="gal-item-${item.id}" style="padding: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div style="aspect-ratio: 1/1; overflow: hidden; border-radius: 8px; position: relative;">
            <img src="${item.src}" alt="${item.caption}" style="width: 100%; height: 100%; object-fit: cover;" />
            ${item.featured ? `<span style="position: absolute; top: 8px; right: 8px; font-size: 10px; background: rgba(201,168,76,0.9); color: #fff; padding: 2px 8px; border-radius: 12px; font-weight: bold; box-shadow: 0 0 10px rgba(201,168,76,0.5);">🌟 Highlight</span>` : ''}
          </div>
          <div class="gal-caption-text" style="font-size: 12px; font-weight: 500; color: var(--gold-l); word-break: break-word;">${item.caption}</div>
          <div style="display: flex; gap: 6px;">
            <button class="cr-order-btn" onclick="startEditGallery('${item.id}')" style="border: 1px solid var(--gold); color: var(--gold); background: transparent; width: 50%; padding: 6px; font-size: 11px;">
              Edit
            </button>
            <button class="close-calc-btn" onclick="deleteGalleryItem('${item.id}', '${item.src}')" style="border: 1px solid var(--pink); color: var(--pink); width: 50%; padding: 6px; font-size: 11px;">
              Delete
            </button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: var(--pink);">Failed to load gallery: ${err.message}</p>`;
  }
}

function startEditGallery(id) {
  const item = gallery.find(g => g.id === id);
  if (!item) return;

  const card = document.getElementById(`gal-item-${id}`);
  if (!card) return;

  card.innerHTML = `
    <div style="aspect-ratio: 1/1; overflow: hidden; border-radius: 8px; margin-bottom: 6px;">
      <img src="${item.src}" alt="${item.caption}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
    <div class="rv-field" style="margin-bottom: 6px;">
      <label style="font-size: 10px;">Caption</label>
      <input type="text" id="edit-gal-caption-${id}" value="${item.caption}" required style="padding: 6px; font-size: 11px;" />
    </div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; margin-top: 6px;">
      <input type="checkbox" id="edit-gal-featured-${id}" ${item.featured ? 'checked' : ''} style="width: auto; margin: 0; cursor: pointer;" />
      <label for="edit-gal-featured-${id}" style="margin: 0; font-size: 11px; font-weight: normal; cursor: pointer; color: var(--gold-l);">Feature on Landing Page (Highlight) 🌟</label>
    </div>
    <div style="display: flex; gap: 6px;">
      <button class="cr-order-btn" onclick="saveEditGallery('${id}')" style="width: 50%; padding: 6px; font-size: 11px;">
        Save
      </button>
      <button class="close-calc-btn" onclick="fetchGallery()" style="border: 1px solid var(--muted); color: var(--muted); width: 50%; padding: 6px; font-size: 11px;">
        Cancel
      </button>
    </div>
  `;
}

async function saveEditGallery(id) {
  const caption = document.getElementById(`edit-gal-caption-${id}`).value.trim();
  const featured = document.getElementById(`edit-gal-featured-${id}`).checked;
  if (!caption) return;

  try {
    const { error } = await window.supabaseClient
      .from('gallery')
      .update({ caption, featured })
      .eq('id', id);

    if (error) throw error;
    alert('Caption & highlights status updated successfully!');
    fetchGallery();
  } catch (err) {
    alert('Failed to update: ' + err.message);
  }
}

async function handleUploadImage(event) {
  event.preventDefault();
  const fileInput = document.getElementById('galleryFileInput');
  const captionInput = document.getElementById('newCaption');
  const featuredInput = document.getElementById('newFeatured');
  const uploadBtn = document.getElementById('uploadBtn');

  const file = fileInput.files[0];
  const caption = captionInput.value.trim();
  const featured = featuredInput.checked;

  if (!file) { alert('Please select a file.'); return; }
  if (!caption) { alert('Please enter a caption.'); return; }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Storage
    const { error: uploadError } = await window.supabaseClient.storage
      .from('gallery_images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('gallery_images')
      .getPublicUrl(filePath);

    // Insert row to DB
    const { error: dbError } = await window.supabaseClient
      .from('gallery')
      .insert([{ src: publicUrl, caption: caption, featured: featured }]);

    if (dbError) throw dbError;

    fileInput.value = '';
    captionInput.value = '';
    featuredInput.checked = false;
    alert('Design uploaded successfully!');
    fetchGallery();
  } catch (err) {
    alert('Upload failed: ' + err.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload Design ↗';
  }
}

async function deleteGalleryItem(id, src) {
  if (!confirm('Delete this design from gallery?')) return;
  try {
    const { error: dbError } = await window.supabaseClient
      .from('gallery')
      .delete()
      .eq('id', id);
    if (dbError) throw dbError;

    // Remove from bucket
    try {
      const filename = src.split('/').pop();
      await window.supabaseClient.storage
        .from('gallery_images')
        .remove([filename]);
    } catch (err) {
      console.warn("Could not delete from storage bucket:", err.message);
    }

    fetchGallery();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ------------------ MENU MANAGER ACTIONS ------------------
let menuItems = [];

async function fetchMenuItems() {
  const container = document.getElementById('menu-list-container');
  if (!window.supabaseClient) {
    container.innerHTML = '<p>Database connection offline.</p>';
    return;
  }
  container.innerHTML = '<p>Loading menu items...</p>';

  try {
    const { data, error } = await window.supabaseClient
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    menuItems = data || [];

    if (menuItems.length === 0) {
      container.innerHTML = '<p>No menu items found in database.</p>';
      return;
    }

    let html = '';
    menuItems.forEach(item => {
      html += `
        <div class="menu-card" id="menu-item-${item.id}" style="display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: bold; color: var(--gold-l); font-size: 16px;">${item.name}</span>
              <span class="badge-approved" style="background: rgba(201,168,76,0.15); border: 1px solid var(--gold); color: var(--gold-l); font-size: 10px; text-transform: uppercase;">
                ${item.category}
              </span>
            </div>
            <p style="margin: 4px 0; font-size: 13px; color: var(--cream);">${item.pricing}</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="cr-order-btn" onclick="startEditMenuItem('${item.id}')" style="padding: 8px 16px; border: 1px solid var(--gold); color: var(--gold); background: transparent;">
              Edit
            </button>
            <button class="close-calc-btn" onclick="deleteMenuItem('${item.id}')" style="padding: 8px 16px; border: 1px solid var(--pink); color: var(--pink);">
              Delete
            </button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color: var(--pink);">Failed to fetch menu items: ${err.message}</p>`;
  }
}

async function adminAddMenuItem(event) {
  event.preventDefault();
  const nameInput = document.getElementById('adMenuName');
  const catInput = document.getElementById('adMenuCategory');
  const priceInput = document.getElementById('adMenuPricing');
  const btn = document.getElementById('adMenuBtn');

  const name = nameInput.value.trim();
  const category = catInput.value;
  const pricing = priceInput.value.trim();

  if (!name || !pricing) return;

  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const { error } = await window.supabaseClient
      .from('menu_items')
      .insert([{ name, category, pricing }]);

    if (error) throw error;
    alert('Menu item saved successfully!');
    nameInput.value = '';
    priceInput.value = '';
    fetchMenuItems();
  } catch (err) {
    alert('Failed to save menu item: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Menu Item ↗';
  }
}

function startEditMenuItem(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;

  const card = document.getElementById(`menu-item-${id}`);
  if (!card) return;

  card.innerHTML = `
    <div style="width: 100%;">
      <div style="font-weight: bold; font-size: 14px; color: var(--gold-l); margin-bottom: 12px;">Edit Menu Item</div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="rv-field">
            <label style="font-size: 10px;">Item Name</label>
            <input type="text" id="edit-menu-name-${id}" value="${item.name}" required style="padding: 6px;" />
          </div>
          <div class="rv-field">
            <label style="font-size: 10px;">Category</label>
            <select id="edit-menu-cat-${id}" style="padding: 6px; background: var(--dark2); color: var(--cream); border: 1px solid var(--gold); border-radius: 4px; font-family: 'Montserrat', sans-serif;">
              <option value="cakes" ${item.category === 'cakes' ? 'selected' : ''}>Cakes 🎂</option>
              <option value="fudge" ${item.category === 'fudge' ? 'selected' : ''}>Fudge Cakes 🍫</option>
              <option value="brownies" ${item.category === 'brownies' ? 'selected' : ''}>Brownies 🟫</option>
              <option value="cupcakes" ${item.category === 'cupcakes' ? 'selected' : ''}>Cupcakes 🧁</option>
            </select>
          </div>
        </div>
        <div class="rv-field">
          <label style="font-size: 10px;">Pricing Rows (Format: Label: Rs. Price | Label: Rs. Price)</label>
          <input type="text" id="edit-menu-pricing-${id}" value="${item.pricing}" required style="padding: 6px;" />
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="cr-order-btn" onclick="saveEditMenuItem('${id}')" style="padding: 6px 16px;">Save Changes</button>
          <button class="close-calc-btn" onclick="fetchMenuItems()" style="padding: 6px 16px; border: 1px solid var(--muted); color: var(--muted);">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

async function saveEditMenuItem(id) {
  const name = document.getElementById(`edit-menu-name-${id}`).value.trim();
  const category = document.getElementById(`edit-menu-cat-${id}`).value;
  const pricing = document.getElementById(`edit-menu-pricing-${id}`).value.trim();

  if (!name || !pricing) return;

  try {
    const { error } = await window.supabaseClient
      .from('menu_items')
      .update({ name, category, pricing })
      .eq('id', id);

    if (error) throw error;
    alert('Menu item updated successfully!');
    fetchMenuItems();
  } catch (err) {
    alert('Failed to update menu item: ' + err.message);
  }
}

async function deleteMenuItem(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;
  try {
    const { error } = await window.supabaseClient
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    fetchMenuItems();
  } catch (err) {
    alert('Failed to delete menu item: ' + err.message);
  }
}

// ------------------ INQUIRIES ACTIONS ------------------
let customInquiries = [];

async function fetchInquiries() {
  const container = document.getElementById('inquiries-list-container');
  if (!window.supabaseClient) {
    container.innerHTML = '<p>Database connection offline.</p>';
    return;
  }
  container.innerHTML = '<p>Loading inquiries...</p>';

  try {
    const { data, error } = await window.supabaseClient
      .from('custom_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    customInquiries = data || [];

    if (customInquiries.length === 0) {
      container.innerHTML = '<p>No customer inquiries found.</p>';
      return;
    }

    let html = '';
    customInquiries.forEach(item => {
      html += `
        <div class="menu-card" style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">
          <!-- Reference Image -->
          <div style="width: 120px; aspect-ratio: 1/1; overflow: hidden; border-radius: 8px; border: 1px solid var(--gold); background: #0c0c0e;">
            <img src="${item.image_url}" alt="Design Preview" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <!-- Inquiry Details -->
          <div style="flex: 1; min-width: 250px;">
            <h4 style="color: var(--gold-l); font-size: 16px; margin: 0 0 6px;">${item.name}</h4>
            <p style="font-size: 13px; color: var(--cream); margin: 4px 0;">
              <strong>WhatsApp:</strong> <a href="https://wa.me/${item.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #4cc982; text-decoration: underline;">${item.phone} ↗</a>
            </p>
            <p style="font-size: 13px; color: var(--cream); margin: 4px 0;">
              <strong>Required Date:</strong> ${new Date(item.delivery_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; border-left: 2px solid var(--gold); margin-top: 8px; font-size: 12px; font-style: italic;">
              "${item.requirements}"
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <button class="cr-order-btn" onclick="downloadInquiryImage('${item.image_url}', 'design-${item.name.toLowerCase().replace(/\s+/g, '-')}.png')" style="padding: 6px 14px; font-size: 11px;">
                Download Design 📥
              </button>
              <button class="close-calc-btn" onclick="deleteInquiry('${item.id}', '${item.image_url}')" style="padding: 6px 14px; font-size: 11px; border: 1px solid var(--pink); color: var(--pink);">
                Delete Inquiry
              </button>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color: var(--pink);">Failed to fetch inquiries: ${err.message}</p>`;
  }
}

async function downloadInquiryImage(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'custom-design.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    window.open(url, '_blank');
  }
}

async function deleteInquiry(id, imageUrl) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  try {
    // Delete database record
    const { error: dbError } = await window.supabaseClient
      .from('custom_inquiries')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    // Delete image from storage
    try {
      const filename = imageUrl.split('/').pop();
      await window.supabaseClient.storage
        .from('gallery_images')
        .remove([`inquiries/${filename}`]);
    } catch (storageErr) {
      console.warn("Storage deletion warning:", storageErr.message);
    }

    fetchInquiries();
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ------------------ ADMIN RECEIPT GENERATOR ------------------
function generateInvoiceReceipt(event) {
  event.preventDefault();

  const clientName = document.getElementById('invClientName').value.trim();
  const clientPhone = document.getElementById('invClientPhone').value.trim();
  const itemName = document.getElementById('invItemName').value.trim();
  const itemSize = document.getElementById('invItemSize').value.trim();
  const deliveryTime = document.getElementById('invDeliveryTime').value.trim();
  const paymentStatus = document.getElementById('invPaymentStatus').value;
  const orderPrice = parseFloat(document.getElementById('invOrderPrice').value) || 0;
  const deliveryFee = parseFloat(document.getElementById('invDeliveryFee').value) || 0;
  const advancePaid = parseFloat(document.getElementById('invAdvancePaid').value) || 0;
  const notes = document.getElementById('invNotes').value.trim();

  const total = orderPrice + deliveryFee;
  const balance = total - advancePaid;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0c0c0e';
  ctx.fillRect(0, 0, 500, 700);

  // Borders Gold Accent
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 464, 664);
  
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, 452, 652);

  // Logo / Title
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold 26px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText("Abeeha's Bakeout", 250, 75);

  ctx.fillStyle = '#e8a0b4';
  ctx.font = 'italic 14px Georgia';
  ctx.fillText("delight in every bite · Lahore", 250, 100);

  // Divider
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 120);
  ctx.lineTo(460, 120);
  ctx.stroke();

  // Receipt Label
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold 15px Montserrat, sans-serif';
  ctx.fillText("OFFICIAL ORDER RECEIPT", 250, 145);

  // Client Details Panel (Left-aligned)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fdfbf7';
  ctx.font = '13px Montserrat, sans-serif';
  ctx.fillText(`Customer: ${clientName}`, 45, 185);
  ctx.fillText(`Phone/WhatsApp: ${clientPhone}`, 45, 210);
  ctx.fillText(`Date & Time: ${deliveryTime}`, 45, 235);

  // Inner Divider
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.15)';
  ctx.beginPath();
  ctx.moveTo(40, 260);
  ctx.lineTo(460, 260);
  ctx.stroke();

  // Order Details
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold 13px Montserrat, sans-serif';
  ctx.fillText("ORDER DESCRIPTION", 45, 290);

  ctx.fillStyle = '#fdfbf7';
  ctx.font = '13px Montserrat, sans-serif';
  ctx.fillText(`Item: ${itemName}`, 45, 320);
  ctx.fillText(`Size / Weight: ${itemSize}`, 45, 345);
  
  if (notes) {
    ctx.fillStyle = '#e8a0b4';
    ctx.font = 'italic 12px Montserrat, sans-serif';
    // Handle text wrap for notes (max width 400px)
    const words = notes.split(' ');
    let line = 'Note: ';
    let y = 375;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 400 && n > 0) {
        ctx.fillText(line, 45, y);
        line = words[n] + ' ';
        y += 20;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 45, y);
  }

  // Invoice Summary Table
  const tableY = notes ? 440 : 400;
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.15)';
  ctx.strokeRect(40, tableY, 420, 130);

  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold 12px Montserrat, sans-serif';
  ctx.fillText("BILLING SUMMARY", 50, tableY + 25);

  ctx.fillStyle = '#fdfbf7';
  ctx.font = '13px Montserrat, sans-serif';
  ctx.fillText("Order Base Price:", 50, tableY + 55);
  ctx.textAlign = 'right';
  ctx.fillText(`Rs. ${orderPrice.toLocaleString()}`, 450, tableY + 55);

  ctx.textAlign = 'left';
  ctx.fillText("Delivery Charges:", 50, tableY + 80);
  ctx.textAlign = 'right';
  ctx.fillText(`Rs. ${deliveryFee.toLocaleString()}`, 450, tableY + 80);

  ctx.strokeStyle = 'rgba(201, 168, 76, 0.1)';
  ctx.beginPath();
  ctx.moveTo(45, tableY + 95);
  ctx.lineTo(455, tableY + 95);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold 14px Montserrat, sans-serif';
  ctx.fillText("Total Amount:", 50, tableY + 115);
  ctx.textAlign = 'right';
  ctx.fillText(`Rs. ${total.toLocaleString()}`, 450, tableY + 115);

  // Balance & Advances (Below table)
  const footerY = tableY + 160;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fdfbf7';
  ctx.font = '13px Montserrat, sans-serif';
  ctx.fillText(`Advance Paid: Rs. ${advancePaid.toLocaleString()}`, 45, footerY);

  ctx.fillStyle = balance <= 0 ? '#4cc982' : '#e8a0b4';
  ctx.font = 'bold 14px Montserrat, sans-serif';
  ctx.fillText(`Balance Due: Rs. ${balance.toLocaleString()}`, 45, footerY + 25);

  // Payment Status Stamp (Glowing box on the bottom right)
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px Montserrat, sans-serif';
  
  let stampBg = 'rgba(232, 160, 180, 0.15)';
  let stampBorder = '#e8a0b4';
  let stampText = 'PENDING BALANCE';

  if (paymentStatus === 'Paid') {
    stampBg = 'rgba(76, 201, 130, 0.15)';
    stampBorder = '#4cc982';
    stampText = 'FULLY PAID';
  } else if (paymentStatus === 'Advance Paid') {
    stampBg = 'rgba(201, 168, 76, 0.15)';
    stampBorder = '#c9a84c';
    stampText = 'PARTIAL ADVANCE';
  }

  // Draw Stamp Box
  ctx.fillStyle = stampBg;
  ctx.fillRect(290, footerY - 15, 170, 45);
  ctx.strokeStyle = stampBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(290, footerY - 15, 170, 45);

  ctx.fillStyle = stampBorder;
  ctx.fillText(stampText, 375, footerY + 12);

  // Footer message
  ctx.fillStyle = 'rgba(253, 251, 247, 0.4)';
  ctx.font = 'italic 11px Georgia';
  ctx.fillText("Thank you for choosing Abeeha's Bakeout! ♡", 250, 675);

  // Convert to image download
  try {
    const link = document.createElement('a');
    link.download = `slip-${clientName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Could not download receipt image: " + err.message);
  }
}
