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
  // Wishlist Toggle functionality
  // ==========================================
  document.querySelectorAll('.toggle-wishlist').forEach((button) => {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
 
      const productId = this.getAttribute('data-product-id');
      const icon = this.querySelector('i');
 
      fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            if (data.action === 'added') {
              this.classList.add('active');
              this.style.color = '#ff4d4d';
              showToast('Added to wishlist! ❤️');
            } else {
              this.classList.remove('active');
              this.style.color = '#ccc';
              showToast('Removed from wishlist');
            }
          } else {
            if (data.error === 'Unauthorized') {
              window.location.href = '/auth/login';
            } else {
              showToast(data.error || 'Failed to update wishlist', 'error');
            }
          }
        })
        .catch((error) => {
          console.error('Wishlist toggle error:', error);
          showToast('Failed to update wishlist', 'error');
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
 
  // ==========================================
  // Live Search Logic
  // ==========================================
  const searchInputsConfigs = [
    { input: document.getElementById('live-search-input-desktop'), results: document.getElementById('search-results-desktop') },
    { input: document.getElementById('live-search-input-mobile'), results: document.getElementById('search-results-mobile') }
  ];
 
  searchInputsConfigs.forEach(({ input, results }) => {
    if (!input || !results) return;
 
    let debounceSearchTimeout;
    input.addEventListener('input', function() {
      clearTimeout(debounceSearchTimeout);
      const qVal = this.value.trim();
 
      if (qVal.length < 2) {
        results.innerHTML = '';
        results.classList.remove('show');
        return;
      }
 
      debounceSearchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(qVal)}`);
          const sData = await res.json();
 
          if (sData.success && sData.products.length > 0) {
            results.innerHTML = sData.products.map(p => `
              <a href="/product/${p._id}" class="search-result-item">
                <img src="/uploads/${p.image}" alt="${p.name}" onerror="this.src='/img/placeholder.jpg'">
                <div class="res-info">
                  <h5>${p.name}</h5>
                  <p>₹${p.price.toLocaleString('en-IN')}</p>
                </div>
              </a>
            `).join('');
            results.classList.add('show');
          } else {
            results.innerHTML = '<div class="search-no-results">No products found for "' + qVal + '"</div>';
            results.classList.add('show');
          }
        } catch (err) {
          console.error('Search fetch error:', err);
        }
      }, 300);
    });
 
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove('show');
      }
    });
 
    // Re-show results on focus if there's text
    input.addEventListener('focus', function() {
      if (this.value.trim().length >= 2 && results.innerHTML !== '') {
        results.classList.add('show');
      }
    });
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

// ==========================================
// Product Comparison functionality
// ==========================================
function addToCompare(productId) {
  let compareList = JSON.parse(localStorage.getItem('compareItems') || '[]');
  
  if (compareList.includes(productId)) {
    showToast('Already in comparison list', 'info');
    return;
  }
  
  if (compareList.length >= 4) {
    showToast('Max 4 products allowed for comparison', 'error');
    return;
  }
  
  compareList.push(productId);
  localStorage.setItem('compareItems', JSON.stringify(compareList));
  
  showToast('Added to comparison! ⚖️');
  updateCompareFloatingButton(compareList.length);
}

function updateCompareFloatingButton(count) {
  let btn = document.getElementById('floating-compare');
  if (!btn) {
    btn = document.createElement('a');
    btn.id = 'floating-compare';
    btn.className = 'floating-btn';
    btn.style.cssText = 'position:fixed; bottom:110px; right:30px; background:#088178; color:#fff; padding:12px 20px; border-radius:30px; text-decoration:none; z-index:9999; box-shadow:0 10px 20px rgba(0,0,0,0.1); font-weight:600; display:none; transition: 0.3s;';
    btn.innerHTML = '<i class="fa-solid fa-scale-unbalanced-flip"></i> Compare (<span id="compare-count">0</span>)';
    document.body.appendChild(btn);
  }
  
  const countSpan = document.getElementById('compare-count');
  if (count > 0) {
    countSpan.textContent = count;
    btn.href = `/compare?ids=${JSON.parse(localStorage.getItem('compareItems')).join(',')}`;
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}

// Check comparison list on load
document.addEventListener('DOMContentLoaded', () => {
  const compareList = JSON.parse(localStorage.getItem('compareItems') || '[]');
  updateCompareFloatingButton(compareList.length);
});
