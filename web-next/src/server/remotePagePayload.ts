import { cookies } from 'next/headers';
import { API_URL } from '@/config';
import type { RemoteHtmlPayload } from '@/components/ejs-partials/types';

function isExecutableScriptType(typeValue: string): boolean {
  const scriptType = typeValue.trim().toLowerCase();
  return (
    scriptType === '' ||
    scriptType === 'text/javascript' ||
    scriptType === 'application/javascript' ||
    scriptType === 'module'
  );
}

function stripExecutableScripts(html: string): string {
  return html.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (fullMatch, attrs: string) => {
    const typeMatch = (attrs || '').match(/type=["']([^"']+)["']/i);
    const scriptType = typeMatch?.[1] || '';
    return isExecutableScriptType(scriptType) ? '' : fullMatch;
  });
}

function extractBodyHtml(html: string): string {
  const matched = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return matched?.[1] || html;
}

function extractStyles(html: string): string[] {
  const styles: string[] = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null = styleRegex.exec(html);

  while (match) {
    const style = (match[1] || '').trim();
    if (style) styles.push(style);
    match = styleRegex.exec(html);
  }

  return styles;
}

function extractScripts(html: string): RemoteHtmlPayload['scripts'] {
  const scripts: RemoteHtmlPayload['scripts'] = [];
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = scriptRegex.exec(html);

  while (match) {
    const attrs = match[1] || '';
    const content = (match[2] || '').trim();
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
    const scriptType = (typeMatch?.[1] || '').trim().toLowerCase();

    const isExecutableJs = isExecutableScriptType(scriptType);

    if (!isExecutableJs) {
      match = scriptRegex.exec(html);
      continue;
    }

    if (srcMatch?.[1]) {
      scripts.push({ src: srcMatch[1], type: scriptType || undefined });
    } else if (content) {
      scripts.push({ text: content, type: scriptType || undefined });
    }

    match = scriptRegex.exec(html);
  }

  return scripts;
}

export async function fetchRemotePagePayload(path: string): Promise<RemoteHtmlPayload> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const response = await fetch(`${API_URL}${path}`, {
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });

    const html = await response.text();

    return {
      bodyHtml: stripExecutableScripts(extractBodyHtml(html)),
      styles: extractStyles(html),
      scripts: extractScripts(html),
    };
  } catch {
    return {
      bodyHtml: '<section class="section-p1"><h2>Failed to load page.</h2></section>',
      styles: [],
      scripts: [],
    };
  }
}
