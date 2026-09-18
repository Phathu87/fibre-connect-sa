import React from 'react';
import LegalPage from '@/components/LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="September 2026"
      intro="FibreConnect SA is designed with POPIA (Protection of Personal Information Act) principles in mind. This is a draft template requiring final legal review. We do not claim to be 'POPIA certified' or 'government approved'."
      sections={[
        { heading: '1. Information we collect', body: ['When you submit an enquiry we collect your name, email, phone number and service address. When you create an account we store your profile and preferences.', 'We collect anonymous analytics events to understand how the platform is used, subject to your cookie consent.'] },
        { heading: '2. How we use your information', body: ['To process your enquiries and forward your details to the relevant provider with your consent.', 'To communicate with you about your enquiry and, with separate consent, to send marketing communications.'] },
        { heading: '3. Sharing', body: ['We share your details with a provider only when you submit an enquiry and consent to that sharing. We do not sell your personal information.'] },
        { heading: '4. Your rights', body: ['You may request access to your personal information, request corrections, and request deletion of your account and data. Use the data request options below or contact support.'] },
        { heading: '5. Data retention', body: ['We retain enquiry data for as long as necessary to provide the service and meet legal obligations.'] },
        { heading: '6. Security', body: ['Production security (encryption, access control, audit trails) is enforced by the backend. The frontend does not provide security on its own.'] },
      ]}
    >
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold">Data subject requests</h2>
        <div className="mt-2 grid gap-2 text-sm">
          <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">Request access to my data</button>
          <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">Request correction of my data</button>
          <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">Request deletion of my account</button>
          <button className="rounded-lg border border-border px-3 py-2 text-left hover:bg-muted">Withdraw marketing consent</button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">These options prepare for POPIA compliance. Production handling is performed by the backend.</p>
      </section>
    </LegalPage>
  );
}