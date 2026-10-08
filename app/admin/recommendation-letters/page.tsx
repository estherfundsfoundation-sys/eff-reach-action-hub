import { redirect } from "next/navigation";

/* Letter oversight moved into MyEFF: National → Letters lists every letter the REACH
   tool issues (eff_reach_rec_national) and revokes one (eff_reach_rec_revoke). */
export default function RecommendationLettersAdmin() {
  redirect("https://my.estherfundsfoundation.org/national#letters");
}
