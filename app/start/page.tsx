import type { Metadata } from "next";
import Start from "./Start";
import "../scholarships/scholarships.css";
import "./start.css";

export const metadata: Metadata = {
  title: "Start here · REACH",
  description: "Who are you? Students from 9th grade to after graduation, families, schools, colleges and communities: REACH shows what was made for you.",
};
export default function Page() { return <Start />; }
