'use client'


import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import HomePageDesktop from './desktop';

export default function HomePage() {
  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 768px)", });//These values will probally change later, the ones here rn are for testing
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
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
    <>
      {/* {isDesktopOrLaptop && <HomePageDesktop/>}
      {isMobile && <p>Mobile view</p>}
      Leaving this commented out because the default works fine on small resolutions for the moment
      */}
      <HomePageDesktop/>
    </>
  );
}
