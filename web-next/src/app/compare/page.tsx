import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';
import StorefrontShell from '@/components/ejs-partials/StorefrontShell';
import { getSessionUsername } from '@/server/sessionUser';
import { getSiteSettings } from '@/server/siteSettings';

export const dynamic = 'force-dynamic';

type CompareSearchParams = {
  ids?: string | string[];
};

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeCompareIds(rawIds: string): string[] {
  if (!rawIds.trim()) {
    return [];
  }

  // Decode up to two passes to tolerate legacy double-encoded links.
  const decoded = safeDecodeURIComponent(safeDecodeURIComponent(rawIds));
  return decoded
    .split(',')
    .map((value) => value.trim())
    .filter((value, index, all) => value.length > 0 && all.indexOf(value) === index)
    .slice(0, 4);
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value || '';
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams?: CompareSearchParams | Promise<CompareSearchParams>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const ids = normalizeCompareIds(firstValue(resolvedSearchParams?.ids));
  const path = ids.length > 0 ? `/compare?ids=${ids.join(',')}` : '/compare';
  const initialPayload = await fetchRemotePagePayload(path);
  const sessionUser = await getSessionUsername();
  const settings = await getSiteSettings();

  return (
    <StorefrontShell
      header={{ activePage: 'compare', sessionUser }}
      settings={settings}
      sessionUser={sessionUser}
      breadcrumbs={[{ name: 'Compare', url: '/compare' }]}
    >
      <RemoteHtmlPage path={path} initialPayload={initialPayload} />
    </StorefrontShell>
  );
}
