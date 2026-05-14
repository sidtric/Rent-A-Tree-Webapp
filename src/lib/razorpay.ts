import { apiFetch } from './api';

let razorpayPromise: Promise<void> | null = null;
function loadRazorpay(): Promise<void> {
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  if (razorpayPromise) return razorpayPromise;
  razorpayPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { razorpayPromise = null; reject(new Error('Failed to load Razorpay')); };
    document.body.appendChild(s);
  });
  return razorpayPromise;
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface RichItem {
  type: 'tree' | 'box';
  plan?: string;
  variety: string;
  qty: number;
}

interface OpenCheckoutOpts {
  type: 'cart';
  items: { variety?: string; plan?: string; quantity: number }[];
  richItems: RichItem[];
  userName: string;
  userEmail: string;
  userPhone?: string;
  deliveryAddress: string;
  phone: string;
  description?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError?: (message: string) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout(opts: OpenCheckoutOpts) {
  const [order] = await Promise.all([
    apiFetch<RazorpayOrder>('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({
        type: 'cart',
        items: opts.items,
        meta: {
          userName:        opts.userName,
          userEmail:       opts.userEmail,
          userPhone:       opts.userPhone || '',
          deliveryAddress: opts.deliveryAddress,
          richItems:       opts.richItems,
        },
      }),
    }),
    loadRazorpay(),
  ]);

  const rzp = new (window as any).Razorpay({
    key: order.key,
    amount: order.amount,
    currency: order.currency,
    order_id: order.orderId,
    name: 'YourOrchard',
    description: opts.description || `YourOrchard — Mango Season ${new Date().getFullYear()}`,
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
        opts.onError?.(err.message || 'Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
        opts.onDismiss?.();
      }
    },
  });
  rzp.open();
}
