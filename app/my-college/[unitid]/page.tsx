import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollegeView from "./CollegeView";
import { rpc } from "../../scholarships/lib";
import type { College } from "../data";
import "../../scholarships/scholarships.css";
import "../college.css";

export const revalidate = 600;

async function load(id: string) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return null;
  return rpc<College | null>("eff_campus_public", { p_unitid: n }, 600).catch(() => null);
}

export async function generateMetadata({ params }: { params: Promise<{ unitid: string }> }): Promise<Metadata> {
  const c = await load((await params).unitid);
  if (!c) return { title: "Your college's resources | REACH" };
  return {
    title: `${c.name}: help for students | REACH by Esther Funds Foundation`,
    description: `Emergency money, food, counseling and financial aid help at ${c.name}, with where each one came from.`,
    alternates: { canonical: `/my-college/${c.unitid}` },
  };
}

export default async function Page({ params }: { params: Promise<{ unitid: string }> }) {
  const c = await load((await params).unitid);
  if (!c) notFound();
  return <CollegeView c={c} />;
}
