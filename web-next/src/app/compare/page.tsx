import RemoteHtmlPage from '@/components/ejs-partials/RemoteHtmlPage';
import { fetchRemotePagePayload } from '@/server/remotePagePayload';

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

  return <RemoteHtmlPage path={path} initialPayload={initialPayload} />;
}
