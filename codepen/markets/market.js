
const switcher = document.querySelector("[data-market-language]");
if (switcher) {
  switcher.addEventListener("change", (event) => {
    const root = location.hostname.endsWith("github.io") ? "/spaplus-global" : "";
    location.href = root + event.target.value;
  });
}
const shareButton = document.querySelector(".share-market");
const shareToast = document.querySelector(".share-toast");
if (shareButton) {
  shareButton.addEventListener("click", async () => {
    const shareUrl =
      document.querySelector('link[rel="canonical"]')?.href ||
      location.origin + location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      if (error && error.name === "AbortError") return;
      const field = document.createElement("textarea");
      field.value = shareUrl;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    shareToast.textContent = "Link copied";
    shareToast.classList.add("is-visible");
    window.setTimeout(() => shareToast.classList.remove("is-visible"), 2200);
  });
}
const funnelForm = document.querySelector("[data-country-funnel]");
if (funnelForm) {
  const formSteps = [...funnelForm.querySelectorAll("[data-form-step]")];
  const progressLabel = funnelForm.querySelector("[data-progress-label]");
  const progressBar = funnelForm.querySelector("[data-progress-bar]");
  const showStep = (stepNumber) => {
    formSteps.forEach((step) => {
      const active = Number(step.dataset.formStep) === stepNumber;
      step.hidden = !active;
      step.classList.toggle("is-active", active);
    });
    if (progressLabel) {
      progressLabel.textContent = stepNumber === 1
        ? funnelForm.dataset.stepOneLabel
        : funnelForm.dataset.stepTwoLabel;
    }
    if (progressBar) progressBar.style.width = stepNumber === 1 ? "50%" : "100%";
  };
  funnelForm.querySelector("[data-step-next]")?.addEventListener("click", () => {
    const firstStep = funnelForm.querySelector("[data-form-step='1']");
    const invalid = [...firstStep.querySelectorAll("input, select, textarea")].find(
      (field) => !field.checkValidity(),
    );
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return;
    }
    window.dataLayer.push({
      event: "spaplus_funnel_step_complete",
      step: 1,
      lead_type: funnelForm.elements.namedItem("leadType").value,
      market: funnelForm.elements.namedItem("market").value,
    });
    showStep(2);
    funnelForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  funnelForm.querySelector("[data-step-back]")?.addEventListener("click", () => {
    showStep(1);
    funnelForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const successModal = document.querySelector("[data-success-modal]");
  const closeSuccessModal = () => {
    if (!successModal) return;
    successModal.hidden = true;
    document.body.style.overflow = "";
  };
  successModal?.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", closeSuccessModal);
  });
  successModal?.addEventListener("click", (event) => {
    if (event.target === successModal) closeSuccessModal();
  });
  const attributionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "wbraid",
    "gbraid",
    "fbclid",
    "msclkid",
  ];
  const attributionParams = new URLSearchParams(location.search);
  const storedAttribution = JSON.parse(sessionStorage.getItem("spaplus_attribution") || "{}");
  attributionKeys.forEach((key) => {
    const value = attributionParams.get(key) || storedAttribution[key] || "";
    if (value) storedAttribution[key] = value;
    const field = funnelForm.elements.namedItem(key);
    if (field) field.value = value;
  });
  sessionStorage.setItem("spaplus_attribution", JSON.stringify(storedAttribution));
  funnelForm.elements.namedItem("referrer").value = document.referrer;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "spaplus_funnel_view",
    lead_type: funnelForm.elements.namedItem("leadType").value,
    market: funnelForm.elements.namedItem("market").value,
    locale: funnelForm.elements.namedItem("locale").value,
  });
  funnelForm.addEventListener("focusin", () => {
    if (funnelForm.dataset.started) return;
    funnelForm.dataset.started = "true";
    window.dataLayer.push({
      event: "spaplus_funnel_start",
      lead_type: funnelForm.elements.namedItem("leadType").value,
      market: funnelForm.elements.namedItem("market").value,
      locale: funnelForm.elements.namedItem("locale").value,
    });
  });
  funnelForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = funnelForm.querySelector(".form-status");
    const submit = funnelForm.querySelector("button[type='submit']");
    const formValues = Object.fromEntries(new FormData(funnelForm).entries());
    const emailLocaleMap = {
      "el-cy": "el",
      "el-gr": "el",
      "hu-hu": "hu",
      "it-it": "it",
      "de-de": "de",
      "de-ch": "de",
      "fr-fr": "fr",
      "nl-nl": "nl",
      "sv-se": "sv",
      "nb-no": "nb",
    };
    const fallbackAutoResponses = {
      "el-cy": "Ευχαριστούμε. Λάβαμε τα στοιχεία σας και η ομάδα SpaPlus θα επικοινωνήσει μαζί σας σύντομα.",
      "el-gr": "Ευχαριστούμε. Λάβαμε τα στοιχεία σας και η ομάδα SpaPlus θα επικοινωνήσει μαζί σας σύντομα.",
      "hu-hu": "Köszönjük. Megkaptuk az adatokat, és a SpaPlus csapata hamarosan jelentkezik.",
      "it-it": "Grazie. Abbiamo ricevuto i tuoi dati e il team SpaPlus ti contatterà presto.",
      "de-de": "Vielen Dank. Wir haben Ihre Angaben erhalten. Das SpaPlus-Team meldet sich in Kürze.",
      "de-ch": "Vielen Dank. Wir haben Ihre Angaben erhalten. Das SpaPlus-Team meldet sich in Kürze.",
      "fr-fr": "Merci. Nous avons bien reçu vos informations. L’équipe SpaPlus reviendra vers vous prochainement.",
      "nl-nl": "Bedankt. We hebben je gegevens ontvangen. Het SpaPlus-team neemt binnenkort contact op.",
      "sv-se": "Tack. Vi har tagit emot dina uppgifter. SpaPlus-teamet återkommer snart.",
      "nb-no": "Takk. Vi har mottatt opplysningene dine. SpaPlus-teamet tar snart kontakt.",
    };
    const topic = formValues.leadType === "spa_business"
      ? "Spa business lead | " + formValues.market
      : "Country entrepreneur lead | " + formValues.market;
    const campaignDetails = attributionKeys
      .filter((key) => formValues[key])
      .map((key) => key + ": " + formValues[key])
      .join("\n");
    const payload = {
      submissionId: crypto.randomUUID(),
      privacyAccepted: formValues.privacyConsent === "accepted",
      name: formValues.name,
      email: formValues.email,
      organization: formValues.company,
      topic,
      publicTopic: formValues.displayTopic,
      locale: emailLocaleMap[formValues.locale] || "en",
      source: location.href,
      message: [
        formValues.message,
        "",
        "Market: " + formValues.market,
        "Lead type: " + formValues.leadType,
        "Phone: " + formValues.phone,
        "Website: " + (formValues.website || "Not provided"),
        formValues.city ? "City or region: " + formValues.city : "",
        formValues.role ? "Contact role: " + formValues.role : "",
        formValues.businessType ? "Business type: " + formValues.businessType : "",
        formValues.treatmentRooms ? "Treatment rooms: " + formValues.treatmentRooms : "",
        formValues.onlineBooking ? "Online booking: " + formValues.onlineBooking : "",
        formValues.authorityConfirmed ? "Authority confirmed: Yes" : "",
        campaignDetails ? "\nCampaign attribution:\n" + campaignDetails : "",
        "Referrer: " + (formValues.referrer || "Direct"),
      ].filter(Boolean).join("\n"),
    };
    funnelForm.classList.add("is-sending");
    submit.disabled = true;
    status.textContent = funnelForm.dataset.sending;
    try {
      let response = null;
      try {
        response = await fetch("https://spaplus-global-brand.adir-naor-7510.chatgpt.site/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        response = null;
      }
      if (!response?.ok) {
        response = await fetch("https://formsubmit.co/ajax/93567c940af3bbace0ca1b462708c256", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            company: formValues.company,
            website: formValues.website || "Not provided",
            city_or_region: formValues.city || "Not provided",
            contact_role: formValues.role || "Not provided",
            business_type: formValues.businessType || "Not provided",
            treatment_rooms: formValues.treatmentRooms || "Not provided",
            online_booking: formValues.onlineBooking || "Not provided",
            authority_confirmed: formValues.authorityConfirmed || "Not applicable",
            market: formValues.market,
            lead_type: formValues.leadType,
            message: formValues.message,
            campaign_attribution: campaignDetails || "Direct",
            page: location.href,
            _subject: "[SpaPlus Global] " + topic,
            _template: "box",
            _cc: "palombo.r@gmail.com,s0509350015@gmail.com",
            _autoresponse:
              fallbackAutoResponses[formValues.locale] ||
              "Thank you for contacting SpaPlus Global. We have received your enquiry and our team will review it shortly.",
          }),
        });
      }
      if (!response.ok) throw new Error("Delivery endpoints failed");
      window.dataLayer.push({
        event: "generate_lead",
        lead_type: formValues.leadType,
        market: formValues.market,
        locale: formValues.locale,
      });
      funnelForm.reset();
      status.textContent = funnelForm.dataset.success;
      if (formSteps.length) showStep(1);
      if (successModal) {
        successModal.hidden = false;
        document.body.style.overflow = "hidden";
        successModal.querySelector("[data-modal-close]")?.focus();
      }
    } catch {
      status.textContent = funnelForm.dataset.error;
      window.dataLayer.push({
        event: "spaplus_funnel_error",
        lead_type: formValues.leadType,
        market: formValues.market,
        locale: formValues.locale,
      });
    } finally {
      funnelForm.classList.remove("is-sending");
      submit.disabled = false;
    }
  });
}
