import { cookies } from 'next/headers';
import { API_URL } from '@/src/config';

function extractUsernameFromProfileHtml(html: string): string | null {
  const headingMatch = html.match(/Welcome,\s*([^!<\n]+)!/i);
  if (headingMatch?.[1]) {
    return headingMatch[1].trim();
  }

  const logoutMatch = html.match(/Logout\s*\(([^)]+)\)/i);
  if (logoutMatch?.[1]) {
    return logoutMatch[1].trim();
  }

  return null;
}

export async function getSessionUsername(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    if (!cookieHeader) {
      return null;
    }

    const response = await fetch(`${API_URL}/profile`, {
      cache: 'no-store',
      headers: { cookie: cookieHeader },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return extractUsernameFromProfileHtml(html);
  } catch {
    return null;
  }
}
