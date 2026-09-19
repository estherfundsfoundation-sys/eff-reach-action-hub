const q = (category, prompt, star = false) => ({ category, prompt, star });

export const SCORING_CONFIG = {
  weights: {
    relevance: 20,
    specificity: 15,
    structure: 15,
    action: 10,
    result: 15,
    professional: 10,
    alignment: 10,
    delivery: 5,
  },
  mastery: [
    { min: 95, label: "Mastered" },
    { min: 85, label: "Interview Ready" },
    { min: 70, label: "Developing" },
    { min: 0, label: "Needs Practice" },
  ],
};

const universal = {
  introduction: [
    q("Introduction", "Tell me about yourself and the experiences that prepared you for this role."),
    q("Introduction", "Walk me through your background and what you would bring to this position."),
  ],
  motivation: [
    q("Motivation", "Why are you interested in this profession and this opportunity?"),
    q("Motivation", "What drew you to this field, and what keeps you committed to it?"),
  ],
  teamwork: [
    q("Teamwork", "Tell me about a time you worked with others to complete an important goal.", true),
    q("Teamwork", "Describe how you contribute when a team has different working styles.", true),
  ],
  conflict: [
    q("Conflict", "Tell me about a disagreement or difficult interaction you handled professionally.", true),
    q("Conflict", "Describe a time you received difficult feedback. What did you do with it?", true),
  ],
  strengths: [
    q("Strengths", "What strength would make you effective in this role, and where have you demonstrated it?"),
    q("Strengths", "What is one professional skill you are actively strengthening?"),
  ],
  closing: [
    q("Closing", "What questions would you ask us before deciding whether this role is a strong fit?"),
    q("Closing", "What would success look like for you in your first 90 days?"),
  ],
};

const profiles = {
  "Elementary Teacher": {
    category: "Education",
    description: "Build inclusive, standards-aligned learning experiences that support academic growth, belonging, and strong family partnerships.",
    competencies: ["Classroom management", "Differentiated instruction", "Family communication", "Assessment literacy", "Student-centered planning"],
    keywords: ["students", "instruction", "lesson", "learning", "assessment", "classroom", "families", "differentiation", "standards", "literacy", "data", "engagement", "behavior", "collaboration", "growth"],
    welcome: "Welcome to your interview for the role of Elementary Teacher. We are looking for a candidate who can support student growth, manage a classroom effectively, collaborate with families and colleagues, and create engaging learning experiences. Take your time, answer clearly, and use specific examples whenever possible.",
    questions: [
      ...universal.introduction, ...universal.motivation,
      q("Behavioral", "Tell me about a time you helped a learner understand a difficult concept.", true),
      q("Instruction", "How would you plan a standards-aligned lesson for students with different readiness levels?"),
      q("Scenario", "A student repeatedly disrupts independent work. Walk us through your response."),
      q("Assessment", "How would you use formative assessment data to adjust tomorrow's instruction?"),
      q("Family partnership", "Describe how you would communicate a concern to a student's family while protecting the relationship."),
      q("Inclusion", "How do you ensure multilingual learners and students with disabilities can participate meaningfully?"),
      q("Classroom culture", "What routines would you establish during the first two weeks of school?"),
      ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
    ],
  },
  "Registered Nurse": {
    category: "Healthcare",
    description: "Deliver safe, patient-centered care through sound clinical judgment, precise communication, teamwork, and ethical practice.",
    competencies: ["Patient-centered care", "Clinical judgment", "Safety and escalation", "Interdisciplinary teamwork", "Documentation"],
    keywords: ["patient", "care", "safety", "assessment", "clinical", "communication", "documentation", "team", "provider", "medication", "priority", "handoff", "escalation", "evidence", "outcome"],
    welcome: "Welcome to your interview for the role of Registered Nurse. We are looking for a candidate who demonstrates strong communication, patient-centered care, professionalism, teamwork, and sound decision-making. Protect confidentiality as you practice and avoid sharing identifiable patient details.",
    questions: [
      ...universal.introduction, ...universal.motivation,
      q("Behavioral", "Tell me about a time you noticed a change in a patient's condition and took action.", true),
      q("Clinical judgment", "How do you prioritize care when several patients need attention at once?"),
      q("Scenario", "A patient refuses a recommended treatment. How would you respond?"),
      q("Safety", "Describe how you prevent medication or documentation errors."),
      q("Communication", "How would you handle an incomplete or concerning clinical handoff?"),
      q("Patient advocacy", "Tell me about a time you advocated for a patient's needs or understanding.", true),
      q("Ethics", "What would you do if you observed a practice that could compromise patient safety?"),
      ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
    ],
  },
  "Human Resources Coordinator": {
    category: "Business",
    description: "Coordinate people operations with discretion, accurate documentation, responsive service, and consistent policy execution.",
    competencies: ["Employee service", "Confidentiality", "Process coordination", "Policy communication", "HR data accuracy"],
    keywords: ["employee", "candidate", "onboarding", "confidential", "policy", "records", "recruiting", "scheduling", "compliance", "data", "stakeholder", "process", "communication", "resolution", "documentation"],
    welcome: "Welcome to your interview for the role of Human Resources Coordinator. We are looking for organized, discreet, people-centered candidates who can communicate policy clearly and keep high-stakes processes accurate.",
    questions: [
      ...universal.introduction, ...universal.motivation,
      q("Behavioral", "Tell me about a process you organized for several people or deadlines.", true),
      q("Confidentiality", "How would you protect sensitive employee or candidate information?"),
      q("Scenario", "A new hire arrives, but required onboarding steps are incomplete. What do you do?"),
      q("Recruiting", "How would you create a professional and equitable candidate experience?"),
      q("Policy", "How would you respond when an employee asks a question you cannot answer with certainty?"),
      q("Data accuracy", "Describe how you check detailed records before submitting or communicating them."),
      q("Service", "Tell me about a time you de-escalated a frustrated customer, peer, or employee.", true),
      ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
    ],
  },
  "Software Engineer": {
    category: "Technology",
    description: "Design, build, test, and improve reliable software while communicating tradeoffs and collaborating across technical teams.",
    competencies: ["Problem solving", "Code quality", "Testing and debugging", "Technical communication", "System thinking"],
    keywords: ["software", "code", "testing", "debugging", "system", "api", "database", "performance", "users", "requirements", "deployment", "review", "architecture", "reliability", "collaboration"],
    welcome: "Welcome to your interview for the role of Software Engineer. We are looking for thoughtful problem solving, clear technical communication, sound tradeoffs, quality-minded execution, and the ability to learn from feedback.",
    questions: [
      ...universal.introduction, ...universal.motivation,
      q("Technical project", "Choose one software project and explain the problem, your contribution, and the result.", true),
      q("Problem solving", "Walk me through how you approach a bug you cannot immediately reproduce."),
      q("Scenario", "A release deadline is close, but a key test is failing intermittently. What do you do?"),
      q("System design", "How would you clarify requirements before designing a new feature?"),
      q("Quality", "What practices do you use to make your code easier to test and maintain?"),
      q("Learning", "Tell me about a technical concept you had to learn quickly to complete a project.", true),
      q("Tradeoffs", "Describe a technical decision where you balanced speed, scope, and reliability."),
      ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
    ],
  },
  "Social Worker": {
    category: "Social Work & Human Services",
    description: "Support individuals and families through ethical assessment, resource navigation, advocacy, documentation, and trauma-informed care.",
    competencies: ["Trauma-informed practice", "Ethical boundaries", "Case assessment", "Resource coordination", "Cultural humility"],
    keywords: ["client", "family", "assessment", "resources", "advocacy", "case", "trauma-informed", "documentation", "confidentiality", "safety", "referral", "community", "boundaries", "strengths", "follow-up"],
    welcome: "Welcome to your interview for the role of Social Worker. We are looking for ethical judgment, empathy with boundaries, resource coordination, clear documentation, and respect for client self-determination. Do not share identifying client information while practicing.",
    questions: [
      ...universal.introduction, ...universal.motivation,
      q("Behavioral", "Tell me about a time you connected someone with a needed resource or support.", true),
      q("Ethics", "How do you balance empathy, professional boundaries, and client self-determination?"),
      q("Scenario", "A client needs housing tonight and several referrals are unavailable. What are your next steps?"),
      q("Assessment", "How would you begin assessing a client's immediate needs, strengths, and safety?"),
      q("Documentation", "How do you write case notes that are timely, objective, and useful?"),
      q("Cultural humility", "Describe how you work respectfully with people whose experiences differ from yours."),
      q("Resilience", "What practices help you manage emotionally demanding work without disengaging from clients?"),
      ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
    ],
  },
  "Marketing Coordinator": {
    category: "Communications & Marketing",
    description: "Coordinate audience-centered campaigns using clear messaging, organized execution, performance data, and brand consistency.",
    competencies: ["Campaign execution", "Audience insight", "Content development", "Performance measurement", "Brand stewardship"],
    keywords: ["campaign", "audience", "content", "brand", "analytics", "engagement", "conversion", "social", "email", "research", "calendar", "creative", "message", "performance", "stakeholder"],
    welcome: "Welcome to your interview for the role of Marketing Coordinator. We are looking for audience awareness, organized campaign execution, strong writing, brand judgment, and the ability to learn from performance data.",
    questions: [
      ...universal.introduction, ...universal.motivation,
      q("Campaign", "Tell me about a campaign, event, or content series you helped execute.", true),
      q("Audience", "How would you learn what motivates a new target audience?"),
      q("Scenario", "A scheduled post receives negative feedback. Walk us through your response."),
      q("Measurement", "Which metrics would you use to evaluate a campaign and why?"),
      q("Brand", "How do you keep content consistent when several people contribute?"),
      q("Content", "Describe how you would turn one long-form idea into content for multiple channels."),
      q("Optimization", "Tell me about a time data or feedback changed your original plan.", true),
      ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
    ],
  },
};

const categoryMap = [
  ["Education", ["Elementary Teacher", "Secondary Teacher", "School Counselor", "Special Education Teacher"]],
  ["Healthcare", ["Registered Nurse", "Medical Assistant", "Healthcare Administrator", "Physical Therapist"]],
  ["Business", ["Human Resources Coordinator", "Business Analyst", "Project Coordinator", "Management Trainee"]],
  ["Technology", ["Software Engineer", "IT Support Specialist", "Data Analyst", "Cybersecurity Analyst"]],
  ["Social Work & Human Services", ["Social Worker", "Case Manager", "Community Outreach Coordinator"]],
  ["Communications & Marketing", ["Marketing Coordinator", "Public Relations Specialist", "Social Media Coordinator"]],
  ["Finance & Accounting", ["Financial Analyst", "Staff Accountant", "Audit Associate"]],
  ["Criminal Justice", ["Probation Officer", "Victim Advocate", "Crime Analyst"]],
  ["Hospitality", ["Guest Services Manager", "Event Coordinator", "Hotel Operations Associate"]],
  ["STEM / Science", ["Laboratory Technician", "Research Assistant", "Environmental Scientist"]],
  ["Government & Public Service", ["Program Analyst", "Legislative Aide", "Public Affairs Coordinator"]],
  ["General Internship", ["Business Intern", "Nonprofit Intern", "Research Intern", "General Summer Intern"]],
];

const genericQuestions = [
  ...universal.introduction, ...universal.motivation,
  q("Behavioral", "Tell me about a time you took ownership of an important task.", true),
  q("Problem solving", "Describe a problem you analyzed before deciding what to do.", true),
  q("Scenario", "A priority changes close to a deadline. How would you respond?"),
  q("Communication", "Explain how you adapt a message for different audiences."),
  q("Organization", "How do you manage multiple deadlines without sacrificing quality?"),
  ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
];

export const CAREER_CATEGORIES = categoryMap.map(([name, professions]) => ({ name, professions }));

export const CAREER_DATA = Object.fromEntries(categoryMap.flatMap(([category, names]) => names.map((name) => {
  const seeded = profiles[name];
  return [name, seeded || {
    category,
    description: `Prepare for an early-career ${name} interview with realistic questions about judgment, communication, teamwork, and results.`,
    competencies: ["Communication", "Problem solving", "Professional judgment", "Organization", "Teamwork"],
    keywords: ["communication", "team", "project", "results", "service", "analysis", "planning", "quality", "stakeholder", "deadline", "professional", "improved", "organized", "collaborated", "completed"],
    welcome: `Welcome to your interview for the role of ${name}. Use specific, truthful examples and explain what you did, why you did it, and what happened next.`,
    questions: genericQuestions,
  }];
})));

export const FEATURED_PROFESSIONS = Object.keys(profiles);

export function buildInterviewQuestions(professionName, count = 8) {
  const pool = CAREER_DATA[professionName]?.questions || genericQuestions;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const preferred = ["Introduction", "Motivation", "Behavioral", "Scenario", "Teamwork", "Conflict", "Strengths", "Closing"];
  const selected = [];
  for (const category of preferred) {
    const options = shuffled.filter((item) => item.category === category && !selected.includes(item));
    if (options.length) selected.push(options[0]);
  }
  for (const item of shuffled) {
    if (selected.length >= count) break;
    if (!selected.includes(item)) selected.push(item);
  }
  return selected.slice(0, count);
}
