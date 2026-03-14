"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GhostAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Track Page View
    console.log(`📊 Analysis: User visited ${pathname}`);
    
    // 2. Track Ad Interaction (Simple version)
    const handleAdClick = () => {
      console.log(`💰 Revenue Event: Ad clicked on ${pathname}`);
      // If you have a real analytics backend later, send data here.
    };

    window.addEventListener('blur', () => {
      // When a user clicks an iframe (like an ad), the window loses focus
      if (document.activeElement?.tagName === 'IFRAME') {
        handleAdClick();
      }
    });
  }, [pathname]);

  return null;
}