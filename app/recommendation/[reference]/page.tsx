import Link from "next/link";
import { rpc } from "@/app/scholarships/lib";

export const dynamic = "force-dynamic";

type Verification = { reference: string; student_name: string; scholarship_name: string; scholarship_organization: string; status: string; created_at: string; revoked_at: string | null };

export default async function RecommendationVerification({ params }: { params: Promise<{ reference: string }> }) {
  const { reference: rawReference } = await params;
  const reference = decodeURIComponent(rawReference).trim().toUpperCase();
  let record: Verification | null = null;
  if (/^EFF-REC-[A-Z0-9]{10}$/.test(reference)) {
    // The record lives in MyEFF's database (eff_reach_rec_verify, anon, by exact reference).
    try { record = await rpc<Verification | null>("eff_reach_rec_verify", { p_ref: reference }, 0); }
    catch { record = null; }
  }
  const initials = record?.student_name.split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase();
  return <main className="verification-page"><section><p>ESTHER FUNDS FOUNDATION · LETTER VERIFICATION</p><h1>{!record ? "Reference not found." : record.status === "issued" ? "Active scholarship letter." : "This letter has been revoked."}</h1>{record ? <div><b>{record.reference}</b><span>Student initials: {initials}</span><span>Scholarship: {record.scholarship_name}</span><span>Organization: {record.scholarship_organization}</span><span>Issued: {new Date(record.created_at).toLocaleDateString("en-US")}</span>{record.revoked_at && <span>Revoked: {new Date(record.revoked_at).toLocaleDateString("en-US")}</span>}</div> : <p>Check the reference printed on the PDF. A missing reference is not an active EFF-issued letter.</p>}<small>This page confirms only whether the exact EFF reference is active. It does not independently verify applicant-submitted facts.</small><Link href="/tools/recommendation">Return to the scholarship letter tool</Link></section></main>;
}
