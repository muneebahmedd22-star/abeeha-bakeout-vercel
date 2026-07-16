// ══════════════════════════════════════
// ADMIN PORTAL OPERATIONS
// ══════════════════════════════════════

let session = false;
let reviews = [];
let pricing = [];
let gallery = [];

// 1. Initial State Check
window.addEventListener('DOMContentLoaded', () => {
  // Hide loader
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('fade-out');

  const localSession = localStorage.getItem('admin-session');
  if (localSession === 'true') {
    session = true;
    showDashboard();
  } else {
    showLogin();
  }
});

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
        <div class="menu-card" style="display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; gap: 10px; align-items: center; marginBottom: 6px;">
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
          <div style="display: flex; gap: 10px;">
            ${!item.approved ? `
              <button class="cr-order-btn" onclick="approveReview('${item.id}')" style="padding: 8px 16px; background: linear-gradient(135deg, #4cc982, #2e995a);">
                Approve ✓
              </button>
            ` : ''}
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
        <div class="menu-card" style="padding: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div style="aspect-ratio: 1/1; overflow: hidden; border-radius: 8px;">
            <img src="${item.src}" alt="${item.caption}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="font-size: 12px; font-weight: 500; color: var(--gold-l); word-break: break-word;">${item.caption}</div>
          <button class="close-calc-btn" onclick="deleteGalleryItem('${item.id}', '${item.src}')" style="border: 1px solid var(--pink); color: var(--pink); width: 100%; padding: 6px;">
            Delete
          </button>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="grid-column: 1/-1; color: var(--pink);">Failed to load gallery: ${err.message}</p>`;
  }
}

async function handleUploadImage(event) {
  event.preventDefault();
  const fileInput = document.getElementById('galleryFileInput');
  const captionInput = document.getElementById('newCaption');
  const uploadBtn = document.getElementById('uploadBtn');

  const file = fileInput.files[0];
  const caption = captionInput.value.trim();

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
      .insert([{ src: publicUrl, caption: caption }]);

    if (dbError) throw dbError;

    fileInput.value = '';
    captionInput.value = '';
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
