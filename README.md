# MediPadi - Healthcare Platform

A comprehensive healthcare platform connecting patients with providers through a prepaid health micro-cover system.

## 📋 Features

### Core Modules

- **Patient/Member Module**: Registration, digital membership ID with QR code, credit-based appointments, renewal reminders
- **Doctor Module**: Profile verification, availability management, earnings tracking, payout system
- **Agent Module**: Wallet funding, assisted member registration
- **Provider Module**: Member verification via QR code, claim submission
- **Admin Module**: Full platform management, doctor verification, payout processing, statistics

### Key Features

- ✅ Video consultations (Vonage)
- ✅ Credit-based subscription system
- ✅ Digital membership IDs with QR codes
- ✅ Email/SMS/WhatsApp notifications
- ✅ Paystack payment integration
- ✅ Claims processing system
- ✅ Multi-role dashboard system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd medipadi
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**
   Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Vonage Video
NEXT_PUBLIC_VONAGE_APPLICATION_ID=
VONAGE_API_KEY=
VONAGE_API_SECRET=

# Paystack Payments
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Email Notifications
EMAIL_USER=
EMAIL_PASS=

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma migrate deploy
```

5. **Run the development server**

```bash
pnpm dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete platform documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Feature implementation details
- **[proposal.txt](./proposal.txt)** - Original project proposal

## 🏗️ Tech Stack

- **Framework**: Next.js 16.1.3
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS + Radix UI
- **Video**: Vonage Video API
- **Payments**: Stripe
- **Notifications**: Nodemailer + Twilio
- **QR Codes**: qrcode library

## 👥 User Roles

1. **Patient (PATIENT)** - Book appointments, manage credits, view membership ID
2. **Doctor (DOCTOR)** - Manage availability, conduct consultations, request payouts
3. **Admin (ADMIN)** - Verify doctors, approve payouts, view platform statistics
4. **Agent (AGENT)** - Register members, manage wallet for assisted payments
5. **Provider (PROVIDER)** - Verify members, submit claims for services

## 🔐 Security

- Role-based access control
- Server-side validation
- Secure payment processing via Stripe
- Protected API routes
- SQL injection protection via Prisma

## 📊 Database Schema

Key models:

- **User** - Multi-role user model with specialty, credits, wallet balance
- **Appointment** - Links patients and doctors with video session details
- **Payout** - Tracks doctor earnings and payment requests
- **Claim** - Provider claims for member services
- **Availability** - Doctor availability slots
- **CreditTransaction** - Credit allocation and deduction history

## 🛠️ Development Commands

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## 📝 License

This project is proprietary software developed for Medisure Care Services Ltd. (MediPadi).

## 🤝 Support

For support, email support@medipadi.com or contact the development team.
