'use client';

import { useEffect } from 'react';

export default function ProfileEnhancer() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const bindProfileInteractions = () => {
      const tabs = Array.from(document.querySelectorAll('.profile-tab')) as HTMLElement[];
      const panels = Array.from(document.querySelectorAll('.tab-content')) as HTMLElement[];

      if (!tabs.length || !panels.length) {
        return false;
      }

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

      cleanup = () => {
        tabClickHandlers.forEach(({ tab, onClick }) => {
          tab.removeEventListener('click', onClick);
        });
        profilePhotoInput?.removeEventListener('change', onPhotoChange);
      };

      return true;
    };

    if (bindProfileInteractions()) {
      return () => cleanup?.();
    }

    const observer = new MutationObserver(() => {
      if (bindProfileInteractions()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, []);

  return null;
}
