const form = document.querySelector("#leadForm");
if (form) {
  const tabs = [...document.querySelectorAll("[data-lead-type]")];
  const typeInput = form.querySelector('[name="lead_type"]');
  const status = document.querySelector("#formStatus");
  const sellerOnly = [...form.querySelectorAll("[data-for='seller']")];
  const buyerOnly = [...form.querySelectorAll("[data-for='buyer']")];

  function setLeadType(type) {
    typeInput.value = type;
    tabs.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.leadType === type)));
    sellerOnly.forEach(el => el.hidden = type !== "seller");
    buyerOnly.forEach(el => el.hidden = type !== "buyer");
    form.querySelector("#formHeading").textContent = type === "seller" ? "Tell us about your business" : "Tell us what you want to acquire";
    form.querySelector("#formIntro").textContent = type === "seller"
      ? "Share a few initial details. Our team will contact you to understand the opportunity."
      : "Tell us about your acquisition or investment requirement. Our team will get in touch.";
    status.style.display = "none";
  }
  tabs.forEach(btn => btn.addEventListener("click", () => setLeadType(btn.dataset.leadType)));
  setLeadType(new URLSearchParams(location.search).get("type") === "seller" ? "seller" : "buyer");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form-status";
    status.style.display = "block";
    const endpoint = window.UDYOGSETU_CONFIG?.leadEndpoint?.trim();
    if (!endpoint) {
      status.classList.add("error");
      status.textContent = "The enquiry form is designed and ready, but it is not connected to a secure lead database yet. Please connect the backend endpoint before publishing this website or accepting live enquiries.";
      return;
    }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Sending…";
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      if (payload.website) { throw new Error("spam"); }
      await fetch(endpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(payload) });
      form.reset();
      setLeadType(typeInput.value || "buyer");
      status.className = "form-status";
      status.textContent = "Thank you. Your enquiry has been submitted. The UdyogSetu team will be in touch.";
    } catch (error) {
      status.classList.add("error");
      status.textContent = "We couldn't submit your enquiry just now. Please try again later or contact the UdyogSetu team.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Send enquiry →";
    }
  });
}
