import Script from "next/script";
import App from "./layout";

export default function Page() {
  return (
    <>
      {/* Google Analytics GA4 — G-3V60ZZV7H9 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3V60ZZV7H9"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-3V60ZZV7H9');
      `}</Script>
      <App />
    </>
  );
}