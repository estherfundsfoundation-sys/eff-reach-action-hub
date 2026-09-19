"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PathId = "money" | "academic" | "basic" | "burnout" | "family" | "safety";
type Choice = { text: string; feedback: string; strong: boolean; reply?: string };
type Scene = { title: string; message: string; coach: string; choices: Choice[]; context?: string; phase?: string };
type Pathway = { id: PathId; icon: string; label: string; summary: string; color: string; opening: string; scenes: Scene[]; template: string; resources: Array<{ label: string; detail: string; href: string }> };

const sharedScenes: Scene[] = [
  { title: "Start with care—not a solution", message: "I don’t think I can do this anymore. I might just leave school.", coach: "Your first job is to make it safer for Jordan to keep talking.", choices: [
    { text: "That sounds really heavy. I’m glad you told me. What’s making school feel impossible right now?", feedback: "Strong start. You acknowledge the weight of the situation and ask an open question without taking control.", strong: true },
    { text: "You can’t drop out—you’ve already come too far.", feedback: "The intention is caring, but this can make Jordan feel judged or trapped. Begin by listening before persuading.", strong: false },
    { text: "Everybody feels like that sometimes. You’ll be fine.", feedback: "This minimizes what Jordan shared. Their situation deserves curiosity, not comparison.", strong: false },
  ]},
  { title: "Ask what kind of support they want", message: "I don’t even know where to start. Everything feels connected.", coach: "Support works better when you ask permission before problem-solving.", choices: [
    { text: "Do you want me to listen, help you think through options, or sit with you while we contact someone?", feedback: "Excellent. Jordan keeps ownership while learning that they do not have to take the next step alone.", strong: true },
    { text: "Give me your phone. I’ll email the dean and handle it.", feedback: "Taking over can make someone feel powerless. Offer to do the task with them, not for them, unless safety requires immediate action.", strong: false },
    { text: "You should make a list of everything that’s wrong.", feedback: "A list may help later, but this response adds another assignment before Jordan feels heard.", strong: false },
  ]},
];

const pathways: Pathway[] = [
  { id: "money", icon: "$", label: "Tuition or financial-aid crisis", color: "sun", summary: "A balance, aid change, or registration hold is pushing them out.", opening: "My aid changed, I owe $2,400, and they said I can’t register. I feel stupid for thinking I could afford this.", scenes: [{ title: "Turn panic into one next move", message: "The deadline is Friday. I don’t think there’s anything I can do.", coach: "Do not promise money or a result. Help Jordan protect their options before withdrawing.", choices: [
    { text: "Let’s look at the notice together and identify who can change the decision. I can sit with you while you contact financial aid or the dean of students.", feedback: "Strong. You offer practical company, preserve Jordan’s agency, and focus on the office with decision-making power.", strong: true },
    { text: "Start a fundraiser tonight. That’s probably the only way.", feedback: "Fundraising may be one tool, but it should not replace checking appeals, emergency grants, payment options, and institutional errors first.", strong: false },
    { text: "Maybe taking the semester off is for the best.", feedback: "A pause may eventually be Jordan’s choice, but recommend it only after they understand the academic and financial consequences.", strong: false },
  ]}], template: "Hey Jordan, I’m glad you told me. A balance does not mean you failed. Before you withdraw, can we look at the notice together and identify the deadline and the office that can change the decision? I can sit with you while you contact financial aid, student accounts, or the dean of students. You deserve to know every option before making a permanent decision.", resources: [
    { label: "Tuition Rescue Plan", detail: "Build a personalized 48-hour response.", href: "/tools/balance" }, { label: "Student Defense Suite", detail: "Prepare an appeal, evidence, and escalation path.", href: "/defense?tool=tuition" }, { label: "Federal Student Aid", detail: "Review official aid and FAFSA guidance.", href: "https://studentaid.gov/" },
  ]},
  { id: "academic", icon: "A+", label: "Grades or academic standing", color: "coral", summary: "Failing classes, SAP, probation, or fear of disappointing others.", opening: "I’m failing two classes. If my family finds out, I’m done. It feels easier to disappear before everybody knows.", scenes: [{ title: "Separate the semester from the person", message: "I already messed everything up. There is no fixing this.", coach: "Shame makes help harder to reach. Validate the fear and guide Jordan toward accurate information.", choices: [
    { text: "This semester is a situation—not your identity. Would it help if we checked the academic deadlines and talked with your professor or advisor together?", feedback: "Strong. You reduce shame without making false promises and offer a specific, shared next step.", strong: true },
    { text: "You just need to study harder this week.", feedback: "This assumes effort is the only barrier and may deepen shame. Learn what is happening before offering a strategy.", strong: false },
    { text: "Don’t tell your family. We can keep this between us.", feedback: "Do not promise secrecy. Help Jordan decide which safe, supportive person or professional can join the plan.", strong: false },
  ]}], template: "I hear how ashamed and scared you feel, but one hard semester is not your whole story. Before you disappear or withdraw, can we check your deadlines and options together? I can sit with you while you email your professor, advisor, tutoring center, or academic-success office. We only need one next step today.", resources: [
    { label: "Stay-Enrolled Planner", detail: "Name the barrier and build a support-team plan.", href: "/tools/persist" }, { label: "Student Defense Suite", detail: "Navigate grades, SAP, and academic petitions.", href: "/defense?tool=sap" }, { label: "Reach for Yourself", detail: "Build a complete stay-enrolled plan.", href: "/reach-yourself" },
  ]},
  { id: "basic", icon: "⌂", label: "Food, housing, or transportation", color: "mint", summary: "A basic need is making school attendance impossible.", opening: "I’m sleeping on somebody’s couch and missing class because I don’t have a ride. I can’t keep pretending everything is normal.", scenes: [{ title: "Stabilize the next 24 hours", message: "I don’t want everybody in my business. I just need somewhere safe tonight.", coach: "Respect privacy while connecting Jordan to urgent, practical support.", choices: [
    { text: "You control who knows. Let’s focus on tonight first—would you like me to sit with you while we call 211 or your campus basic-needs office?", feedback: "Strong. You protect dignity, prioritize the immediate need, and offer company without forcing disclosure.", strong: true },
    { text: "You can stay with me as long as you need.", feedback: "A short offer may be generous, but do not promise housing beyond your capacity. Pair personal help with stable resources.", strong: false },
    { text: "You should have told someone earlier.", feedback: "This adds blame when Jordan needs safety. Focus on what can happen next.", strong: false },
  ]}], template: "Thank you for trusting me. You do not have to explain everything or tell everybody. Let’s focus on the most urgent need first. Would you like me to stay with you while we call 211 or contact the campus basic-needs, housing, or student-affairs office? We can take the rest one step at a time.", resources: [
    { label: "Call 211", detail: "Find local food, housing, utilities, and transportation support.", href: "https://www.211.org/" }, { label: "FindHelp", detail: "Search nearby free and reduced-cost programs.", href: "https://www.findhelp.org/" }, { label: "EFF Student Resources", detail: "Open EFF’s organized support directory.", href: "https://portal.estherfundsfoundation.org/resources" },
  ]},
  { id: "burnout", icon: "♡", label: "Burnout, isolation, or belonging", color: "lilac", summary: "They feel exhausted, alone, or as if college was not made for them.", opening: "Everybody else looks like they belong here. I’m exhausted from acting like I’m okay. Maybe college just isn’t for people like me.", scenes: [{ title: "Make room for the real feeling", message: "I don’t need a motivational speech. I’m just tired.", coach: "Presence can be more helpful than positivity. Let Jordan decide what support sounds like.", choices: [
    { text: "No speech. I can just sit with you. What has been draining you the most—and what would make this week feel even 5% lighter?", feedback: "Strong. You honor the boundary, invite specifics, and make the next step feel manageable.", strong: true },
    { text: "Think positive. You earned your place here.", feedback: "The encouragement is kind, but it skips over the exhaustion Jordan asked you to acknowledge.", strong: false },
    { text: "You need counseling.", feedback: "Counseling can help, but leading with a directive may feel dismissive. Listen first, then ask permission to explore support.", strong: false },
  ]}], template: "I hear you. I’m not going to give you a motivational speech or make you prove how hard this is. I can sit with you and listen. What has been draining you the most, and what would make this week feel even a little lighter? If you want, we can look at counseling, mentoring, accommodations, or one trusted campus person together.", resources: [
    { label: "Reach for Yourself", detail: "Find wellness, belonging, and student-support options.", href: "/reach-yourself" }, { label: "Find a Health Center", detail: "Locate community health services.", href: "https://findahealthcenter.hrsa.gov/" }, { label: "988 Lifeline", detail: "Call or text 988 if distress becomes a crisis.", href: "https://988lifeline.org/" },
  ]},
  { id: "family", icon: "↔", label: "Family, work, or caregiving pressure", color: "sun", summary: "Responsibilities outside school are crowding out their education.", opening: "My family needs my paycheck and my little brother needs me. I’m working nights and sleeping through class. Something has to go.", scenes: [{ title: "Respect the responsibility", message: "School people don’t understand. I can’t just stop helping my family.", coach: "Do not frame family responsibilities as a bad choice. Look for flexibility and support.", choices: [
    { text: "Your family matters, and so does the future you’re building. Can we explore options that respect both—like a course adjustment, emergency support, childcare, or a work-study conversation?", feedback: "Strong. You respect Jordan’s values and invite solutions without demanding that they abandon family responsibilities.", strong: true },
    { text: "Your education has to come first, no matter what.", feedback: "This dismisses real obligations. Support Jordan in finding a sustainable balance rather than ranking what they love.", strong: false },
    { text: "Quit your job and apply for more loans.", feedback: "This creates financial risk and may be impossible. Explore grants, benefits, scheduling, and campus support before debt.", strong: false },
  ]}], template: "I respect how much you are carrying for your family. You should not have to choose without knowing every option. Can we explore one change that protects both your responsibilities and your education—such as a course adjustment, emergency aid, childcare, benefits, work-study, or a conversation with the dean of students? I can go with you.", resources: [
    { label: "Family Funding Check", detail: "Pressure-test the college gap and borrowing choices.", href: "/tools/family" }, { label: "Childcare Assistance", detail: "Find state and local childcare support.", href: "https://www.childcare.gov/consumer-education/get-help-paying-for-child-care/child-care-financial-assistance-options" }, { label: "CareerOneStop", detail: "Explore work, training, and local employment resources.", href: "https://www.careeronestop.org/" },
  ]},
  { id: "safety", icon: "!", label: "Urgent safety or mental-health concern", color: "coral", summary: "Their words or behavior suggest they may not be safe.", opening: "I don’t care what happens anymore. Everybody would be better off if I just disappeared.", scenes: [{ title: "Ask directly and stay present", message: "Please don’t make this a big deal. Promise you won’t tell anyone.", coach: "Safety comes before secrecy. Asking about suicide does not plant the idea.", choices: [
    { text: "I care about you too much to promise secrecy. Are you thinking about suicide or hurting yourself right now? I’m staying with you while we call or text 988.", feedback: "Strong. You ask directly, do not leave Jordan alone, and connect to immediate professional support.", strong: true },
    { text: "Promise me you won’t do anything, okay?", feedback: "A promise is not a safety plan. Ask directly, stay present, and involve trained support immediately.", strong: false },
    { text: "You’re scaring me. Don’t say things like that.", feedback: "This may shut down disclosure. Stay calm, acknowledge what you heard, and get immediate help.", strong: false },
  ]}], template: "I’m really glad you told me. I care about you too much to keep this secret. Are you thinking about suicide or hurting yourself right now? I am staying with you while we call or text 988. If you are in immediate danger, have a plan, or cannot stay safe, I’m calling 911 or campus emergency services now.", resources: [
    { label: "Call or text 988", detail: "24/7 Suicide & Crisis Lifeline support.", href: "https://988lifeline.org/" }, { label: "Call 911", detail: "Use for immediate danger or a life-threatening emergency.", href: "tel:911" }, { label: "Crisis Text Line", detail: "Text HOME to 741741.", href: "https://www.crisistextline.org/" },
  ]},
];

const advancedScenes: Record<PathId, Scene[]> = {
  money: [
    { phase: "VERIFY", title: "Read the notice, not the panic", message: "It only says “financial hold.” I stopped reading after I saw the amount.", context: "The amount is real, but the cause and remedy are still unknown. A missing form, aid error, SAP issue, or billing charge can require very different action.", coach: "Ask permission to review private information. Find the cause, deadline, office with authority, and exactly what the hold blocks.", choices: [
      { text: "Would you be comfortable opening it with me? Let’s find the reason, deadline, contact person, and what the hold actually blocks.", feedback: "This turns a vague crisis into answerable questions while keeping Jordan in control.", strong: true, reply: "It says my grant was removed because they need a verification form." },
      { text: "Forward me the whole email and I’ll handle it.", feedback: "Taking possession of the problem can weaken Jordan’s agency and expose private information unnecessarily.", strong: false, reply: "I don’t want to forward all my financial-aid information." },
      { text: "Call billing and demand a payment plan.", feedback: "Billing may not be able to restore aid. First determine why the balance exists.", strong: false, reply: "Billing already told me what I owe. They didn’t explain why." },
    ]},
    { phase: "ESCALATE", title: "Find the person who can protect the deadline", message: "Financial aid says verification takes two weeks, but registration closes Friday.", context: "The standard processing time conflicts with Jordan’s deadline. Simply waiting could produce preventable harm.", coach: "Combine compliance with escalation: submit the requirement, save proof, and request temporary protection in writing.", choices: [
      { text: "Let’s submit the form today, save the confirmation, and ask financial aid plus the dean of students for an expedited review or temporary registration protection.", feedback: "This creates a paper trail, meets the requirement, and asks the right offices for interim relief.", strong: true, reply: "Could you sit with me while I write it? I freeze when I email offices." },
      { text: "Email the university president first.", feedback: "Jumping to the top can slow the response and bypass people who can act quickly.", strong: false, reply: "That feels huge. I don’t even know what to say." },
      { text: "Two weeks is not that long. Wait and see.", feedback: "Waiting without written protection could let the registration deadline pass.", strong: false, reply: "Friday is in three days. I can’t risk that." },
    ]},
    { phase: "FOLLOW THROUGH", title: "Build a 48-hour protection plan", message: "I submitted the form. What if nobody answers before Friday?", context: "A resource list is not yet a plan. Jordan needs an owner, timing, backup route, and documentation.", coach: "Sequence the next moves and set a decision point before any irreversible withdrawal.", choices: [
      { text: "Today we save proof and email both offices. Tomorrow morning we call or visit. If there’s no answer by Thursday, we request written guidance before changing enrollment.", feedback: "The plan is time-bound, documented, and has an escalation point.", strong: true, reply: "That feels doable. I can ask my professor if I can step out to call." },
      { text: "Apply for every scholarship you can find tonight.", feedback: "Scholarships rarely resolve an immediate institutional deadline and can overwhelm Jordan.", strong: false, reply: "I don’t have energy for twenty applications tonight." },
      { text: "Put it on a credit card so the hold disappears.", feedback: "High-cost debt is not a safe first response, and payment may complicate an aid correction.", strong: false, reply: "I don’t even have that kind of credit limit." },
    ]},
  ],
  academic: [
    { phase: "VERIFY", title: "Find the academic decision points", message: "I stopped going to one class three weeks ago. I don’t even know if I can still pass.", context: "Jordan may still have options, but attendance rules, deadlines, incomplete eligibility, aid consequences, and remaining work must be verified.", coach: "Separate what Jordan knows from what shame is predicting.", choices: [
      { text: "Let’s check the syllabus and academic calendar, then ask your professor what outcomes are still possible instead of guessing.", feedback: "This replaces catastrophic assumptions with accurate information.", strong: true, reply: "The withdrawal date is next week. I didn’t realize I still had time." },
      { text: "You probably already failed after missing three weeks.", feedback: "This high-consequence assumption may stop Jordan from seeking help.", strong: false, reply: "Then there’s no point emailing anyone." },
      { text: "Drop the course before it hurts your GPA more.", feedback: "Withdrawal can affect aid, housing, athletics, visas, and progress. Check the full impact first.", strong: false, reply: "I didn’t know it could change my financial aid." },
    ]},
    { phase: "DECIDE", title: "Compare options instead of choosing from shame", message: "My professor said I can finish, withdraw, or request an incomplete. I’m overwhelmed.", context: "Every option has different workload, deadline, GPA, aid, and future-semester consequences.", coach: "Use a decision grid and let Jordan choose the sustainable option.", choices: [
      { text: "Let’s compare each option by workload, deadline, GPA impact, aid impact, and the support you’d need. Then you can choose with full information.", feedback: "This restores agency and makes hidden tradeoffs visible.", strong: true, reply: "Seeing it side by side makes the incomplete look more realistic." },
      { text: "Take the incomplete. It sounds easiest.", feedback: "An incomplete creates future work and its own deadline; it is not automatically easiest.", strong: false, reply: "What if next semester is just as busy?" },
      { text: "Finish everything. You can sleep after finals.", feedback: "Encouraging harmful overwork ignores the capacity problem that created the crisis.", strong: false, reply: "That’s how I got here." },
    ]},
    { phase: "RECOVER", title: "Plan for the next setback", message: "If I miss one more assignment, I’m giving up.", context: "All-or-nothing thinking can turn a normal setback into total disengagement.", coach: "Create a recovery rule before the next hard day arrives.", choices: [
      { text: "One missed assignment is a signal to contact your support team—not proof the plan failed. Who should be your first call if you start avoiding again?", feedback: "This converts setbacks into triggers for support.", strong: true, reply: "My advisor. She already said I can email her directly." },
      { text: "Then don’t miss another assignment.", feedback: "This adds pressure without creating support.", strong: false, reply: "That’s what I’m afraid I can’t promise." },
      { text: "Maybe college really isn’t for you right now.", feedback: "That conclusion is premature and reinforces Jordan’s fear.", strong: false, reply: "That’s what I keep thinking." },
    ]},
  ],
  basic: [
    { phase: "TRIAGE", title: "Choose the first need", message: "I haven’t eaten since yesterday, my phone is dying, and I have to leave this couch by eight.", context: "Several urgent needs compete for attention. Jordan may not have capacity for a complicated plan.", coach: "Triage in order: immediate danger, shelter, food, communication, transportation, then school coordination.", choices: [
      { text: "Let’s charge your phone and get food now, then call about safe housing for tonight. We can handle class after you’re stable.", feedback: "The plan matches Jordan’s immediate physical needs.", strong: true, reply: "The student center has outlets and a pantry." },
      { text: "First, email all your professors.", feedback: "Academic communication matters, but basic safety and food come first.", strong: false, reply: "I can’t think about emails right now." },
      { text: "Here are twelve shelters I found online.", feedback: "A long list transfers navigation work to someone who is already overwhelmed.", strong: false, reply: "I don’t even know which one is open." },
    ]},
    { phase: "CONNECT", title: "Make a warm handoff", message: "211 gave me two numbers, but I hate calling strangers and explaining everything again.", context: "The barrier is no longer information; it is fear, fatigue, and repeated disclosure.", coach: "Prepare the first sentence, call together, and confirm the resource can actually help.", choices: [
      { text: "Let’s choose one, write your first two sentences, and call together on speaker. You can lead, and I’ll stay beside you.", feedback: "This lowers the activation barrier without taking over.", strong: true, reply: "Can I just say I’m a student and need emergency housing tonight?" },
      { text: "I’ll call and tell them your whole situation.", feedback: "Do not share personal circumstances without consent.", strong: false, reply: "Please don’t tell strangers everything about me." },
      { text: "You have the numbers. Call when you’re ready.", feedback: "Information alone is not a warm connection when fear is the barrier.", strong: false, reply: "I’ll probably keep putting it off." },
    ]},
    { phase: "STABILIZE", title: "Bridge tonight to next week", message: "I found a place for two nights. After that, I still don’t know.", context: "Short-term shelter creates breathing room, not resolution.", coach: "Use the two days to build coordinated campus support and a durable plan.", choices: [
      { text: "Tomorrow, let’s ask the dean or basic-needs office for a case manager and check housing, food, transit, and emergency aid in one plan.", feedback: "This connects crisis relief to coordinated follow-through.", strong: true, reply: "A case manager sounds better than calling a different office every day." },
      { text: "At least you have two nights. Try not to worry.", feedback: "This minimizes a predictable deadline.", strong: false, reply: "I can’t stop worrying when I don’t know where I’ll go." },
      { text: "Post publicly and ask if someone has a room.", feedback: "Public disclosure and unvetted housing offers create privacy and safety risks.", strong: false, reply: "I don’t want strangers knowing where I am." },
    ]},
  ],
  burnout: [
    { phase: "ASSESS", title: "Listen for what burnout is covering", message: "I sleep all weekend and still wake up tired. Even answering texts feels hard.", context: "Persistent exhaustion and withdrawal can signal depression, illness, overload, discrimination, or another condition.", coach: "Ask about duration, daily functioning, and safety without diagnosing.", choices: [
      { text: "How long has this been happening? Are you eating, getting to class, and feeling safe with yourself?", feedback: "These questions assess severity and safety without assigning a diagnosis.", strong: true, reply: "About a month. I’m missing class, but I’m not thinking about hurting myself." },
      { text: "That sounds like depression.", feedback: "A friend should not diagnose. Focus on what is happening and connect Jordan to assessment.", strong: false, reply: "Maybe, but I don’t know." },
      { text: "Try sleeping earlier and deleting social media.", feedback: "These tips are too narrow for the level of impairment described.", strong: false, reply: "I’m already sleeping twelve hours." },
    ]},
    { phase: "CONNECT", title: "Offer a menu, not an assignment", message: "Counseling has a waitlist, and I don’t want another thing on my calendar.", context: "One blocked resource should not end the support plan.", coach: "Offer two or three realistic entry points and let Jordan choose the least burdensome.", choices: [
      { text: "Would a same-day health visit, a support group, or telling one trusted advisor feel easiest? We can choose just one.", feedback: "This keeps the choice small and preserves agency.", strong: true, reply: "A same-day health visit feels concrete." },
      { text: "You have to make time for counseling if you want help.", feedback: "This makes support conditional and can increase shame.", strong: false, reply: "I knew this would turn into homework." },
      { text: "Forget campus counseling. It never works.", feedback: "A waitlist is frustrating, but dismissing the service removes one possible support.", strong: false, reply: "Then what am I supposed to do?" },
    ]},
    { phase: "BOUNDARIES", title: "Respond to ‘I don’t want to be a burden’", message: "You have your own life. I don’t want you checking on me all the time.", context: "Jordan may want connection and boundaries at the same time.", coach: "Negotiate predictable support rather than disappearing or becoming overinvolved.", choices: [
      { text: "You’re not a burden, and we can choose a rhythm that respects both of us. Would a Wednesday text and Sunday coffee feel supportive?", feedback: "Care becomes predictable, consensual, and sustainable.", strong: true, reply: "Yes. Knowing when you’ll check in would help." },
      { text: "I’ll check on you whenever I want.", feedback: "This ignores Jordan’s boundary.", strong: false, reply: "That makes me want to avoid my phone more." },
      { text: "Okay, I’ll leave you alone.", feedback: "Total withdrawal can confirm Jordan’s fear of being too much.", strong: false, reply: "I didn’t mean never talk to me." },
    ]},
  ],
  family: [
    { phase: "MAP", title: "Map the real schedule", message: "I work 10 p.m. to 6 a.m., take my brother to school, then have class at nine.", context: "The current schedule makes sleep and attendance structurally impossible.", coach: "Map work, travel, caregiving, sleep, and fixed class requirements before suggesting changes.", choices: [
      { text: "Can we put the whole week on one page so we can see which conflict is doing the most damage?", feedback: "This makes the capacity problem visible without judging Jordan.", strong: true, reply: "Tuesday and Thursday mornings are the impossible part." },
      { text: "You need better time management.", feedback: "No planning technique can create sleep inside an impossible schedule.", strong: false, reply: "There literally aren’t enough hours." },
      { text: "Drop the morning classes now.", feedback: "Schedule changes can affect aid and progress. Verify options first.", strong: false, reply: "I need those courses for my major." },
    ]},
    { phase: "NEGOTIATE", title: "Ask for flexibility with specifics", message: "I don’t know what to ask my advisor. I can’t change everything.", context: "A specific request is easier to act on than a general statement of overwhelm.", coach: "Name the exact conflicts and ask about bounded alternatives.", choices: [
      { text: "Ask about another section, hybrid attendance, a reduced load, or temporary flexibility—and confirm aid impact before changing credits.", feedback: "This creates realistic options while protecting enrollment consequences.", strong: true, reply: "There’s an afternoon section. I didn’t know I could ask to switch late." },
      { text: "Say it’s an emergency so they have to change everything.", feedback: "Do not exaggerate or guarantee what the institution must do.", strong: false, reply: "It’s ongoing, not one emergency." },
      { text: "Take the semester off and return when life settles down.", feedback: "Life may not simply settle, and stopping out can create re-entry barriers.", strong: false, reply: "I’m afraid I won’t come back." },
    ]},
    { phase: "BOUNDARIES", title: "Handle guilt after setting a limit", message: "My mom sounded disappointed when I said I can’t cover Friday too.", context: "A sustainable adjustment can still create real guilt and family tension.", coach: "Support the boundary without attacking Jordan’s family.", choices: [
      { text: "Her disappointment can hurt and your limit can still be necessary. What boundary can you communicate clearly and keep?", feedback: "This validates the relationship while strengthening sustainability.", strong: true, reply: "I can cover Saturdays, but Friday has to stay for class." },
      { text: "Your mom will get over it.", feedback: "This dismisses an important relationship.", strong: false, reply: "You don’t know my mom." },
      { text: "See? Your family doesn’t support you.", feedback: "This polarizes the situation and may make Jordan defend family instead of plan.", strong: false, reply: "That’s not fair. She’s under pressure too." },
    ]},
  ],
  safety: [
    { phase: "ASK DIRECTLY", title: "Clarify what ‘disappear’ means", message: "Sometimes I think people would be relieved if I wasn’t here.", context: "Statements about disappearing, being a burden, or others being better off are suicide warning signs.", coach: "Ask directly. Asking about suicide does not plant the idea.", choices: [
      { text: "When you say ‘wasn’t here,’ are you thinking about suicide or killing yourself?", feedback: "A clear question opens the door to an honest safety assessment.", strong: true, reply: "Yes. I’ve been thinking about it a lot this week." },
      { text: "You don’t really mean that, do you?", feedback: "This pressures Jordan to reassure you and can shut down disclosure.", strong: false, reply: "Never mind. Forget I said anything." },
      { text: "Think about how devastated everyone would be.", feedback: "Guilt can intensify the feeling of being a burden.", strong: false, reply: "That’s why I shouldn’t have said anything." },
    ]},
    { phase: "ASSESS NOW", title: "Ask about plan, access, and timeframe", message: "I thought about taking all the pills in my room tonight. I haven’t done anything.", context: "Jordan has disclosed suicidal thoughts, a possible method, access, and a near-term timeframe.", coach: "This is imminent risk. Do not rely on secrecy or a promise.", choices: [
      { text: "Thank you for telling me. I’m staying with you, and we’re calling 911 or campus emergency services now. We can contact 988 together too.", feedback: "This matches the disclosed risk and maintains connection.", strong: true, reply: "I’m scared, but please stay while we call." },
      { text: "Promise me you won’t take them.", feedback: "A promise does not reduce access or bring trained help.", strong: false, reply: "I can promise, but I don’t know how I’ll feel later." },
      { text: "Sleep first and text me in the morning.", feedback: "Jordan should not be left alone with accessible means and a near-term plan.", strong: false, reply: "I don’t know if I can make it to morning." },
    ]},
    { phase: "HANDOFF", title: "Make an accurate live handoff", message: "The dispatcher wants to know what happened. I can’t say it again.", context: "Responders need the exact statements, method, access, timeframe, and actions already taken.", coach: "With Jordan’s knowledge, speak first without minimizing or dramatizing.", choices: [
      { text: "I can speak first while you stay beside me. I’ll say exactly what you told me: suicidal thoughts, pills in your room, and that you were thinking about tonight.", feedback: "This reduces repetition while giving responders essential facts.", strong: true, reply: "Okay. Don’t leave anything out." },
      { text: "I’ll say you’re just stressed so they don’t overreact.", feedback: "Minimizing can block the appropriate level of care.", strong: false, reply: "Then they won’t understand why we called." },
      { text: "You have to explain it yourself.", feedback: "Requiring Jordan to lead may become a barrier in a crisis.", strong: false, reply: "I can’t get the words out." },
    ]},
  ],
};

const stages = ["Notice", "Listen", "Ask", "Connect", "Plan", "Follow up"];

export default function FriendWalkthrough() {
  const [selected, setSelected] = useState<Pathway | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [speechReady, setSpeechReady] = useState(false);
  const scenes = useMemo(() => selected ? [sharedScenes[0], { ...sharedScenes[1], message: selected.opening }, ...selected.scenes, ...advancedScenes[selected.id]] : [], [selected]);
  const finished = Boolean(selected && step >= scenes.length);
  const score = answers.reduce((total, answer, index) => total + (scenes[index]?.choices[answer]?.strong ? 1 : 0), 0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => setSpeechReady(window.speechSynthesis.getVoices().length > 0);
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(null);
  }, [step, selected]);

  function preferredVoice(tone: "jordan" | "nia" | "coach") {
    const voices = window.speechSynthesis.getVoices();
    const namePreference = tone === "nia"
      ? ["jenny", "aria", "emma", "michelle", "susan", "libby", "samantha", "ava", "sonia", "zira"]
      : tone === "jordan"
        ? ["ava", "sonia", "samantha", "jenny", "aria", "emma", "michelle", "libby", "zira", "susan"]
        : ["aria", "samantha", "ava", "jenny", "sonia", "emma", "michelle", "libby", "zira", "susan"];
    const masculineNames = ["david", "mark", "george", "guy", "james", "richard", "daniel", "ryan", "christopher"];
    return [...voices]
      .filter(voice => voice.lang.toLowerCase().startsWith("en"))
      .sort((a, b) => {
        const score = (voice: SpeechSynthesisVoice) => {
          const name = voice.name.toLowerCase();
          const preferredIndex = namePreference.findIndex(candidate => name.includes(candidate));
          let value = preferredIndex >= 0 ? 150 - preferredIndex * 8 : 0;
          if (name.includes("natural") || name.includes("neural") || name.includes("online")) value += 90;
          if (voice.lang.toLowerCase() === "en-us") value += 20;
          if (masculineNames.some(candidate => name.includes(candidate))) value -= 200;
          return value;
        };
        return score(b) - score(a);
      })[0] || voices[0];
  }

  function speak(label: string, text: string, tone: "jordan" | "nia" | "coach" = "jordan") {
    if (!("speechSynthesis" in window)) return;
    if (speaking === label) {
      window.speechSynthesis.cancel();
      setSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = preferredVoice(tone);
    utterance.rate = tone === "coach" ? 0.98 : tone === "nia" ? 1.06 : 0.96;
    utterance.pitch = tone === "coach" ? 1.22 : tone === "nia" ? 1.42 : 1.3;
    utterance.volume = 1;
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => setSpeaking(null);
    setSpeaking(label);
    window.speechSynthesis.speak(utterance);
  }

  function choosePath(path: Pathway) { setSelected(path); setStep(0); setAnswers([]); setPicked(null); setCopied(false); }
  function next() { if (picked === null) return; window.speechSynthesis?.cancel(); setSpeaking(null); setAnswers([...answers, picked]); setStep(step + 1); setPicked(null); }
  async function copyTemplate() { if (!selected) return; await navigator.clipboard.writeText(selected.template); setCopied(true); }

  return <main className="friend-sim">
    <header className="friend-sim-nav"><Link href="/">← REACH Action Hub</Link><Link href="/reach-a-friend">Friend support guide</Link></header>
    {!selected && <><section className="friend-sim-hero"><div className="friend-sim-hero-copy"><p className="kicker">REACH PEER-SUPPORT TRAINING</p><h1>Help them stay.</h1><p>Practice a complete conversation—not just one good line. Your choices shape how Jordan responds as you move from the first warning sign to a real support plan.</p><div className="training-meta"><span><b>6</b> real-life pathways</span><span><b>6</b> decisions each</span><span><b>20–30</b> minutes</span></div><a href="#choose-a-path" className="button primary">Choose a training pathway ↓</a></div><div className="friend-cast" aria-label="Nia and Jordan, the student characters in this experience"><div className="cast-card nia"><img src="/reach-nia.png" alt="Nia, a supportive college friend"/><span><b>Nia</b>You guide her response.</span></div><div className="cast-card jordan"><img src="/reach-jordan.png" alt="Jordan, a college student facing a difficult semester"/><span><b>Jordan</b>Their trust changes with your choices.</span></div></div></section>
    <section className="path-selector" id="choose-a-path"><div className="path-selector-head"><p className="kicker">CHOOSE THE PRESSURE POINT</p><h2>What is pushing Jordan out?</h2><p>Every pathway now includes a different fact-finding process, decision point, resistance moment, action plan, and follow-up.</p></div><div className="path-cards">{pathways.map(path => <button key={path.id} className={`path-card ${path.color}`} onClick={() => choosePath(path)}><span>{path.icon}</span><div><h3>{path.label}</h3><p>{path.summary}</p><b>Start this training →</b></div></button>)}</div></section>
    <section className="reach-method"><p className="kicker">THE REACH METHOD</p><h2>You do not have to fix everything.</h2><div>{stages.map((stage, index) => <article key={stage}><span>{index + 1}</span><h3>{stage}</h3><p>{["Notice changes and warning signs.","Make room for truth without judgment.","Clarify facts, urgency, and what support they want.","Make a warm connection—do not just hand over a list.","Build an owned, timed plan with a backup.","Check the outcome and the person again."][index]}</p></article>)}</div></section></>}
    {selected && !finished && <section className="simulator-shell"><div className="sim-progress"><button onClick={() => setSelected(null)}>← Change pathway</button><div><span style={{width:`${((step + 1) / scenes.length) * 100}%`}} /></div><p>Decision {step + 1} of {scenes.length}</p></div><div className="stage-track">{scenes.map((scene, index) => <span key={index} className={index < step ? "complete" : index === step ? "current" : ""}>{index + 1}<b>{scene.phase || stages[Math.min(index, stages.length - 1)]}</b></span>)}</div><div className="simulator-grid"><aside className="sim-character"><div className="sim-character-frame"><img src="/reach-jordan.png" alt="Jordan" /></div><span>{selected.label}</span><h2>Jordan</h2><button className="voice-button light" onClick={() => speak("jordan-scene", scenes[step].message, "jordan")} disabled={!speechReady} aria-label={speaking === "jordan-scene" ? "Stop Jordan's voice" : "Hear Jordan speak"}>{speaking === "jordan-scene" ? "■ Stop audio" : "▶ Hear Jordan"}</button><blockquote>“{scenes[step].message}”</blockquote>{scenes[step].context && <div className="context-card"><b>What is happening here</b><p>{scenes[step].context}</p></div>}</aside><section className="sim-conversation" aria-live="polite"><p className="kicker">{scenes[step].phase || stages[Math.min(step, stages.length - 1)]}</p><h1>{scenes[step].title}</h1><div className="coach-note"><div className="coach-note-head"><b>REACH coach</b><button className="voice-button" onClick={() => speak("coach", scenes[step].coach, "coach")} disabled={!speechReady}>{speaking === "coach" ? "■ Stop" : "▶ Listen"}</button></div><p>{scenes[step].coach}</p></div><h2>What should Nia say?</h2><div className="choice-list">{scenes[step].choices.map((choice, index) => <div className="choice-row" key={choice.text}><button onClick={() => picked === null && setPicked(index)} disabled={picked !== null} className={picked === index ? (choice.strong ? "chosen strong" : "chosen rethink") : picked !== null && choice.strong ? "best" : ""}><span>{String.fromCharCode(65 + index)}</span><p>{choice.text}</p></button><button className="choice-audio" onClick={() => speak("choice-" + index, choice.text, "nia")} aria-label={"Hear choice " + String.fromCharCode(65 + index)} disabled={!speechReady}>{speaking === "choice-" + index ? "■" : "▶"}</button></div>)}</div>{picked !== null && <div className={`choice-feedback ${scenes[step].choices[picked].strong ? "strong" : "rethink"}`}><b>{scenes[step].choices[picked].strong ? "That keeps the door open." : "Notice what this response could change."}</b><p>{scenes[step].choices[picked].feedback}</p>{scenes[step].choices[picked].reply && <blockquote className="jordan-reply"><span>JORDAN’S RESPONSE</span>“{scenes[step].choices[picked].reply}”<button className="voice-button" onClick={() => speak("jordan-reply", scenes[step].choices[picked].reply || "", "jordan")} disabled={!speechReady}>{speaking === "jordan-reply" ? "■ Stop" : "▶ Hear Jordan reply"}</button></blockquote>}<button onClick={next}>{step === scenes.length - 1 ? "View my training debrief →" : "Continue to the next decision →"}</button></div>}</section></div></section>}
    {selected && finished && <section className="support-kit"><div className="support-kit-head"><p className="kicker">TRAINING DEBRIEF</p><h1>You completed the {selected.label.toLowerCase()} pathway.</h1><p>You chose {score} strong response{score === 1 ? "" : "s"} across {scenes.length} decisions. This is practice, not a grade. Review what built trust, what created risk, and how to carry the plan forward.</p><div><button onClick={() => choosePath(selected)}>Replay this pathway</button><button onClick={() => setSelected(null)}>Train another pathway</button></div></div><div className="debrief-lessons"><article><span>1</span><div><b>Listen for the problem beneath the first sentence.</b><p>Jordan’s words may contain shame, fear, urgency, and a practical barrier at the same time.</p></div></article><article><span>2</span><div><b>Do the next step with them—not for them.</b><p>Support should increase agency, clarity, and connection instead of creating dependence.</p></div></article><article><span>3</span><div><b>Never let a resource list become the handoff.</b><p>Prepare the message, make the call together, confirm the result, and set the next check-in.</p></div></article></div><div className="support-kit-grid"><article className="copy-template"><span>READY-TO-SEND TEMPLATE</span><h2>Words you can use</h2><blockquote>“{selected.template}”</blockquote><button onClick={copyTemplate}>{copied ? "Copied ✓" : "Copy this message"}</button></article><article className="resource-stack"><span>THE NEXT RIGHT CONNECTION</span><h2>Resources for this situation</h2>{selected.resources.map(resource => <a href={resource.href} key={resource.label} target={resource.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><b>{resource.label}</b><p>{resource.detail}</p><span>↗</span></a>)}</article></div><div className="followup-card"><div><span>SAME DAY</span><h3>Confirm the first action, who owns it, and when it will happen.</h3></div><div><span>24–48 HOURS</span><h3>“I remembered what you told me. What changed, and what still feels stuck?”</h3></div><div><span>ONE WEEK</span><h3>Check whether the plan is sustainable—not merely completed once.</h3></div><p><b>Remember:</b> You can care deeply without becoming the only support person. If safety is at risk, involve trained help immediately.</p></div></section>}
  </main>;
}
