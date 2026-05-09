import LegalPage from './LegalPage';

const SECTIONS = [
  {
    heading: '1. Introduction',
    content: 'YourOrchard ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains what information we collect when you use our website yourorchard.in, how we use it, and your rights under applicable Indian law, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 (DPDP Act).',
  },
  {
    heading: '2. Information We Collect',
    content: [
      'Account information: name, email address, and password (stored encrypted) when you register.',
      'Order information: delivery address, phone number, and details of tree rentals or mango box orders you place.',
      'Payment information: payment status and transaction IDs processed via Razorpay. We do not store card numbers, UPI handles, or bank credentials.',
      'Usage data: pages visited, browser type, IP address, and timestamps — collected automatically for security and analytics purposes.',
      'Communications: any messages you send us via the contact form or email.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    content: [
      'To process and fulfil your tree rental or mango box order.',
      'To send order confirmations, farm updates, and delivery notifications.',
      'To respond to your queries and support requests.',
      'To improve our website, services, and user experience.',
      'To detect and prevent fraud or unauthorised access.',
      'To comply with legal and regulatory obligations.',
    ],
  },
  {
    heading: '4. Sharing of Information',
    content: [
      'We do not sell your personal data to any third party.',
      'Razorpay: payment information is shared with Razorpay solely to process transactions. Razorpay\'s privacy policy governs their data practices.',
      'Delivery partners: your name, phone number, and delivery address are shared with our logistics partners to fulfil shipments.',
      'Legal authorities: we may disclose information if required to do so by law or in response to a valid legal process.',
    ],
  },
  {
    heading: '5. Data Retention',
    content: 'We retain your account and order data for as long as your account is active or as required by law. If you request account deletion, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.',
  },
  {
    heading: '6. Cookies',
    content: 'We use minimal, functional cookies to keep you logged in and to remember your session. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, but this may affect platform functionality.',
  },
  {
    heading: '7. Data Security',
    content: 'We implement industry-standard security measures including HTTPS encryption, hashed passwords, and access controls to protect your data. However, no method of transmission over the internet is 100% secure. We will notify you promptly in the event of any data breach that affects your personal information.',
  },
  {
    heading: '8. Your Rights',
    content: [
      'Access: you may request a copy of the personal data we hold about you.',
      'Correction: you may ask us to correct inaccurate or incomplete data.',
      'Deletion: you may request deletion of your personal data, subject to legal retention requirements.',
      'Withdraw consent: you may withdraw consent to marketing communications at any time by contacting us.',
      'To exercise any of these rights, email us at support.YourOrchard@gmail.com.',
    ],
  },
  {
    heading: '9. Children\'s Privacy',
    content: 'Our services are not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided us with personal information, we will delete it promptly.',
  },
  {
    heading: '10. Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised date. Your continued use of our services after the change constitutes your acceptance of the new policy.',
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How YourOrchard collects, uses, and protects your personal information."
      lastUpdated="1 May 2026"
      sections={SECTIONS}
    />
  );
}
