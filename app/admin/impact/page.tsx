import { redirect } from "next/navigation";

/* REACH impact check-ins now live in MyEFF → National → REACH (eff_reach_outcomes_national). */
export default function ImpactAdmin() {
  redirect("https://my.estherfundsfoundation.org/national#reach");
}
