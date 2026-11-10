import type { Metadata } from "next";
import Review from "./Review";

export const metadata: Metadata = { title: "Review applications · REACH", robots: { index: false, follow: false } };

export default function Page() {
  return <Review />;
}
