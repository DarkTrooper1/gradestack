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

const PAGE_BG = `
  radial-gradient(ellipse 80% 50% at 50% -10%, #1e4a8a 0%, transparent 70%),
  radial-gradient(ellipse 60% 40% at 80% 20%, #163461 0%, transparent 60%),
  linear-gradient(180deg,
    #0d2244 0%, #112a50 15%, #1a3666 25%, #2a4a7a 35%,
    #6b7fa0 48%, #b8bfcc 60%, #ddd8ce 72%, #f0ebe0 84%, #f4f1eb 100%)
`.trim();

export default function ShortlistedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${cormorant.variable} ${inter.variable}`}
      style={{
        background: PAGE_BG,
        minHeight: "100vh",
        fontFamily: "var(--font-inter), 'Inter', sans-serif",
      }}
    >
      {children}
    </div>
  );
}
