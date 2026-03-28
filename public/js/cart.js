// EcomSphere - Cart Page JavaScript
// Updated from original cart.js with new API endpoints

document.addEventListener('DOMContentLoaded', function () {
  fetchCartItems();

  // ==========================================
  // Fetch Cart Items
  // ==========================================
  function fetchCartItems() {
    fetch('/api/cart')
      .then((response) => {
        if (response.redirected) {
          window.location.href = '/auth/login';
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (!data) return;

        if (data.success && data.cart && data.cart.length > 0) {
          displayCartItems(data.cart);
          updateCartTotals(data.total);
          // Enable checkout button
          const checkoutBtn = document.getElementById('checkout-btn');
          if (checkoutBtn) checkoutBtn.disabled = false;
        } else {
          showEmptyCart();
        }
      })
      .catch((error) => {
        console.error('Error fetching cart:', error);
        showEmptyCart();
      });
  }

  // ==========================================
  // Display Cart Items
  // ==========================================
  function displayCartItems(cart) {
    const cartTable = document.getElementById('cart-items');
    if (!cartTable) return;

    cartTable.innerHTML = '';

    cart.forEach((item) => {
      const row = document.createElement('tr');
      row.setAttribute('data-item-id', item.id);
      row.innerHTML = `
        <td>
          <button class="remove-item" data-id="${item.id}" title="Remove">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
        <td>
          <img src="/uploads/${item.image}"
               width="70" height="70"
               style="object-fit:cover; border-radius:8px; border:1px solid #eee;"
               onerror="this.src='/img/placeholder.jpg'"
               alt="${item.name}">
        </td>
        <td>
          <strong>${item.name}</strong>
        </td>
        <td>₹${parseFloat(item.price).toLocaleString('en-IN')}</td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="decrease-qty" data-id="${item.id}" title="Decrease">−</button>
            <span class="item-quantity" style="min-width:30px; text-align:center; font-weight:700;">${item.quantity}</span>
            <button class="increase-qty" data-id="${item.id}" title="Increase">+</button>
          </div>
        </td>
        <td class="cart-item-subtotal" data-price="${item.price}" data-quantity="${item.quantity}">
          ₹${(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
        </td>
      `;
      cartTable.appendChild(row);
    });

    attachEventListeners();
  }

  // ==========================================
  // Show Empty Cart
  // ==========================================
  function showEmptyCart() {
    const cartTable = document.getElementById('cart-items');
    if (cartTable) {
      cartTable.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:50px; color:#888;">
            <i class="fa-solid fa-cart-shopping" style="font-size:50px; color:#ccc; display:block; margin-bottom:15px;"></i>
            <p style="font-size:18px;">Your cart is empty</p>
            <a href="/shop" style="display:inline-block;margin-top:15px;padding:12px 28px;background:#088178;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
              Start Shopping
            </a>
          </td>
        </tr>
      `;
    }
    updateCartTotals(0);
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.disabled = true;
  }

  // ==========================================
  // Event Listeners for Cart Buttons
  // ==========================================
  function attachEventListeners() {
    document.querySelectorAll('.increase-qty').forEach((button) => {
      button.addEventListener('click', function () {
        const itemId = this.getAttribute('data-id');
        updateCartQuantity(itemId, 'increase');
      });
    });

    document.querySelectorAll('.decrease-qty').forEach((button) => {
      button.addEventListener('click', function () {
        const itemId = this.getAttribute('data-id');
        updateCartQuantity(itemId, 'decrease');
      });
    });

    document.querySelectorAll('.remove-item').forEach((button) => {
      button.addEventListener('click', function () {
        const itemId = this.getAttribute('data-id');
        removeCartItem(itemId);
      });
    });
  }

  // ==========================================
  // Update Cart Quantity
  // ==========================================
  function updateCartQuantity(itemId, action) {
    fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, action }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          fetchCartItems();
        } else {
          showToast(data.error || 'Failed to update cart', 'error');
        }
      })
      .catch(() => showToast('Failed to update cart', 'error'));
  }

  // ==========================================
  // Remove Cart Item
  // ==========================================
  function removeCartItem(itemId) {
    const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
    if (row) {
      row.style.opacity = '0.5';
      row.style.transition = 'opacity 0.3s';
    }

    fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          fetchCartItems();
          showToastCart('Item removed from cart');
        } else {
          if (row) row.style.opacity = '1';
          showToastCart(data.error || 'Failed to remove item', 'error');
        }
      })
      .catch(() => {
        if (row) row.style.opacity = '1';
        showToastCart('Failed to remove item', 'error');
      });
  }

  // ==========================================
  // Update Cart Totals Display
  // ==========================================
  function updateCartTotals(total) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    const displayTotal = `₹${parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (subtotalEl) subtotalEl.textContent = displayTotal;
    if (totalEl) totalEl.innerHTML = `<strong>${displayTotal}</strong>`;
  }

  // Cart-specific toast (re-uses global if available)
  function showToastCart(msg, type = 'success') {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    }
  }
});
