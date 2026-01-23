import type { Transaction } from 'paystack-sdk/dist/transaction/transaction';
import { alova } from '../alova';

export function initializePayment<F extends Record<string, any>> (
  params: Record<string, string | null> = {},
) {
  return (form: F) => {
    return alova.Post('/api/payments/process', form, {
      params,
      transform: (data: {
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
        }
      }) => data.data,
    });
  };
}

export function verifyPayment<A = Record<string, any>> (params: Record<string, string | null> = {}) {
  return () => {
    return alova.Get<A & {
      data: Transaction
      amount: number
      message: string
    }>('/api/payments/process', {
      params,
    });
  };
}
