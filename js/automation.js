(() => {
  window.hgTrackAutomation = eventName => {
    if (!/^automation_[a-z_]+$/.test(String(eventName || ""))) return;
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: eventName });
    if (typeof window.gtag === "function") window.gtag("event", eventName);
  };

  document.querySelectorAll("[data-automation-event]").forEach(element => {
    element.addEventListener("click", () => {
      window.hgTrackAutomation(element.dataset.automationEvent);
    });
  });

  const form = document.querySelector('#leadForm[data-source="automation-landing-page"]');
  let formStarted = false;
  form?.addEventListener("focusin", () => {
    if (formStarted) return;
    formStarted = true;
    window.hgTrackAutomation("automation_form_start");
  });
})();
