import { PageNumberPaginationMeta } from "prisma-extension-pagination";
import { alova } from "@/lib/alova";

export interface DoctorAppointment {
    id: string;
    doctorId: string;
    patientId: string;
    startTime: string;
    endTime: string;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    patientDescription?: string;
    diagnosis?: string;
    prescription?: string;
    doctorNotes?: string;
    videoRoomId?: string;
    createdAt: string;
    updatedAt: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        imageUrl?: string;
    };
}

export const getDoctorAppointments =
    (status?: "SCHEDULED" | "COMPLETED" | "CANCELLED") => (
        page: number = 1,
        limit: number = 10
    ) => {
        const params: any = { page, limit };
        if (status) {
            params.status = status;
        }

        return alova.Get<{
            data: DoctorAppointment[];
            meta: PageNumberPaginationMeta<true>;
        }>("/api/doctor/appointments", {
            params,
            name: "get-doctor-appointments",
            hitSource: ["book-appointment", "cancel-appointment", "complete-appointment"],
        });
    };
