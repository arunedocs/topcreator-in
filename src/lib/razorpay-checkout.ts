/** Razorpay Standard Checkout — UPI shown inside Razorpay modal, not our bid form. */

export interface RazorpayCheckoutParams {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  channelName: string;
  category: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onDismiss?: () => void;
}

/**
 * Explicitly list UPI in Razorpay's payment modal alongside cards, netbanking & wallets.
 * @see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/
 */
export function getRazorpayCheckoutConfig() {
  return {
    display: {
      blocks: {
        methods: {
          name: "Payment Options",
          instruments: [
            { method: "upi" },
            { method: "card" },
            { method: "netbanking" },
            { method: "wallet" },
          ],
        },
      },
      sequence: ["block.methods"],
      preferences: {
        show_default_blocks: false,
      },
    },
  };
}

export function buildRazorpayCheckoutOptions(params: RazorpayCheckoutParams) {
  return {
    key: params.key,
    amount: params.amount,
    currency: params.currency,
    name: "TopCreator.in",
    description: `#1 bid in ${params.category}`,
    order_id: params.orderId,
    prefill: {
      name: params.channelName,
    },
    theme: { color: "#09090b" },
    config: getRazorpayCheckoutConfig(),
    handler: params.onSuccess,
    modal: {
      ondismiss: params.onDismiss,
    },
  };
}
