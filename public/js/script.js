// EcomSphere - Main JavaScript
// Updated from original script.js with new API endpoints

// ==========================================
// Toast Notification System
// ==========================================
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ==========================================
// Add to Cart functionality
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  // Attach add-to-cart listeners to all buttons
  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', function (event) {
      event.preventDefault();

      const productId = this.getAttribute('data-product-id');
      const name = this.getAttribute('data-name');
      const quantity = 1;

      if (!productId) {
        showToast('Invalid product', 'error');
        return;
      }

      // Visual feedback
      const icon = this.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-cart-shopping');
        icon.classList.add('fa-spinner', 'fa-spin');
      }

      fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
        .then((response) => {
          if (response.status === 302 || response.redirected) {
            window.location.href = '/auth/login';
            return;
          }
          return response.json();
        })
        .then((data) => {
          if (icon) {
            icon.classList.remove('fa-spinner', 'fa-spin');
            icon.classList.add('fa-cart-shopping');
          }
          if (data && data.success) {
            showToast(`${name} added to cart! 🛒`);
            updateCartBadge(data.cartCount);
          } else if (data) {
            showToast(data.error || 'Failed to add item', 'error');
          }
        })
        .catch((error) => {
          console.error('Add to cart error:', error);
          if (icon) {
            icon.classList.remove('fa-spinner', 'fa-spin');
            icon.classList.add('fa-cart-shopping');
          }
          showToast('Failed to add item to cart', 'error');
        });
    });
  });

  // ==========================================
  // Mobile Navigation — Sidebar Controller
  // ==========================================
  const navbar  = document.getElementById('navbar');
  const bar     = document.getElementById('bar');
  const close   = document.getElementById('close');
  const overlay = document.getElementById('drawer-overlay');

  let savedScrollY = 0;
  let debounceTimer = null;

  /** Centralized Sidebar State Controller */
  const Sidebar = {
    isOpen: false,

    toggle(force) {
      // Debounce rapid taps
      if (debounceTimer) return;
      debounceTimer = setTimeout(() => { debounceTimer = null; }, 150);

      this.isOpen = (force !== undefined) ? force : !this.isOpen;

      if (navbar)  navbar.classList.toggle('active', this.isOpen);
      if (overlay) overlay.classList.toggle('visible', this.isOpen);
      if (bar)     bar.setAttribute('aria-expanded', String(this.isOpen));

      if (this.isOpen) {
        // Lock body scroll
        savedScrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        // Move focus to first link inside sidebar
        const firstLink = navbar && navbar.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        // Restore body scroll
        document.body.style.overflow = '';
        window.scrollTo(0, savedScrollY);
        // Return focus to hamburger
        if (bar) bar.focus();
      }
    },

    open()  { this.toggle(true);  },
    close() { this.toggle(false); }
  };

  // Hamburger opens sidebar
  if (bar) {
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      Sidebar.open();
    });
  }

  // Close button inside profile header
  if (close) {
    close.addEventListener('click', (e) => {
      e.preventDefault();
      Sidebar.close();
    });
  }

  // Overlay click closes sidebar (outside click)
  if (overlay) {
    overlay.addEventListener('click', () => Sidebar.close());
  }

  // Sidebar clicks do NOT bubble to overlay
  if (navbar) {
    navbar.addEventListener('click', (e) => e.stopPropagation());
  }

  // ESC key closes sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && Sidebar.isOpen) Sidebar.close();
  });

  // Force-close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100 && Sidebar.isOpen) Sidebar.close();
  });

  // ── Swipe Gesture Support ──
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);

    // Only treat as horizontal swipe if it's more horizontal than vertical
    if (deltaY > 40) return;

    // Swipe right from left edge → open sidebar
    if (deltaX > 60 && touchStartX < 40 && !Sidebar.isOpen) {
      Sidebar.open();
    }
    // Swipe left → close sidebar
    if (deltaX < -60 && Sidebar.isOpen) {
      Sidebar.close();
    }
  }, { passive: true });

  // ── Analytics: Delegated tracking on sidebar links ──
  if (navbar) {
    navbar.addEventListener('click', (e) => {
      const link = e.target.closest('[data-track]');
      if (link && typeof window.gtag === 'function') {
        window.gtag('event', link.dataset.track, { label: link.dataset.label });
      }
    });
  }

  // Auto-dismiss flash messages
  const flashMessages = document.querySelectorAll('.flash-message');
  flashMessages.forEach((msg) => {
    setTimeout(() => {
      msg.style.opacity = '0';
      msg.style.transition = 'opacity 0.5s';
      setTimeout(() => msg.remove(), 500);
    }, 4000);
  });
}); // end DOMContentLoaded

// ==========================================
// Cart Badge Update
// ==========================================
function updateCartBadge(count) {
  let badge = document.querySelector('.cart-badge');
  if (!badge) {
    const cartLink = document.querySelector('#lg-bag a');
    if (cartLink) {
      badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.style.cssText =
        'position:absolute; top:-8px; right:-8px; background:#e63946; color:#fff; border-radius:50%; width:18px; height:18px; font-size:11px; display:flex; align-items:center; justify-content:center; font-weight:700;';
      cartLink.style.position = 'relative';
      cartLink.appendChild(badge);
    }
  }
  if (badge && count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';
  }
}

// Coupon placeholder
function applyCoupon() {
  const code = document.getElementById('coupon-code')?.value;
  if (code) {
    showToast('Coupon feature coming soon!', 'error');
  } else {
    showToast('Please enter a coupon code', 'error');
  }
}
