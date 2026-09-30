import { redirect } from "next/navigation";

/* EFF's own scholarships moved to /apply, where students apply with My REACH. */
export default function Page() { redirect("/apply"); }
