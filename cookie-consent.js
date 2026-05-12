// Cookie Consent Manager for ToolCouponVault

const COOKIE_CONSENT_KEY = 'toolcouponvault_consent';
const CONSENT_COOKIE_NAME = 'cc_consent';
const CONSENT_VERSION = '1.0';

function initCookieConsent() {
  // Check if consent already given
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (consent) return;

  // Show cookie banner
  const banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.style.display = 'flex';
  }
}

function acceptAllCookies() {
  saveCookieConsent('all');
  hideCookieBanner();
}

function rejectNonEssentialCookies() {
  saveCookieConsent('essential');
  hideCookieBanner();
}

function saveCookieConsent(choice) {
  const consentData = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    choice: choice,
    marketing: choice === 'all',
    analytics: choice === 'all'
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));

  // Set a cookie for server-side consent (if needed)
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  document.cookie = `${CONSENT_COOKIE_NAME}=${choice}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-consent-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function getCookieConsent() {
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCookieConsent);

// Make functions globally available
window.acceptAllCookies = acceptAllCookies;
window.rejectNonEssentialCookies = rejectNonEssentialCookies;