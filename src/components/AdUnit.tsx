"use client";
import { useEffect, useRef } from 'react';

export default function AdUnit({ zoneId }: { zoneId: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This script tells the network WHERE to show the ad
    const atOptions = {
      'key': zoneId,
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };

    if (adRef.current && !adRef.current.firstChild) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;

      adRef.current.append(configScript);
      adRef.current.append(script);
    }
  }, [zoneId]);

  return (
    <div className="flex justify-center my-8 min-h-[90px] w-full">
      <div ref={adRef}></div>
    </div>
  );
}