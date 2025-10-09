'use client'


import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import HomePageDesktop from './desktop';

export default function HomePage() {
  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 500px)", });//These values will probally change later, the ones here rn are for testing
  const isMobile = useMediaQuery({ query: "(max-width: 500px)" });
  const isPortrait = useMediaQuery({ query: "(orientation: portrait)" });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Avoid rendering mismatched HTML before hydration
    return null
  }

  return (
    <div>
      {isDesktopOrLaptop && <HomePageDesktop/>}
      {isMobile && <p>Mobile view</p>}
    </div>
  );
}
