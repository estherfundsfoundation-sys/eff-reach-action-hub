import type { Metadata, Viewport } from "next";
import "./globals.css";
import MovedNotice from "./MovedNotice";

export const metadata: Metadata = {
  title: "EFF Reach Action Hub | Student & Family Support",
  description: "Free college funding, emergency support, family guidance, career tools, wellness resources, and clear next steps from Esther Funds Foundation.",
  metadataBase: new URL("https://reach.estherfundsfoundation.org"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "EFF Reach Action Hub",
    description: "Seven guided pathways, interactive tools, and trusted resources to help students stay enrolled and keep reaching.",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "EFF Reach Action Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EFF Reach Action Hub",
    description: "One place for student, family, campus, community, K–12, and professional support.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  /* The EFF family bar (www.estherfundsfoundation.org/ecosystem.js): one script,
     drawn in its own shadow root so it never touches this site's styles. */
  return <html lang="en"><head><script src="https://www.estherfundsfoundation.org/ecosystem.js" defer /></head><body>{children}<MovedNotice /></body></html>;
}
