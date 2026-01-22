import 'dotenv/config';
import Paystack from 'paystack-sdk';

type Metadata = {
    [key: string]: string | number | boolean | undefined;
    planId?: string;
    planSlug?: string;
    userId?: string;
}

/**
 * Initialize Paystack payment
 * @param amount   - Amount in kobo (NGN minor units)
 * @param email    - Customer email
 * @param metadata - Additional metadata
 */
export const initializePaystackPayment = async ({
    amount,
    email,
    metadata = {},
    callback_url,
}: {
    amount: number;
    email: string;
    metadata?: Metadata;
    callback_url?: string;
}) => {
    try {
        const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

        const response = await paystack.transaction.initialize({
            amount: String(amount * 100),
            email,
            metadata,
            callback_url,
            reference: `MP${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        });

        if (!response.status) {
            throw new Error(`Paystack initialization failed: ${response.message}`);
        }

        return response;
    } catch (error) {
        console.error('Failed to initialize Paystack payment:', error);
        throw new Error('Failed to initialize payment:' + (error as Error).message);
    }
}

/**
 * Verify Paystack transaction
 * @param reference - Transaction reference
 * @returns 
 */
export async function verifyPaystackTransaction (reference: string) {
    try {
        const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

        const response = await paystack.transaction.verify(reference);

        return response;

    } catch (error) {
        console.error('Failed to verify Paystack transaction:', error);
        throw new Error('Failed to verify transaction');
    }
} 