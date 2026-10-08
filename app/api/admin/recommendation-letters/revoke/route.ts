/* Revoking moved to MyEFF → National → Letters (eff_reach_rec_revoke). */
export async function POST() {
  return Response.redirect("https://my.estherfundsfoundation.org/national#letters", 303);
}
