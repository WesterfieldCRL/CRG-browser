'use client'
import { useEffect } from 'react';

export default function LoadingScreenDismiss() {
  useEffect(() => {
    const hide = () => {
      const el = document.getElementById('loading-screen');
      if (el) {
        try { el.style.opacity = '0'; } catch {}
        window.setTimeout(() => { try { el.remove(); } catch {} }, 300);
      }
    };
    // run immediately and on load
    hide();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', hide, { once: true });
      return () => window.removeEventListener('load', hide);
    }
  }, []);
  return null;
}
