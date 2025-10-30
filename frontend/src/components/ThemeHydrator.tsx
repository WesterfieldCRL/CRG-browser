'use client';

import { useEffect } from 'react';

export default function ThemeHydrator() {
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null; // 'light' | 'dark' | null
    const systemDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const theme = saved ?? (systemDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return null;
}
