import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="September 2026"
      intro="These terms govern your use of FibreConnect SA. This is a draft template for demonstration and requires final legal review before commercial release."
      sections={[
        { heading: '1. Use of the platform', body: ['FibreConnect SA is a broadband comparison and lead-generation platform. You may use it to discover, compare and enquire about packages.', 'You agree to provide accurate information when submitting enquiries.'] },
        { heading: '2. Sample data', body: ['Package, pricing and coverage information shown is sample/demo data for demonstration. It is not sourced from a live provider feed and should not be relied upon as a binding offer.'] },
        { heading: '3. Enquiries', body: ['Submitting an enquiry expresses your interest in a package. It is not an order or contract. The provider determines final pricing, availability and terms.'] },
        { heading: '4. Intellectual property', body: ['FibreConnect SA is independently developed. Provider and network names are referenced for comparison purposes and remain the property of their respective owners.'] },
        { heading: '5. Limitation of liability', body: ['FibreConnect SA is provided on an "as is" basis. We are not liable for decisions made based on sample data or for the actions of third-party providers.'] },
        { heading: '6. Changes to terms', body: ['We may update these terms. Continued use after changes constitutes acceptance of the updated terms.'] },
      ]}
    />
  );
}