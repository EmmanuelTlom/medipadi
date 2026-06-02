import { MetadataRoute } from 'next';
import { db } from '@/lib/prisma';

const BASE = 'https://medisure.africa';

// Mirrors lib/specialities.js without importing JSX icons
const SPECIALTIES = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Obstetrics & Gynecology', 'Oncology',
  'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Pulmonology', 'Radiology', 'Urology', 'Other',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const specialtyEntries: MetadataRoute.Sitemap = SPECIALTIES.map((s) => ({
    url: `${BASE}/doctors/${encodeURIComponent(s)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  let doctorEntries: MetadataRoute.Sitemap = [];
  try {
    const doctors = await db.user.findMany({
      where: { role: 'DOCTOR', verificationStatus: 'VERIFIED' },
      select: { id: true, specialty: true, updatedAt: true },
    });
    doctorEntries = doctors.map((d) => ({
      url: `${BASE}/doctors/${encodeURIComponent(d.specialty ?? 'General Medicine')}/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch {
    // Non-fatal — skip doctor entries if DB is unavailable during build
  }

  return [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/doctors`, lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    ...specialtyEntries,
    ...doctorEntries,
  ];
}
