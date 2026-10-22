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

// Universal questions written for scholarship, graduate and professional school committees,
// where "this role" does not fit.
const academic = {
  introduction: [
    q("Introduction", "Tell me about yourself and what has shaped your goals."),
    q("Introduction", "Walk me through your journey so far and what brings you here today."),
  ],
  motivation: [
    q("Motivation", "Why are you applying for this opportunity, and why now?"),
    q("Motivation", "What do you hope to gain here, and what will you give back?"),
  ],
  teamwork: [
    q("Teamwork", "Tell me about a time you worked with others to reach a shared goal.", true),
    q("Teamwork", "Describe a group project where not everyone pulled their weight. What did you do?", true),
  ],
  conflict: [
    q("Conflict", "Tell me about a time you disagreed with someone and handled it respectfully.", true),
    q("Conflict", "Describe a time you received critical feedback on your work. What did you do with it?", true),
  ],
  strengths: [
    q("Strengths", "What is one strength that has helped you succeed, and where have you shown it?"),
    q("Strengths", "What is one skill you are working to grow right now?"),
  ],
  closing: [
    q("Closing", "Is there anything you want us to know about you that we have not asked?"),
    q("Closing", "What questions would you like to ask the committee?"),
  ],
};

const jobSet = (...specific) => [
  ...universal.introduction, ...universal.motivation, ...specific,
  ...universal.teamwork, ...universal.conflict, ...universal.strengths, ...universal.closing,
];
const schoolSet = (...specific) => [
  ...academic.introduction, ...academic.motivation, ...specific,
  ...academic.teamwork, ...academic.conflict, ...academic.strengths, ...academic.closing,
];

// Paths EFF's students actually face: scholarships, internships, campus jobs, graduate and
// professional school, and the first jobs of many majors. Every prompt is the kind of question
// real interviewers and committees ask; nothing here states a statistic or a fact.
Object.assign(profiles, {
  "Scholarship Interview": {
    category: "College & Campus",
    academic: true,
    interviewTitle: "scholarship interview",
    description: "Show a scholarship committee who you are, what you have overcome, where you are going, and how you will give back.",
    competencies: ["Personal story", "Goals and direction", "Service and leadership", "Resilience", "Gratitude and giving back"],
    keywords: ["scholarship", "goals", "community", "service", "leadership", "education", "family", "major", "career", "impact", "challenge", "mentor", "give back", "volunteer", "resilience", "campus", "first-generation"],
    welcome: "Welcome to your scholarship interview. The committee wants to know you as a person: your story, your goals, how you have served, and what this support would make possible. There are no trick questions here. Be yourself, be specific, and let your examples speak for you.",
    questions: schoolSet(
      q("Behavioral", "Tell me about a challenge you faced in school and how you worked through it.", true),
      q("Behavioral", "Describe a time you showed leadership, in or out of a formal role.", true),
      q("Service", "Tell me about a way you have served your community. What did it teach you?", true),
      q("Goals", "What do you plan to study, and how does it connect to your long-term goals?"),
      q("Impact", "How would this scholarship change what is possible for you?"),
      q("Values", "Which person has influenced you most, and how?"),
      q("Scenario", "If you received this award and your first semester went harder than expected, what would you do?"),
      q("Giving back", "How do you plan to give back to your community or to the students who come after you?"),
      q("Reflection", "What accomplishment are you most proud of, and why?"),
      q("Community", "What is an issue in your community that you care about, and what would you do about it?"),
      q("Representation", "What does it mean to you to represent this scholarship and the people who fund it?"),
      q("Self-awareness", "Describe yourself in three words, then give an example for one of them."),
    ),
  },
  "Internship (Any Field)": {
    category: "College & Campus",
    interviewTitle: "internship interview",
    description: "Prove you can learn fast, take direction, own your work, and make a team's summer or semester easier.",
    competencies: ["Coachability", "Initiative", "Organization", "Professional communication", "Learning agility"],
    keywords: ["internship", "learn", "project", "deadline", "supervisor", "team", "feedback", "coursework", "initiative", "organized", "research", "communication", "goals", "skills", "professional", "deliverable"],
    welcome: "Welcome to your internship interview. We know you are early in your career, so we are listening for curiosity, reliability, and how you learn. Use examples from classes, jobs, campus groups, or volunteering. All of them count.",
    questions: jobSet(
      q("Behavioral", "Tell me about a class project or job where you had to learn something new quickly.", true),
      q("Behavioral", "Describe a time you managed several deadlines at once.", true),
      q("Initiative", "Tell me about a time you took initiative without being asked.", true),
      q("Learning goals", "What do you hope to learn during this internship?"),
      q("Research", "What do you know about our organization, and why do you want to intern here?"),
      q("Scenario", "Your supervisor gives you a task with unclear instructions and then leaves for a meeting. What do you do?"),
      q("Scenario", "You notice a mistake in a deliverable right after you send it. How do you handle it?"),
      q("Preparation", "Which course has prepared you most for this internship, and how?"),
      q("Feedback", "How do you like to receive feedback, and how do you use it?"),
      q("Skills", "What tools, software, or methods are you comfortable with, and how have you used them?"),
      q("Professionalism", "How would you make a strong impression in your first two weeks?"),
      q("Direction", "How does this internship fit with what you want to do after graduation?"),
    ),
  },
  "Campus Job / Work-Study": {
    category: "College & Campus",
    interviewTitle: "campus job interview",
    description: "Show a campus office you are dependable, friendly with students and staff, careful with information, and able to balance work with class.",
    competencies: ["Reliability", "Student service", "Time management", "Confidentiality", "Following procedures"],
    keywords: ["students", "schedule", "shift", "office", "service", "reliable", "classes", "front desk", "phone", "email", "confidential", "procedure", "help", "staff", "campus", "organized"],
    welcome: "Welcome to your campus job interview. This office wants someone dependable who treats every student and visitor with care and can balance work with classes. Answer honestly, especially about your schedule. Being clear helps everyone.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time you helped someone who was confused or frustrated.", true),
      q("Behavioral", "Describe a time a team or group was counting on you. How did you show up?", true),
      q("Procedures", "Tell me about a time you followed a procedure carefully, even when it took longer.", true),
      q("Balance", "How will you balance this job with your class schedule?"),
      q("Scenario", "A student comes to the desk upset about a problem you cannot fix yourself. What do you do?"),
      q("Scenario", "It is a slow shift and your tasks are done. What do you do with the time?"),
      q("Confidentiality", "If you saw another student's private information on a screen or form, how would you handle it?"),
      q("Availability", "What hours are you available, and how would you handle a shift you can no longer work?"),
      q("Communication", "How would you answer a phone call or email from someone you do not know?"),
      q("Research", "What do you know about this office and the students it serves?"),
      q("Growth", "What skills from this job do you hope to carry into your career?"),
    ),
  },
  "Resident Assistant": {
    category: "College & Campus",
    interviewTitle: "Resident Assistant interview",
    description: "Lead a residence community: build belonging, mediate conflict, respond calmly in a crisis, and connect residents to campus support.",
    competencies: ["Community building", "Conflict mediation", "Crisis response", "Fair policy enforcement", "Resource referral"],
    keywords: ["residents", "community", "floor", "roommate", "conflict", "policy", "duty", "program", "event", "inclusion", "safety", "resources", "counseling", "role model", "support", "boundaries", "referral"],
    welcome: "Welcome to your Resident Assistant interview. We are looking for students who build community, stay calm when things get hard, treat every resident fairly, and know when to bring in help. Talk us through your thinking. How you reason matters as much as your answer.",
    questions: jobSet(
      q("Behavioral", "Describe a time you supported a peer through a hard moment.", true),
      q("Programming", "Tell me about an event or program you planned. What happened?", true),
      q("Community", "How would you build community on a floor of students who do not know each other?"),
      q("Scenario", "Two roommates come to you after weeks of conflict. Walk us through how you would help."),
      q("Scenario", "You learn a resident is struggling and has stopped going to class. What do you do?"),
      q("Scenario", "You are on duty and see a policy violation involving a friend. How do you handle it?"),
      q("Crisis", "If a resident tells you they are thinking about hurting themselves, what are your first steps?"),
      q("Boundaries", "How would you balance being a friendly presence with enforcing policies?"),
      q("Inclusion", "How would you make sure every resident, including those who feel different, feels welcome?"),
      q("Balance", "How would you manage RA duties alongside your classes and other commitments?"),
      q("Referral", "Which campus resources would you point residents to, and when?"),
      q("Leadership", "Why do you want to be a role model for other students?"),
    ),
  },
  "Graduate School Admissions": {
    category: "Graduate & Professional School",
    academic: true,
    interviewTitle: "graduate admissions interview",
    description: "Show a faculty committee you are ready for advanced, independent study and that this program fits your goals.",
    competencies: ["Research readiness", "Program fit", "Independence", "Academic communication", "Clear goals"],
    keywords: ["research", "program", "faculty", "advisor", "thesis", "methods", "cohort", "goals", "field", "publication", "lab", "data", "teaching", "independent", "degree", "question", "literature"],
    welcome: "Welcome to your graduate admissions interview. The committee wants to understand your academic preparation, your research interests, why this program fits, and how you will handle independent work. Speak about your own ideas with confidence, and it is fine to say what you are still figuring out.",
    questions: schoolSet(
      q("Research", "Tell us about a research project, thesis, or major paper you worked on. What was your role?", true),
      q("Behavioral", "Tell me about a time an idea or plan did not work. What did you do next?", true),
      q("Fit", "Why this program, and which faculty or areas of work interest you?"),
      q("Goals", "What do you plan to do with this degree?"),
      q("Preparation", "How has your undergraduate work prepared you for graduate-level study?"),
      q("Independence", "Graduate study requires a lot of independent work. How do you stay motivated without close supervision?"),
      q("Scenario", "You and your advisor disagree about the direction of your project. How do you handle it?"),
      q("Field", "What question or debate in your field excites you right now?"),
      q("Balance", "How will you manage coursework, research or assistantship duties, and your well-being?"),
      q("Contribution", "What would you add to our cohort and department?"),
      q("Teaching", "If you had a teaching assistant role, how would you support undergraduates who are struggling?"),
      q("Timing", "Why is now the right time for you to start graduate school?"),
    ),
  },
  "Medical School": {
    category: "Graduate & Professional School",
    academic: true,
    interviewTitle: "medical school interview",
    description: "Practice traditional and MMI-style stations: your motivation for medicine, ethics, teamwork, communication, and care for others.",
    competencies: ["Motivation for medicine", "Ethical reasoning", "Empathy and communication", "Teamwork", "Resilience"],
    keywords: ["patient", "medicine", "physician", "clinical", "volunteer", "shadowing", "ethics", "empathy", "community", "health", "team", "communication", "research", "service", "listen", "care", "equity"],
    welcome: "Welcome to your medical school interview. Some questions are traditional and some are short ethical scenarios like those used in multiple mini interviews. For a scenario, there is rarely one right answer: name the people involved, the values in tension, the information you would want, and what you would do. Protect privacy and do not share identifiable patient details.",
    questions: schoolSet(
      q("Motivation", "Why medicine? What experiences confirmed this path for you?"),
      q("Clinical", "Tell us about a clinical or volunteer experience that affected you.", true),
      q("Behavioral", "Tell me about a mistake you made and what you learned from it.", true),
      q("Teamwork", "Describe a time you worked with people from very different backgrounds or roles.", true),
      q("Scenario", "A friend in your class asks you to sign them in for a required session they are skipping. What do you do?"),
      q("Scenario", "A patient refuses a treatment the care team believes is necessary. How would you think through this?"),
      q("Scenario", "A patient asks you not to share a diagnosis with their family. How would you respond?"),
      q("Health equity", "What is a barrier to health care in a community you know, and how might a physician help?"),
      q("Resilience", "Medical training is demanding. How do you care for yourself under pressure?"),
      q("Communication", "How would you explain a complicated idea to someone with no medical background?"),
      q("Fit", "Why are you interested in our school?"),
      q("Professionalism", "If you saw a classmate acting unprofessionally with a patient, what would you do?"),
      q("Values", "What does it mean to you to be a good physician?"),
    ),
  },
  "Law School": {
    category: "Graduate & Professional School",
    academic: true,
    interviewTitle: "law school interview",
    description: "Show an admissions interviewer why you want the law, how you reason and argue, and what you will bring to the community.",
    competencies: ["Analytical reasoning", "Persuasive communication", "Integrity", "Motivation for law", "Composure"],
    keywords: ["law", "justice", "argument", "writing", "research", "advocacy", "ethics", "reading", "analysis", "debate", "evidence", "client", "community", "policy", "rights", "facts", "persuasive"],
    welcome: "Welcome to your law school interview. We want to hear how you think: why the law, how you reason through a problem, and how you engage with people who see things differently. Take a breath before you answer, and organize your points.",
    questions: schoolSet(
      q("Motivation", "Why do you want to go to law school?"),
      q("Goals", "What kind of law, or what kind of work, are you drawn to?"),
      q("Behavioral", "Tell us about a time you built an argument or wrote something persuasive.", true),
      q("Advocacy", "Describe a time you advocated for someone or for something you believed in.", true),
      q("Reasoning", "Walk us through how you analyze a problem when the facts are unclear."),
      q("Scenario", "You strongly disagree with a classmate's view on a controversial issue in seminar. How do you engage?"),
      q("Scenario", "You learn a teammate used someone else's work without credit. What would you do?"),
      q("Pressure", "Law school is demanding. How do you handle pressure and heavy reading loads?"),
      q("Experience", "Which experience on your résumé best shows you are ready for law school?"),
      q("Values", "What does justice mean to you?"),
      q("Fit", "Why are you interested in this law school?"),
      q("Contribution", "What would you contribute to our law school community?"),
    ),
  },
  "Retail & Customer Service Associate": {
    category: "Hospitality & Retail",
    interviewTitle: "retail and customer service interview",
    description: "Show you can keep customers happy, stay calm when it gets busy, handle money accurately, and back up your coworkers.",
    competencies: ["Customer service", "Staying calm under pressure", "Accuracy with transactions", "Teamwork", "Reliability"],
    keywords: ["customer", "service", "store", "register", "shift", "policy", "return", "product", "team", "busy", "manager", "cash", "line", "helpful", "schedule", "sales", "calm"],
    welcome: "Welcome to your customer service interview. We are looking for someone friendly, reliable, and calm when the store gets busy. Use examples from any job, school, team, or even helping family. Customer service skills show up everywhere.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time you turned an unhappy customer around.", true),
      q("Behavioral", "Describe a time you helped a coworker during a busy shift.", true),
      q("Scenario", "A customer wants to return an item outside the return policy and is getting angry. What do you do?"),
      q("Scenario", "The line is long, the phone is ringing, and a customer needs help finding something. How do you prioritize?"),
      q("Scenario", "You see a coworker doing something that breaks store policy. What would you do?"),
      q("Sales", "How would you recommend a product to a customer without being pushy?"),
      q("Accuracy", "How do you make sure you handle money and transactions accurately?"),
      q("Availability", "What is your availability, including weekends and holidays?"),
      q("Service", "What does great customer service mean to you?"),
      q("Learning", "How would you learn our products quickly?"),
      q("Attitude", "This job can mean long hours on your feet and repetitive tasks. How do you stay positive and focused?"),
      q("Safety", "What would you do if you suspected someone was shoplifting?"),
    ),
  },
  "Accounting & Finance Associate": {
    category: "Finance & Accounting",
    interviewTitle: "accounting and finance interview",
    description: "Show accuracy, integrity, comfort with numbers and spreadsheets, and the ability to explain financial results clearly.",
    competencies: ["Attention to detail", "Technical accounting", "Integrity", "Spreadsheet analysis", "Clear communication of numbers"],
    keywords: ["financial", "accounting", "reconcile", "budget", "forecast", "excel", "statements", "balance sheet", "income", "cash flow", "audit", "accuracy", "deadline", "close", "analysis", "ethics", "spreadsheet"],
    welcome: "Welcome to your accounting and finance interview. We are listening for accuracy, honesty, comfort with numbers, and how clearly you can explain what the numbers mean. When you describe your work, name the tools you used and how you checked it.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time your attention to detail caught an error.", true),
      q("Behavioral", "Describe a time you managed a heavy workload during a busy period.", true),
      q("Project", "Tell me about a budget, forecast, or financial project you worked on.", true),
      q("Technical", "Walk me through how the three main financial statements connect."),
      q("Tools", "How have you used Excel or similar tools to analyze or organize financial data?"),
      q("Scenario", "At month-end close, an account does not reconcile and the deadline is tomorrow. What do you do?"),
      q("Scenario", "You find a mistake in work you already submitted to your supervisor. What do you do?"),
      q("Ethics", "If a manager asked you to record something in a way you believed was inaccurate, what would you do?"),
      q("Communication", "How would you explain a financial result to someone who is not in finance?"),
      q("Career", "Which professional certifications or next steps are you considering, and why?"),
      q("Learning", "How do you keep up with changes in accounting rules or the financial world?"),
      q("Confidentiality", "How do you handle sensitive financial information?"),
    ),
  },
  "Management Trainee": {
    category: "Business",
    interviewTitle: "management trainee interview",
    description: "Show you can lead people, make decisions, learn every part of the business, and grow into a manager others want to work for.",
    competencies: ["Leadership", "Decision-making", "Adaptability", "Coaching others", "Business awareness"],
    keywords: ["lead", "team", "manager", "decision", "customers", "business", "goals", "metrics", "feedback", "process", "improve", "schedule", "employees", "operations", "results", "trust", "rotation"],
    welcome: "Welcome to your management trainee interview. Our program is built for people who want to lead, so we are listening for how you treat people, how you decide, and how fast you adapt. Leadership examples from school, sports, faith, or jobs all count.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time you led a group or project.", true),
      q("Decision", "Describe a decision you made with incomplete information.", true),
      q("Improvement", "Tell me about a time you improved a process.", true),
      q("Scenario", "You are put in charge of a team that includes people older and more experienced than you. How do you earn their trust?"),
      q("Scenario", "An employee on your shift is consistently late. How would you handle it?"),
      q("Metrics", "How would you measure whether your team is doing well?"),
      q("Adaptability", "Our program rotates through several departments. How do you adapt to new teams quickly?"),
      q("Customers", "How do you balance what customers want with what the business needs?"),
      q("Coaching", "How would you give constructive feedback to someone who reports to you?"),
      q("Flexibility", "How do you feel about the relocation, travel, or varied schedules that can come with a program like this?"),
      q("Research", "What do you know about our business and our competitors?"),
      q("Growth", "What kind of manager do you want to become?"),
    ),
  },
  "Data Analyst": {
    category: "Technology",
    interviewTitle: "data analyst interview",
    description: "Turn messy data into clear answers: clean it, analyze it, check it, and explain what it means to people who decide.",
    competencies: ["Data cleaning", "SQL and analysis", "Data storytelling", "Accuracy and validation", "Stakeholder communication"],
    keywords: ["data", "sql", "excel", "python", "dashboard", "query", "analysis", "visualization", "stakeholder", "clean", "trend", "metric", "report", "tableau", "insight", "validate", "privacy"],
    welcome: "Welcome to your data analyst interview. We want to hear how you go from a question to an answer: where the data came from, how you cleaned and checked it, and how you explained the result. Name the tools you used and be honest about your level with each one.",
    questions: jobSet(
      q("Project", "Walk me through a data project from the question to the result.", true),
      q("Behavioral", "Tell me about a time your analysis changed someone's decision.", true),
      q("Data quality", "How do you handle missing, messy, or inconsistent data?"),
      q("Technical", "Explain how you would use SQL to find the top customers by total spending."),
      q("Communication", "How would you present a finding to someone who does not work with data?"),
      q("Scenario", "A stakeholder needs a report by end of day, but your numbers do not match another team's dashboard. What do you do?"),
      q("Visualization", "How do you decide which chart to use for a given question?"),
      q("Statistics", "Explain the difference between correlation and causation, and why it matters in your work."),
      q("Tools", "Which tools do you use, such as Excel, SQL, Python, R, Tableau, or Power BI, and for what?"),
      q("Validation", "How do you check that your analysis is correct before you share it?"),
      q("Scenario", "Someone asks you to find out why sales are down. What are your first steps?"),
      q("Ethics", "How do you protect privacy when working with personal data?"),
    ),
  },
  "Engineer (General)": {
    category: "STEM / Science",
    interviewTitle: "engineering interview",
    description: "Show how you solve technical problems, design with safety and cost in mind, test and learn from failure, and work across disciplines.",
    competencies: ["Technical problem solving", "Design tradeoffs", "Safety and standards", "Testing and iteration", "Cross-team communication"],
    keywords: ["design", "project", "prototype", "test", "analysis", "safety", "standards", "requirements", "cad", "calculation", "team", "cost", "performance", "system", "data", "manufacturing", "improve"],
    welcome: "Welcome to your engineering interview. We are listening for how you think through a problem, the tradeoffs you weigh, how you test your work, and how you communicate with people who are not engineers. Senior design, labs, competitions, and co-ops are all good examples.",
    questions: jobSet(
      q("Project", "Tell me about an engineering project you worked on and the part you owned.", true),
      q("Behavioral", "Tell me about a test or prototype that failed. What did you learn?", true),
      q("Improvement", "Tell me about a time you improved a design, process, or system.", true),
      q("Problem solving", "Walk me through how you approach a technical problem you have never seen before."),
      q("Design", "Describe a design decision where you balanced cost, safety, and performance."),
      q("Scenario", "You discover a calculation error late in a project that could affect safety. What do you do?"),
      q("Scenario", "Your team is behind schedule and a manager asks you to skip a review step. How do you respond?"),
      q("Collaboration", "How do you work with people from other disciplines, like manufacturing, operations, or clients?"),
      q("Tools", "Which software, tools, or lab skills are you strongest in?"),
      q("Communication", "How would you explain a technical issue to a non-engineer who needs to make a decision?"),
      q("Standards", "How do you make sure your work follows codes, standards, or safety requirements?"),
      q("Learning", "What technical skill are you learning now, and why?"),
    ),
  },
  "Public Health Specialist": {
    category: "Healthcare",
    interviewTitle: "public health interview",
    description: "Improve the health of whole communities through programs, outreach, data, partnerships, and trust.",
    competencies: ["Community engagement", "Health equity", "Program planning and evaluation", "Health communication", "Data use"],
    keywords: ["community", "health", "program", "outreach", "data", "equity", "prevention", "education", "partners", "evaluation", "survey", "trust", "access", "campaign", "population", "privacy", "culturally"],
    welcome: "Welcome to your public health interview. We are looking for people who listen to communities, use data well, communicate clearly, and care about who is being left out. Examples from classes, campus campaigns, internships, and volunteering all count.",
    questions: jobSet(
      q("Program", "Tell me about a health program, campaign, or research project you supported.", true),
      q("Behavioral", "Describe a time you worked with an outside partner or organization.", true),
      q("Field motivation", "What drew you to public health?"),
      q("Community", "How would you build trust with a community that has reasons to distrust health institutions?"),
      q("Data", "How would you use data to decide where a program should focus?"),
      q("Equity", "Which social factors affect health in the communities you know, and how could a program respond?"),
      q("Scenario", "Turnout at a free screening event is much lower than expected. What would you change next time?"),
      q("Scenario", "False health information is spreading on social media in your community. How would you respond?"),
      q("Communication", "How would you share health information with people who have low health literacy or speak another language?"),
      q("Evaluation", "How do you know whether a public health program is working?"),
      q("Privacy", "How do you protect people's privacy when collecting health information?"),
      q("Current issue", "Which public health issue do you care about most right now, and why?"),
    ),
  },
  "Counselor / Psychology Track": {
    category: "Social Work & Human Services",
    interviewTitle: "counseling and psychology interview",
    description: "For counseling roles, psychology research or practicum spots, and related programs: listening, ethics, boundaries, and care for every client.",
    competencies: ["Active listening", "Ethics and confidentiality", "Cultural humility", "Safety assessment", "Self-awareness"],
    keywords: ["client", "listen", "empathy", "confidentiality", "boundaries", "ethics", "safety", "referral", "supervision", "culture", "mental health", "therapy", "research", "assessment", "support", "self-care", "notes"],
    welcome: "Welcome to your counseling and psychology interview. We are listening for empathy with boundaries, ethical judgment, self-awareness, and respect for every person. Never share identifying details about anyone you have supported.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time you supported someone who was going through something hard.", true),
      q("Experience", "Tell me about a class, research project, or experience that shaped how you think about mental health.", true),
      q("Field motivation", "Why do you want to work in counseling or psychology?"),
      q("Boundaries", "How do you keep professional boundaries while still showing care?"),
      q("Ethics", "How would you explain the limits of confidentiality to a new client?"),
      q("Scenario", "A client says something that makes you worried about their safety. What are your next steps?"),
      q("Scenario", "A client is not making progress and seems frustrated with you. How would you handle it?"),
      q("Cultural humility", "How do you work with clients whose culture, identity, or beliefs differ from yours?"),
      q("Approach", "Which approaches or theories interest you, and why?"),
      q("Self-care", "This work can be emotionally heavy. How do you take care of yourself?"),
      q("Supervision", "How do you use supervision and feedback to grow?"),
      q("Documentation", "Why do accurate notes matter in counseling work?"),
    ),
  },
  "Criminal Justice Professional": {
    category: "Criminal Justice",
    interviewTitle: "criminal justice interview",
    description: "For roles across courts, corrections, probation, advocacy, and law enforcement: integrity, fairness, de-escalation, and accurate reports.",
    competencies: ["Integrity", "De-escalation", "Fairness and bias awareness", "Accurate documentation", "Community trust"],
    keywords: ["integrity", "safety", "community", "report", "de-escalate", "policy", "fair", "bias", "court", "procedure", "rehabilitation", "victim", "trust", "stress", "documentation", "respect", "law"],
    welcome: "Welcome to your criminal justice interview. We are listening for integrity, fairness, calm judgment under stress, and respect for every person you will serve. Be direct and honest. In this field, trust is everything.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time you did the right thing when it was not easy.", true),
      q("Behavioral", "Describe a time you had to follow rules or procedures exactly.", true),
      q("Field motivation", "Why do you want to work in criminal justice?"),
      q("Scenario", "Someone you are working with becomes angry and starts shouting. How do you de-escalate?"),
      q("Scenario", "You see a coworker break policy in a way that could harm someone. What do you do?"),
      q("Fairness", "How do you treat people fairly when you have to make quick judgments?"),
      q("Documentation", "Why does accurate report writing matter, and how do you make sure yours is accurate?"),
      q("Community", "How can people in this field build trust with the communities they serve?"),
      q("Stress", "This work can involve stressful and traumatic situations. How do you manage stress?"),
      q("Respect", "How would you work with people whose backgrounds are very different from yours?"),
      q("Values", "What role do rehabilitation and second chances play in this field, in your view?"),
      q("Role knowledge", "What do you know about the daily work of this role?"),
    ),
  },
  "Communications & Media Associate": {
    category: "Communications & Marketing",
    interviewTitle: "communications and media interview",
    description: "Write, produce, and share stories that are accurate, on deadline, and right for each audience and channel.",
    competencies: ["Writing for audiences", "Deadline production", "Accuracy and ethics", "Audience growth", "Composure with the press"],
    keywords: ["story", "writing", "audience", "content", "deadline", "social", "press release", "editor", "video", "interview", "sources", "fact-check", "brand", "engagement", "newsletter", "media", "publish"],
    welcome: "Welcome to your communications and media interview. We want to hear how you tell a story, meet a deadline, check your facts, and reach the right audience. Have a piece of your work in mind that you can walk us through.",
    questions: jobSet(
      q("Portfolio", "Walk me through a piece of your work you are proud of, from idea to publishing.", true),
      q("Behavioral", "Tell me about a time you produced quality work on a tight deadline.", true),
      q("Writing", "How do you adapt your writing for a press release, a social post, and a newsletter?"),
      q("Scenario", "A post goes out with an error and people are already sharing it. What do you do?"),
      q("Scenario", "A reporter calls about a sensitive situation and you are not authorized to speak. What do you say?"),
      q("Media habits", "Which news outlets, creators, or campaigns do you follow, and what do you learn from them?"),
      q("Interviewing", "How do you prepare to interview someone for a story?"),
      q("Ethics", "How do you check facts and sources before you publish?"),
      q("Measurement", "How do you measure whether a piece of content worked?"),
      q("Feedback", "How do you respond when an editor makes heavy changes to your work?"),
      q("Tools", "Which tools do you use for writing, design, video, or audio?"),
      q("Audience", "How would you reach an audience that does not usually pay attention to us?"),
    ),
  },
  "Nonprofit Program Coordinator": {
    category: "Social Work & Human Services",
    interviewTitle: "nonprofit program coordinator interview",
    description: "Run mission-driven programs: plan and deliver them, lead volunteers, track outcomes, report to funders, and keep the community at the center.",
    competencies: ["Program coordination", "Volunteer leadership", "Outcome tracking", "Partnerships", "Resourcefulness"],
    keywords: ["mission", "program", "volunteers", "community", "participants", "event", "budget", "grant", "outcomes", "partners", "data", "report", "coordinate", "outreach", "impact", "donors", "schedule"],
    welcome: "Welcome to your nonprofit program coordinator interview. We are looking for someone who loves the mission, stays organized when wearing many hats, does a lot with a little, and listens to the people we serve. Campus organizations and volunteer work make great examples.",
    questions: jobSet(
      q("Program", "Tell me about a program, event, or project you coordinated from start to finish.", true),
      q("Behavioral", "Describe a time you did a lot with limited resources.", true),
      q("Mission", "What draws you to our mission?"),
      q("Volunteers", "How would you recruit, train, and keep volunteers engaged?"),
      q("Scenario", "Your event is in two days and a key partner cancels. What do you do?"),
      q("Budget", "How have you managed or tracked a budget, even a small one?"),
      q("Outcomes", "How would you track whether participants are actually being helped?"),
      q("Funders", "What experience do you have with grant reports, outcomes, or updates for funders?"),
      q("Community voice", "How would you make sure the people we serve have a voice in our programs?"),
      q("Prioritizing", "Nonprofit roles often mean many tasks at once. How do you prioritize?"),
      q("Partnerships", "How would you build a relationship with a new community partner?"),
      q("Sustainability", "How do you stay steady in mission-driven work without burning out?"),
    ),
  },
  "Secondary Teacher": {
    category: "Education",
    interviewTitle: "middle and high school teaching interview",
    description: "Teach a subject to middle and high school students: engaging lessons, respectful relationships, fair assessment, and strong partnerships with families.",
    competencies: ["Content instruction", "Adolescent engagement", "Classroom management", "Assessment and data", "Inclusive teaching"],
    keywords: ["students", "lesson", "content", "engagement", "classroom", "assessment", "grades", "families", "iep", "504", "differentiation", "department", "standards", "relationships", "technology", "behavior", "data"],
    welcome: "Welcome to your middle and high school teaching interview. We are looking for someone who knows their subject, connects with teenagers, manages a classroom with respect, and partners with families. Use examples from student teaching, tutoring, coaching, or mentoring.",
    questions: jobSet(
      q("Behavioral", "Tell me about a time you helped a student who was falling behind.", true),
      q("Engagement", "How would you engage teenagers who say your subject is boring or pointless?"),
      q("Instruction", "Walk us through a lesson you would teach in your subject."),
      q("Scenario", "A student keeps using a phone during instruction after several reminders. How do you respond?"),
      q("Scenario", "A parent emails you upset about their child's grade. What do you do?"),
      q("Scenario", "A student tells you something that makes you think they may be unsafe at home. What are your obligations?"),
      q("Assessment", "How do you use assessment results to change your teaching?"),
      q("Relationships", "How do you build respectful relationships with students in grades 6 through 12?"),
      q("Inclusion", "How do you support students with IEPs or 504 plans, and students learning English, in a content class?"),
      q("Collaboration", "How would you work with your department or grade-level team?"),
      q("Classroom culture", "What does a respectful, productive classroom look like to you on the first day and the hundredth?"),
      q("Technology", "How do you use technology in your classroom, and when do you avoid it?"),
    ),
  },
});

// Tough and curveball questions. Two are mixed into a session when the student keeps
// "Add 2 tough questions" on. `tip` is shown on the "how to approach this" reveal and after scoring.
const tough = (key, prompt, tip, extra = {}) => ({ key, category: "Tough question", prompt, star: false, tough: true, tip, ...extra });

export const TOUGH_QUESTIONS = [
  tough("weakness", "What is your greatest weakness?", "Pick a real weakness that will not sink you for this role, show what you are doing about it, and give one recent sign of progress. Skip fake weaknesses like \"I work too hard.\" Interviewers have heard them all."),
  tough("failure", "Tell me about a time you failed.", "Choose a real failure with a clear lesson. Spend a short time on what went wrong and most of your time on what you did next and what you do differently now. Own your part without blaming anyone.", { star: true }),
  tough("why-you", "Why should we hire you over the other candidates?", "Connect two or three of your strengths to what they need, with one proof point for each. Sound confident, not boastful, and never put other candidates down.", { academicPrompt: "Why should we choose you over the other applicants?" }),
  tough("gap", "I see some time away from school or work on your record. Can you tell me about it?", "Be honest and brief. You never have to share health, family, or other private reasons. A simple line like \"I stepped away to take care of a personal matter, and it is resolved\" is enough. Then say what you learned or did during that time and what is different now. Many people stop out and come back. Coming back is a strength."),
  tough("gpa", "Your transcript shows a hard semester. What happened, and what has changed?", "Own it in one or two sentences without over-explaining. You do not owe anyone private details. Spend most of your answer on what changed: new study habits, support you found, a course load you manage better, and how you have done since. End on your progress."),
  tough("salary", "What are your salary expectations?", "Research the typical pay range for this role and city before the interview. Give a range instead of one number, and it is completely okay to ask what range they have budgeted. You can also say you are flexible and looking at the whole offer.", { jobOnly: true }),
  tough("five-years", "Where do you see yourself in five years?", "Show ambition that fits this path. Talk about skills you want to build and responsibility you want to earn. It is fine not to have every detail figured out. Honest direction beats a rehearsed plan."),
  tough("leaving", "Why are you leaving your current job, or why did you leave your last one?", "Stay positive and look forward. Focus on what you are moving toward, like growth, a better fit with your schedule or goals, or new skills. Never criticize a past employer, even if they earned it.", { jobOnly: true }),
  tough("disagree", "Tell me about a time you disagreed with a supervisor.", "Show respect and maturity. Explain how you raised the concern privately and calmly, the facts you brought, how you listened, and how it ended, even if you did not get your way.", { star: true, academicPrompt: "Tell me about a time you disagreed with a teacher, professor, or supervisor." }),
  tough("your-questions", "What questions do you have for us?", "Always have two or three ready. Ask about the work itself, what success looks like in the first months, the team or community, or the next steps. Saying \"no questions\" can sound like low interest.", { replacesClosing: true }),
];

export function buildToughQuestions(count = 2, { academic: isAcademic = false } = {}) {
  const pool = TOUGH_QUESTIONS.filter((item) => !(isAcademic && item.jobOnly));
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return picked.map(({ academicPrompt, ...item }) => ({ ...item, prompt: isAcademic && academicPrompt ? academicPrompt : item.prompt }));
}

export function mixToughQuestions(base, toughList = []) {
  const list = [...base];
  let inserted = 0;
  const ordered = [...toughList].sort((a, b) => Number(Boolean(b.replacesClosing)) - Number(Boolean(a.replacesClosing)));
  ordered.forEach((item) => {
    const closingIndex = list.findIndex((entry) => entry.category === "Closing");
    if (item.replacesClosing && closingIndex >= 0) {
      list[closingIndex] = item;
      return;
    }
    // The first tough question lands mid-interview; any other sits just before the final question.
    const position = inserted === 0 ? Math.min(4, list.length) : Math.max(0, list.length - 1);
    list.splice(position, 0, item);
    inserted += 1;
  });
  return list;
}

export const PANELISTS = {
  job: [
    { name: "Ms. Carter", title: "Hiring Manager" },
    { name: "Mr. Okafor", title: "Team Lead" },
    { name: "Dr. Reyes", title: "Department Director" },
    { name: "Ms. Nguyen", title: "Human Resources" },
  ],
  academic: [
    { name: "Dr. Ellis", title: "Committee Chair" },
    { name: "Ms. Brooks", title: "Committee Member" },
    { name: "Dr. Patel", title: "Faculty Reviewer" },
    { name: "Mr. Johnson", title: "Alumni Volunteer" },
  ],
};

const categoryMap = [
  ["College & Campus", ["Scholarship Interview", "Internship (Any Field)", "Campus Job / Work-Study", "Resident Assistant"]],
  ["Graduate & Professional School", ["Graduate School Admissions", "Medical School", "Law School"]],
  ["Education", ["Elementary Teacher", "Secondary Teacher", "School Counselor", "Special Education Teacher"]],
  ["Healthcare", ["Registered Nurse", "Public Health Specialist", "Medical Assistant", "Healthcare Administrator", "Physical Therapist"]],
  ["Business", ["Human Resources Coordinator", "Management Trainee", "Business Analyst", "Project Coordinator"]],
  ["Technology", ["Software Engineer", "Data Analyst", "IT Support Specialist", "Cybersecurity Analyst"]],
  ["Social Work & Human Services", ["Social Worker", "Counselor / Psychology Track", "Nonprofit Program Coordinator", "Case Manager", "Community Outreach Coordinator"]],
  ["Communications & Marketing", ["Marketing Coordinator", "Communications & Media Associate", "Public Relations Specialist", "Social Media Coordinator"]],
  ["Finance & Accounting", ["Accounting & Finance Associate", "Financial Analyst", "Staff Accountant", "Audit Associate"]],
  ["Criminal Justice", ["Criminal Justice Professional", "Probation Officer", "Victim Advocate", "Crime Analyst"]],
  ["Hospitality & Retail", ["Retail & Customer Service Associate", "Guest Services Manager", "Event Coordinator", "Hotel Operations Associate"]],
  ["STEM / Science", ["Engineer (General)", "Laboratory Technician", "Research Assistant", "Environmental Scientist"]],
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
