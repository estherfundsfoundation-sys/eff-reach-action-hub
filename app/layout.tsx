import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EFF Reach Action Hub | Student & Family Support",
  description: "Free college funding, emergency support, family guidance, career tools, wellness resources, and clear next steps from Esther Funds Foundation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
