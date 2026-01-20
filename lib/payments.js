// Payment integration utilities
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment session
 */
export async function createPaymentSession (amount, currency, successUrl, cancelUrl) {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: "Healthcare Subscription",
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return session;
    } catch (error) {
        console.error("Failed to create payment session:", error);
        throw new Error("Failed to create payment session");
    }
}