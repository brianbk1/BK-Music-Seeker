import Script from "next/script";

export const metadata = {
  title: "BBK Music Seeker — Find Live Music Near You",
  description: "Find live music, bands, and entertainment at bars and restaurants near you.",
  icons: { icon: "/favicon.ico" },
  other: {
    "google-adsense-account": "ca-pub-5006125305468777",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense verification + script */}
        <meta name="google-adsense-account" content="ca-pub-5006125305468777" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5006125305468777"
          crossOrigin="anonymous"
        />
        {/* Google Analytics GA4 */}
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
      </head>
      <body>{children}</body>
    </html>
  );
}
