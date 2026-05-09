import LegalPage from './LegalPage';

const SECTIONS = [
  {
    heading: '1. Overview',
    content: 'YourOrchard ships mango boxes and seasonal tree-rental harvests across India from our orchard in Ramnagar, Uttarakhand. Delivery is handled by reputed third-party courier partners. We take care to pack all produce carefully to ensure it reaches you in fresh condition.',
  },
  {
    heading: '2. Delivery Areas',
    content: [
      'We currently ship to most major cities and towns across India.',
      'Delivery to remote areas (as classified by our courier partners) may take additional time or may not be available for every season.',
      'If we are unable to deliver to your pincode, we will contact you and offer a full refund.',
    ],
  },
  {
    heading: '3. Mango Box Delivery',
    content: [
      'Chausa: Available from approximately May 15. Dispatch begins when the variety is at peak ripeness.',
      'Dasheri: Available from approximately June 1.',
      'Langra: Available from approximately June 10.',
      'Actual dispatch dates may shift by a few days depending on harvest conditions. We will send you a dispatch notification with a tracking link.',
      'Estimated delivery time after dispatch: 1–3 business days for metro cities; 3–5 business days for other locations.',
      'Delivery is free for all mango box orders placed on yourorchard.in.',
    ],
  },
  {
    heading: '4. Tree Rental Harvest Delivery',
    content: [
      'For tree rental plans, your seasonal harvest is packed and dispatched from our orchard at peak ripeness, typically in multiple batches over the season.',
      'You will receive farm updates (photos/videos) throughout the season so you can track your tree\'s progress.',
      'Harvest delivery is included in your rental plan price. No additional shipping charges apply.',
      'Exact harvest quantities may vary by ±10–15% from estimates due to natural agricultural variation.',
    ],
  },
  {
    heading: '5. Packaging',
    content: 'All mangoes are hand-picked, graded, and packed in ventilated corrugated boxes to maintain freshness during transit. We do not use plastic wrapping on individual fruits. If you have specific packaging preferences, contact us before your order is dispatched.',
  },
  {
    heading: '6. Delivery Attempts',
    content: [
      'Our courier partners will attempt delivery to your provided address. If the delivery fails on the first attempt, a second attempt will be made the next business day.',
      'After two failed attempts, the package may be returned to us. In such cases, we will contact you to arrange re-delivery. A re-delivery charge may apply.',
      'YourOrchard is not responsible for failed deliveries due to incorrect addresses or the recipient being unavailable.',
    ],
  },
  {
    heading: '7. Damaged in Transit',
    content: 'If your package arrives visibly damaged, please take photographs before opening and contact us at support.YourOrchard@gmail.com within 24 hours of receipt. We will assess the situation and arrange a replacement or refund as per our Refund Policy. Perishable goods cannot be returned, but we will work to make it right.',
  },
  {
    heading: '8. Tracking Your Order',
    content: 'Once your order is dispatched, you will receive a tracking link via your registered email or phone number. You can also log in to your YourOrchard dashboard to see your order status in real time.',
  },
  {
    heading: '9. Contact',
    content: 'For shipping queries, reach us at support.YourOrchard@gmail.com or +91 75358 50398 (Mon–Sat, 10 AM – 6 PM IST).',
  },
];

export default function Shipping() {
  return (
    <LegalPage
      title="Shipping & Delivery Policy"
      subtitle="How YourOrchard ships mango boxes and rental harvests across India."
      lastUpdated="1 May 2026"
      sections={SECTIONS}
    />
  );
}
