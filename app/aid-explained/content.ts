/* Financial aid, explained like a story (16 Nov 2026, Shayna: "turn this into a blog for high school and college
   students so that they understand this"). Rewritten for students from EFF's Simple Version of its financial aid
   training (built from FSA Basic Training for New Staff 2026–27). Figures are 2026–27; check them each fall.
   EFF is not a financial aid office; the school's aid office decides. */

export type Q = { ask: string; options: { t: string; right?: boolean; why: string }[] };
export type Chapter = {
  key: string; n: string; title: string; story: string[]; plain: (string | [string, string])[];
  box?: { kind: "remember" | "watch" | "secret"; title: string; body: string[] };
  table?: { head: [string, string]; rows: [string, string][] };
  q: Q;
};

export const CHAPTERS: Chapter[] = [
  {
    key: "gap", n: "1", title: "The price tag, the family number, and the gap",
    story: [
      "Maya gets into college. The college says one year costs $10. (Pretend money. Small numbers first.)",
      "Maya's family fills out the FAFSA. The government reads it and gives her family a number: 3.",
      "So there's a gap. The year costs $10, her family number is 3, and the gap is $7. That gap is what financial aid tries to fill.",
    ],
    plain: [
      "There are only three numbers in this whole business.",
      ["The price tag", "What one year of college really costs: classes, a place to live, food, books, getting around, all of it. The official name is Cost of Attendance (COA)."],
      ["The family number", "The number your FAFSA gives your family. It is not a bill. Nobody pays it. It only measures how much help you need. The official name is the Student Aid Index (SAI). It can even go below zero, down to −1,500. A lower number means more need."],
      ["The gap", "Price tag minus family number. Aid fills the gap."],
      "One more thing that matters: aid can never go over the price tag. If a year costs $10, the most help you can get is $10. When you're told \"that's all we can give,\" this ceiling is usually why.",
      "Scholarships from outside count too. They fill part of the gap, so other aid shrinks to fit. Everything has to fit under the price tag.",
    ],
    box: { kind: "remember", title: "Remember just this", body: ["Price tag minus family number equals the gap.", "Aid fills the gap. Aid never goes over the price tag."] },
    q: { ask: "A year costs $10. Your family number is 4. How big is your gap?", options: [
      { t: "$14", why: "That's adding. The gap is the price tag minus the family number." },
      { t: "$6", right: true, why: "Yes. $10 minus 4 is $6. That's the whole math of financial aid. Everything else is details." },
      { t: "$4", why: "That's the family number. The gap is what's left after you take it away from the price tag." },
    ] },
  },
  {
    key: "pell", n: "2", title: "Pell: the gift money",
    story: [
      "Maya's gap is $7. The first help she gets is a Pell Grant: $5 of gift money.",
      "She never pays it back. Not when she graduates. Not ever.",
    ],
    plain: [
      ["A grant is a gift. A loan is borrowing.", "Pell is a gift."],
      ["The most Pell for 2026–27", "$7,395 for a full year of full-time school."],
      ["Fewer classes, smaller gift", "9 credits out of 12 pays 75%. 6 out of 12 pays 50%."],
      ["Too high for Pell", "If your family number is 14,790 or more, there's no Pell."],
      ["Summer counts", "You can get extra Pell in summer, up to half a year more."],
      ["The hero rule", "If your parent died serving as a soldier or a public safety officer, you get the most Pell no matter what your family number says."],
    ],
    box: { kind: "watch", title: "The Pell piggy bank", body: [
      "Pell has a lifetime piggy bank. It holds about 12 full-time semesters of Pell for your whole life. Every semester uses some.",
      "When it hits zero, Pell is over for good. Nobody can refill it: not your school, not an appeal. If you've switched majors a few times or gone part time for years, check your bank at StudentAid.gov.",
      "New rule: if your scholarships and grants from outside the government add up to your whole price tag, you lose Pell completely. Before you celebrate a huge outside scholarship, check the total against your price tag.",
    ] },
    q: { ask: "Maya has already used 11½ semesters of Pell. What happens next?", options: [
      { t: "It refills when she starts a new degree", why: "Nothing refills it. It's a lifetime bank." },
      { t: "Her school can appeal to refill it", why: "No appeal can refill it. Not the school, not anyone." },
      { t: "She gets about half a semester more, then Pell ends for life", right: true, why: "Right. The bank holds about 12 semesters total, for life." },
    ] },
  },
  {
    key: "loans", n: "3", title: "Loans: borrowing, with a receipt",
    story: [
      "Pell gave Maya $5. Her gap is $7, so she still needs $2. The school offers a loan: borrow $2 now, pay it back slowly after school.",
      "Maya clicks yes. But the money doesn't move. Why?",
    ],
    plain: [
      "A federal student loan needs three things before it pays:",
      ["1. Accept it", "In your school's portal."],
      ["2. Do entrance counseling", "A short online class at StudentAid.gov."],
      ["3. Sign the promise note", "It's called a Master Promissory Note (MPN), also at StudentAid.gov."],
      "Miss one and the money just sits there. This is one of the top reasons a balance shows up out of nowhere.",
      ["Subsidized", "The government pays the interest while you're in school."],
      ["Unsubsidized", "Interest grows while you study."],
    ],
    table: { head: ["Year in school", "Most you can borrow each year (dependent students)"], rows: [
      ["Freshman", "$5,500"], ["Sophomore", "$6,500"], ["Junior and senior", "$7,500"], ["Whole degree, in total", "$31,000"],
    ] },
    box: { kind: "secret", title: "The door most families never hear about", body: [
      "If your parent applies for the Parent PLUS loan and is told no, you can borrow more in your own name: $4,000 more a year as a freshman or sophomore, $5,000 more as a junior or senior.",
      "A parent is usually told no for serious credit problems: big bills 90 or more days late, accounts in collections, or a bankruptcy or foreclosure in the last five years. Having no credit history is not a no.",
      "The catch: your parent has to actually apply. A parent who just refuses to apply opens nothing. The \"no\" is what opens the door, and a \"yes\" never forces them to borrow.",
      "Parents now have limits too: $20,000 a year and $65,000 in total for each child.",
    ] },
    q: { ask: "Maya's dad says, \"I won't apply for the parent loan.\" Does Maya get the extra borrowing?", options: [
      { t: "Yes, refusing counts", why: "Refusing isn't the same as being told no." },
      { t: "No. He has to apply and be turned down", right: true, why: "Exactly. Only a real \"no\" opens the extra borrowing." },
      { t: "Yes, if he writes a letter", why: "A letter doesn't open it. Only a denied application does." },
    ] },
  },
  {
    key: "sap", n: "4", title: "The report card rule",
    story: [
      "Sophomore year is rough. Maya fails two classes and drops one.",
      "Next semester, her aid is gone. The school says she broke the report card rule.",
    ],
    plain: [
      "The government keeps paying only if you're really moving toward your degree. The official name is Satisfactory Academic Progress (SAP). It has three parts:",
      ["Grades", "Keep about a C average (2.0) or better."],
      ["Finish what you start", "Pass about 2 out of every 3 classes you sign up for (67%)."],
      ["Don't take forever", "A 4-year degree lets you attempt about 6 years' worth of classes (150%)."],
      "Three hard truths: taking a break doesn't fix it, paying for classes yourself doesn't fix it, and the moment you can't finish inside the time limit, aid stops right then.",
      "Three ways back: pass enough classes to get back inside the lines; use a warning semester if your school gives one; or appeal.",
    ],
    box: { kind: "remember", title: "An appeal is a letter with proof", body: [
      "\"I had a hard semester\" isn't enough. \"Our apartment had mold, we had to move, here are both leases and the photos, and I was working 40 hours a week, here's my schedule\": that's an appeal.",
      "Denied for \"not enough documentation\"? That's the most fixable no there is. The door is open; the folder was thin. Gather the papers and ask again.",
      "If it works, you get probation: one semester to get back on track, or a written plan. Follow the plan and your aid stays on.",
      "If your aid stopped for this rule, fix it first, before payment plans or anything else.",
    ] },
    q: { ask: "Your appeal was denied for \"insufficient documentation,\" and you have all your papers at home. What does that mean?", options: [
      { t: "It's over, nothing can be done", why: "Not at all. This is the most fixable kind of denial." },
      { t: "The door is open. Your folder was just too thin", right: true, why: "Yes. Build the folder, claim by claim, paper by paper, and ask again." },
      { t: "You should switch schools", why: "No need. Send the proof." },
    ] },
  },
  {
    key: "second", n: "5", title: "\"Prove it,\" and asking for a second look",
    story: [
      "The government picks Maya's FAFSA and says: prove it. She has to show papers that match the form. Until she does, her money waits.",
      "Then her mom loses her job in October. But the FAFSA used last year's taxes, when mom still had the job. The form thinks the family is fine. The family is not fine.",
    ],
    plain: [
      ["Prove it (verification)", "It's normal. Lots of students get picked. Send what's asked as fast as you can. If two papers in your file disagree, everything stops until the school sorts it out, so ask your aid office if anything is missing."],
      ["Everyone must say yes", "Every person who filled out part of the FAFSA must agree to share tax information. One \"no\" and you get no federal aid."],
      ["A second look (professional judgment)", "You can always ask. Your school must let you. The aid office can change the ingredients: use this year's real income, or add costs like a laptop, childcare or medical bills."],
      ["What they can't do", "Type in a better family number, skip a rule, or raise a lifetime limit. Their answer is final."],
      ["It takes time", "Three to five weeks is normal, so ask early."],
      ["When the problem is family", "If your parents abandoned you, a parent is in prison, your home is abusive or dangerous, you're a refugee or you were trafficked, you can ask to be treated as independent (a dependency override)."],
      ["What doesn't count on its own", "Parents who won't pay, won't fill out the form, or don't claim you on taxes, or paying your own bills. Those are hard, but they don't open that door."],
    ],
    q: { ask: "Can Maya ask the aid office to \"just type in a lower family number\"?", options: [
      { t: "Yes, if she asks nicely", why: "They can't change the number directly." },
      { t: "Yes, once per student", why: "There's no one-time pass for that." },
      { t: "No. They can change the ingredients, like using her mom's new income, not the number", right: true, why: "Right. Bring proof of the change and ask for a second look." },
    ] },
  },
  {
    key: "balance", n: "6", title: "Balances, holds, and the magic number",
    story: [
      "Maya owes her school $900. They put a hold on her account: she can't sign up for next semester until she deals with it. She panics. She thinks she needs $900 by Friday.",
      "Then she learns her school's secret: the hold only blocks her while she owes more than $500. She doesn't need $900. She needs $400.",
    ],
    plain: [
      ["The magic number", "Most schools have one: the amount you need to get under before they let you register. One school says $225, another $500, another everything. Ask the bursar for yours. Your target is almost never the whole bill."],
      ["Leftover money is yours", "If aid pays more than the school charges, the school must give you the rest within 14 days."],
      ["Old charges are stubborn", "This year's aid can pay last year's classes and housing, but other old charges only up to $200. That's why a small old balance can survive a year of full aid."],
      ["Payment plans", "Ask: how many payments, how much each, and does signing up let me register while I pay?"],
      ["If the school made the mistake", "If the school paid you too much by its own mistake, the school fixes it. It can't become your debt or block your transcript."],
    ],
    box: { kind: "remember", title: "Do this first", body: ["Call or email your bursar and ask: \"What balance do I need to get under to register?\" Then aim there."] },
    q: { ask: "You owe $2,952. Your school's magic number is $225. How much do you need to pay to register?", options: [
      { t: "All $2,952", why: "Not to register. You only need to get under the magic number." },
      { t: "$225", why: "That's the line you need to get under, not the amount to pay." },
      { t: "$2,727, which gets you down to $225", right: true, why: "Yes. $2,952 minus $2,727 leaves $225." },
    ] },
  },
  {
    key: "leave", n: "7", title: "Leaving in the middle: the 60% line",
    story: [
      "Maya's cousin starts the semester, gets his aid, then leaves in week 3. The school sends him a bill. \"But it was my aid!\"",
      "Here's the rule he never knew: you earn your aid day by day.",
    ],
    plain: [
      ["Leave at 10% of the term", "You earned 10% of your aid."],
      ["Leave at 40%", "You earned 40%."],
      ["Stay past 60%", "You earned all of it. Nothing goes back."],
      ["The grant cushion", "When you leave, half of your grant money is protected, and if you'd owe $50 or less of grant money, it's forgiven."],
      ["An approved leave is different", "A leave of absence your school approves in writing, with a plan to come back, follows kinder rules."],
      ["Never really started?", "A newer rule: if you never really began classes, your charges are wiped and your Pell bank and loan limits stay untouched."],
    ],
    box: { kind: "watch", title: "Before you withdraw", body: ["A withdrawal bill is a math problem, not a verdict. Check the date, the 60% line, the 50% cushion and the $50 forgiveness. Schools make mistakes on these. Ask your aid office to walk you through the numbers before anyone pays."] },
    q: { ask: "A student leaves after finishing 70% of the semester. How much aid goes back?", options: [
      { t: "None. Past 60%, she earned all of it", right: true, why: "Right. The 60% line is the one to know." },
      { t: "30%", why: "Past 60%, it's all earned." },
      { t: "All of it", why: "No. She earned it day by day, and she passed 60%." },
    ] },
  },
  {
    key: "pots", n: "8", title: "Two school pots: the line-up grant and the campus job",
    story: [
      "Two kinds of aid don't come straight from the government to you. The government gives your school a pot, and the school hands it out. When the pot is empty, it's empty.",
      "That's why filing your FAFSA early matters so much.",
    ],
    plain: [
      ["The line-up grant (FSEOG)", "$100 to $4,000 a year. Pell students come first, neediest first. Nobody jumps the line."],
      ["The campus job (Work-Study)", "It's a job, not a check. Your award is the most you're allowed to earn, paycheck by paycheck, all semester."],
    ],
    box: { kind: "watch", title: "The work-study trap", body: ["Work-study can never pay a bill that's due today. It's money you haven't earned yet. It helps next month's budget, not this week's hold."] },
    q: { ask: "You have a $1,500 work-study award and a $1,278 bill due this week. Can work-study clear it?", options: [
      { t: "Yes, the school advances it", why: "Work-study isn't paid up front." },
      { t: "No. It's wages you earn slowly over the semester", right: true, why: "Right. Look at a payment plan or your school's emergency fund for this week's bill." },
      { t: "Yes, if you ask the bursar", why: "It's still paycheck by paycheck." },
    ] },
  },
];

export const CHEAT: [string, string][] = [
  ["Most Pell (2026–27)", "$7,395"],
  ["Too high for Pell", "Family number 14,790 and up"],
  ["Pell piggy bank", "About 12 full-time semesters, for life"],
  ["Parent told no on PLUS", "+$4,000 a year (freshman, sophomore), +$5,000 (junior, senior)"],
  ["Report card rule", "C average · pass 2 of 3 classes · finish within 150% of the time"],
  ["Line-up grant (FSEOG)", "$100 to $4,000 · Pell students first"],
  ["Leftover aid paid to you", "Within 14 days"],
  ["Leaving school: earned-it-all line", "60% of the term"],
  ["Grant cushion when you leave", "50% protected · $50 or less forgiven"],
];

export const DATES: [string, string][] = [
  ["October 1", "The new FAFSA opens. File early, because school pots run out."],
  ["Your school's priority date", "Usually well before spring. Find it on your school's aid page."],
  ["June 30", "The last day to file the FAFSA for the school year that's ending."],
  ["July 1", "The new aid year starts and new rules switch on."],
];

export const TEN: string[] = [
  "Price tag minus family number equals the gap. Aid fills the gap and never goes over the price tag.",
  "Pell is a gift with a lifetime piggy bank of about 12 semesters.",
  "A loan needs three things before it pays: accept, counseling, sign.",
  "A parent told no on the Parent PLUS loan opens $4,000 or $5,000 more for you. A refusal opens nothing.",
  "Break the report card rule and aid stops. An appeal is a letter with proof. A thin folder is fixable.",
  "\"Prove it\" papers pause everything until they match.",
  "A second look can change the ingredients, never the recipe.",
  "Your school has a magic number. Aim there, not at the whole balance.",
  "Leave before 60% of the term and unearned aid goes back. Past 60%, it's all earned.",
  "Work-study is a job, earned slowly. It never pays a bill due today.",
];
