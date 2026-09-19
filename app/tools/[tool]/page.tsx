import {notFound,redirect} from "next/navigation";
import InteractiveTools from "../page";

const toolIds = new Set([
  "award","counteroffer","recommendation","career-profile","essay","scholarship","fafsa",
  "aid","balance","reminders","friend","family","campus","persist",
]);

export default async function FocusedToolPage({params}:{params:Promise<{tool:string}>}) {
  const {tool} = await params;
  if (tool === "resume") redirect("/resume");
  if (!toolIds.has(tool)) notFound();
  return <InteractiveTools initialTool={tool} dedicated/>;
}
