import { redirect } from "next/navigation";

/* The shipping confirmation round is closed and its old store (a Cloudflare D1 binding) never existed on Vercel. */
export default function ShippingAdmin() {
  redirect("https://my.estherfundsfoundation.org/national#reach");
}
