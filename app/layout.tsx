import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gatherly — Make every gathering feel special",
  description:
    "Your thoughtful AI event planner for weddings, birthdays, and community celebrations. Build a budget, timeline, vendor checklist, and ideas in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
