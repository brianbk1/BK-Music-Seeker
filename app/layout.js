export const metadata = {
  title: "BBK Music Seeker — Find Live Music Near You",
  description: "Discover live music events at bars, restaurants, clubs, and venues near you. Search by zip code or city to find what's playing tonight.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5006125305468777" />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-3V60ZZV7H9"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-3V60ZZV7H9');`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5006125305468777"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ margin: 0, padding: "0 1rem 1rem", background: "#f1f5f9", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
