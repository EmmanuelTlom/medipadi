export class HttpException<F = Record<string, any>> extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public details?: F
    ) {
        super(message);
        this.name = 'HttpException';
    }
}