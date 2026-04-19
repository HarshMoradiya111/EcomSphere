import { API_URL } from '@/config';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';

type MarketingAssets = {
  banners?: Array<{ image: string; subtitle?: string; title?: string; buttonLink?: string; buttonText?: string }>;
  flashSale?: { isActive?: boolean; title?: string; discountText?: string } | null;
};

async function fetchMarketingData() {
  try {
    const res = await fetch(`${API_URL}/api/v1/products/marketing/assets`, { cache: 'no-store' });
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

export default async function HomePage() {
  // Fetch data on the server
  const marketing = await fetchMarketingData();
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <HomePageClient 
      marketing={marketing as MarketingAssets}
      sessionUser={sessionUser}
      settings={settings}
    />
  );
}
