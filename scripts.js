// ToolCouponVault - Main JavaScript

// Theme Management
function initTheme() {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  // Check for saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    html.classList.add('dark');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  } else {
    if (sunIcon && moonIcon) {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      html.classList.toggle('dark');
      const isDark = html.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'none' : 'block';
        moonIcon.style.display = isDark ? 'block' : 'none';
      }
    });
  }
}

// Mobile Menu Toggle
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });
  }
}

// Copy to Clipboard
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const codeElement = this.closest('.coupon-code-box')?.querySelector('.coupon-code');
      if (!codeElement) return;

      const code = codeElement.textContent.trim();

      try {
        await navigator.clipboard.writeText(code);
        this.textContent = 'Copied!';
        this.classList.add('copied');

        showToast('Coupon code copied to clipboard!');

        setTimeout(() => {
          this.textContent = 'Copy';
          this.classList.remove('copied');
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        this.textContent = 'Copied!';
        this.classList.add('copied');
        showToast('Coupon code copied to clipboard!');

        setTimeout(() => {
          this.textContent = 'Copy';
          this.classList.remove('copied');
        }, 2000);
      }
    });
  });
}

// Toast Notification
function showToast(message) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Search Functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const couponCards = document.querySelectorAll('.coupon-card');

  if (!searchInput || couponCards.length === 0) return;

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    couponCards.forEach(card => {
      const toolName = card.dataset.tool?.toLowerCase() || '';
      const description = card.dataset.description?.toLowerCase() || '';
      const category = card.dataset.category?.toLowerCase() || '';

      const matches = toolName.includes(searchTerm) ||
                      description.includes(searchTerm) ||
                      category.includes(searchTerm);

      card.style.display = matches ? 'block' : 'none';
    });
  });
}

// Expiry Countdown
function initExpiryCountdown() {
  document.querySelectorAll('.expiry-badge[data-expiry]').forEach(badge => {
    const expiryDate = new Date(badge.dataset.expiry);

    function updateCountdown() {
      const now = new Date();
      const diff = expiryDate - now;

      if (diff <= 0) {
        badge.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Expired
        `;
        badge.style.color = '#ef4444';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      let text = '';
      if (days > 0) {
        text = `${days}d ${hours}h left`;
      } else if (hours > 0) {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        text = `${hours}h ${mins}m left`;
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        text = `${mins}m left`;
      }

      badge.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${text}
      `;
    }

    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
  });
}

// Filter by category
function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      const cards = document.querySelectorAll('.coupon-card');

      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Coupon Modal
function initCouponModal() {
  const modal = document.getElementById('coupon-modal');
  if (!modal) return;

  // View Code button click
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

      // Populate modal
      const logoEl = modal.querySelector('.modal-tool-logo');
      if (logoEl) logoEl.textContent = tool.charAt(0).toUpperCase();

      const nameEl = modal.querySelector('.modal-tool-name');
      if (nameEl) nameEl.textContent = tool;

      const discountEl = modal.querySelector('.modal-discount');
      if (discountEl) discountEl.textContent = discount;

      const codeEl = modal.querySelector('.modal-code');
      if (codeEl) codeEl.textContent = code;

      const dealBtn = modal.querySelector('.modal-deal-btn');
      if (dealBtn && url) {
        dealBtn.href = url;
        dealBtn.onclick = () => window.open(url, '_blank');
      }

      const ratingEl = modal.querySelector('.modal-rating');
      if (ratingEl) ratingEl.innerHTML = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating)) + ` ${rating}/5`;

      const expiryEl = modal.querySelector('.modal-expiry');
      if (expiryEl && expiry) {
        const expDate = new Date(expiry);
        const days = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
        expiryEl.textContent = days > 0 ? `${days} days left` : 'Expired';
      }

      // Show modal
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Copy button in modal
  const copyBtn = modal.querySelector('.modal-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async function() {
      const codeEl = modal.querySelector('.modal-code');
      if (!codeEl) return;

      const code = codeEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(code);
        this.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `;
        this.classList.add('copied');
        showToast('Coupon code copied!');

        setTimeout(() => {
          this.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
}

// Initialize all functionality
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initCopyButtons();
  initSearch();
  initExpiryCountdown();
  initCategoryFilter();
  initCouponModal();
});