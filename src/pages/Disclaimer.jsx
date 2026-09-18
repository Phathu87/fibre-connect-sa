import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function Disclaimer() {
  return (
    <LegalPage
      title="Disclaimer"
      lastUpdated="September 2026"
      intro="This is a draft template requiring final legal review."
      sections={[
        { heading: '1. Sample data', body: ['All package, pricing, coverage and provider information on FibreConnect SA is sample/demo data for demonstration. It is not sourced from a live provider feed unless explicitly stated.', 'We do not claim live network availability has been confirmed for any address unless a real integration exists.'] },
        { heading: '2. No provider endorsement', body: ['FibreConnect SA is independently developed. References to providers and networks are for comparison purposes only and do not imply endorsement, sponsorship or affiliation.'] },
        { heading: '3. Not an order', body: ['Submitting an enquiry is not placing an order. Final availability, pricing and terms are determined by the provider.'] },
        { heading: '4. No professional advice', body: ['Content on this platform is general information and not professional or legal advice.'] },
      ]}
    />
  );
}