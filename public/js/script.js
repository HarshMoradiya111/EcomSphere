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
  // Mobile Navigation
  // ==========================================
  const bar = document.getElementById('bar');
  const nav = document.getElementById('navbar');
  const close = document.getElementById('close');

  if (bar) {
    bar.addEventListener('click', () => {
      nav.classList.add('active');
    });
  }

  if (close) {
    close.addEventListener('click', () => {
      nav.classList.remove('active');
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
});

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
