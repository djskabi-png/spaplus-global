
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
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: location.href });
        return;
      }
      await navigator.clipboard.writeText(location.href);
    } catch {
      if (error && error.name === "AbortError") return;
      const field = document.createElement("textarea");
      field.value = location.href;
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
