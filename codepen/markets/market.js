
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
    } catch {
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
  const attributionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
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
      "fr-fr": "fr-CA",
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
      locale: emailLocaleMap[formValues.locale] || "en",
      source: location.href,
      message: [
        formValues.message,
        "",
        "Market: " + formValues.market,
        "Lead type: " + formValues.leadType,
        "Phone: " + formValues.phone,
        "Website: " + (formValues.website || "Not provided"),
        campaignDetails ? "\nCampaign attribution:\n" + campaignDetails : "",
        "Referrer: " + (formValues.referrer || "Direct"),
      ].filter(Boolean).join("\n"),
    };
    funnelForm.classList.add("is-sending");
    submit.disabled = true;
    status.textContent = "Sending...";
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
            market: formValues.market,
            lead_type: formValues.leadType,
            message: formValues.message,
            campaign_attribution: campaignDetails || "Direct",
            page: location.href,
            _subject: "[SpaPlus Global] " + topic,
            _template: "box",
            _cc: "palombo.r@gmail.com,s0509350015@gmail.com",
            _autoresponse:
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
    } catch {
      status.textContent = "The message could not be sent. Please try again.";
    } finally {
      funnelForm.classList.remove("is-sending");
      submit.disabled = false;
    }
  });
}
