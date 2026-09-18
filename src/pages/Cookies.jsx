import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function Cookies() {
  return (
    <LegalPage
      title="Cookie Policy"
      lastUpdated="September 2026"
      intro="FibreConnect SA uses cookies and local storage to enable core functionality and, with your consent, analytics and marketing. This is a draft template requiring final legal review."
      sections={[
        { heading: '1. Necessary cookies', body: ['Always on. Required for the site to function — for example, remembering your theme and cookie consent choice.'] },
        { heading: '2. Analytics cookies', body: ['Optional. Help us understand how visitors use the platform so we can improve it. Only enabled with your consent.'] },
        { heading: '3. Functional cookies', body: ['Optional. Enable extra features such as saved packages and recent searches.'] },
        { heading: '4. Marketing cookies', body: ['Optional. Used to personalise offers and communications. Only enabled with your explicit consent.'] },
        { heading: '5. Managing preferences', body: ['You can change your cookie preferences at any time. Optional cookies can be accepted, rejected or customised via the consent banner.'] },
      ]}
    />
  );
}