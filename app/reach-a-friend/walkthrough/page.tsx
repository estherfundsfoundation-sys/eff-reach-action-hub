import type { Metadata } from "next";
import FriendWalkthrough from "./FriendWalkthrough";

export const metadata: Metadata = {
  title: "Help Them Stay | REACH Interactive Walkthrough",
  description: "Practice what to say when a friend is thinking about leaving college and leave with response templates, resources, and a follow-up plan.",
};

export default function FriendWalkthroughPage() {
  return <FriendWalkthrough />;
}
