import test from "node:test";
import assert from "node:assert/strict";
import { createResumeDraft, validateResume } from "../app/tools/resume-engine.ts";
import { createCareerProfile, profileSafetyIssues } from "../app/tools/career-profile.ts";

const resume = {
  personal: { fullName: "Jordan Taylor", email: "jtaylor@university.edu", phone: "", location: "", linkedIn: "" },
  education: { institution: "Georgia State University", degree: "B.S. in Psychology", graduationDate: "May 2027", gpa: "", honors: "", relevantCoursework: "" },
  experience: [{ role: "Shift Lead / Barista", organization: "Starbucks", location: "Atlanta, GA", dates: "2025", rawInput: "Made drinks during morning rush, opened the store at 4:30 AM, ran cash drawer, solved customer complaints, and showed 2 new baristas how to do prep.", proof: "" }],
  projects: [], skills: { technical: "", languages: "", certifications: "" },
};

test("resume selects strong evidence without inventing results", () => {
  const draft = createResumeDraft(resume);
  const bullets = draft.experience[0].bullets.map(item => item.text);
  assert.equal(bullets.length, 3);
  assert.ok(bullets.some(line => line.includes("2 new baristas trained")));
  assert.ok(bullets.every(line => !line.includes("$")));
  assert.deepEqual(validateResume(resume, draft), []);
});

const profileInput = {
  student: { fullName: "Alexandria Brooks", university: "Florida State University", major: "Computer Science & Information Technology", gradYear: "2027", targetRole: "Looking for a Summer 2027 Front-End or UX Engineering internship", rawBio: "i am a sophomore and i really like building accessible websites for people. i spent the last semester working on a club website and i also help tutor freshmen in python.", skillsRaw: "React, CSS, Python, Figma, Accessibility auditing" },
  rawProjects: [{ name: "Club Redesign", category: "Web Dev", description: "Redid the website for our campus tech club so students with screen readers could use it better, had about 200 people check it out.", url: "https://github.com/example" }],
  documents: [{ docType: "Recommendation Letter", recommenderRaw: "Dr. Marcus Vance, associate prof of computer science", fileUrl: "https://example.edu/reference.pdf" }],
};

test("career profile produces a bounded professional summary and structured projects", () => {
  const profile = createCareerProfile(profileInput);
  assert.match(profile.headline, /^Aspiring Front-End or UX Engineering Intern/);
  assert.ok(profile.summary.split(/\s+/).length <= 90);
  assert.ok(!profile.summary.includes("They is"));
  assert.equal(profile.projects[0].bullets.length, 2);
  assert.match(profile.documents[0].verification, /not verified by EFF/);
});

test("career profile blocks sensitive identifiers and omits unsafe links", () => {
  const unsafe = structuredClone(profileInput);
  unsafe.student.rawBio = "My Social Security number is 123-45-6789.";
  unsafe.rawProjects[0].url = "javascript:alert(1)";
  assert.ok(profileSafetyIssues(unsafe).length > 0);
  assert.equal(createCareerProfile(unsafe).projects[0].url, "");
});
