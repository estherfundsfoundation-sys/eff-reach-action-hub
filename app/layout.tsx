import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  return <html lang="en"><body>{children}</body></html>;
}
