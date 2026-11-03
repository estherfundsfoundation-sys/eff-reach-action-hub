/* The aid moves nobody tells you (3 Nov 2026, Shayna: "the FAFSA hidden-knowledge layer … the moves students don't
   know"). Written from official sources only (studentaid.gov, fsapartners.ed.gov, ecfr.gov, ed.gov, USDA, state
   agencies), researched in MyEFF's research_notes/fafsa-hidden-knowledge/notes.md, which lists everything still
   unconfirmed. Anything unconfirmed is left out here or worded "ask your school". Re-check every fall: the 2027–28
   maximum Pell and its SAI cutoff are announced in early 2027. */
export type Move = {
  key: string; title: string; hook: string; truth: string[]; script: string; bring?: string[];
  when: string[]; sources: Array<[string, string]>;
};

export const MOVES: Move[] = [
  {
    key: "special-circumstances", title: "Your family's money changed? Ask for a second look.",
    hook: "Professional judgment, also called a special circumstances review",
    truth: [
      "The FAFSA looks at money from two years ago. If your life changed since then, the financial aid office can change the numbers behind your aid.",
      "A parent lost a job, someone died, a divorce, big medical bills, you lost income: these are the reasons it exists.",
      "Every college must tell students the process exists and can't have a policy of saying no to everyone. They decide case by case, and their answer is final.",
      "It counts only at that college. If you transfer, ask again.",
    ],
    script: "Hi, my name is ___, student ID ___. Since I filed my FAFSA my family's situation changed: ___. I'd like to request a special circumstances review, sometimes called professional judgment. What form do you need, what documents should I bring, and when will I hear back?",
    bring: ["A layoff letter or unemployment statements", "A death certificate", "Medical bills", "A divorce or separation document", "Recent pay stubs showing the lower income", "A short letter in your own words"],
    when: ["Ask as soon as the change happens. Don't wait for your award letter."],
    sources: [["FSA Handbook, Special Cases (2026–27)", "https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2026-2027/application-and-verification-guide/ch5-special-cases"]],
  },
  {
    key: "independent", title: "Can't get your parents' information? You may not need it.",
    hook: "Dependency override, homeless youth determination, foster care",
    truth: [
      "If there's a real break with your parents (abuse, abandonment, a parent in prison, a family you can't find), the aid office can treat you as independent. That's a dependency override.",
      "\"My parents won't help\" or \"they don't claim me\" is not enough by itself. The office usually wants a letter from someone outside the family: a counselor, pastor, social worker or teacher.",
      "If you're under 24 and homeless or at risk and not living with a parent, you can be independent as an unaccompanied homeless youth. A school district homeless liaison, a shelter or youth program director can confirm it. If nobody can, the aid administrator can decide from your statement. Why you became homeless must not count against you.",
      "If you were in foster care, a ward of the court or emancipated, the FAFSA has its own questions for that. Answer them; no override is needed.",
    ],
    script: "I can't provide my parents' information because ___. I'd like to request a dependency override (or: a homeless youth determination). Who can write a letter for me, and what should it say?",
    when: ["Ask when you file the FAFSA.", "Answer the homeless question honestly every year and keep your letter."],
    sources: [
      ["FSA Handbook, Special Cases (2026–27)", "https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2026-2027/application-and-verification-guide/ch5-special-cases"],
      ["ED: unaccompanied homeless youth determinations", "https://fsapartners.ed.gov/knowledge-center/library/dear-colleague-letters/2023-04-14/unaccompanied-homeless-youth-determinations-update-updated-july-19-2024"],
    ],
  },
  {
    key: "sap", title: "Lost your aid for grades? Appeal it.",
    hook: "Satisfactory academic progress (SAP) appeals",
    truth: [
      "To keep federal aid you must keep a GPA, finish enough of the classes you try, and finish within 150% of your program's length. Your college sets the exact numbers.",
      "Dropped and failed classes count as tried. Ask before you drop.",
      "If you fall behind, you can appeal. A won appeal puts you on probation for a term, or on an academic plan if you need longer.",
      "An appeal must say what happened (illness, a death, a crisis) and what has changed so you'll succeed now.",
    ],
    script: "I'm appealing the loss of my financial aid for ___. What happened: ___. How it affected my classes: ___. What has changed: ___. My plan: ___. I've attached ___. I'm asking to be placed on probation or an academic plan.",
    when: ["The appeal is usually due before the next term starts. Ask your college for its date the day you get the letter."],
    sources: [["34 CFR 668.34", "https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-668/subpart-C/section-668.34"]],
  },
  {
    key: "verification", title: "Selected for verification? It's not an accusation. Finish it fast.",
    hook: "Verification",
    truth: [
      "It means your college has to check your FAFSA. It doesn't mean you did anything wrong.",
      "Until it's done, the college can't pay you any federal aid for that year.",
      "Tax information that came straight from the IRS through the FAFSA usually doesn't need checking. Otherwise send an IRS tax return transcript (free at IRS.gov, Get Transcript).",
      "If you never finish, you lose Pell for that year.",
    ],
    script: "I was selected for verification. Can you give me the exact list of what you still need from me and my parent, and the date you need it by? Can I upload it online?",
    when: ["Do it the week your college asks. Your aid waits until you do."],
    sources: [["FSA Handbook, Verification (2026–27)", "https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2026-2027/application-and-verification-guide/ch4-verification-updates-and-corrections"]],
  },
  {
    key: "displacement", title: "Won a scholarship? Ask what they'll cut before they cut it.",
    hook: "Scholarship displacement",
    truth: [
      "Your total aid can't be more than your cost of attendance. If an outside scholarship pushes you over, the college must reduce something.",
      "A correctly figured Pell Grant is never what gets cut. Many colleges cut loans first, but some cut their own grants.",
      "You can ask them to cut loans or work-study instead, and to re-check whether your costs went up.",
      "California, Maryland, New Jersey, Washington, Pennsylvania and Minnesota have laws limiting this at their colleges.",
    ],
    script: "I received an outside scholarship of $___ from ___. Before you adjust my package, can you tell me exactly what will be reduced? I'd like you to reduce my loans or work-study first and keep my grants. Can you also re-check my cost of attendance?",
    when: ["Report each scholarship as soon as you accept it."],
    sources: [["FSA Handbook, Overawards (2026–27)", "https://fsapartners.ed.gov/sites/default/files/2026-2027/2026-2027_Federal_Student_Aid_Handbook/_knowledge-center_fsa-handbook_2026-2027_vol4_ch3-overawards-and-overpayments.pdf"]],
  },
  {
    key: "pell-limits", title: "The two new ways to lose Pell, and how to protect it.",
    hook: "The 2026 Pell limits",
    truth: [
      "From July 2026, a student whose SAI is equal to or more than twice the maximum Pell gets no Pell. For 2026–27 that's an SAI of $14,790 or more.",
      "Also new: if your non-federal grants and scholarships (state, college, private) equal or exceed your cost of attendance, you get no Pell. Even $1 under keeps you eligible.",
      "Your college can lower its own aid to bring you under and save your Pell. Ask.",
      "The 2027–28 numbers come out in early 2027.",
    ],
    script: "My outside scholarships and state grants are close to my cost of attendance. Under the new rule I could lose my Pell if they reach it. Can you check, and if needed adjust my institutional aid or my cost of attendance so I stay Pell-eligible?",
    when: ["Every time a new scholarship arrives, check that your non-federal grants stay below your cost of attendance. Pell Protector does the math."],
    sources: [
      ["FSA: Pell ineligibility effective dates", "https://fsapartners.ed.gov/knowledge-center/library/electronic-announcements/2026-06-04/effective-dates-workforce-pell-and-federal-pell-grant-ineligibility-provisions"],
      ["FSA: 2026–27 Pell eligibility ($14,790)", "https://fsapartners.ed.gov/knowledge-center/library/electronic-announcements/2025-08-15/2026-27-fafsa-form-and-pell-grant-eligibility-updates"],
    ],
  },
  {
    key: "summer-pell", title: "Summer classes can be paid for too.",
    hook: "Year-round Pell",
    truth: [
      "If you've used your Pell for the year, you may get more for summer, up to 150% of your yearly award.",
      "You no longer have to be half-time to get it.",
    ],
    script: "I'd like to take summer classes. Am I eligible for year-round Pell, and which award year will my summer count in?",
    when: ["March to April: ask before summer registration."],
    sources: [["FSA Handbook: year-round Pell", "https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2025-2026/vol7/ch5-summer-terms-crossover-payment-periods-and-year-round-pell"]],
  },
  {
    key: "consortium", title: "Taking a class somewhere cheaper? Keep your aid.",
    hook: "Consortium agreements",
    truth: [
      "You can take a class at another school (a community college, a summer class back home) and keep your federal aid if your college signs a consortium agreement and the class counts toward your degree.",
      "Get it signed before you enroll. Students have lost aid at both schools by skipping this.",
    ],
    script: "I want to take ___ at ___ this term. It counts toward my degree. Can we set up a consortium agreement so my aid covers it? Which school pays me, and what do you need from me?",
    when: ["Weeks before the other school's term starts."],
    sources: [["FSA Handbook, Volume 2 (written arrangements)", "https://fsapartners.ed.gov/sites/default/files/2024-2025/2024-2025_Federal_Student_Aid_Handbook/_knowledge-center_fsa-handbook_2024-2025_vol2.pdf"]],
  },
  {
    key: "snap", title: "College students can get SNAP, if one of these is true.",
    hook: "SNAP student exemptions",
    truth: [
      "Students 18 to 49 enrolled at least half-time need one exemption to get SNAP. The common ones:",
      "You work at least 20 hours a week for pay. Or you're in work-study (that counts on its own, even under 20 hours). Or you care for a child under 6. Or you're a single parent, full-time, with a child under 12.",
      "Apply through your state's SNAP office.",
    ],
    script: "Can you give me a letter confirming my work-study award and that I'm enrolled at least half-time? I'm applying for SNAP.",
    when: ["When your work-study award posts, apply for SNAP the same week."],
    sources: [["USDA: SNAP college student exemptions Q&A", "https://www.usda.gov/sites/default/files/guidance-documents/FNS.snap-collegestudentexemptionsqas.pdf"]],
  },
  {
    key: "refund", title: "Your refund has a legal deadline.",
    hook: "The 14-day credit balance rule",
    truth: [
      "If your aid is more than your bill, the college must pay you the leftover within 14 days: 14 days after the balance appears, or 14 days after classes start if it was there before.",
      "If you'll have a refund, the college must give you a way to get books and supplies by the 7th day of the term.",
    ],
    script: "My aid is more than my bill. When will my refund be sent? I need money for books: what's the way to get them in the first week?",
    when: ["First day of class plus 14 days: if nothing has arrived, ask."],
    sources: [["34 CFR 668.164", "https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-668/subpart-K/section-668.164"]],
  },
  {
    key: "withdraw", title: "Before you withdraw, find your 60% date.",
    hook: "Return of federal aid",
    truth: [
      "If you withdraw or stop going before 60% of the term, you've earned only part of your federal aid. The rest goes back, and you can end up owing the college.",
      "After 60%, you've earned all of it. Sometimes staying a few more days changes everything.",
    ],
    script: "Before I withdraw, can you run a Return of Title IV estimate for me: how much I'd owe, and the date I pass 60% of the term?",
    when: ["Know each term's 60% date. Before You Withdraw works it out."],
    sources: [["FSA Handbook, Withdrawals", "https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2025-2026/vol5/ch1-general-requirements-withdrawals-and-return-title-iv-funds"]],
  },
  {
    key: "coa", title: "Your cost of attendance can go up, and so can your aid.",
    hook: "Cost of attendance adjustments",
    truth: [
      "The aid office can raise your cost of attendance for child care, disability costs, or a computer you buy for school. A higher cost can unlock more aid.",
      "Bring receipts or quotes.",
    ],
    script: "I'd like a cost of attendance adjustment for ___ (child care / a laptop / disability costs). Here are my receipts or estimates.",
    when: ["Ask early in the term, while aid can still be added."],
    sources: [["FSA Handbook, Cost of Attendance", "https://fsapartners.ed.gov/knowledge-center/fsa-handbook/2024-2025/vol3/ch2-cost-attendance-budget"]],
  },
  {
    key: "work-study", title: "No work-study in your offer? Ask anyway.",
    hook: "Federal Work-Study",
    truth: [
      "Work-study is part-time work paid with federal money. It also counts for SNAP.",
      "It depends on need and the college's funds, and you usually find the job yourself. Good jobs go fast.",
    ],
    script: "I don't see Federal Work-Study in my aid offer. Can I be considered if funds open up? Where's the list of work-study jobs?",
    when: ["Ask when you file the FAFSA, and apply for jobs the first week of the term."],
    sources: [["StudentAid.gov: Federal Work-Study", "https://studentaid.gov/articles/8-things-federal-work-study/"]],
  },
  {
    key: "autopay", title: "Repaying loans? Autopay lowers your rate.",
    hook: "The autopay discount",
    truth: [
      "Signing up for autopay with your federal loan servicer lowers your interest rate by 0.25% while you're repaying.",
      "From July 2026, Parent PLUS loans are capped at $20,000 a year and $65,000 per student. If your parent reaches the cap, ask the aid office what's left: a payment plan or more grant aid.",
    ],
    script: "Please enroll me in autopay. Am I getting the interest-rate reduction, and what rate will I have?",
    when: ["As soon as repayment starts."],
    sources: [
      ["MOHELA (a federal servicer): autopay reduction", "https://mohela.studentaid.gov/DL/resourceCenter/AutoPayInterestRateReduction.aspx"],
      ["FSA: loan limits FAQ (July 2026)", "https://fsapartners.ed.gov/sites/default/files/2026-05/FrequentlyAskedQuestionsLoanLimits.pdf"],
    ],
  },
];

/* State FAFSA deadlines for 2027–28 from the official form (studentaid.gov/sites/default/files/2027-28-fafsa-form.pdf)
   and the state agencies. Louisiana, Mississippi and New York are left out until checked. "first" = awarded while
   funds last: file in October or November. */
export const STATES: Array<{ st: string; name: string; when: string; date?: string; first?: boolean }> = [
  { st: "AL", name: "Alabama", when: "No state date. Ask your college's financial aid office." },
  { st: "CA", name: "California", when: "March 2, 2027 for Cal Grant and many state programs.", date: "2027-03-02" },
  { st: "DC", name: "Washington, DC", when: "FAFSA priority June 25, 2027; DC TAG priority July 1, 2027.", date: "2027-06-25" },
  { st: "FL", name: "Florida", when: "May 15, 2027 (date processed). Check with your college.", date: "2027-05-15" },
  { st: "GA", name: "Georgia", when: "As soon as possible after October 1, 2026. Check with your college." },
  { st: "IL", name: "Illinois", when: "As soon as possible. MAP grants go out while money lasts.", first: true },
  { st: "KY", name: "Kentucky", when: "As soon as possible. State awards go out while money lasts.", first: true },
  { st: "MD", name: "Maryland", when: "March 1, 2027 for fullest consideration.", date: "2027-03-01" },
  { st: "NC", name: "North Carolina", when: "June 1, 2027 priority for UNC System and NC community colleges (Next NC Scholarship). After that, while funds last.", date: "2027-06-01", first: true },
  { st: "SC", name: "South Carolina", when: "State need-based grants go out while money lasts. SC Tuition Grants (private colleges): August 1, 2027.", first: true },
  { st: "TN", name: "Tennessee", when: "Tennessee Promise and returning State Grant students: April 1, 2027. Everyone else: while money lasts.", date: "2027-04-01", first: true },
  { st: "TX", name: "Texas", when: "January 15, 2027 priority (TASFA if you can't file the FAFSA).", date: "2027-01-15" },
  { st: "VA", name: "Virginia", when: "As soon as possible after October 1, 2026. Dates vary by college." },
];
