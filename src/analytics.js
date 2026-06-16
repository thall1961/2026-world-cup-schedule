// Google Analytics 4 (gtag.js), loaded at runtime.
//
// Only activates when REACT_APP_GA_MEASUREMENT_ID is set at build time, so
// local dev and forks without an ID stay analytics-free. Set it in .env.local:
//   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

export function initAnalytics() {
  if (!GA_ID || typeof window === "undefined") return;

  // Inject the gtag library.
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}
