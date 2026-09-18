import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function Accessibility() {
  return (
    <LegalPage
      title="Accessibility Statement"
      lastUpdated="September 2026"
      intro="FibreConnect SA is designed to meet WCAG 2.2 AA fundamentals. This is a draft template requiring final review."
      sections={[
        { heading: '1. Our commitment', body: ['We aim to make the platform usable by everyone, including people using assistive technology, keyboard navigation and screen readers.'] },
        { heading: '2. Features', body: ['Semantic headings, visible focus states, labelled form fields, accessible dialogs and drawers, sufficient colour contrast, touch target sizing, and reduced-motion support.'] },
        { heading: '3. Comparison & tables', body: ['Comparison tables are designed to remain accessible on mobile through stacked card layouts and screen-reader-friendly result announcements.'] },
        { heading: '4. Feedback', body: ['If you encounter an accessibility barrier, please contact us so we can address it.'] },
      ]}
    />
  );
}