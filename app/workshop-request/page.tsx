import type { Metadata } from "next";
import TourRequest from "./TourRequest";
import "../scholarships/scholarships.css";
import "./tour.css";

export const metadata: Metadata = {
  title: "REACH on Tour 2027 | Esther Funds Foundation",
  description:
    "Bring REACH to your school, college, church or community: workshops, game nights, service drives and every REACH resource, in person. Chapter partnerships, affiliates, ambassadors and sponsors start here too.",
  alternates: { canonical: "/workshop-request" },
  openGraph: {
    title: "REACH on Tour 2027",
    description: "Bring REACH to your school, college or community. Request a stop.",
    url: "https://reach.estherfundsfoundation.org/workshop-request",
    images: ["/og.png"],
  },
};

export default function Page() {
  return <TourRequest />;
}
