import type { Metadata } from "next";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shortlisted",
  description: "AI feedback on your UCAS personal statement — scored the way a competitive admissions tutor reads it.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function ShortlistedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${instrumentSerif.variable} ${instrumentSans.variable}`}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0d1f3c 0%, #1a3358 50%, #2d4a72 100%)",
        fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
        color: "#ffffff",
      }}
    >
      {children}
    </div>
  );
}
