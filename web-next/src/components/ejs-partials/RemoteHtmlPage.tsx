'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/src/config';
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

  const bodyHtml = documentElement.body.innerHTML.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (fullMatch, attrs: string) => {
    const typeMatch = (attrs || '').match(/type=["']([^"']+)["']/i);
    const scriptType = typeMatch?.[1] || '';
    return isExecutableScriptType(scriptType) ? '' : fullMatch;
  });

  return {
    bodyHtml,
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
  const [scripts, setScripts] = useState<Array<{ src?: string; text?: string }>>(initialPayload?.scripts || []);

  useEffect(() => {
    if (initialPayload) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${API_URL}${path}`, { credentials });
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
      scripts.forEach((scriptNode) => {
        const scriptText = scriptNode.text || '';
        const scriptElement = document.createElement('script');

        if (scriptNode.src) {
          scriptElement.src = scriptNode.src;
          if (scriptNode.type === 'module') {
            scriptElement.type = 'module';
          }
          externalScriptElements.push(scriptElement);
        } else if (scriptText.trim()) {
          scriptElement.text = `(function(){try{${scriptText}}catch(error){const message=String((error&&error.message)||error||'');if(message.includes("Cannot read properties of null (reading 'addEventListener')")||message.includes('Cannot read properties of null')||message.includes('Cannot set properties of null')){return;}console.error('Remote inline script error:', error);}})();`;
        } else {
          return;
        }

        document.body.appendChild(scriptElement);
        if (!scriptNode.src) {
          document.body.removeChild(scriptElement);
        }
      });
    }, 0);

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
