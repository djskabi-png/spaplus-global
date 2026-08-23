"use client";

import { useMemo, useState } from "react";
import "./booking.css";

type Mode = "existing" | "improved";
type ProductKind = "treatment" | "package";
type Identity = "google" | "meta" | "guest" | "email" | null;

type Props = { mode: Mode };

const products = {
  treatment: {
    eyebrow: "Solo treatment",
    title: "Advanced Personalized Facial",
    id: "Treatment No.585",
    price: 109,
    duration: "60 min",
    description: "A personalized European facial using essential oils and plant extracts.",
  },
  package: {
    eyebrow: "Solo package",
    title: "Half Day Spa",
    id: "Package No.100100",
    price: 259,
    duration: "180 min",
    description: "A complete half-day wellness escape with a facial, body wrap, massage and spa access.",
  },
} as const;

const dates = ["Aug 24", "Aug 25", "Aug 26", "Aug 27"];
const times = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

function Mark() {
  return <span className="booking-mark" aria-hidden="true">SP</span>;
}

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="booking-icon" aria-hidden="true">{children}</span>;
}

function Progress({ step }: { step: number }) {
  const labels = ["Choose", "Schedule", "Details", "Card"];
  return (
    <ol className="booking-progress" aria-label={`Step ${step} of 4`}>
      {labels.map((label, index) => (
        <li key={label} className={index + 1 <= step ? "is-active" : ""}>
          <span>{index + 1}</span><small>{label}</small>
        </li>
      ))}
    </ol>
  );
}

function ProductSummary({ kind, compact = false, onEdit }: { kind: ProductKind; compact?: boolean; onEdit?: () => void }) {
  const product = products[kind];
  return (
    <section className={`booking-summary ${compact ? "is-compact" : ""}`} aria-label="Booking summary">
      <div className={`booking-art booking-art-${kind}`} aria-hidden="true"><span>Illustrative preview</span></div>
      <div className="booking-summary-copy">
        <small>{product.id}</small>
        <strong>{product.title}</strong>
        <span>ALTISPA</span>
        <div className="booking-meta"><span>◷ {product.duration}</span><span>♙ Single (1)</span></div>
        {onEdit ? <button type="button" className="booking-text-button" onClick={onEdit}>Edit</button> : null}
      </div>
      <b className="booking-price">${product.price}</b>
    </section>
  );
}

function Choice({ onChoose }: { onChoose: (kind: ProductKind) => void }) {
  return (
    <div className="booking-panel booking-choice">
      <div className="booking-intro">
        <span className="booking-demo-pill">Interactive booking demo</span>
        <h1>What would you like to book?</h1>
        <p>Choose a solo treatment or a solo package. Every step is clickable through secure card verification.</p>
      </div>
      <div className="booking-product-grid">
        {(Object.keys(products) as ProductKind[]).map((kind) => {
          const product = products[kind];
          return (
            <button className="booking-product" type="button" key={kind} onClick={() => onChoose(kind)}>
              <div className={`booking-art booking-art-${kind}`} aria-hidden="true"><span>Illustrative preview</span></div>
              <div className="booking-product-copy">
                <small>{product.eyebrow}</small>
                <h2>{product.title}</h2>
                <p>{product.description}</p>
                <div><span>{product.duration}</span><b>${product.price}</b></div>
              </div>
              <span className="booking-product-cta">Start booking</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Setup({ mode, kind, onBack, onContinue }: { mode: Mode; kind: ProductKind; onBack: () => void; onContinue: () => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guestOpen, setGuestOpen] = useState(mode === "existing");
  const [addOns, setAddOns] = useState(false);
  const ready = Boolean(date && time);
  return (
    <div className="booking-panel">
      <Progress step={2} />
      {mode === "existing" ? (
        <>
          <div className={`booking-art booking-art-${kind} booking-art-hero`} aria-hidden="true"><span>Illustrative preview</span></div>
          <ProductSummary kind={kind} />
          <p className="booking-long-copy">{products[kind].description} Select guest preferences, optional additions, arrival date and treatment time to continue.</p>
        </>
      ) : <ProductSummary kind={kind} compact onEdit={onBack} />}

      <section className="booking-card">
        <button className="booking-section-toggle" type="button" aria-expanded={guestOpen} onClick={() => setGuestOpen(!guestOpen)}>
          <span><small>Guest 1</small><strong>Your preferences</strong></span><span>{guestOpen ? "−" : "+"}</span>
        </button>
        {guestOpen && (
          <div className="booking-fields booking-fields-compact">
            <label>Guest Gender<select defaultValue="Male"><option>Male</option><option>Female</option></select></label>
            <label>Therapist Gender<select defaultValue="No Preference"><option>No Preference</option><option>Male</option><option>Female</option></select></label>
            <label>{kind === "package" ? "Package" : "Treatment"}<select defaultValue={products[kind].title}><option>{products[kind].title}</option></select></label>
            <label>Duration<select defaultValue={products[kind].duration}><option>{products[kind].duration}</option></select></label>
            <button type="button" className="booking-accordion" aria-expanded={addOns} onClick={() => setAddOns(!addOns)}><span>Add-ons</span><span>{addOns ? "−" : "+"}</span></button>
            {addOns && <div className="booking-option-box"><label><input type="checkbox" /> Scalp massage, 15 min</label><label><input type="checkbox" /> Eye treatment</label></div>}
          </div>
        )}
      </section>

      <section className="booking-card">
        <div className="booking-section-heading"><small>Arrival date</small><strong>August 2026</strong></div>
        <div className="booking-date-grid">
          {dates.map((item) => <button type="button" key={item} className={date === item ? "is-selected" : ""} onClick={() => { setDate(item); setTime(""); }}>{item}</button>)}
        </div>
        {date && <div className="booking-time-area"><strong>Treatment time</strong><div className="booking-time-grid">{times.map((item) => <button type="button" key={item} className={time === item ? "is-selected" : ""} onClick={() => setTime(item)}>{item}</button>)}</div></div>}
      </section>

      <section className="booking-info"><strong>Important Information</strong><p>You will receive your booking confirmation by email within 24 hours. Online bookings must be made at least two days in advance.</p></section>
      <div className="booking-sticky"><button type="button" className="booking-back" onClick={onBack}>Back</button><button type="button" className="booking-primary" disabled={!ready} onClick={onContinue}>{ready ? "Continue to Booking" : "Select a date and time"}</button></div>
    </div>
  );
}

function OptionalRows() {
  const [open, setOpen] = useState<string | null>(null);
  return <div className="booking-optional-list">{["Invoice details", "Promo code", "Notes for the Spa"].map((label) => <div key={label}><button type="button" className="booking-accordion" aria-expanded={open === label} onClick={() => setOpen(open === label ? null : label)}><span>{label} <small>(optional)</small></span><span>{open === label ? "−" : "+"}</span></button>{open === label && <div className="booking-option-box">{label === "Notes for the Spa" ? <textarea aria-label={label} placeholder="Share a special request" /> : <input aria-label={label} placeholder={`Enter ${label.toLowerCase()}`} />}</div>}</div>)}</div>;
}

function IdentityChoice({ onSelect }: { onSelect: (identity: Identity) => void }) {
  return <section className="booking-card booking-identity-choice"><h2>How would you like to continue?</h2><button type="button" onClick={() => onSelect("google")} className="booking-social"><Icon>G</Icon>Continue with Google</button><button type="button" onClick={() => onSelect("meta")} className="booking-social"><Icon>∞</Icon>Continue with Meta</button><button type="button" className="booking-quiet" onClick={() => onSelect("guest")}>Continue as Guest</button><button type="button" className="booking-quiet" onClick={() => onSelect("email")}>Log In with Email</button><p className="booking-reassure">⌁ Takes less than a minute.</p></section>;
}

function Details({ mode, kind, onBack, onContinue }: { mode: Mode; kind: ProductKind; onBack: () => void; onContinue: () => void }) {
  const [identity, setIdentity] = useState<Identity>(mode === "existing" ? "guest" : null);
  const [terms, setTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signedIn = identity === "google" || identity === "meta";
  const identityReady = signedIn ? mobile.length > 5 : identity === "guest" ? fullName && mobile.length > 5 && email.includes("@") : identity === "email" ? email.includes("@") && password.length > 3 : false;
  const canContinue = Boolean(identityReady && terms);

  const fields = <div className="booking-fields"><label>Full Name*<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name" /></label><label>Mobile*<input inputMode="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter your mobile number" /></label><label>Email*<input inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" /></label></div>;

  return <div className="booking-panel"><Progress step={3} /><ProductSummary kind={kind} compact onEdit={onBack} />
    {mode === "existing" ? <section className="booking-card booking-existing-details"><h2>Sign Up</h2><div className="booking-social-row"><button type="button" className="booking-social" onClick={() => setIdentity("google")}><Icon>G</Icon>Google</button><button type="button" className="booking-social" onClick={() => setIdentity("meta")}><Icon>∞</Icon>Meta</button></div><button type="button" className="booking-social" onClick={() => setIdentity("email")}><Icon>✉</Icon>Log In with Email</button><div className="booking-divider"><span>or</span></div><h2>Fill in details</h2>{fields}<OptionalRows /></section> : !identity ? <IdentityChoice onSelect={setIdentity} /> : <section className="booking-card booking-selected-identity"><button type="button" className="booking-change-method" onClick={() => setIdentity(null)}>Change method</button>{signedIn && <><h2><Icon>{identity === "google" ? "G" : "∞"}</Icon>Signed in with {identity === "google" ? "Google" : "Meta"}</h2><div className="booking-profile"><span>AN</span><div><strong>Adir Naor</strong><small>adir@example.com</small></div><b>✓</b></div><div className="booking-fields"><label>Mobile*<input inputMode="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="Enter your mobile number" /></label></div><OptionalRows /></>}{identity === "guest" && <><h2>Continue as Guest</h2>{fields}<OptionalRows /></>}{identity === "email" && <><h2>Log In with Email</h2><div className="booking-fields"><label>Email*<input inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" /></label><label>Password*<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label></div><div className="booking-inline-links"><button type="button">Forgot Password?</button><button type="button">Create Account</button></div></>}</section>}
    <section className="booking-payment-note"><Icon>▣</Icon><div><strong>Pay at the Spa</strong><p>Your card is only used to secure the booking. You will not be charged online.</p></div></section>
    <label className="booking-terms"><input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} /> <span>I agree to the SpaPlus Terms &amp; Conditions and Privacy Policy.</span></label>
    <div className="booking-sticky"><span className="booking-sticky-price">${products[kind].price}</span><button type="button" className="booking-primary" disabled={!canContinue} onClick={onContinue}>Continue to Secure Card Verification</button></div>
  </div>;
}

function CardVerification({ kind, onBack, onRestart }: { kind: ProductKind; onBack: () => void; onRestart: () => void }) {
  return <div className="booking-panel"><Progress step={4} /><section className="booking-card booking-card-form"><button type="button" className="booking-back-link" onClick={onBack}>← Back</button><h1>Secure Card Verification</h1><p className="booking-lock-line">▣ You will not be charged online.</p><div className="booking-due"><strong>${products[kind].price}</strong><span>due at the spa</span></div><div className="booking-fields"><label>Cardholder Name<input placeholder="Enter cardholder name" /></label><label>Card Number<input inputMode="numeric" placeholder="•••• •••• •••• ••••" /></label><div className="booking-two-fields"><label>MM / YY<input inputMode="numeric" placeholder="MM / YY" /></label><label>CVC<input inputMode="numeric" placeholder="CVC" /></label></div></div><div className="booking-demo-stop"><strong>Interactive demo ends here</strong><p>No card data is submitted or stored. This screen demonstrates the final step only.</p></div><button type="button" className="booking-secondary" onClick={onRestart}>Restart demo</button></section></div>;
}

export default function BookingDemo({ mode }: Props) {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<ProductKind | null>(null);
  const title = useMemo(() => mode === "existing" ? "Existing booking flow" : "Improved booking flow", [mode]);
  const restart = () => { setKind(null); setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const go = (next: number) => { setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <main className={`booking-demo booking-${mode}`}><header className="booking-topbar"><a href="/booking" className="booking-brand" aria-label="SpaPlus booking demo home"><Mark /><strong>SpaPlus</strong></a><div><span className={`booking-mode booking-mode-${mode}`}>{title}</span><a href={mode === "existing" ? "/booking/improved" : "/booking/existing"}>View {mode === "existing" ? "improved" : "existing"}</a></div></header><div className="booking-shell">{step === 1 && <Choice onChoose={(choice) => { setKind(choice); go(2); }} />}{step === 2 && kind && <Setup mode={mode} kind={kind} onBack={restart} onContinue={() => go(3)} />}{step === 3 && kind && <Details mode={mode} kind={kind} onBack={() => go(2)} onContinue={() => go(4)} />}{step === 4 && kind && <CardVerification kind={kind} onBack={() => go(3)} onRestart={restart} />}</div><footer className="booking-footer"><p>Interactive concept only. No booking, login, payment or personal data is submitted.</p></footer></main>;
}
