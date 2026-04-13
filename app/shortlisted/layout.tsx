import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

const cormorant = Cormorant_Garamond({
  weight: "600",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shortlisted",
  description: "AI feedback on your UCAS personal statement — scored the way a competitive admissions tutor reads it.",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function ShortlistedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${cormorant.variable} ${inter.variable}`}
      style={{ background: "#f4f1eb", minHeight: "100vh", fontFamily: "var(--font-inter), 'Inter', sans-serif" }}
    >
      {children}
    </div>
  );
}
