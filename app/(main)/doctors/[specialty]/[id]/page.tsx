export async function generateMetadata({ params }: { params: Promise<{ id: string; specialty: string }> }) {
  const { id, specialty } = await params;
  try {
    const { doctor } = await getDoctorById(id);
    const name = [doctor.firstName, doctor.lastName].filter(Boolean).join(' ') || doctor.name || 'Doctor';
    const spec = doctor.specialty ?? decodeURIComponent(specialty);
    return {
      title: `Dr. ${name} – ${spec}`,
      description: `Book an appointment with Dr. ${name}, a verified ${spec} specialist on MediPadi. Quality healthcare in Nigeria.`,
      alternates: {
        canonical: `https://medisure.africa/doctors/${encodeURIComponent(spec)}/${id}`,
      },
      openGraph: {
        title: `Dr. ${name} – ${spec} | MediPadi`,
        description: `Verified ${spec} specialist. Book online or in-clinic on MediPadi.`,
        url: `https://medisure.africa/doctors/${encodeURIComponent(spec)}/${id}`,
        ...(doctor.imageUrl && {
          images: [{ url: doctor.imageUrl, width: 400, height: 400, alt: `Dr. ${name}` }],
        }),
      },
    };
  } catch {
    return { title: 'Doctor Profile' };
  }
}

import { getAvailableTimeSlots, getDoctorById } from '@/actions/appointments';

import { DoctorProfile } from './_components/doctor-profile';
import { redirect } from 'next/navigation';

export default async function DoctorProfilePage({ params }) {
  const { id } = await params;

  try {
    // Fetch doctor data and available slots in parallel
    const [doctorData, slotsData] = await Promise.all([
      getDoctorById(id),
      getAvailableTimeSlots(id),
    ]);

    return (
      <DoctorProfile
        doctor={doctorData.doctor}
        availableDays={slotsData.days || []}
      />
    );
  } catch (error) {
    console.error('Error loading doctor profile:', error);
    redirect('/doctors');
  }
}
