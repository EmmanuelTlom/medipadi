# Quick Start Guide

## Initial Setup Steps

### 1. Database Migration ✅

Already completed! The following migration has been applied:

```
20260118234829_add_agent_provider_support
```

### 2. Environment Variables

Ensure you have the following environment variables configured in `.env.local`:

**Required for Core Functionality:**

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth (public)
- `CLERK_SECRET_KEY` - Clerk auth (secret)

**Required for Video Calls:**

- `NEXT_PUBLIC_VONAGE_APPLICATION_ID`
- `VONAGE_API_KEY`
- `VONAGE_API_SECRET`

**Required for Payments:**

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Optional (for notifications):**

- `EMAIL_USER` - Gmail for email notifications
- `EMAIL_PASS` - Gmail app password
- `TWILIO_ACCOUNT_SID` - Twilio SMS/WhatsApp
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### 3. Start the Development Server

```bash
pnpm dev
```

## Testing the New Features

### Admin Dashboard

1. Log in as an admin user
2. Navigate to `/admin`
3. Explore the new tabs:
   - **Members** - View all registered patients
   - **Agents** - View all agents and their wallet balances
   - **Reports** - View platform statistics

### Member Dashboard

1. Log in as a patient
2. Navigate to `/member` (or your profile page)
3. You should see:
   - Digital Membership ID
   - QR Code for verification
   - Credit balance
   - Renewal reminder (if credits are 0)
   - Last credit allocation date

### Agent Dashboard

1. Create a user with AGENT role (manually in database for now)
2. Log in as agent
3. Navigate to `/agent`
4. See wallet and member registration tabs

### Provider Dashboard

1. Create a user with PROVIDER role (manually in database for now)
2. Log in as provider
3. Navigate to `/provider`
4. See claims management tab

### Notifications (Optional - requires env vars)

The notification system is ready but requires:

1. Gmail credentials for email
2. Twilio account for SMS/WhatsApp

Test manually by calling:

```javascript
import { sendEmailNotification, sendSMSNotification } from '@/lib/server.utils';

// Send test email
await sendEmailNotification('test@example.com', 'Test Subject', 'Test message');

// Send test SMS
await sendSMSNotification('+1234567890', 'Test message');
```

### Payments

Test Stripe integration:

1. Go to `/pricing`
2. Click on a payment button
3. Complete checkout (use test card: 4242 4242 4242 4242)

### Claims

Test claim submission via API or create UI:

```javascript
import { submitClaim } from '@/actions/claims';

await submitClaim(providerId, memberId, 100.0);
```

## Database Updates

### New Fields on User Model

- `phoneNumber` - For SMS notifications
- `walletBalance` - For agent wallet (default: 0)
- `lastCreditAllocation` - Tracks when credits were last allocated
- `membershipId` - Unique membership ID for QR code

### New Roles Available

- `AGENT` - For healthcare agents
- `PROVIDER` - For clinics/pharmacies

### New Claim Model

Track claims submitted by providers for member services.

## Common Tasks

### Creating an Admin User

Manually update a user in the database:

```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'admin@example.com';
```

### Creating Test Users

1. Sign up normally through the app
2. Update role in database:

```sql
-- For Agent
UPDATE "User" SET role = 'AGENT' WHERE email = 'agent@example.com';

-- For Provider
UPDATE "User" SET role = 'PROVIDER' WHERE email = 'provider@example.com';
```

### Viewing Database

```bash
npx prisma studio
```

Opens Prisma Studio at http://localhost:5555

### Checking Migrations

```bash
npx prisma migrate status
```

### Resetting Database (Development Only)

```bash
npx prisma migrate reset
```

⚠️ This will delete all data!

## Features Ready for Use

### ✅ Fully Functional

- Patient registration and login
- Doctor onboarding and verification
- Appointment booking and video calls
- Credit system and payout requests
- Admin dashboard (existing features)

### ✅ New Features Ready

- Admin members list
- Admin agents list
- Admin statistics/reports
- Member dashboard with QR code
- Renewal reminders
- Database schema for claims
- Database schema for agents

### 🚧 Requires Additional Setup

- Email notifications (needs Gmail credentials)
- SMS notifications (needs Twilio account)
- Payment processing (needs Stripe setup)
- Agent wallet funding UI (backend ready, needs frontend)
- Provider claim submission UI (backend ready, needs frontend)

## Next Development Tasks

### High Priority

1. Complete Agent wallet funding UI
2. Complete Provider claim submission UI
3. Add QR code scanner for providers
4. Implement automated renewal reminders
5. Add email/SMS integration to appointment flow

### Medium Priority

1. Create corporate website
2. Build Android app
3. Add analytics dashboard
4. Implement referral system

### Low Priority

1. iOS app
2. Advanced reporting
3. Third-party integrations
4. Loyalty programs

## Troubleshooting

### Migration Issues

If you encounter migration issues:

```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Type Errors

Regenerate Prisma client:

```bash
npx prisma generate
```

### Server Not Starting

1. Check environment variables
2. Ensure database is running
3. Check for port conflicts (default: 3000)

### Cannot Access New Dashboards

1. Verify user role in database
2. Check if user is authenticated
3. Clear browser cache

## Resources

- **Full Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Original Proposal**: [proposal.txt](./proposal.txt)
- **Prisma Schema**: [prisma/schema.prisma](./prisma/schema.prisma)

## Support

For technical issues or questions:

- Review documentation files
- Check Prisma Studio for database issues
- Review browser console for client-side errors
- Check terminal for server-side errors

---

**Last Updated**: January 18, 2026
**Migration Version**: 20260118234829_add_agent_provider_support
