import {notFound,redirect} from "next/navigation";
import InteractiveTools from "../page";

const toolIds = new Set([
  "award","counteroffer","recommendation","career-profile","essay","scholarship","fafsa",
  "aid","balance","reminders","friend","family","campus","persist",
]);

const toolTitles: Record<string, [string, string]> = {
  award: ["Award Letter & Balance Decoder", "Upload an aid letter, add work income, and see what is still uncovered."],
  counteroffer: ["Financial Aid Counter-Offer Engine", "Compare competing offers and draft an aid reconsideration request."],
  recommendation: ["Official EFF Recommendation Letter", "Get a personalized EFF scholarship recommendation letter."],
  "career-profile": ["Career Launchpad Profile", "Shape your headline, bio, projects and skills into a career profile."],
  essay: ["Essay Story Builder", "Turn one real moment into a scholarship-ready outline."],
  scholarship: ["Scholarship Action Center", "Turn a deadline into a clear application plan."],
  fafsa: ["FAFSA Decoder", "Understand your FAFSA status, SAI, verification and next move."],
  aid: ["Aid Offer Decoder", "See the real college gap without financial-aid jargon."],
  balance: ["Tuition Rescue Plan", "Get a 48-hour plan for a balance or registration hold."],
  reminders: ["Deadline Reminder Builder", "Add private deadline reminders to your calendar."],
  friend: ["Help-a-Friend Script", "Know what to say to a friend and where to connect them."],
  family: ["Family Funding Check", "Pressure-test a college or loan decision together."],
  campus: ["Campus Event Builder", "Build a useful REACH event in under three minutes."],
  persist: ["Stay-Enrolled Planner", "Build a support plan before changing enrollment."],
};

export async function generateMetadata({params}:{params:Promise<{tool:string}>}) {
  const {tool} = await params;
  const t = toolTitles[tool];
  if (!t) return {};
  return { title: `${t[0]} · EFF REACH`, description: t[1], openGraph: { title: `${t[0]} · EFF REACH`, description: t[1] } };
}

export default async function FocusedToolPage({params}:{params:Promise<{tool:string}>}) {
  const {tool} = await params;
  if (tool === "resume") redirect("/resume");
  if (!toolIds.has(tool)) notFound();
  return <InteractiveTools initialTool={tool} dedicated/>;
}
