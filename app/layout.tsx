import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DecisionRail | Evidence-to-release control plane",
  description: "A deterministic, human-governed product decision control plane reference implementation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
