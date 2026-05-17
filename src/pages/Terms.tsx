import LegalPage from './LegalPage';

const SECTIONS = [
  {
    heading: '1. Acceptance of Terms',
    content: 'By accessing or using the YourOrchard website (yourorchard.in) and its services, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions and all applicable laws of India. If you do not agree, please do not use our platform. We reserve the right to update these terms at any time; continued use of the platform constitutes acceptance of the revised terms.',
  },
  {
    heading: '2. About YourOrchard',
    content: 'YourOrchard is an agri-commerce platform operated from Ramnagar, Uttarakhand, India. We offer seasonal mango tree rental plans and direct-to-home mango box orders sourced from our orchard in Ramnagar. Our services are available across India subject to delivery feasibility.',
  },
  {
    heading: '3. Eligibility',
    content: 'You must be at least 18 years of age and a resident of India to register, purchase, or use our services. By creating an account, you confirm that all information provided is accurate, current, and complete. YourOrchard reserves the right to terminate accounts found to contain false information.',
  },
  {
    heading: '4. Tree Rental Plans',
    content: [
      'Tree rental plans are seasonal and valid for one mango harvest season (approximately May 15 – July 31 of the applicable year).',
      'Plans are available in three tiers: Sapling (₹2,499), Adult (₹4,499), and Grand (₹7,999). Pricing is per season and is subject to change for future seasons.',
      'Each rented tree is a real, identified tree on our Ramnagar orchard. We assign specific trees to renters at the time of booking.',
      'Estimated yields (15–20 kg, 30–45 kg, and 60–80 kg respectively) are indicative and may vary due to seasonal weather, pest conditions, or other agricultural factors. YourOrchard is not liable for yield shortfalls caused by such factors.',
      'Tree rentals include: weekly farm update photos/videos, full-season tree care by our team, and free home delivery of your harvest once mangoes are ready.',
      'Renters do not acquire ownership of any tree or land. The rental is a right to receive that tree\'s seasonal produce.',
    ],
  },
  {
    heading: '5. Mango Box Orders',
    content: [
      'Mango boxes are available in three varieties: Chausa Aam (₹1,299 / 10 kg), Dasheri Aam (₹1,499 / 10 kg), and Langra Aam (₹1,399 / 10 kg). Prices may change for future seasons.',
      'Box orders are prebooked before harvest and dispatched once the variety is in season. Estimated dispatch windows are communicated at time of order.',
      'We cannot guarantee exact delivery dates as harvest timing depends on natural ripening. We will notify you before dispatch.',
    ],
  },
  {
    heading: '6. Payments',
    content: [
      'All payments are processed securely via Razorpay. YourOrchard does not store your card, UPI, or net banking credentials.',
      'Prices are inclusive of GST where applicable. Payment confirmation will be sent to your registered email.',
      'In case of a failed transaction where money is debited but the order is not confirmed, it will be refunded to your original payment method within 5–7 business days.',
    ],
  },
  {
    heading: '7. Account Responsibility',
    content: 'You are responsible for maintaining the confidentiality of your account credentials. All activities that occur under your account are your responsibility. Notify us immediately at support.YourOrchard@gmail.com if you suspect any unauthorised access.',
  },
  {
    heading: '8. Prohibited Use',
    content: [
      'You may not use this platform for any unlawful purpose or in violation of any Indian law or regulation.',
      'You may not attempt to gain unauthorised access to any part of our systems or interfere with the operation of the website.',
      'You may not resell, sublicense, or commercially exploit tree rentals or box orders purchased on this platform.',
      'Automated scraping, crawling, or data extraction from the platform is strictly prohibited.',
    ],
  },
  {
    heading: '9. Intellectual Property',
    content: 'All content on this website, including text, photographs, videos, logos, and design elements, is the property of YourOrchard and is protected under applicable Indian intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.',
  },
  {
    heading: '10. Force Majeure',
    content: 'YourOrchard shall not be held liable for failure or delay in performing its obligations due to circumstances beyond our reasonable control, including but not limited to: extreme weather events, floods, pest infestations, governmental restrictions, natural disasters, or pandemics. In such cases, we will notify affected customers and offer appropriate remedies at our discretion.',
  },
  {
    heading: '11. Limitation of Liability',
    content: 'To the maximum extent permitted by applicable law, YourOrchard\'s total liability for any claim arising from or related to our services shall be limited to the amount paid by you for the specific service in question. We are not liable for any indirect, incidental, or consequential damages.',
  },
  {
    heading: '12. Governing Law & Dispute Resolution',
    content: 'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of courts in Nainital, Uttarakhand.',
  },
  {
    heading: '13. Contact',
    content: 'For any questions regarding these Terms, please contact us at support.YourOrchard@gmail.com or +91 75358 50398. Our registered address is: YourOrchard, Ramnagar, Uttarakhand — 244715.',
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using YourOrchard's website or services."
      lastUpdated="1 May 2026"
      sections={SECTIONS}
    />
  );
}
