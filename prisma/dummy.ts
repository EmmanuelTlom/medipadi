import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const alt = async () => {
    const types = ['DOCTOR', 'PATIENT', 'ADMIN', 'AGENT', 'PROVIDER'] as const
    const users = []
    for (const type of types) {
        const user = await prisma.user.findFirst({
            where: {
                role: type,
                weeklyAvailability: type === 'DOCTOR' ? { some: {} } : undefined,
                verificationStatus: type === 'DOCTOR' ? 'VERIFIED' : undefined,
                patientAppointments: type === 'PATIENT' ? { some: {} } : undefined,
                memberClaims: type === 'PATIENT' ? { some: {} } : undefined,
                subscriptionEnd: type === 'PATIENT' ? { gt: new Date() } : undefined,
                registeredMembers: type === 'AGENT' ? { some: {} } : undefined,
                walletBalance: type === 'AGENT' ? { gt: 0 } : undefined,
                credits: { gt: 0 },
                experience: { gt: 0 }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                membershipId: true,
            },
        })

        if (!user) {
            users.push({
                Role: type,
                Name: 'N/A',
                Email: 'N/A',
                ID: 'N/A',
                Password: 'N/A',
                OTP: 'N/A',
            })

            continue;
        };

        users.push({
            Role: type,
            Name: user.firstName + ' ' + user.lastName,
            Email: user.email,
            ID: user.membershipId,
            Password: 'PassW@D1234',
            OTP: 424242,
        });
    }
    return users
}

alt().then((users) => {
    console.table(users);
    process.exit(0);
}).catch((e) => {
    console.error('Error Loading Dummy Data:', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
}); 