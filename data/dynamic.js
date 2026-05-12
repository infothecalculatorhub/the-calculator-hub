// ToolCouponVault - Dynamic Data Loader
// This file handles all dynamic content loading from data.json

// ===== DATA STORE =====
let appData = {
  coupons: [],
  categories: [],
  blogPosts: []
};

// ===== UTILITY FUNCTIONS =====

// Get domain from URL for favicon
function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

// Get initials from tool name
function getInitials(name) {
  return name.charAt(0).toUpperCase();
}

// Calculate days left until expiry
function getDaysLeft(expiry) {
  const now = new Date();
  const exp = new Date(expiry);
  const diff = exp - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 30) return `${Math.floor(days / 30)}mo left`;
  return `${days}d left`;
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Generate star rating HTML
function getStarRating(rating) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty) + ` ${rating}`;
}

// Generate coupon card HTML
function generateCouponCard(coupon, index) {
  const daysLeft = getDaysLeft(coupon.expiry);
  const faviconUrl = getFaviconUrl(coupon.url);

  return `
    <article class="coupon-card" data-tool="${coupon.tool}" data-discount="${coupon.discount}"
             data-code="${coupon.code}" data-url="${coupon.url}" data-rating="${coupon.rating}"
             data-expiry="${coupon.expiry}" data-description="${coupon.description}"
             data-category="${coupon.category}">
      <div class="coupon-header">
        <div class="tool-logo">
          <img src="${faviconUrl}" alt="${coupon.tool}" onerror="this.parentElement.innerHTML='${getInitials(coupon.tool)}'">
        </div>
        <div class="coupon-info">
          <h3>${coupon.tool}</h3>
          <span class="discount-badge">${coupon.discount}</span>
        </div>
      </div>
      <p class="coupon-description">${coupon.description}</p>
      <button class="view-code-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        View Code
      </button>
      <div class="coupon-meta">
        <span class="star-rating">${getStarRating(coupon.rating)}</span>
        <span class="expiry-badge" data-expiry="${coupon.expiry}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${daysLeft}
        </span>
      </div>
    </article>
  `;
}

// Generate category card HTML
function generateCategoryCard(category) {
  const iconMap = {
    'edit': '<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle>',
    'pen-tool': '<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>',
    'search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
    'server': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>',
    'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
    'check-square': '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
    'video': '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
    'shopping-bag': '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>'
  };

  const icon = iconMap[category.icon] || iconMap['edit'];

  return `
    <a href="${category.slug}/" class="category-card">
      <div class="category-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${icon}
        </svg>
      </div>
      <h3>${category.name}</h3>
      <span>${category.couponCount} Coupons</span>
    </a>
  `;
}

// Generate blog post card HTML
function generateBlogPostCard(post) {
  const dateFormatted = formatDate(post.date);

  return `
    <article class="blog-post-card">
      <div class="blog-post-image" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      </div>
      <div class="blog-post-content">
        <span class="blog-post-category">${post.category}</span>
        <h2><a href="blog/${post.slug}">${post.title}</a></h2>
        <p>${post.excerpt}</p>
        <div class="blog-post-meta">
          <span>${dateFormatted}</span>
          <span>${post.readTime} min read</span>
        </div>
      </div>
    </article>
  `;
}

// ===== DATA LOADING =====

// Get correct path to data.json based on current page location
function getDataPath() {
  const path = window.location.pathname;
  // If we're in a subdirectory (blog/, ai-writing-tools/, etc.)
  if (path.includes('/')) {
    // Count depth and go up that many levels
    const depth = (path.match(/\//g) || []).length;
    const basePath = depth > 2 ? '../'.repeat(depth - 1) : '../';
    return basePath + 'data/data.json';
  }
  return 'data/data.json';
}

async function loadData() {
  try {
    // Skip if already loaded
    if (appData.coupons.length > 0) return true;

    const response = await fetch(getDataPath());
    if (!response.ok) throw new Error('Failed to load data');
    const data = await response.json();
    appData = data;
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    return false;
  }
}

// ===== RENDER FUNCTIONS =====

// Render featured coupons on homepage
function renderFeaturedCoupons(containerId, count = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const featuredCoupons = appData.coupons.filter(c => c.featured).slice(0, count);
  container.innerHTML = featuredCoupons.map((coupon, index) => generateCouponCard(coupon, index)).join('');

  // Re-initialize copy buttons and modal after rendering
  initCopyButtons();
  initCouponModal();
  initExpiryCountdown();
}

// Render latest coupons on homepage
function renderLatestCoupons(containerId, count = 6, offset = 0) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const nonFeaturedCoupons = appData.coupons.filter(c => !c.featured).slice(offset, offset + count);
  container.innerHTML = nonFeaturedCoupons.map((coupon, index) => generateCouponCard(coupon, index)).join('');

  initCopyButtons();
  initCouponModal();
  initExpiryCountdown();
}

// Render all coupons for a category
function renderCategoryCoupons(containerId, categorySlug) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const categoryCoupons = appData.coupons.filter(c => c.categorySlug === categorySlug);
  container.innerHTML = categoryCoupons.map((coupon, index) => generateCouponCard(coupon, index)).join('');

  initCopyButtons();
  initCouponModal();
  initExpiryCountdown();
}

// Render all categories
function renderCategories(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = appData.categories.map(cat => generateCategoryCard(cat)).join('');
}

// Render blog posts
function renderBlogPosts(containerId, count = 8) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const posts = appData.blogPosts.slice(0, count);
  container.innerHTML = posts.map(post => generateBlogPostCard(post)).join('');
}

// Render homepage
async function initHomepage() {
  await loadData();

  // Render categories
  const categoryGrid = document.getElementById('category-grid');
  if (categoryGrid) {
    categoryGrid.innerHTML = appData.categories.map(cat => generateCategoryCard(cat)).join('');
  }

  // Render featured coupons
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid) {
    const featuredCoupons = appData.coupons.filter(c => c.featured).slice(0, 6);
    featuredGrid.innerHTML = featuredCoupons.map(coupon => generateCouponCard(coupon)).join('');
  }

  // Render latest coupons
  const latestGrid = document.getElementById('latest-grid');
  if (latestGrid) {
    const latestCoupons = appData.coupons.filter(c => !c.featured).slice(0, 6);
    latestGrid.innerHTML = latestCoupons.map(coupon => generateCouponCard(coupon)).join('');
  }

  // Render blog posts on homepage
  const homepageBlogGrid = document.getElementById('homepage-blog-grid');
  if (homepageBlogGrid) {
    homepageBlogGrid.innerHTML = appData.blogPosts.slice(0, 3).map(post => generateHomepageBlogCard(post)).join('');
  }
}

// Generate homepage blog card (smaller version for homepage)
function generateHomepageBlogCard(post) {
  return `
    <article class="blog-card">
      <div class="blog-image" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </div>
      <div class="blog-content">
        <span class="blog-category">${post.category}</span>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <a href="blog/${post.slug}" class="read-more-link">
          Read More
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `;
}

// Render category page
async function initCategoryPage(categorySlug, pageTitle, pageDescription) {
  await loadData();

  const category = appData.categories.find(c => c.categorySlug === categorySlug);
  if (!category) return;

  // Update page title and description if elements exist
  const titleEl = document.querySelector('.page-header h1');
  const descEl = document.querySelector('.page-header p');
  if (titleEl && pageTitle) titleEl.textContent = pageTitle;
  if (descEl && pageDescription) descEl.textContent = pageDescription;

  // Render coupons using ID selector
  const couponGrid = document.getElementById('category-coupons');
  if (couponGrid) {
    const categoryCoupons = appData.coupons.filter(c => c.categorySlug === categorySlug);
    couponGrid.innerHTML = categoryCoupons.map(coupon => generateCouponCard(coupon)).join('');
  }

  // Reinitialize
  initCopyButtons();
  initCouponModal();
  initExpiryCountdown();
}

// Render blog page
async function initBlogPage() {
  const blogGrid = document.getElementById('blog-grid');
  if (blogGrid) {
    blogGrid.innerHTML = appData.blogPosts.map(post => generateBlogPostCard(post)).join('');
  }
  initCopyButtons();
  initCouponModal();
  initExpiryCountdown();
}

// Render categories page
async function initCategoriesPage() {
  const categoriesContainer = document.getElementById('categories-container');
  if (categoriesContainer) {
    categoriesContainer.innerHTML = appData.categories.map(cat => generateCategoryCard(cat)).join('');
  }
  initCopyButtons();
  initCouponModal();
  initExpiryCountdown();
}

// ===== MODAL FUNCTIONS =====

function updateModalContent(modal, tool, discount, code, url, rating, expiry) {
  const logoEl = modal.querySelector('.modal-tool-logo');
  if (logoEl) {
    const faviconUrl = getFaviconUrl(url);
    logoEl.innerHTML = `<img src="${faviconUrl}" alt="${tool}" onerror="this.style.display='none'">`;
  }

  const nameEl = modal.querySelector('.modal-tool-name');
  if (nameEl) nameEl.textContent = tool;

  const discountEl = modal.querySelector('.modal-discount');
  if (discountEl) discountEl.textContent = discount;

  const codeEl = modal.querySelector('.modal-code');
  if (codeEl) codeEl.textContent = code;

  const dealBtn = modal.querySelector('.modal-deal-btn');
  if (dealBtn) {
    dealBtn.href = url;
    dealBtn.onclick = () => window.open(url, '_blank');
  }

  const ratingEl = modal.querySelector('.modal-rating');
  if (ratingEl) ratingEl.innerHTML = getStarRating(rating);

  const expiryEl = modal.querySelector('.modal-expiry');
  if (expiryEl) {
    const days = getDaysLeft(expiry);
    expiryEl.textContent = days;
  }
}

// ===== MODAL FUNCTIONS =====
  const modal = document.getElementById('coupon-modal');
  if (!modal) return;

  document.querySelectorAll('.view-code-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.coupon-card');
      if (!card) return;

      const tool = card.dataset.tool || '';
      const discount = card.dataset.discount || '';
      const code = card.dataset.code || '';
      const url = card.dataset.url || '';
      const rating = card.dataset.rating || '4.5';
      const expiry = card.dataset.expiry || '';

      // Open affiliate link
      if (url) {
        window.open(url, '_blank');
      }

      // Update modal content
      updateModalContent(modal, tool, discount, code, url, rating, expiry);

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close handlers
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Copy button
  const copyBtn = modal.querySelector('.modal-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async function() {
      const codeEl = modal.querySelector('.modal-code');
      if (!codeEl) return;

      const code = codeEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(code);
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `;
        this.classList.add('copied');
        showToast('Coupon code copied!');

        setTimeout(() => {
          this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Code
          `;
          this.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
    });
  }
};

// ===== SEO SCHEMA GENERATION =====

function generateSchemaMarkup() {
  const coupons = appData.coupons;

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ToolCouponVault",
    "url": "https://toolcouponvault.com",
    "description": "Your trusted source for SaaS and AI tool discounts",
    "publisher": {
      "@type": "Organization",
      "name": "ToolCouponVault"
    }
  };

  // Offer Schema for coupons
  const offerSchemas = coupons.slice(0, 10).map(coupon => ({
    "@type": "Offer",
    "url": coupon.url,
    "name": `${coupon.tool} - ${coupon.discount}`,
    "description": coupon.description,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": new Date().toISOString().split('T')[0],
    "validThrough": coupon.expiry
  }));

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top SaaS Coupons",
    "itemListElement": offerSchemas.map((offer, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": offer
    }))
  };

  return {
    websiteSchema,
    itemListSchema
  };
}

// Inject schema into head
function injectSchemas() {
  const schemas = generateSchemaMarkup();

  // Add website schema
  const websiteScript = document.createElement('script');
  websiteScript.type = 'application/ld+json';
  websiteScript.textContent = JSON.stringify(schemas.websiteSchema);
  document.head.appendChild(websiteScript);

  // Add offer list schema
  const itemListScript = document.createElement('script');
  itemListScript.type = 'application/ld+json';
  itemListScript.textContent = JSON.stringify(schemas.itemListSchema);
  document.head.appendChild(itemListScript);
}

// ===== EXPORT =====
window.ToolCouponVault = {
  loadData,
  renderFeaturedCoupons,
  renderLatestCoupons,
  renderCategoryCoupons,
  renderCategories,
  renderBlogPosts,
  initHomepage,
  initCategoryPage,
  initBlogPage,
  initCategoriesPage,
  getCouponById: (id) => appData.coupons.find(c => c.id === id),
  getCategoryBySlug: (slug) => appData.categories.find(c => c.categorySlug === slug),
  getBlogPostBySlug: (slug) => appData.blogPosts.find(p => p.slug.includes(slug))
};