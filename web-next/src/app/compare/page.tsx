import type { Metadata } from 'next';
import { API_URL } from '@/config';
import CompareClient from '@/components/compare/CompareClient';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const metadata: Metadata = {
  title: 'Compare Products | EcomSphere',
};

export const dynamic = 'force-dynamic';

async function getBulkProducts(ids: string[]) {
  if (!ids.length) return [];
  const res = await fetch(`${API_URL}/api/v1/products/bulk?ids=${ids.join(',')}`, {
    cache: 'no-store'
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export default async function ComparePage({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = searchParams.ids ? searchParams.ids.split(',') : [];
  const initialProducts = await getBulkProducts(ids);
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <CompareClient 
      initialProducts={initialProducts} 
      sessionUser={sessionUser} 
      settings={settings} 
    />
  );
}
