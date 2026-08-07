"use client";

import { useMemo, useState } from "react";

type Locale = "en" | "fr";
type View = "overview" | "onboarding" | "bookings" | "reports" | "profile" | "help";

const text = {
  en: {
    demo: "DEMO WORKSPACE",
    spa: "New Spa Demo",
    market: "Canada",
    nav: ["Overview", "Onboarding", "Bookings", "Reports", "Spa profile", "Help centre"],
    heading: "Everything your spa needs to launch, manage bookings and grow.",
    intro: "This is the empty first-day workspace. Nothing is published and no booking can arrive until the setup is reviewed and approved.",
    sample: "Illustrative demo. No live business data is shown.",
    resume: "Continue setup",
    progress: "Launch progress",
    progressValue: "0 of 7 steps complete",
    cards: ["Bookings", "Gross sales", "Guests", "Live experiences"],
    checklist: "Your launch journey",
    checklistIntro: "A guided path from registration to a bookable SpaPlus profile.",
    steps: [
      ["Business details", "Legal name, location, contacts and booking notification email."],
      ["Treatments and packages", "Choose approved services from your website or add them manually."],
      ["Capacity and facilities", "Add group capacity, amenities, accessibility and opening hours."],
      ["Photos and permissions", "Approve website media or upload verified spa photography."],
      ["Policies", "Confirm cancellation, no-show, content and review permissions."],
      ["Partner agreement", "Review and sign the approved Canadian partner agreement."],
      ["SpaPlus review", "Our team verifies the profile before it can go live."],
    ],
    open: "Open step",
    noBookings: "No bookings yet",
    noBookingsText: "When your spa is live, every request, approval, change and cancellation will appear here with a complete activity history.",
    example: "View booking example",
    lifecycle: "How a booking moves",
    lifecycleSteps: ["New request", "Awaiting spa", "Confirmed", "Modified", "Completed"],
    payments: "Simple payment reconciliation",
    paymentsText: "Track pay-at-spa and prepaid bookings, commission, balances and the monthly settlement in one place.",
    operations: "Canada operations view",
    operationsText: "Country managers see onboarding, active and paused spas, booking health, documents and alerts across the market.",
    integration: "Data connection",
    integrationText: "Gal booking data is not connected in this demo. The production connector will be added only after field mapping, permissions and reconciliation tests.",
    close: "Close",
    modalTitle: "Illustrative booking record",
    modalText: "This preview shows the structure only. It does not create a booking or change the zero totals.",
    bookingRows: ["Guest and contact details", "Experience, date and participants", "Approval and change timeline", "Payment, commission and settlement"],
    setupTitle: "Business details",
    setupText: "The real onboarding saves each step, sends a continuation link and records every email, document and approval in the audit trail.",
    fields: ["Spa or company name", "Website", "Booking requests email", "Customer reviews email", "Main contact", "Province and time zone"],
    save: "Save draft",
    notConnected: "Demo only. Saving is disabled.",
    language: "FR CA",
  },
  fr: {
    demo: "ESPACE DE DÉMONSTRATION",
    spa: "Nouveau spa, démo",
    market: "Canada",
    nav: ["Aperçu", "Intégration", "Réservations", "Rapports", "Profil du spa", "Centre d’aide"],
    heading: "Tout ce qu’il faut à votre spa pour se lancer, gérer ses réservations et grandir.",
    intro: "Voici l’espace de travail vide du premier jour. Rien n’est publié et aucune réservation ne peut arriver avant la vérification et l’approbation.",
    sample: "Démonstration illustrative. Aucune donnée commerciale réelle.",
    resume: "Continuer l’intégration",
    progress: "Progression du lancement",
    progressValue: "0 étape sur 7 terminée",
    cards: ["Réservations", "Ventes brutes", "Clients", "Expériences actives"],
    checklist: "Votre parcours de lancement",
    checklistIntro: "Un parcours guidé de l’inscription jusqu’à la mise en ligne sur SpaPlus.",
    steps: [
      ["Renseignements sur l’entreprise", "Nom légal, adresse, contacts et courriel de réservation."],
      ["Soins et forfaits", "Sélectionnez les services approuvés ou ajoutez-les manuellement."],
      ["Capacité et installations", "Ajoutez la capacité, les commodités, l’accessibilité et les heures."],
      ["Photos et autorisations", "Approuvez les médias du site ou téléversez des photos vérifiées."],
      ["Politiques", "Confirmez les politiques d’annulation et les autorisations de contenu."],
      ["Entente de partenariat", "Lisez et signez l’entente canadienne approuvée."],
      ["Vérification SpaPlus", "Notre équipe vérifie le profil avant sa mise en ligne."],
    ],
    open: "Ouvrir l’étape",
    noBookings: "Aucune réservation pour le moment",
    noBookingsText: "Une fois votre spa actif, chaque demande, approbation, modification et annulation apparaîtra ici avec son historique.",
    example: "Voir un exemple",
    lifecycle: "Parcours d’une réservation",
    lifecycleSteps: ["Nouvelle demande", "En attente du spa", "Confirmée", "Modifiée", "Terminée"],
    payments: "Rapprochement des paiements simplifié",
    paymentsText: "Suivez les paiements sur place et prépayés, les commissions, les soldes et le règlement mensuel.",
    operations: "Vue des opérations au Canada",
    operationsText: "Les responsables suivent l’intégration, les spas actifs ou en pause, les documents, les réservations et les alertes.",
    integration: "Connexion des données",
    integrationText: "Les données de réservation de Gal ne sont pas connectées à cette démo. Le connecteur de production suivra la validation des champs, droits et rapprochements.",
    close: "Fermer",
    modalTitle: "Exemple de réservation",
    modalText: "Cet aperçu montre seulement la structure. Il ne crée aucune réservation et ne modifie pas les totaux.",
    bookingRows: ["Client et coordonnées", "Expérience, date et participants", "Historique des approbations", "Paiement, commission et règlement"],
    setupTitle: "Renseignements sur l’entreprise",
    setupText: "Le véritable parcours enregistre chaque étape, envoie un lien de reprise et conserve les courriels, documents et approbations dans l’historique.",
    fields: ["Nom du spa ou de l’entreprise", "Site Web", "Courriel des réservations", "Courriel des avis clients", "Personne-ressource", "Province et fuseau horaire"],
    save: "Enregistrer le brouillon",
    notConnected: "Démonstration seulement. L’enregistrement est désactivé.",
    language: "EN CA",
  },
} as const;

export default function NewSpaDemo() {
  const [locale, setLocale] = useState<Locale>("en");
  const [view, setView] = useState<View>("overview");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const t = text[locale];
  const views: View[] = ["overview", "onboarding", "bookings", "reports", "profile", "help"];
  const money = locale === "fr" ? "0 $ CA" : "CA$0";
  const values = useMemo(() => ["0", money, "0", "0"], [money]);

  return (
    <main className="ops-demo" lang={locale === "fr" ? "fr-CA" : "en-CA"}>
      <aside className="ops-sidebar">
        <a className="ops-brand" href="/demo/new-spa/" aria-label="SpaPlus home">
          <img src="/spaplus-mark.png" alt="SpaPlus" /><span>SpaPlus</span>
        </a>
        <div className="ops-market"><small>{t.market}</small><strong>{t.spa}</strong><span>{t.demo}</span></div>
        <nav aria-label="Workspace navigation">
          {t.nav.map((label, index) => (
            <button key={label} className={view === views[index] ? "active" : ""} onClick={() => setView(views[index])}>
              <i aria-hidden="true" /> <span>{label}</span>{index === 2 ? <b>0</b> : null}
            </button>
          ))}
        </nav>
        <div className="ops-user"><span>NS</span><div><strong>{t.spa}</strong><small>Partner workspace</small></div></div>
      </aside>

      <section className="ops-shell">
        <header className="ops-topbar">
          <div><strong>SpaPlus</strong><span>{t.demo}</span></div>
          <button onClick={() => setLocale(locale === "en" ? "fr" : "en")}>{t.language}</button>
        </header>
        <nav className="ops-mobile-nav" aria-label="Mobile workspace navigation">
          {t.nav.slice(0, 4).map((label, index) => <button key={label} className={view === views[index] ? "active" : ""} onClick={() => setView(views[index])}>{label}</button>)}
        </nav>

        <div className="ops-content">
          <div className="ops-notice"><span>i</span><p>{t.sample}</p></div>
          <section className="ops-hero">
            <div><small>{t.market} partner workspace</small><h1>{t.heading}</h1><p>{t.intro}</p></div>
            <article className="ops-progress"><div><span>{t.progress}</span><strong>{t.progressValue}</strong></div><i><b /></i><button onClick={() => setSetupOpen(true)}>{t.resume}</button></article>
          </section>

          <section className="ops-stats" aria-label="Workspace totals">
            {t.cards.map((label, index) => <article key={label}><span>{label}</span><strong>{values[index]}</strong><small>No data yet</small></article>)}
          </section>

          <section className="ops-grid">
            <article className="ops-card ops-journey">
              <header><div><small>0%</small><h2>{t.checklist}</h2><p>{t.checklistIntro}</p></div><strong>0 / 7</strong></header>
              <div className="ops-steps">{t.steps.map(([title, body], index) => <div key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div><button onClick={() => setSetupOpen(true)}>{t.open}</button></div>)}</div>
            </article>
            <div className="ops-side">
              <article className="ops-card ops-empty"><span className="ops-empty-icon">0</span><h2>{t.noBookings}</h2><p>{t.noBookingsText}</p><button onClick={() => setBookingOpen(true)}>{t.example}</button></article>
              <article className="ops-dark"><small>{t.lifecycle}</small><div>{t.lifecycleSteps.map((step, index) => <span key={step}><b>{index + 1}</b>{step}</span>)}</div></article>
            </div>
          </section>

          <section className="ops-feature-grid">
            <article><span>01</span><h2>{t.payments}</h2><p>{t.paymentsText}</p></article>
            <article><span>02</span><h2>{t.operations}</h2><p>{t.operationsText}</p></article>
            <article className="warning"><span>03</span><h2>{t.integration}</h2><p>{t.integrationText}</p></article>
          </section>
        </div>
      </section>

      {bookingOpen ? <div className="ops-overlay" onClick={() => setBookingOpen(false)}><section className="ops-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}><button className="ops-x" onClick={() => setBookingOpen(false)}>×</button><small>{t.demo}</small><h2>{t.modalTitle}</h2><p>{t.modalText}</p><div>{t.bookingRows.map((row, index) => <span key={row}><b>{index + 1}</b>{row}</span>)}</div><button className="ops-primary" onClick={() => setBookingOpen(false)}>{t.close}</button></section></div> : null}
      {setupOpen ? <div className="ops-overlay drawer" onClick={() => setSetupOpen(false)}><aside className="ops-drawer" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}><button className="ops-x" onClick={() => setSetupOpen(false)}>×</button><small>STEP 1 OF 7</small><h2>{t.setupTitle}</h2><p>{t.setupText}</p><div className="ops-fields">{t.fields.map(field => <label key={field}><span>{field}</span><input disabled aria-label={field} /></label>)}</div><p className="ops-info">{t.notConnected}</p><button className="ops-primary" disabled>{t.save}</button></aside></div> : null}
    </main>
  );
}
