'use client';

import { useEffect } from 'react';

export default function TawkTo() {
  useEffect(() => {
    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6a217c898705f01c350961aa/1jq9csutc';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0?.parentNode?.insertBefore(s1, s0);
    return () => { s1.remove(); };
  }, []);

  return null;
}
