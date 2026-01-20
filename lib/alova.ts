import { HttpException } from './Exceptions/HttpException';
import ReactHook from 'alova/react';
import { ValidationException } from './Exceptions/ValidationException';
import adapterFetch from 'alova/fetch';
import { createAlova } from 'alova';

const alova = createAlova({
    statesHook: ReactHook,
    requestAdapter: adapterFetch(),
    responded: async response => {
        const data = await response.clone().json();

        if (response.status === 422) {
            throw new ValidationException(
                data.error ?? data.message ?? `[${response.status}]${response.statusText}`,
                data.errors || {}
            );
        } else if (response.status !== 200) {
            throw new HttpException(
                data.error ?? data.message ?? `[${response.status}]${response.statusText}`,
                response.status,
            );
        }

        return data;
    }
});

export { alova };