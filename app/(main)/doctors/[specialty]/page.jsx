export async function generateMetadata({ params }) {
  const specialty = decodeURIComponent((await params).specialty);
  return {
    title: `${specialty} Doctors in Nigeria`,
    description: `Find verified ${specialty} specialists on MediPadi. Book online or in-clinic appointments with trusted doctors near you in Nigeria.`,
    alternates: { canonical: `https://medisure.africa/doctors/${encodeURIComponent(specialty)}` },
    openGraph: {
      title: `${specialty} Doctors in Nigeria | MediPadi`,
      description: `Verified ${specialty} specialists available for consultations on MediPadi.`,
      url: `https://medisure.africa/doctors/${encodeURIComponent(specialty)}`,
    },
  };
}

import { redirect } from "next/navigation";
import { getDoctorsBySpecialty } from "@/actions/doctors-listing";
import { DoctorCard } from "../components/doctor-card";
import { PageHeader } from "@/components/page-header";

export default async function DoctorSpecialtyPage({ params }) {
  const { specialty } = await params;

  // Redirect to main doctors page if no specialty is provided
  if (!specialty) {
    redirect("/doctors");
  }

  // Fetch doctors by specialty
  const { doctors, error } = await getDoctorsBySpecialty(specialty);

  if (error) {
    console.error("Error fetching doctors:", error);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={specialty.split("%20").join(" ")}
        backLink="/doctors"
        backLabel="All Specialties"
      />

      {doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-white mb-2">
            No doctors available
          </h3>
          <p className="text-muted-foreground">
            There are currently no verified doctors in this specialty. Please
            check back later or choose another specialty.
          </p>
        </div>
      )}
    </div>
  );
}
