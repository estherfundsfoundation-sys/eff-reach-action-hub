import type { Metadata } from "next";
import CheckIn from "./CheckIn";
import "../../scholarships/scholarships.css";
import "../../apply/[program]/apply.css";

export const metadata: Metadata = { title: "How are you doing? | REACH", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CheckIn code={code} />;
}
