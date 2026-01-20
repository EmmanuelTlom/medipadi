# MediPadi Platform Documentation

## Overview

MediPadi is a comprehensive healthcare platform that connects patients with healthcare providers through a prepaid health micro-cover system. The platform supports multiple user roles and provides features for managing subscriptions, appointments, and claims.

## User Roles

### 1. Patient (Member)

- **Registration**: Patients can sign up and create their profile
- **Digital Membership ID**: Each patient receives a unique membership ID with QR code
- **Credits System**: Patients purchase credits to book appointments (2 credits per consultation)
- **Appointment Booking**: Browse doctors by specialty and book video consultations
- **Membership Dashboard**: View membership status, credits, and renewal reminders

### 2. Doctor (Provider)

- **Profile Setup**: Doctors complete onboarding with specialty, experience, and credentials
- **Verification**: Admin verifies doctor credentials before activation
- **Availability Management**: Set weekly availability slots for appointments
- **Earnings Tracking**: View credits earned from completed appointments
- **Payout System**: Request payouts ($8 per credit, with $2 platform fee)
- **Appointments Management**: View, manage, and complete appointments

### 3. Agent

- **Wallet Funding**: Agents deposit funds into their wallet
- **Assisted Registration**: Register members and pay subscriptions on their behalf
- **Member Management**: Track registered members and their status

### 4. Provider (Clinic/Pharmacy)

- **Member Verification**: Verify members using QR code or membership ID
- **Claim Submission**: Submit claims for services provided to members
- **Claims Tracking**: Monitor claim approval status

### 5. Admin

- **Doctor Verification**: Review and approve/reject doctor applications
- **Doctor Management**: View all verified doctors and their status
- **Payout Processing**: Review and approve payout requests from doctors
- **Member Management**: View all registered members and their status
- **Agent Management**: Monitor agents and their wallet balances
- **Dashboard Statistics**: View platform-wide metrics and reports

## Core Features

### Credits System

- **Free Plan**: 0 credits (sign-up bonus may apply)
- **Standard Plan**: 10 credits per month
- **Premium Plan**: 24 credits per month
- **Credits never expire**: Use them whenever needed
- **Each consultation costs 2 credits**

### Appointment Flow

1. Patient selects a doctor by specialty
2. Patient books an available time slot (costs 2 credits)
3. Doctor receives appointment notification
4. At appointment time, both join video consultation
5. Doctor marks appointment as completed
6. Doctor earns credits (can request payout later)

### Payment Integration

- Stripe integration for card payments
- Support for mobile money (implementation ready)
- USSD support (implementation ready)
- POS support (implementation ready)

### Notifications System

- Email notifications for appointments, renewals, and claims
- SMS notifications via Twilio
- WhatsApp notifications (using Twilio)

### Claims Processing

- Providers submit claims for member services
- Admin reviews and approves/rejects claims
- Members receive notifications of claim status

## Database Schema

### User Model

- Supports multiple roles: PATIENT, DOCTOR, ADMIN, AGENT, PROVIDER
- Stores credits, wallet balance, membership ID
- Tracks verification status for doctors
- Includes specialty and experience for doctors

### Appointment Model

- Links patient and doctor
- Stores video session details (Vonage integration)
- Tracks appointment status (SCHEDULED, COMPLETED, CANCELLED)

### Payout Model

- Tracks doctor payout requests
- Calculates platform fee and net amount
- Stores PayPal email for payments
- Status: PROCESSING or PROCESSED

### Claim Model

- Tracks claims submitted by providers
- Status: PENDING, APPROVED, REJECTED
- Links to member for verification

## Technical Stack

- **Framework**: Next.js 16.1.3
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **UI**: Tailwind CSS with Radix UI components
- **Video**: Vonage Video API
- **Payments**: Stripe
- **Notifications**: Nodemailer (email), Twilio (SMS/WhatsApp)
- **QR Codes**: qrcode library

## Environment Variables Required

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

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email (Nodemailer)
EMAIL_USER=
EMAIL_PASS=

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Run development server
pnpm dev
```

### Initial Setup

1. Create an admin user by manually updating the database
2. Admin logs in and verifies doctors
3. Patients can sign up and purchase credits
4. Agents can be created and funded with wallet balance
5. Providers can be registered to submit claims

## API Routes

### Appointments

- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get user appointments
- `PATCH /api/appointments/:id` - Update appointment status

### Payments

- `POST /api/create-checkout-session` - Create Stripe payment session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Video

- `POST /api/video/session` - Create video session
- `POST /api/video/token` - Generate video token

## Support

For technical support or questions, contact:

- Email: support@medipadi.com
- Technical Team: dev@medipadi.com

## Training Resources

### For Admins

- Review doctor applications thoroughly
- Check credentials before approval
- Monitor payout requests for fraud
- Generate weekly/monthly reports

### For Doctors

- Keep availability up to date
- Complete appointments on time
- Add detailed notes for each consultation
- Request payouts when credits accumulate

### For Agents

- Verify member information before registration
- Maintain adequate wallet balance
- Track member subscriptions and renewals
- Provide excellent customer service

### For Providers

- Verify members using QR code scanner
- Submit claims promptly with accurate information
- Track claim status regularly
- Report any issues to admin

## Troubleshooting

### Common Issues

**Credits not allocated**

- Check subscription plan in Clerk
- Verify lastCreditAllocation date
- Ensure monthly allocation logic is running

**Video call not working**

- Verify Vonage credentials
- Check network connectivity
- Ensure browser permissions for camera/microphone

**Payment failed**

- Verify Stripe configuration
- Check payment method validity
- Review Stripe logs for errors

**Email/SMS not sent**

- Verify email credentials (Nodemailer)
- Check Twilio account balance
- Ensure phone numbers are in correct format

## Future Enhancements

### Phase 2 Features

- Referral & rewards system
- Advanced analytics dashboard
- Push notifications & in-app messaging
- Integration with 3rd-party services (insurance, telco, banking)
- Loyalty programs & discounts
- Expanded payment gateways
- Corporate website
- Android/iOS mobile apps

## Security Best Practices

1. **User Authentication**: All routes are protected with Clerk authentication
2. **Role-Based Access**: Middleware checks user roles before granting access
3. **Data Validation**: Server-side validation for all user inputs
4. **Payment Security**: Stripe handles all payment processing securely
5. **API Protection**: Server actions validate user permissions
6. **Database Security**: Prisma provides SQL injection protection

## Maintenance

### Regular Tasks

- Monitor database performance
- Review error logs weekly
- Update dependencies monthly
- Backup database daily
- Monitor API usage and costs
- Review user feedback

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Contact & Support

For any questions or support needs, please contact the MediPadi development team.
