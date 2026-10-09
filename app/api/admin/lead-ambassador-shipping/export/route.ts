/* The shipping confirmation round is closed; there is nothing to export. */
export async function GET() {
  return Response.redirect("https://my.estherfundsfoundation.org/national#reach", 302);
}
