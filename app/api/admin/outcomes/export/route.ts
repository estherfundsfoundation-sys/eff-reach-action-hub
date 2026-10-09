/* The outcomes sheet moved to MyEFF → National → REACH. */
export async function GET() {
  return Response.redirect("https://my.estherfundsfoundation.org/national#reach", 302);
}
