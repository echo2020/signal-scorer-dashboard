import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signal Scorer — Gate.io Dashboard",
  description: "Real-time Gate.io market data dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
