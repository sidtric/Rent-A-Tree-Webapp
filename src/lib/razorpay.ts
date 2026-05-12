import { apiFetch } from './api';

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface OpenCheckoutOpts {
  type: 'cart';
  items: { variety?: string; plan?: string; quantity: number }[];
  userName: string;
  userEmail: string;
  userPhone?: string;
  description?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout(opts: OpenCheckoutOpts) {
  const order = await apiFetch<RazorpayOrder>('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ type: 'cart', items: opts.items }),
  });

  const rzp = new (window as any).Razorpay({
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'YourOrchard',
    description: opts.description || 'YourOrchard — Mango Season 2026',
    prefill: { name: opts.userName, email: opts.userEmail, contact: opts.userPhone },
    theme: { color: '#2d5a27' },
    modal: { ondismiss: opts.onDismiss },
    handler: async (response: any) => {
      try {
        await apiFetch('/api/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        opts.onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      } catch (err: any) {
        alert('Payment verification failed: ' + (err.message || 'Please contact support.'));
        opts.onDismiss?.();
      }
    },
  });
  rzp.open();
}
