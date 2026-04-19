import { API_URL } from '@/config';
import type { SettingsLike } from '@/components/ejs-partials/types';

const DEFAULT_SETTINGS: SettingsLike = {
  address: 'SSCCS',
  phone: '+91 8160730726, +91 6359401196',
  hours: '10:00 - 18:00, Mon - Sat',
  email: '',
  logo: '/img/logo.png',
};

function normalizeLogoPath(logo?: string | null): string {
  if (!logo || !logo.trim()) {
    return '/img/logo.png';
  }

  const value = logo.trim();

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  return `/uploads/${value}`;
}

export async function getSiteSettings(): Promise<SettingsLike> {
  try {
    const response = await fetch(`${API_URL}/api/v1/admin/settings`, { cache: 'no-store' });
    if (!response.ok) {
      return DEFAULT_SETTINGS;
    }

    const json = await response.json();
    const settings = (json?.settings || {}) as SettingsLike;

    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      logo: normalizeLogoPath(settings.logo),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
