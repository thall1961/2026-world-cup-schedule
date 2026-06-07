// Where the donate button points. Paste your own link below, or set
// REACT_APP_DONATE_URL in .env.local / Vercel. Works with any hosted page:
// Buy Me a Coffee, Ko-fi, PayPal.me, a Stripe Payment Link, GitHub Sponsors, etc.
const DONATE_URL =
  process.env.REACT_APP_DONATE_URL || "https://buymeacoffee.com/Utfc0Wq";

export default function DonateButton({ className = "" }) {
  return (
    <a
      className={`donate ${className}`}
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="donate__emoji" aria-hidden="true">☕</span>
      <span className="donate__text">Buy me a coffee</span>
    </a>
  );
}
