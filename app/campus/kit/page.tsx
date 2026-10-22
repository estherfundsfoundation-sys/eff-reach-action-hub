import type { Metadata } from "next";
import Kit from "./Kit";
import "../../scholarships/scholarships.css";
import "../../apply-with-me/applyme.css";
import "../campus.css";

export const metadata: Metadata = {
  title: "REACH share kit | Esther Funds Foundation",
  description: "Graphics, captions, a newsletter blurb, a syllabus statement and an LMS message for sharing REACH with your students.",
  robots: { index: false },
};

export default function Page() { return <Kit />; }
