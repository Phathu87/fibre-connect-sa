import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProviderLogo from '@/components/ui/ProviderLogo';
import { packageService } from '@/services/packageService';
import { enquiryService } from '@/services/userDataService';
import { events } from '@/services/analyticsService';

const STEPS = ['Package', 'Coverage', 'Your details', 'Installation', 'Review', 'Consent'];

export default function Enquire() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const slug = params.get('package');
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    address: { street: '', suburb: '', city: '', province: '', postalCode: '' },
    firstName: '', lastName: '', email: '', phone: '', contactMethod: 'Email',
    propertyType: 'Residential', dwelling: 'House', unit: '', accessNotes: '', landlordAck: false,
    privacy: false, terms: false, providerContact: false, marketing: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    events.enquiryStarted(slug);
    packageService.getBySlug(slug).then(p => { setPkg(p); setLoading(false); });
  }, [slug]);

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const setAddr = (k, v) => setData(d => ({ ...d, address: { ...d.address, [k]: v } }));

  const canNext = () => {
    if (step === 0) return !!pkg;
    if (step === 1) return data.address.street && data.address.city;
    if (step === 2) return data.firstName && data.lastName && data.email && data.phone;
    if (step === 3) return data.propertyType && data.dwelling;
    if (step === 4) return true;
    if (step === 5) return data.privacy && data.terms && data.providerContact;
    return true;
  };

  const next = () => {
    events.enquiryStepCompleted(STEPS[step]);
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else submit();
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const submit = async () => {
    setSubmitting(true);
    const res = await enquiryService.create({
      ...data,
      packageId: pkg.id, packageSlug: pkg.slug, packageName: pkg.name,
      providerId: pkg.providerId, providerName: pkg.provider?.name,
      monthlyPrice: pkg.promotionalPrice || pkg.monthlyPrice, installationFee: pkg.installationFee,
    });
    events.enquiryCompleted(res.reference);
    setSubmitting(false);
    setResult(res);
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-10"><div className="h-80 animate-pulse rounded-xl border border-border bg-muted/40" /></div>;

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success"><Check className="h-8 w-8" /></div>
          <h1 className="mt-4 text-2xl font-extrabold">Enquiry submitted</h1>
          <p className="mt-2 text-muted-foreground">Your reference is <span className="font-mono font-bold text-foreground">{result.reference}</span>.</p>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm">
          <h2 className="font-display font-bold">What happens next</h2>
          <ol className="mt-2 space-y-1.5 text-muted-foreground">
            <li>1. Our team reviews your enquiry (status: <strong className="text-foreground">Submitted</strong>).</li>
            <li>2. We forward your details to {pkg.provider?.name}.</li>
            <li>3. The provider contacts you to finalise and schedule installation.</li>
          </ol>
        </div>
        <div className="mt-4 flex gap-2">
          <Link to="/account/enquiries" className="flex-1 rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white">Track in account</Link>
          <Link to="/packages" className="flex-1 rounded-lg border border-border py-2.5 text-center text-sm font-medium">Browse more</Link>
        </div>
      </div>
    );
  }

  if (!pkg) return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="text-2xl font-extrabold">No package selected</h1><Link to="/packages" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Browse packages</Link></div>;

  const effectivePrice = pkg.promotionalPrice || pkg.monthlyPrice;
  const consentOptions = /** @type {Array<['privacy' | 'terms' | 'providerContact' | 'marketing', React.ReactNode]>} */ ([
    ['privacy', <>I have read and agree to the <Link to="/privacy" className="text-brand underline">Privacy Policy</Link> (POPIA-aware).</>],
    ['terms', <>I have read and agree to the <Link to="/terms" className="text-brand underline">Terms of Service</Link>.</>],
    ['providerContact', <>I consent to my details being shared with {pkg.provider?.name} so they can contact me about this application.</>],
    ['marketing', <>I would like to receive marketing communications about deals and offers (optional).</>],
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-extrabold md:text-3xl">Apply for this package</h1>
      <p className="mt-1 text-sm text-muted-foreground">Complete the steps below to submit your enquiry.</p>

      {/* stepper */}
      <ol className="mt-5 flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-1 whitespace-nowrap">
            <span className={cn('grid h-7 w-7 place-items-center rounded-full text-xs font-bold', i < step ? 'bg-success text-white' : i === step ? 'bg-brand text-white' : 'bg-muted text-muted-foreground')}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-xs font-medium', i === step ? 'text-brand' : 'text-muted-foreground')}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        {/* step 0: package */}
        {step === 0 && (
          <div>
            <h2 className="font-display font-bold">Confirm your package</h2>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-border p-3">
              <ProviderLogo provider={pkg.provider} size="lg" />
              <div className="flex-1">
                <p className="font-display font-bold">{pkg.name}</p>
                <p className="text-xs text-muted-foreground">{pkg.provider?.name} · {pkg.connectivityType} · {pkg.downloadMbps}/{pkg.uploadMbps}Mbps</p>
              </div>
              <p className="font-bold">R{effectivePrice}/mo</p>
            </div>
            <Link to={`/packages/${pkg.slug}`} className="mt-2 inline-block text-sm text-brand hover:underline">View full package details</Link>
          </div>
        )}

        {/* step 1: coverage */}
        {step === 1 && (
          <div>
            <h2 className="font-display font-bold">Confirm service address</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter the address where the service will be installed.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className="text-sm font-medium">Street address</span><input value={data.address.street} onChange={e => setAddr('street', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">Suburb</span><input value={data.address.suburb} onChange={e => setAddr('suburb', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">City</span><input value={data.address.city} onChange={e => setAddr('city', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">Province</span><input value={data.address.province} onChange={e => setAddr('province', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">Postal code</span><input value={data.address.postalCode} onChange={e => setAddr('postalCode', e.target.value)} inputMode="numeric" className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
            </div>
            <Link to="/coverage" className="mt-2 inline-block text-sm text-brand hover:underline">Run a coverage check first</Link>
          </div>
        )}

        {/* step 2: customer */}
        {step === 2 && (
          <div>
            <h2 className="font-display font-bold">Your contact details</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-medium">First name</span><input value={data.firstName} onChange={e => set('firstName', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">Last name</span><input value={data.lastName} onChange={e => set('lastName', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">Email</span><input type="email" value={data.email} onChange={e => set('email', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block"><span className="text-sm font-medium">Mobile number</span><input type="tel" value={data.phone} onChange={e => set('phone', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block sm:col-span-2"><span className="text-sm font-medium">Preferred contact method</span>
                <select value={data.contactMethod} onChange={e => set('contactMethod', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand">
                  <option>Email</option><option>Phone</option><option>WhatsApp</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* step 3: installation */}
        {step === 3 && (
          <div>
            <h2 className="font-display font-bold">Installation details</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-medium">Property type</span>
                <select value={data.propertyType} onChange={e => set('propertyType', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand">
                  <option>Residential</option><option>Business</option>
                </select>
              </label>
              <label className="block"><span className="text-sm font-medium">Dwelling</span>
                <select value={data.dwelling} onChange={e => set('dwelling', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand">
                  <option>House</option><option>Apartment</option><option>Complex / Estate</option><option>Office</option>
                </select>
              </label>
              <label className="block"><span className="text-sm font-medium">Unit / complex number</span><input value={data.unit} onChange={e => set('unit', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
              <label className="block sm:col-span-2"><span className="text-sm font-medium">Access notes for technician</span><textarea value={data.accessNotes} onChange={e => set('accessNotes', e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" /></label>
            </div>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={data.landlordAck} onChange={e => set('landlordAck', e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
              <span className="text-muted-foreground">I acknowledge that if I am a tenant, I have permission from the landlord / body corporate for installation.</span>
            </label>
          </div>
        )}

        {/* step 4: review */}
        {step === 4 && (
          <div>
            <h2 className="font-display font-bold">Review your application</h2>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold">Package</p>
                <p className="text-muted-foreground">{pkg.name} — {pkg.provider?.name} — R{effectivePrice}/mo</p>
                <p className="text-muted-foreground">Setup: {pkg.installationFee === 0 ? 'Free' : `R${pkg.installationFee}`} · {pkg.contractMonths === 0 ? 'Month-to-month' : `${pkg.contractMonths} months`}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold">Address</p>
                <p className="text-muted-foreground">{[data.address.street, data.address.suburb, data.address.city, data.address.province].filter(Boolean).join(', ')}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold">Contact</p>
                <p className="text-muted-foreground">{data.firstName} {data.lastName} · {data.email} · {data.phone} · via {data.contactMethod}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="font-semibold">Installation</p>
                <p className="text-muted-foreground">{data.propertyType} · {data.dwelling} {data.unit} · {data.accessNotes || 'No access notes'}</p>
              </div>
            </div>
          </div>
        )}

        {/* step 5: consent */}
        {step === 5 && (
          <div>
            <h2 className="font-display font-bold">Consent & agreements</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please review and accept to submit. Boxes are not pre-checked.</p>
            <div className="mt-3 space-y-2.5">
              {consentOptions.map(([key, label]) => (
                <label key={key} className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm">
                  <input type="checkbox" checked={data[key]} onChange={e => set(key, e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-success" /> Your data is handled in line with South African privacy principles.</p>
          </div>
        )}

        {/* nav */}
        <div className="mt-6 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Back</button>
          <button onClick={next} disabled={!canNext() || submitting} className="inline-flex items-center gap-1 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
            {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Submitting…</> : step === STEPS.length - 1 ? 'Submit enquiry' : <>Continue <ChevronRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
