import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shortlisted",
  description: "AI feedback on your UCAS personal statement — scored the way a competitive admissions tutor reads it.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function ShortlistedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
