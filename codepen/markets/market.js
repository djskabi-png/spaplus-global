
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
    const payload = Object.fromEntries(new FormData(funnelForm).entries());
    payload.subject = payload.leadType === "spa_business"
      ? "Spa business lead | " + payload.market
      : "Country entrepreneur lead | " + payload.market;
    funnelForm.classList.add("is-sending");
    submit.disabled = true;
    status.textContent = "Sending...";
    try {
      const response = await fetch("https://spaplus-global-brand.adir-naor-7510.chatgpt.site/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Primary endpoint failed");
      window.dataLayer.push({
        event: "generate_lead",
        lead_type: payload.leadType,
        market: payload.market,
        locale: payload.locale,
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
