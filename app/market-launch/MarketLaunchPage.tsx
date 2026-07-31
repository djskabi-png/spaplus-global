"use client";

import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./market-launch.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

export type MarketLaunchConfig = {
  marketName: string;
  marketSlug: string;
  countryName: string;
  primaryCity: string;
  locale: string;
  languageTag: string;
  homeHref: string;
  heroImage: string;
  heroDisclosure?: string;
  leadEndpoint: string;
  reviewWindowHours: number;
  referenceMarketName: string;
  referenceCountryName: string;
  referenceSpas: Array<{
    name: string;
    location: string;
    image: string;
    imageAlt: string;
  }>;
  priorityAreas: string[];
};

const spaTypes = [
  "Day spa",
  "Hotel or resort spa",
  "Nordic or thermal spa",
  "Medical or wellness spa",
  "Multi-location spa group",
  "Other established spa venue",
];

const serviceOptions = [
  "Massage",
  "Facials and skincare",
  "Body treatments",
  "Thermal or Nordic experience",
  "Couples experiences",
  "Group experiences",
  "Day passes",
  "Spa stays",
];

function track(event: string, data: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("spaplus:marketing-event", {
      detail: { event, ...data },
    }),
  );
  const candidate = window as Window & {
    dataLayer?: Array<Record<string, string>>;
  };
  if (window.localStorage.getItem("spaplus-consent") === "analytics") {
    candidate.dataLayer?.push({ event, ...data });
  }
}

export default function MarketLaunchPage({
  config,
}: {
  config: MarketLaunchConfig;
}) {
  const {
    marketName,
    marketSlug,
    countryName,
    primaryCity,
    locale,
    languageTag,
    homeHref,
    heroImage,
    heroDisclosure,
    leadEndpoint,
    reviewWindowHours,
    referenceMarketName,
    referenceCountryName,
    referenceSpas,
    priorityAreas,
  } = config;
  const eventPrefix = marketSlug.replace(/[^a-z0-9_]+/g, "_");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formStarted, setFormStarted] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const campaignData = useMemo(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]
        .map((key) => [key, params.get(key) || ""])
        .filter(([, value]) => value),
    );
  }, []);

  useEffect(() => {
    setShowCookieConsent(!window.localStorage.getItem("spaplus-consent"));
    track(`view_${eventPrefix}_launch`, {
      market: marketSlug,
      language: locale,
    });
  }, [eventPrefix, locale, marketSlug]);

  function setConsent(value: "essential" | "analytics") {
    window.localStorage.setItem("spaplus-consent", value);
    setShowCookieConsent(false);
    window.dispatchEvent(
      new CustomEvent("spaplus:consent", {
        detail: { analytics: value === "analytics" },
      }),
    );
    if (value === "analytics") {
      track(`view_${eventPrefix}_launch`, {
        market: marketSlug,
        language: locale,
        consent_update: "granted",
      });
    }
  }

  function beginForm() {
    if (!formStarted) {
      setFormStarted(true);
      track(`start_${eventPrefix}_spa_form`, { market: marketSlug });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "submitting") return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const services = values.getAll("services").map(String);
    setSubmitState("submitting");
    setErrorMessage("");

    const payload = {
      submissionId: crypto.randomUUID(),
      market: marketSlug,
      name: String(values.get("name") || ""),
      role: String(values.get("role") || ""),
      email: String(values.get("email") || ""),
      phone: String(values.get("phone") || ""),
      organization: String(values.get("organization") || ""),
      website: String(values.get("website") || ""),
      city: String(values.get("city") || ""),
      postalCode: String(values.get("postalCode") || ""),
      spaType: String(values.get("spaType") || ""),
      locations: String(values.get("locations") || ""),
      services,
      bookingSystem: String(values.get("bookingSystem") || ""),
      preferredContact: String(values.get("preferredContact") || ""),
      message: String(values.get("message") || ""),
      privacyAccepted: values.get("privacy") === "accepted",
      acknowledgementAccepted:
        values.get("acknowledgement") === "accepted",
      honey: String(values.get("website_confirm") || ""),
      locale: languageTag,
      source: window.location.href,
      campaign: campaignData,
    };

    try {
      const response = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to submit");
      }
      form.reset();
      setSubmitState("success");
      track(`submit_${eventPrefix}_spa_form`, {
        market: marketSlug,
        lead_type: "spa_partner",
      });
    } catch {
      setSubmitState("error");
      setErrorMessage(
        "We could not send your details right now. Please try again in a moment.",
      );
    }
  }

  return (
    <main
      className={styles.page}
      style={
        {
          "--market-hero": `url("${heroImage}")`,
        } as CSSProperties
      }
    >
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.header}>
        <a className={styles.brand} href={homeHref} aria-label="SpaPlus Global home">
          <img src="/spaplus-mark.png" alt="" width="48" height="48" />
          <img
            src="/spaplus-wordmark.png"
            alt="SpaPlus"
            width="132"
            height="40"
          />
        </a>
        <nav
          className={styles.headerNav}
          aria-label={`${marketName} launch navigation`}
        >
          <a href="#platform">The platform</a>
          <a href="#process">How it works</a>
          <a href="#faq">Questions</a>
          <a
            className={styles.navCta}
            href="#join"
            onClick={() =>
              track("click_join_early_access", { placement: "header" })
            }
          >
            Join early access
          </a>
        </nav>
      </header>

      <section className={styles.hero} id="main-content">
        <div className={styles.heroPhoto} aria-hidden="true" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            {marketName.toUpperCase()}, YOU&apos;RE NEXT
          </p>
          <h1>SpaPlus is coming to {marketName}.</h1>
          <p className={styles.heroLead}>
            We are preparing a better way for people across {primaryCity} and{" "}
            {marketName} to discover, compare and book memorable spa
            experiences.
          </p>
          <div className={styles.promiseRow} aria-label="Registration terms">
            <span>No fee to register</span>
            <span>No commitment</span>
            <span>No credit card</span>
          </div>
          <div className={styles.heroActions}>
            <a
              className={styles.primaryButton}
              href="#join"
              onClick={() =>
                track("click_join_early_access", { placement: "hero" })
              }
            >
              Put your spa on the early list
            </a>
            <a className={styles.textButton} href="#proof">
              See SpaPlus in action
            </a>
          </div>
          <p className={styles.heroNote}>
            Registration is an expression of interest. It is not a contract or
            a purchase.
          </p>
          {heroDisclosure ? (
            <p className={styles.heroMediaNote}>{heroDisclosure}</p>
          ) : null}
        </div>
      </section>

      <section className={styles.launchBand} aria-label="Launch status">
        <div>
          <small>LIVE TODAY</small>
          <strong>{referenceMarketName}</strong>
        </div>
        <span className={styles.routeLine} aria-hidden="true">
          <i />
        </span>
        <div>
          <small>COMING NEXT</small>
          <strong>{marketName}</strong>
        </div>
      </section>

      <section className={styles.intro} id="why">
        <div className={styles.sectionLabel}>A STRONGER WAY TO GROW</div>
        <div>
          <h2>More people looking for a great spa day. More opportunities for the right spas.</h2>
          <p>
            SpaPlus brings discovery, offers and booking into one focused spa
            platform. Guests get a simpler way to find an experience worth
            making time for. Spa partners get a new channel designed around the
            way spa businesses actually work.
          </p>
        </div>
      </section>

      <section className={styles.benefits}>
        <article>
          <span>01</span>
          <h3>Join before the launch</h3>
          <p>
            Tell us about your business now and be among the first{" "}
            {marketName} spas considered for onboarding.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Get discovered by new guests</h3>
          <p>
            Present the experiences, packages and occasions that make your spa
            worth choosing.
          </p>
        </article>
        <article>
          <span>03</span>
          <h3>Review the offer before deciding</h3>
          <p>
            If the fit is right, we will explain the launch offer and next
            steps. You decide whether to continue.
          </p>
        </article>
      </section>

      <section className={styles.platformSection} id="platform">
        <div className={styles.platformHeading}>
          <div>
            <p className={styles.eyebrowDark}>ONE SPA PLATFORM</p>
            <h2>From first discovery to a confirmed booking.</h2>
          </div>
          <p>
            SpaPlus is being built as a focused home for spa and wellness, not
            another general marketplace. It gives guests a clear way to choose
            and gives spa teams a practical way to receive and manage demand.
          </p>
        </div>

        <div className={styles.productStory}>
          <div className={styles.guestPreview}>
            <div className={styles.previewBar}>
              <span />
              <b>Guest experience</b>
              <small>ILLUSTRATIVE PREVIEW</small>
            </div>
            <div className={styles.previewHero}>
              <p>Find your next good day.</p>
              <h3>Spa experiences across {marketName}</h3>
              <div className={styles.searchPreview}>
                <span>{primaryCity}</span>
                <span>Any date</span>
                <strong>Explore</strong>
              </div>
            </div>
            <div className={styles.previewCards}>
              <article>
                <span>COUPLES</span>
                <strong>A day made for two</strong>
              </article>
              <article>
                <span>DAY PASS</span>
                <strong>More than a treatment</strong>
              </article>
              <article>
                <span>SOLO RESET</span>
                <strong>Time that is entirely yours</strong>
              </article>
            </div>
          </div>

          <div className={styles.partnerPreview}>
            <div className={styles.partnerPreviewTop}>
              <span className={styles.logoDot}>SP</span>
              <div>
                <small>PARTNER VIEW</small>
                <strong>Today at your spa</strong>
              </div>
              <span className={styles.livePill}>LIVE</span>
            </div>
            <div className={styles.partnerStats}>
              <div>
                <small>NEW REQUESTS</small>
                <strong>4</strong>
              </div>
              <div>
                <small>CONFIRMED</small>
                <strong>11</strong>
              </div>
            </div>
            <div className={styles.bookingPreview}>
              <span>10:30</span>
              <div>
                <strong>Couples spa experience</strong>
                <small>2 guests · Confirmation requested</small>
              </div>
              <b>Review</b>
            </div>
            <div className={styles.bookingPreview}>
              <span>14:00</span>
              <div>
                <strong>Day spa package</strong>
                <small>1 guest · Confirmed</small>
              </div>
              <b className={styles.confirmed}>Ready</b>
            </div>
          </div>
        </div>
        <p className={styles.interfaceDisclosure}>
          Interface previews are illustrative. {marketName} inventory is not
          live and the final partner tools may evolve before launch.
        </p>

        <div className={styles.platformGrid}>
          <article>
            <span>01</span>
            <h3>A dedicated spa marketplace</h3>
            <p>
              Present treatments, packages, day passes and spa stays in a place
              where guests arrive specifically looking for wellness.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Booking requests that are easy to manage</h3>
            <p>
              Receive a request by email and in the partner system, then review
              and confirm it without a complicated process.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Availability at the level that suits you</h3>
            <p>
              Start by confirming requests. Spas that maintain live
              availability can move toward immediate confirmation.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Clear payments and monthly reconciliation</h3>
            <p>
              Guests may pay online or at the spa, according to the available
              offer. A monthly report keeps bookings, commission and settlement
              transparent.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.proof} id="proof">
        <div className={styles.proofHeading}>
          <div>
            <p className={styles.eyebrowDark}>BUILT FOR REAL SPA EXPERIENCES</p>
            <h2>
              Already helping guests discover spas in {referenceMarketName}.
            </h2>
          </div>
          <p>
            These are current experiences presented on the live SpaPlus Canada
            platform. {marketName} listings are not live yet.
          </p>
        </div>
        <div className={styles.gallery}>
          {referenceSpas.map((spa) => (
            <figure key={spa.name}>
              <img
                src={spa.image}
                alt={spa.imageAlt}
                width="400"
                height="320"
              />
              <figcaption>
                <strong>{spa.name}</strong>
                <span>{spa.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.mediaDisclosure}>
          Images are sourced from current spa listings on the official SpaPlus
          Canada website. They illustrate the existing {referenceMarketName}{" "}
          platform in {referenceCountryName} and do not depict future{" "}
          {marketName} partners.
        </p>
      </section>

      <section className={styles.occasionSection} id="experiences">
        <div className={styles.occasionLead}>
          <p className={styles.eyebrow}>THE OCCASIONS PEOPLE MAKE TIME FOR</p>
          <h2>Not one kind of guest. Not one kind of spa day.</h2>
          <p>
            The platform is designed to help people start with the experience
            they want, then find a spa that fits.
          </p>
        </div>
        <div className={styles.occasionGrid}>
          <article>
            <span>01</span>
            <h3>For two</h3>
            <p>Couples experiences, celebrations and time away together.</p>
          </article>
          <article>
            <span>02</span>
            <h3>For one</h3>
            <p>A treatment, a quiet reset or a full day devoted to yourself.</p>
          </article>
          <article>
            <span>03</span>
            <h3>For groups</h3>
            <p>Birthdays, friends, teams and occasions worth planning well.</p>
          </article>
          <article>
            <span>04</span>
            <h3>For the whole day</h3>
            <p>Day passes, thermal experiences, resort spas and spa stays.</p>
          </article>
        </div>
      </section>

      <section className={styles.fitSection}>
        <div>
          <p className={styles.eyebrowDark}>WHO WE WANT TO MEET</p>
          <h2>
            Established {marketName} spas that care about the guest experience.
          </h2>
        </div>
        <div className={styles.fitGrid}>
          <p>Day spas with a physical commercial location</p>
          <p>Hotel, resort, Nordic and thermal spas</p>
          <p>Wellness venues with bookable spa experiences</p>
          <p>Multi-location groups preparing for their next growth channel</p>
        </div>
        <p className={styles.fitNote}>
          SpaPlus is not currently onboarding individual mobile therapists,
          home-based services or solo private treatment rooms through this
          program.
        </p>
        <div className={styles.priorityAreas}>
          <span>Priority launch areas</span>
          <div>
            {priorityAreas.map((area) => (
              <strong key={area}>{area}</strong>
            ))}
          </div>
          <small>
            These are target areas for partner conversations, not a claim that
            SpaPlus is already operating there.
          </small>
        </div>
      </section>

      <section className={styles.commercialSection} id="partner-model">
        <div className={styles.commercialIntro}>
          <p className={styles.eyebrowDark}>A MODEL THAT STARTS SIMPLE</p>
          <h2>Understand the journey before you decide.</h2>
          <p>
            Early registration is free. If there is a strong fit, the full
            launch offer and commercial terms are reviewed with you in writing
            before any commitment.
          </p>
        </div>
        <div className={styles.commercialFlow}>
          <article>
            <span>DISCOVERY</span>
            <h3>Your spa is presented to guests</h3>
            <p>
              People can discover your venue, understand your experiences and
              choose an offer that fits the occasion.
            </p>
          </article>
          <article>
            <span>BOOKING</span>
            <h3>You stay in control of confirmation</h3>
            <p>
              Confirm from the email or partner system. If you maintain live
              availability, eligible bookings can be confirmed immediately.
            </p>
          </article>
          <article>
            <span>PAYMENT</span>
            <h3>The guest chooses the available payment option</h3>
            <p>
              For pay-at-spa bookings, the spa charges the guest. For prepaid
              bookings, SpaPlus processes the payment.
            </p>
          </article>
          <article>
            <span>SETTLEMENT</span>
            <h3>One clear monthly picture</h3>
            <p>
              A report shows what was charged, the applicable commission and
              the net balance to settle between the parties.
            </p>
          </article>
        </div>
        <div className={styles.futureNote}>
          <strong>Built to become even easier</strong>
          <p>
            After the initial operating period, deeper calendar connections may
            allow full availability checks and more bookings to flow through
            automatically.
          </p>
        </div>
      </section>

      <section className={styles.process} id="process">
        <div className={styles.processIntro}>
          <p className={styles.eyebrow}>SIMPLE FROM THE START</p>
          <h2>Four steps. No pressure.</h2>
          <p>
            The form helps us understand your spa before we speak. It does not
            create a contract or commit you to joining.
          </p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Introduce your spa</h3>
              <p>Share the basics about your venue, services and location.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>We review the fit</h3>
              <p>
                Our team reviews every complete enquiry within{" "}
                {reviewWindowHours} hours.
              </p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Have a real conversation</h3>
              <p>We explain the launch plan, answer questions and learn more.</p>
            </div>
          </li>
          <li>
            <span>04</span>
            <div>
              <h3>Decide together</h3>
              <p>
                If there is a strong fit, you can review the written launch
                offer before choosing whether to move ahead.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section className={styles.formSection} id="join">
        <div className={styles.formIntro}>
          <p className={styles.eyebrowDark}>
            {marketName.toUpperCase()} FOUNDING SPA LIST
          </p>
          <h2>Tell us about your spa.</h2>
          <p>
            Complete the form once. We will review it personally and contact
            you within {reviewWindowHours} hours.
          </p>
          <div className={styles.assuranceCard}>
            <strong>What happens after you send it?</strong>
            <ul>
              <li>You receive an immediate email confirmation.</li>
              <li>Our team reviews the business and location.</li>
              <li>We contact you to arrange a short conversation.</li>
              <li>No payment or card details are requested.</li>
            </ul>
          </div>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          onFocus={beginForm}
        >
          <div className={styles.field}>
            <label htmlFor="organization">Spa or business name</label>
            <input id="organization" name="organization" required maxLength={160} />
          </div>
          <div className={styles.field}>
            <label htmlFor="website">Website or social profile</label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              required
              maxLength={300}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="city">{marketName} city</label>
            <input id="city" name="city" required maxLength={100} />
          </div>
          <div className={styles.field}>
            <label htmlFor="postalCode">Postal code</label>
            <input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              required
              maxLength={12}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="spaType">Type of spa</label>
            <select id="spaType" name="spaType" required defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              {spaTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="locations">Number of locations</label>
            <select id="locations" name="locations" required defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              <option value="1">1 location</option>
              <option value="2-3">2 to 3 locations</option>
              <option value="4-10">4 to 10 locations</option>
              <option value="11+">11 or more locations</option>
            </select>
          </div>
          <fieldset className={styles.services}>
            <legend>Main services offered</legend>
            <div>
              {serviceOptions.map((service) => (
                <label key={service}>
                  <input type="checkbox" name="services" value={service} />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className={styles.field}>
            <label htmlFor="name">Your full name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="role">Your role</label>
            <input id="role" name="role" required maxLength={100} />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Business email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={180}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              maxLength={40}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="preferredContact">Preferred contact</label>
            <select
              id="preferredContact"
              name="preferredContact"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="bookingSystem">
              Current booking system <span>Optional</span>
            </label>
            <input id="bookingSystem" name="bookingSystem" maxLength={120} />
          </div>
          <div className={`${styles.field} ${styles.fullField}`}>
            <label htmlFor="message">
              Anything we should know? <span>Optional</span>
            </label>
            <textarea id="message" name="message" rows={5} maxLength={1500} />
          </div>
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="website_confirm">Leave this field empty</label>
            <input
              id="website_confirm"
              name="website_confirm"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <label className={styles.consent}>
            <input
              type="checkbox"
              name="privacy"
              value="accepted"
              required
            />
            <span>
              I agree that SpaPlus may use these details to assess and respond
              to this enquiry, as described in the{" "}
              <a href={`${homeHref}#privacy`} target="_blank" rel="noreferrer">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          <label className={styles.consent}>
            <input
              type="checkbox"
              name="acknowledgement"
              value="accepted"
              required
            />
            <span>
              I understand that this registration is an expression of interest
              only. It creates no commitment and requests no payment or credit
              card.
            </span>
          </label>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={submitState === "submitting"}
          >
            {submitState === "submitting"
              ? "Sending your details..."
              : `Join the ${marketName} early list`}
          </button>
          {submitState === "error" ? (
            <p className={styles.formError} role="alert">
              {errorMessage}
            </p>
          ) : null}
          <p className={styles.formFinePrint}>
            Founding partner terms are not guaranteed. Any commercial offer
            will be shared separately in writing after a fit review.
          </p>
        </form>
      </section>

      <section className={styles.faq} id="faq">
        <div>
          <p className={styles.eyebrowDark}>THE IMPORTANT QUESTIONS</p>
          <h2>Before you register.</h2>
        </div>
        <div className={styles.faqList}>
          <details>
            <summary>Does it cost anything to register?</summary>
            <p>
              No. Joining the {marketName} early-access list is free. We do not
              ask for payment or credit card details.
            </p>
          </details>
          <details>
            <summary>Am I committing my spa to join?</summary>
            <p>
              No. The form only tells us you are interested in learning more.
              You can review the launch offer before making any decision.
            </p>
          </details>
          <details>
            <summary>When will SpaPlus launch in {marketName}?</summary>
            <p>
              The launch date has not been announced. Early registrations help
              us build the right founding group before opening the market.
            </p>
          </details>
          <details>
            <summary>What happens with bookings later?</summary>
            <p>
              The initial partner setup supports booking requests and
              confirmations. Spas can manage availability in the partner system
              for immediate confirmation, with deeper calendar connections
              planned as the market develops.
            </p>
          </details>
          <details>
            <summary>How are guest payments handled?</summary>
            <p>
              Guests may be offered pay-now or pay-at-the-spa options, depending
              on the experience. Settlement and commission details are shown in
              a clear monthly report and explained before a spa goes live.
            </p>
          </details>
        </div>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.eyebrow}>
          {primaryCity.toUpperCase()}. {marketName.toUpperCase()}. LET&apos;S
          BUILD THIS WELL.
        </p>
        <h2>
          Your spa could help shape the first SpaPlus experience in{" "}
          {marketName}.
        </h2>
        <a
          className={styles.primaryButton}
          href="#join"
          onClick={() =>
            track("click_join_early_access", { placement: "final" })
          }
        >
          Introduce your spa
        </a>
      </section>

      <footer className={styles.footer}>
        <a className={styles.footerBrand} href={homeHref}>
          <img src="/spaplus-mark.png" alt="" width="42" height="42" />
          <span>SpaPlus</span>
        </a>
        <p>
          SpaPlus is preparing the {marketName} market in {countryName}. No{" "}
          {marketName} spa listings or booking inventory are currently
          represented on this page.
        </p>
        <div>
          <a href={`${homeHref}#about`}>About SpaPlus</a>
          <a href={`${homeHref}#privacy`}>Privacy</a>
          <a href={`${homeHref}#accessibility`}>Accessibility</a>
          <button
            className={styles.cookieSettingsButton}
            type="button"
            onClick={() => setShowCookieConsent(true)}
          >
            Cookie settings
          </button>
        </div>
        <small>© 2026 Global Spa Management Ltd. All rights reserved.</small>
      </footer>

      {submitState === "success" ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSubmitState("idle");
          }}
        >
          <div
            className={styles.successModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <button
              type="button"
              aria-label="Close confirmation"
              onClick={() => setSubmitState("idle")}
            >
              ×
            </button>
            <span className={styles.successMark} aria-hidden="true">
              ✓
            </span>
            <p className={styles.eyebrowDark}>YOU&apos;RE ON THE EARLY LIST</p>
            <h2 id="success-title">Thank you. Your spa details are with us.</h2>
            <p>
              A confirmation is on its way to your email. Our team will review
              the information and contact you within {reviewWindowHours} hours.
            </p>
            <button
              className={styles.modalButton}
              type="button"
              onClick={() => setSubmitState("idle")}
            >
              Back to the page
            </button>
          </div>
        </div>
      ) : null}

      {showCookieConsent ? (
        <aside
          className={styles.cookieConsent}
          aria-label="Privacy choices"
          role="region"
        >
          <div>
            <strong>Your privacy, your choice.</strong>
            <p>
              Essential storage runs the site. Analytics runs only with your
              permission. Read our{" "}
              <a href={`${homeHref}#privacy`}>Privacy Policy</a>.
            </p>
          </div>
          <div className={styles.cookieActions}>
            <button type="button" onClick={() => setConsent("essential")}>
              Essential only
            </button>
            <button type="button" onClick={() => setConsent("analytics")}>
              Allow analytics
            </button>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
