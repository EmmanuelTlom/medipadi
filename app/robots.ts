import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/doctors', '/pricing', '/privacy'],
        disallow: [
          '/admin',
          '/agent',
          '/appointments',
          '/doctor',
          '/member',
          '/onboarding',
          '/provider',
          '/video-call',
          '/api/',
          '/sign-in',
          '/sign-up',
        ],
      },
    ],
    sitemap: 'https://medisure.africa/sitemap.xml',
  };
}
