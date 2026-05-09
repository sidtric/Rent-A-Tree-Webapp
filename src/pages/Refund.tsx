import LegalPage from './LegalPage';

const SECTIONS = [
  {
    heading: '1. Overview',
    content: 'YourOrchard wants every customer to feel confident when purchasing. This policy explains the conditions under which you may cancel a tree rental or mango box order and request a refund. Please read it carefully before making a purchase.',
  },
  {
    heading: '2. Tree Rental Cancellations',
    content: [
      'Within 48 hours of booking: Full refund issued, no questions asked. The refund will be credited to your original payment method within 5–7 business days.',
      'After 48 hours and before the season begins (May 15): 50% refund. The remaining 50% covers tree reservation and preparation costs.',
      'After the season begins (May 15 onwards): No refund. Once the season has started and your tree\'s care schedule has commenced, rentals are non-refundable.',
      'If YourOrchard is unable to fulfil your rental due to circumstances on our end (e.g. orchard damage, insufficient trees), a full refund will be issued regardless of timing.',
    ],
  },
  {
    heading: '3. Mango Box Order Cancellations',
    content: [
      'Before dispatch: You may cancel your box order at any time before it is dispatched. A full refund will be issued within 5–7 business days.',
      'After dispatch: Once your order has been dispatched, it cannot be cancelled. If the box arrives damaged or there is a quality issue, refer to Section 5 below.',
      'Seasonal prebooks: If a variety becomes unavailable due to a crop failure or extreme weather, we will offer a full refund or the option to switch to an available variety.',
    ],
  },
  {
    heading: '4. How to Request a Cancellation or Refund',
    content: [
      'Email us at support.YourOrchard@gmail.com with your registered email address and order details.',
      'Or call us at +91 75358 50398 (Mon–Sat, 10 AM – 6 PM IST).',
      'Please include your order ID and reason for cancellation to help us process your request faster.',
      'Refunds are processed to the original payment method only. We do not issue cash or cheque refunds.',
    ],
  },
  {
    heading: '5. Damaged or Incorrect Deliveries',
    content: [
      'If your mango box arrives damaged, spoiled, or is significantly different from what was ordered, contact us within 24 hours of delivery with photos.',
      'We will either arrange a replacement delivery or issue a full refund at your choice.',
      'We cannot accept claims made after 24 hours of delivery for perishable goods.',
    ],
  },
  {
    heading: '6. Refund Processing Time',
    content: 'Once a refund is approved, it will be initiated within 2 business days. The credit typically appears in your account within 5–7 business days depending on your bank or payment provider. Razorpay processing timelines apply.',
  },
  {
    heading: '7. Non-Refundable Situations',
    content: [
      'Tree rentals cancelled after the season start date (May 15).',
      'Box orders cancelled after dispatch.',
      'Yield variations within the stated estimate range (e.g. 30 kg vs 35 kg for an Adult plan) — these are natural agricultural variations.',
      'Orders where incorrect delivery addresses were provided by the customer and re-delivery was not possible.',
    ],
  },
];

export default function Refund() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      subtitle="Conditions for cancelling your order and receiving a refund from YourOrchard."
      lastUpdated="1 May 2026"
      sections={SECTIONS}
    />
  );
}
