'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_URL } from '@/src/config';

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'circle-info' : 'exclamation-circle'}"></i> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  window.setTimeout(() => {
    toast.classList.remove('show');
    window.setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function updateCartBadge(count: number) {
  let badge = document.querySelector('.cart-badge') as HTMLSpanElement | null;
  if (!badge) {
    const cartLink = document.querySelector('#lg-bag a') as HTMLAnchorElement | null;
    if (!cartLink) return;

    badge = document.createElement('span');
    badge.className = 'cart-badge';
    badge.style.cssText = 'position:absolute; top:-8px; right:-8px; background:#e63946; color:#fff; border-radius:50%; width:18px; height:18px; font-size:11px; display:flex; align-items:center; justify-content:center; font-weight:700;';
    cartLink.style.position = 'relative';
    cartLink.appendChild(badge);
  }

  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.display = 'flex';
  }
}

function getCompareList(): string[] {
  try {
    const raw = window.localStorage.getItem('compareItems');
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed
      .flatMap((item) => (typeof item === 'string' ? decodeURIComponent(item).split(',') : []))
      .map((item) => item.trim())
      .filter((item, index, all) => /^[a-fA-F0-9]{24}$/.test(item) && all.indexOf(item) === index)
      .slice(0, 4);

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      setCompareList(normalized);
    }

    return normalized;
  } catch {
    return [];
  }
}

function setCompareList(compareList: string[]) {
  window.localStorage.setItem('compareItems', JSON.stringify(compareList));
}

function updateCompareFloatingButton(count: number) {
  let button = document.getElementById('floating-compare') as HTMLAnchorElement | null;
  if (!button) {
    button = document.createElement('a');
    button.id = 'floating-compare';
    button.className = 'floating-btn';
    button.style.cssText = 'position:fixed; bottom:110px; right:30px; background:#088178; color:#fff; padding:12px 20px; border-radius:30px; text-decoration:none; z-index:9999; box-shadow:0 10px 20px rgba(0,0,0,0.1); font-weight:600; display:none; transition:0.3s;';
    button.innerHTML = '<i class="fa-solid fa-scale-unbalanced-flip"></i> Compare (<span id="compare-count">0</span>)';
    document.body.appendChild(button);
  }

  const countSpan = document.getElementById('compare-count');
  if (countSpan) {
    countSpan.textContent = String(count);
  }

  if (count > 0) {
    const compareList = getCompareList();
    button.href = `/compare?ids=${compareList.join(',')}`;
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
}

function addToCompare(productId: string) {
  const compareList = getCompareList();

  if (compareList.includes(productId)) {
    showToast('Already in comparison list', 'info');
    return;
  }

  if (compareList.length >= 4) {
    showToast('Max 4 products allowed for comparison', 'error');
    return;
  }

  compareList.push(productId);
  setCompareList(compareList);
  updateCompareFloatingButton(compareList.length);
  showToast('Added to comparison!', 'success');
}

export default function StorefrontBridge() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const compareList = getCompareList();
    updateCompareFloatingButton(compareList.length);

    if (pathname === '/compare') {
      const params = new URLSearchParams(window.location.search);
      const hasIdsInQuery = Boolean((params.get('ids') || '').trim());

      if (!hasIdsInQuery && compareList.length > 0) {
        router.replace(`/compare?ids=${compareList.join(',')}`);
      }
    }

    const bindCheckoutAddressAutofill = (): (() => void) | undefined => {
      const selector = document.getElementById('saved-address-selector') as HTMLSelectElement | null;
      const userDataNode = document.getElementById('user-data');
      const nameInput = document.getElementById('delivery-name') as HTMLInputElement | null;
      const addressInput = document.getElementById('delivery-address') as HTMLInputElement | null;
      const phoneInput = document.getElementById('delivery-phone') as HTMLInputElement | null;

      if (!selector || !userDataNode || !nameInput || !addressInput || !phoneInput) {
        return undefined;
      }

      let userData: {
        addresses?: Array<{
          street?: string;
          city?: string;
          state?: string;
          zip?: string;
          country?: string;
        }>;
        username?: string;
        phone?: string;
      } = {};

      try {
        userData = JSON.parse(userDataNode.textContent || '{}');
      } catch {
        userData = {};
      }

      const addresses = Array.isArray(userData.addresses) ? userData.addresses : [];

      const fillAddress = (indexValue: string) => {
        if (indexValue === '') return;

        const index = Number(indexValue);
        if (!Number.isInteger(index) || index < 0 || index >= addresses.length) return;

        const addr = addresses[index] || {};
        const street = addr.street || '';
        const city = addr.city || '';
        const state = addr.state || '';
        const zip = addr.zip || '';
        const country = addr.country || '';

        if (userData.username) {
          nameInput.value = userData.username;
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        addressInput.value = `${street}, ${city}, ${state} ${zip}, ${country}`.replace(/\s+,/g, ',').trim();
        addressInput.dispatchEvent(new Event('input', { bubbles: true }));

        if (userData.phone) {
          phoneInput.value = userData.phone;
          phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      const onSelectorChange = () => {
        fillAddress(selector.value);
        const shippingUpdater = (window as Window & { updateShippingDisplay?: () => void }).updateShippingDisplay;
        if (typeof shippingUpdater === 'function') {
          shippingUpdater();
        }
      };

      selector.addEventListener('change', onSelectorChange);

      if (selector.value !== '') {
        fillAddress(selector.value);
      }

      return () => {
        selector.removeEventListener('change', onSelectorChange);
      };
    };

    const spaRoutes = [
      '/',
      '/shop',
      '/product/',
      '/blog',
      '/about',
      '/contact',
      '/cart',
      '/checkout',
      '/profile',
      '/wishlist',
      '/track-order',
      '/order-success/',
      '/compare',
      '/faq',
      '/terms',
      '/privacy',
      '/refund-shipping',
    ];

    const shouldUseSpaNavigation = (href: string) => {
      if (!href.startsWith('/')) return false;
      if (href.startsWith('/api/') || href.startsWith('/uploads/') || href.startsWith('/img/') || href.startsWith('/css/') || href.startsWith('/js/')) {
        return false;
      }
      if (href.startsWith('/auth/') || href.startsWith('/admin/')) {
        return false;
      }

      return spaRoutes.some((route) => route === '/' ? href === '/' : href.startsWith(route));
    };

    const onDocumentClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (anchor) {
        const href = anchor.getAttribute('href') || '';
        const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

        if (
          !hasModifier &&
          anchor.target !== '_blank' &&
          !anchor.hasAttribute('download') &&
          href &&
          href !== '#' &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          shouldUseSpaNavigation(href)
        ) {
          event.preventDefault();
          if (href !== pathname) {
            router.push(href);
          }
          return;
        }
      }

      const addButton = target.closest('.add-to-cart') as HTMLElement | null;
      if (addButton) {
        event.preventDefault();

        const productId = addButton.getAttribute('data-product-id');
        const name = addButton.getAttribute('data-name') || 'Item';
        if (!productId) {
          showToast('Invalid product', 'error');
          return;
        }

        const icon = addButton.querySelector('i');
        icon?.classList.remove('fa-cart-shopping');
        icon?.classList.add('fa-spinner', 'fa-spin');

        try {
          const response = await fetch(`${API_URL}/api/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId, quantity: 1 }),
          });

          if (response.redirected) {
            window.location.href = '/auth/login';
            return;
          }

          const data = await response.json();
          if (icon) {
            icon.classList.remove('fa-spinner', 'fa-spin');
            icon.classList.add('fa-cart-shopping');
          }

          if (data.success) {
            showToast(`${name} added to cart!`);
            if (typeof data.cartCount === 'number') updateCartBadge(data.cartCount);
          } else {
            showToast(data.error || 'Failed to add item', 'error');
          }
        } catch (error) {
          console.error('Add to cart error:', error);
          icon?.classList.remove('fa-spinner', 'fa-spin');
          icon?.classList.add('fa-cart-shopping');
          showToast('Failed to add item to cart', 'error');
        }
        return;
      }

      const wishlistButton = target.closest('.toggle-wishlist') as HTMLElement | null;
      if (wishlistButton) {
        event.preventDefault();
        event.stopPropagation();

        const productId = wishlistButton.getAttribute('data-product-id');
        if (!productId) return;

        try {
          const response = await fetch(`${API_URL}/api/wishlist/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId }),
          });

          if (response.redirected) {
            window.location.href = '/auth/login';
            return;
          }

          const data = await response.json();
          if (data.success) {
            if (data.action === 'added') {
              wishlistButton.classList.add('active');
              (wishlistButton as HTMLElement).style.color = '#ff4d4d';
              showToast('Added to wishlist!');
            } else {
              wishlistButton.classList.remove('active');
              (wishlistButton as HTMLElement).style.color = '#ccc';
              showToast('Removed from wishlist');
            }
          } else if (data.error === 'Unauthorized') {
            window.location.href = '/auth/login';
          } else {
            showToast(data.error || 'Failed to update wishlist', 'error');
          }
        } catch (error) {
          console.error('Wishlist toggle error:', error);
          showToast('Failed to update wishlist', 'error');
        }
      }

      const compareButton = target.closest('.compare-btn[data-product-id]') as HTMLElement | null;
      if (compareButton) {
        event.preventDefault();
        const productId = compareButton.getAttribute('data-product-id');
        if (productId) {
          addToCompare(productId);
        }
      }
    };

    const onDocumentSubmit = async (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;

      const action = form.getAttribute('action') || '';
      if (!action.startsWith('/profile') && !action.startsWith('/checkout') && !action.startsWith('/subscribe-newsletter')) {
        return;
      }

      event.preventDefault();

      const method = (form.getAttribute('method') || 'GET').toUpperCase();

      try {
        let response: Response;
        if ((form.enctype || '').includes('multipart/form-data')) {
          const formData = new FormData(form);
          response = await fetch(`${API_URL}${action}`, {
            method,
            credentials: 'include',
            body: formData,
          });
        } else if (method === 'GET') {
          const url = new URL(action, window.location.origin);
          new FormData(form).forEach((value, key) => url.searchParams.set(key, String(value)));
          window.location.href = url.pathname + url.search;
          return;
        } else {
          const formData = new FormData(form);
          response = await fetch(`${API_URL}${action}`, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData as unknown as Record<string, string>),
          });
        }

        const destination = new URL(response.url);
        if (destination.pathname.startsWith('/order-success/')) {
          window.location.href = destination.pathname;
        } else if (action.startsWith('/checkout')) {
          window.location.href = '/checkout';
        } else if (action.startsWith('/profile')) {
          window.location.href = '/profile';
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Form submit error:', error);
        showToast('Unable to submit form', 'error');
      }
    };

    let checkoutCleanup: (() => void) | undefined;
    let checkoutObserver: MutationObserver | undefined;

    if (pathname === '/checkout') {
      checkoutCleanup = bindCheckoutAddressAutofill();

      if (!checkoutCleanup) {
        checkoutObserver = new MutationObserver(() => {
          if (checkoutCleanup) return;
          checkoutCleanup = bindCheckoutAddressAutofill();
          if (checkoutCleanup && checkoutObserver) {
            checkoutObserver.disconnect();
            checkoutObserver = undefined;
          }
        });

        checkoutObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('submit', onDocumentSubmit as unknown as EventListener, true);
    return () => {
      if (checkoutObserver) {
        checkoutObserver.disconnect();
      }
      if (checkoutCleanup) {
        checkoutCleanup();
      }
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('submit', onDocumentSubmit as unknown as EventListener, true);
    };
  }, [pathname, router]);

  return null;
}
