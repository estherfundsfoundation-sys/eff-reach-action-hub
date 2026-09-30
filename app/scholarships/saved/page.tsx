import type { Metadata } from "next";
import Saved from "./Saved";
import "../scholarships.css";

export const metadata: Metadata = { title: "Saved | REACH Scholarships", description: "Your saved scholarships, on this phone. Put every deadline in your calendar in one tap.", alternates: { canonical: "/scholarships/saved" } };
export default function Page() { return <Saved />; }
