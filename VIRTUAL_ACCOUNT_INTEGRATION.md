# Paystack Virtual Account Integration

This feature allows members to request and receive a dedicated Paystack virtual account. Payments made to these virtual accounts are automatically processed to either:

1. Credit the user's wallet, OR
2. Automatically subscribe the user to a plan if the payment amount exactly matches a subscription plan price

## Payment Processing Logic

When a payment is received via the virtual account webhook:

1. **Identify User**: Find user by `virtualAccountNumber`
2. **Check for Duplicate**: Verify transaction hasn't been processed
3. **Amount Matching**:
   - Query all active subscription plans
   - If payment amount exactly matches a plan price AND user is not on that plan:
     - Auto-subscribe user to the plan
     - Allocate plan credits
     - Set subscription end date
     - Create `SUBSCRIPTION` transaction record
   - Otherwise:
     - Add amount to user's wallet
     - Create wallet transaction record
     - Create `WALLET_FUNDING` transaction record

## Environment Variables Required

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
```

## Webhook Configuration

Configure the webhook URL in your Paystack dashboard:

- **URL:** `https://yourdomain.com/api/webhooks/paystack`
- **Events to Subscribe:**
  - `charge.success`
  - `dedicatedaccount.assign.success`

## Testing

### Test Virtual Account Creation

1. Sign in as a PATIENT user
2. Call the `requestVirtualAccount()` action or API endpoint
3. Verify account details are returned and saved in database

### Test Webhook Processing

1. Use Paystack's webhook testing tool in the dashboard
2. Send a test `charge.success` event with:
   - `channel: "dedicated_nuban"`
   - `authorization.account_number` matching a user's virtual account
   - `amount` either matching a plan price or not
3. Verify:
   - For matching amounts: User is subscribed to the plan
   - For non-matching amounts: Wallet is credited

## Security

1. **Webhook Signature Verification**: All webhook requests are verified using HMAC SHA512
2. **Duplicate Prevention**: Transactions are checked via `serviceProvided` flag
3. **Role-Based Access**: Only PATIENT role can request virtual accounts
4. **Idempotency**: Multiple webhook calls for the same transaction are handled safely

## Bank Options

Current supported bank:

- **Wema Bank** (preferred_bank: 'wema-bank')
- **Titan Paystack** (preferred_bank: 'titan-paystack')

## Troubleshooting

### Virtual Account Not Created

- Check Paystack API credentials
- Verify user has email, firstName, lastName
- Check Paystack dashboard for errors

### Webhook Not Working

- Verify webhook URL is publicly accessible
- Check Paystack signature is being sent
- Review webhook logs in Paystack dashboard
- Check application logs for errors

### Payment Not Processing

- Verify transaction reference is unique
- Check user exists with matching virtual account number
- Review database transaction logs
- Check for duplicate processing via `serviceProvided` flag
