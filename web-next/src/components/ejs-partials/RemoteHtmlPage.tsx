'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import type { RemoteHtmlPayload } from './types';

type Props = {
  path: string;
  credentials?: RequestCredentials;
  initialPayload?: RemoteHtmlPayload;
  executeScripts?: boolean;
};

function parseRemoteDocument(html: string) {
  const parser = new DOMParser();
  const documentElement = parser.parseFromString(html, 'text/html');

  // STRIP EJS HEADER/FOOTER/NAVBAR/OVERLAYS
  const toRemove = [
    'header', 'footer',
    'div#header', 'ul#navbar',
    'div#drawer-overlay',
    '.help-widget', '#help-widget'
  ];
  toRemove.forEach(sel => {
    documentElement.querySelectorAll(sel).forEach(el => el.remove());
  });

  const styles = Array.from(documentElement.querySelectorAll('style'))
    .map((style) => style.textContent || '')
    .filter((style) => style.trim().length > 0);
  const isExecutableScriptType = (typeValue: string) => {
    const scriptType = typeValue.trim().toLowerCase();
    return (
      scriptType === '' ||
      scriptType === 'text/javascript' ||
      scriptType === 'application/javascript' ||
      scriptType === 'module'
    );
  };

  let bodyHtml = documentElement.body.innerHTML.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (fullMatch, attrs: string) => {
    const typeMatch = (attrs || '').match(/type=["']([^"']+)["']/i);
    const scriptType = typeMatch?.[1] || '';
    return isExecutableScriptType(scriptType) ? '' : fullMatch;
  });

  let cleanHtml = bodyHtml;
  cleanHtml = cleanHtml.replace(/<header\b[\s\S]*?<\/header>/gi, '');
  cleanHtml = cleanHtml.replace(/<footer\b[\s\S]*?<\/footer>/gi, '');
  cleanHtml = cleanHtml.replace(/<div[^>]+id=["']header["'][\s\S]*?<\/div>/gi, '');
  cleanHtml = cleanHtml.replace(/<ul[^>]+id=["']navbar["'][\s\S]*?<\/ul>/gi, '');
  cleanHtml = cleanHtml.replace(/<div[^>]+id=["']drawer-overlay["'][^>]*>[\s\S]*?<\/div>/gi, '');

  cleanHtml = cleanHtml.replace(/src="\/img\//g, `src="${API_URL}/img/`);
  cleanHtml = cleanHtml.replace(/src="\/uploads\//g, `src="${API_URL}/uploads/`);

  return {
    bodyHtml: cleanHtml,
    styles,
    scripts: Array.from(documentElement.querySelectorAll('script'))
      .map((scriptNode) => ({
        src: scriptNode.src || undefined,
        text: scriptNode.textContent || undefined,
        type: (scriptNode.getAttribute('type') || '').trim().toLowerCase() || undefined,
      }))
      .filter((scriptNode) => {
        const scriptType = scriptNode.type || '';
        return isExecutableScriptType(scriptType);
      }),
    documentElement,
  };
}

export default function RemoteHtmlPage({ path, credentials = 'include', initialPayload, executeScripts = true }: Props) {
  const [html, setHtml] = useState<string>(initialPayload?.bodyHtml || '');
  const [styles, setStyles] = useState<string[]>(initialPayload?.styles || []);
  const [scripts, setScripts] = useState<Array<{ src?: string; text?: string; type?: string }>>(initialPayload?.scripts || []);

  useEffect(() => {
    if (initialPayload) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const separator = path.includes('?') ? '&' : '?';
        const response = await fetch(`${API_URL}${path}${separator}bridge=true`, { 
          credentials,
          headers: {
            'x-nextjs-bridge': 'true'
          }
        });
        const text = await response.text();
        if (cancelled) return;
        const parsed = parseRemoteDocument(text);
        setHtml(parsed.bodyHtml);
        setStyles(parsed.styles);
        setScripts(parsed.scripts);
      } catch (error) {
        console.error('Remote page load error:', error);
        if (!cancelled) {
          setHtml('<section class="section-p1"><h2>Failed to load page.</h2></section>');
          setStyles([]);
          setScripts([]);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [path, credentials, initialPayload]);

  useEffect(() => {
    if (!html || scripts.length === 0 || !executeScripts) return;

    const externalScriptElements: HTMLScriptElement[] = [];
    const timer = window.setTimeout(() => {
      console.log(`[RemoteHtmlPage] Executing ${scripts.length} scripts for ${path}`);
      scripts.forEach((scriptNode, idx) => {
        const scriptElement = document.createElement('script');
        
        if (scriptNode.src) {
          scriptElement.src = scriptNode.src;
          scriptElement.async = false;
          externalScriptElements.push(scriptElement);
        } else {
          const scriptText = scriptNode.text || '';
          // Wrapped in a try-catch to avoid breaking the whole page on a minor script error
          // Added a filter for common null-reference errors in legacy scripts
          scriptElement.text = `(function(){
            try {
              ${scriptText}
            } catch(error) {
              const msg = String((error && error.message) || error || '');
              const ignore = msg.includes("reading 'addEventListener'") || 
                            msg.includes("properties of null") || 
                            msg.includes("properties of undefined");
              if (!ignore) {
                console.error('Remote inline script error [${idx}]:', error);
              }
            }
          })();`;
        }
        
        document.body.appendChild(scriptElement);
        // Only remove inline scripts to keep the body clean; external ones stay for loading
        if (!scriptNode.src) {
          document.body.removeChild(scriptElement);
        }
      });
    }, 50); // Increased delay slightly to ensure DOM is settled

    return () => {
      window.clearTimeout(timer);
      externalScriptElements.forEach((scriptElement) => {
        scriptElement.remove();
      });
    };
  }, [html, scripts, executeScripts]);

  useEffect(() => {
    if (path !== '/profile' || !html) return;

    const tabs = Array.from(document.querySelectorAll('.profile-tab')) as HTMLElement[];
    const panels = Array.from(document.querySelectorAll('.tab-content')) as HTMLElement[];

    if (!tabs.length || !panels.length) return;

    const activateTab = (tabName: string) => {
      tabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
      });

      panels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === tabName);
      });
    };

    const tabClickHandlers = tabs.map((tab) => {
      const onClick = () => {
        const tabName = tab.dataset.tab;
        if (!tabName) return;
        activateTab(tabName);
        window.location.hash = tabName;
      };
      tab.addEventListener('click', onClick);
      return { tab, onClick };
    });

    const hashName = window.location.hash.replace('#', '');
    if (hashName) {
      activateTab(hashName);
    }

    const profilePhotoInput = document.getElementById('profilePhoto') as HTMLInputElement | null;
    const photoForm = document.getElementById('photoForm') as HTMLFormElement | null;
    const onPhotoChange = () => {
      if (profilePhotoInput?.files?.[0] && photoForm) {
        photoForm.submit();
      }
    };

    profilePhotoInput?.addEventListener('change', onPhotoChange);

    return () => {
      tabClickHandlers.forEach(({ tab, onClick }) => {
        tab.removeEventListener('click', onClick);
      });
      profilePhotoInput?.removeEventListener('change', onPhotoChange);
    };
  }, [path, html]);

  return (
    <>
      {styles.map((style, index) => (
        <style key={`${path}-style-${index}`} dangerouslySetInnerHTML={{ __html: style }} />
      ))}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
