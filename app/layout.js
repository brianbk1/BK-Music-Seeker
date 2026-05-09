export const metadata = {
  title: "BBK Music Seeker",
  description: "Find live music anywhere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: "20px", background: "#f1f5f9", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}