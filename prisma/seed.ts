import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const alt = async () => {
    // Create subscription plans first
    console.log('Creating subscription plans...');

    const monthlyPlan = await prisma.subscriptionPlan.upsert({
        where: { slug: 'monthly' },
        update: {},
        create: {
            name: 'Monthly Plan',
            slug: 'monthly',
            description: 'Monthly subscription with 10 credits',
            price: 20.00,
            credits: 10,
            duration: 1,
            isActive: true,
        },
    });

    const yearlyPlan = await prisma.subscriptionPlan.upsert({
        where: { slug: 'yearly' },
        update: {},
        create: {
            name: 'Yearly Plan',
            slug: 'yearly',
            description: 'Yearly subscription with 120 credits',
            price: 200.00,
            credits: 120,
            duration: 12,
            isActive: true,
        },
    });

    console.log(`✓ Created ${monthlyPlan.name} and ${yearlyPlan.name}`);

    const makeUsers = (count: number) => Array.from({ length: count }).map(
        () => (['ADMIN', 'AGENT', 'PROVIDER', 'DOCTOR', 'PATIENT'] as const).map(role => {
            const username = faker.internet
                .username()
                .replace(/[^a-zA-Z0-9_-]/g, '')
                .toLowerCase();

            return {
                role,
                username,
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: username + '+clerk_test@medipadi.com',
                phoneNumber: faker.phone.number({ style: 'national' }),
                clerkUserId: faker.string.uuid(),
                verificationStatus: role === 'DOCTOR' ? faker.helpers.arrayElement([
                    'PENDING', 'VERIFIED', 'REJECTED'
                ]) : null,
                specialty: role === 'DOCTOR' ? faker.helpers.arrayElement([
                    'Cardiology', 'Dermatology', 'Pediatrics', 'General Medicine', 'Orthopedics'
                ]) : null,
                experience: faker.number.int({ min: 0, max: 40 }),
                description: faker.lorem.sentence(),
                membershipId: 'MED' + faker.number.int({ min: 1705000004, max: 1705999999 }),
                subscriptionEnd: role === 'PATIENT' ? faker.date.soon({ days: 365 }) : null,
                walletBalance: role === 'AGENT' ? parseFloat(faker.finance.amount({ min: 0, max: 10000 })) : 0,
                credits: faker.number.int({ min: 0, max: 100 }),
            }
        })).flat();

    const slicedUsers = makeUsers(15);

    const users = (await Promise.all(slicedUsers.map(async (user) => {
        const response = await fetch(
            `http://localhost:3000/api/prisma/seed/users`,
            {
                method: 'POST',
                body: JSON.stringify({
                    emailAddress: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    password: 'PassW@D1234',
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.json())
            .catch(err => {
                console.error('Error seeding users:', err)
                return null;
            });

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (response?.data) {
            return { ...user, clerkUserId: response.data.id }
        }
        console.error('Error seeding users:', response.error)
        return null;
    }))).filter(u => u !== null);

    let counts = {
        appointments: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        payouts: 0,
        availabilities: 0,
        creditTransactions: 0
    };

    // Sort users based on roles
    users.sort((a, b) => {
        const roleOrder = ['ADMIN', 'AGENT', 'PROVIDER', 'DOCTOR', 'PATIENT'];
        return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    });

    for (const create of users) {
        delete create.username;
        const user = await prisma.user.upsert({
            where: { email: create.email },
            update: {},
            create,
        });
        Object.assign(create, { id: user.id });

        if (user.role === 'DOCTOR') {
            console.log('Creating Payouts...');
            await prisma.payout.upsert({
                where: { id: `payout-${user.id}` },
                update: {},
                create: {
                    id: `payout-${user.id}`,
                    doctorId: user.id,
                    amount: parseFloat(faker.finance.amount({ min: 0, max: 10000 })),
                    credits: faker.number.int({ min: 0, max: 100 }),
                    platformFee: parseFloat(faker.finance.amount({ min: 0, max: 1000 })),
                    netAmount: parseFloat(faker.finance.amount({ min: 0, max: 1000 })),
                    paypalEmail: user.email,
                    status: faker.helpers.arrayElement(['PROCESSING', 'PROCESSED']),
                },
            });

            counts.payouts += 1;

            console.log('Creating doctor weekly availability...');
            // Create weekly availability schedules
            // Monday to Friday: 9:00 AM - 5:00 PM
            // Saturday: 9:00 AM - 1:00 PM
            // Sunday: Off
            const weeklySchedules = [
                { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true }, // Monday
                { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true }, // Tuesday
                { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true }, // Wednesday
                { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true }, // Thursday
                { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true }, // Friday
                { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isActive: faker.datatype.boolean() }, // Saturday (random)
            ];

            for (const schedule of weeklySchedules) {
                await prisma.weeklyAvailability.upsert({
                    where: {
                        id: `${user.id}-day-${schedule.dayOfWeek}`,
                    },
                    update: {},
                    create: {
                        id: `${user.id}-day-${schedule.dayOfWeek}`,
                        doctorId: user.id,
                        dayOfWeek: schedule.dayOfWeek,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        isActive: schedule.isActive,
                    },
                });

                counts.availabilities += 1;
            }
        }

        if (user.role === 'PATIENT') {
            let i = 0;
            console.log('Creating Appointments...');
            while (i < faker.number.int({ min: 1, max: 5 })) {
                const startTime = faker.date.soon({ days: 30 });
                const endTime = new Date(startTime);
                endTime.setHours(endTime.getHours() + 1);

                await prisma.appointment.upsert({
                    where: { id: `appt-${user.id}-${i}` },
                    update: {},
                    create: {
                        id: `appt-${user.id}-${i}`,
                        patientId: user.id,
                        doctorId: await prisma.user.findFirst({
                            where: { role: 'DOCTOR' },
                            select: { id: true },
                            skip: faker.number.int({ min: 0, max: 1 }),
                        }).then(doc => doc.id),
                        startTime,
                        endTime,
                        status: faker.helpers.arrayElement([
                            'SCHEDULED', 'COMPLETED', 'CANCELLED'
                        ]),
                        patientDescription: faker.lorem.sentence(),
                    },
                });

                counts.appointments += 1;
                i++;
            }

            console.log('Creating credit transactions...');
            let iii = 0;
            while (iii < faker.number.int({ min: 1, max: 5 })) {
                await prisma.creditTransaction.create({
                    data: {
                        userId: user.id,
                        amount: parseFloat(faker.finance.amount({ min: -5, max: 200 })),
                        type: faker.helpers.arrayElement([
                            'CREDIT_PURCHASE', 'APPOINTMENT_DEDUCTION'
                        ]),
                        packageId: 'pkg-10',
                    },
                });
                counts.creditTransactions += 1;
                iii++;
            }

            console.log('Creating Claims...');
            let ii = 0;
            while (ii < faker.number.int({ min: 1, max: 3 })) {
                const claim = await prisma.claim.upsert({
                    where: { id: `claim-${user.id}-${i}` },
                    update: {},
                    create: {
                        id: `claim-${user.id}-${i}`,
                        memberId: user.id,
                        providerId: await prisma.user.findFirst({
                            where: { role: 'PROVIDER' },
                            select: { id: true },
                            skip: faker.number.int({ min: 0, max: 1 }),
                        }).then(prov => prov.id),
                        amount: parseFloat(faker.finance.amount({ min: 50, max: 1000 })),
                        description: faker.lorem.sentence(),
                        serviceDate: faker.date.past({ years: 1 }),
                        status: faker.helpers.arrayElement([
                            'PENDING', 'APPROVED', 'REJECTED'
                        ]),
                        adminNotes: faker.lorem.sentence(),
                    },
                });

                counts.pendingClaims += claim.status === 'PENDING' ? 1 : 0;
                counts.approvedClaims += claim.status === 'APPROVED' ? 1 : 0;
                counts.rejectedClaims += claim.status === 'REJECTED' ? 1 : 0;

                ii++;
            }
        }
    }

    console.log('\nDatabase seeded successfully!');
    console.log('\nTest Users Created:');
    for (const user of users) {
        if (user.role === 'DOCTOR') {
            console.log(`├─ Doctor (${user.verificationStatus}, ${user.specialty}): ${user.email} (${user.credits} credits)`);
        } else if (user.role === 'PATIENT') {
            console.log(`└─ Patient (${user.subscriptionEnd && user.subscriptionEnd > new Date() ? 'Active' : 'Expired'}, ID: ${user.membershipId}): ${user.email}`);
        } else if (user.role === 'ADMIN') {
            console.log(`├─ Admin: ${user.email}`);
        } else if (user.role === 'AGENT') {
            console.log(`├─ Agent: ${user.email} (Wallet: $${user.walletBalance})`);
        } else if (user.role === 'PROVIDER') {
            console.log(`├─ Provider: ${user.email}`);
        }
    }

    console.log('\nSample Data Created:');
    console.log(`├─ ${users.length} Users`);
    console.log(`├─ ${counts.appointments} Scheduled Appointments`);
    console.log(`├─ ${counts.pendingClaims + counts.approvedClaims + counts.rejectedClaims} Claims (${counts.pendingClaims} Pending, ${counts.approvedClaims} Approved, ${counts.rejectedClaims} Rejected)`);
    console.log(`├─ ${counts.payouts} Pending Payouts`);
    console.log(`├─ ${counts.availabilities} Weekly Availability Schedules`);
    console.log(`└─ ${counts.creditTransactions} Credit Transactions`);

}

alt().then(() => {
    // console.log('Database seed completed.');
    process.exit(0);
}).catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});

// main()
//     .catch((e) => {
//         console.error('Error seeding database:', e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
