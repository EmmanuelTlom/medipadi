import { NextRequest, NextResponse } from 'next/server'
import { DedicatedAccountData } from 'paystack-sdk/dist/dedicated/interface'
import crypto from 'crypto'
import { db } from '@/lib/prisma'
import { processVirtualAccountPayment } from '@/lib/payments'

/**
 * Paystack webhook endpoint for virtual account payments
 *
 * Events handled:
 * - charge.success (for virtual account payments)
 * - dedicatedaccount.assign.success
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    switch (event.event) {

      case 'charge.success': {

        const { data } = event

        if (data.channel !== 'dedicated_nuban') {
          return NextResponse.json({
            message: 'Event ignored - not a virtual account payment'
          })
        }

        const accountNumber = data.authorization?.account_number
        const reference = data.reference
        const amount = data.amount

        if (!accountNumber || !reference || !amount) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const user = await db.user.findUnique({
          where: { virtualAccountNumber: accountNumber }
        })

        if (!user) {
          console.error('User not found for virtual account:', accountNumber)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        const existingTransaction = await db.transaction.findUnique({
          where: { reference }
        })

        if (existingTransaction?.serviceProvided) {
          console.log('Transaction already processed:', reference)
          return NextResponse.json({
            message: 'Transaction already processed'
          })
        }

        try {

          const result = await processVirtualAccountPayment(
            user.id,
            amount,
            reference
          )

          console.log('Virtual account payment processed:', {
            userId: user.id,
            reference,
            type: result.type
          })

          return NextResponse.json({
            success: true,
            message: result.message,
            type: result.type
          })

        } catch (error) {

          console.error('Failed to process virtual account payment:', error)

          if (existingTransaction) {
            await db.transaction.update({
              where: { reference },
              data: {
                status: 'FAILED',
                webhookAttempts: { increment: 1 },
                lastWebhookAt: new Date(),
                webhookError: (error as Error).message,
                failedAt: new Date()
              }
            })
          }

          throw error
        }
      }

      case 'dedicatedaccount.assign.success': {

        const { data } = event
        const customerCode = data.customer?.customer_code
        const account = (data.dedicated_account ?? {}) as DedicatedAccountData

        if (customerCode && account.account_number) {

          await db.user.updateMany({
            where: { paystackCustomerId: customerCode },
            data: {
              virtualAccountActive: true,
              virtualAccountNumber: account.account_number,
              virtualAccountBank: account.bank?.name || 'Wema Bank',
              virtualAccountName: account.account_name,
              paystackCustomerId: account.customer?.customer_code,
              virtualAccountCreatedAt: new Date()
            }
          })
        }

        return NextResponse.json({
          message: 'Virtual account assignment confirmed'
        })
      }

      default:

        console.log('Unhandled webhook event:', event.event)

        return NextResponse.json({
          message: 'Event type not handled'
        })
    }

  } catch (error) {

    console.error('Webhook processing error:', error)

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}