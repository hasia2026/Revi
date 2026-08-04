import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revi — AI Employee for Service Businesses",
  description: "Revi by HASIA Technologies. Your AI employee for service businesses.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1A1A1C",
              color: "#fff",
              border: "1px solid #2E2E31",
            },
          }}
        />
      </body>
    </html>
  );
}
