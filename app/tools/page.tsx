"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const tools = [
  { id: "essay", tag: "WRITE", title: "Essay Story Builder", desc: "Turn one real moment into a scholarship-ready outline.", color: "yellow" },
  { id: "scholarship", tag: "APPLY", title: "Scholarship Action Center", desc: "Turn a deadline into a clear application plan.", color: "pink" },
  { id: "fafsa", tag: "DECODE", title: "FAFSA Decoder", desc: "Understand your status, SAI, verification, and next move.", color: "blue" },
  { id: "aid", tag: "CALCULATE", title: "Aid Offer Decoder", desc: "See the real college gap without financial-aid jargon.", color: "blue" },
  { id: "balance", tag: "ACT FAST", title: "Tuition Rescue Plan", desc: "Get a personalized 48-hour plan for a balance or hold.", color: "pink" },
  { id: "reminders", tag: "REMIND ME", title: "Deadline Reminder Builder", desc: "Add three private reminders to your calendar.", color: "lavender" },
  { id: "friend", tag: "SHOW UP", title: "Help-a-Friend Script", desc: "Know what to say and where to connect them.", color: "lavender" },
  { id: "family", tag: "DECIDE", title: "Family Funding Check", desc: "Pressure-test a college or loan decision together.", color: "yellow" },
  { id: "campus", tag: "CREATE", title: "Campus Event Builder", desc: "Build a useful REACH event in under three minutes.", color: "blue" },
  { id: "persist", tag: "KEEP GOING", title: "Stay-Enrolled Planner", desc: "Build a support plan before changing enrollment.", color: "yellow" },
];

const money = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
const fmt = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function InteractiveTools() {
  const [active, setActive] = useState("essay");
  const [essay, setEssay] = useState({ moment: "", challenge: "", action: "", lesson: "", goal: "" });
  const [scholarship, setScholarship] = useState({ name: "", deadline: "", essay: "yes", recommendation: "no", transcript: "no" });
  const [fafsa, setFafsa] = useState({ status: "started", sai: "", note: "" });
  const [aid, setAid] = useState({ tuition: "", housing: "", fees: "", books: "", transport: "", grants: "", scholarships: "", loans: "", workStudy: "", other: "" });
  const [balance, setBalance] = useState({ amount: "", deadline: "", school: "", tried: "" });
  const [reminder, setReminder] = useState({ name: "", deadline: "" });
  const [friend, setFriend] = useState({ name: "", need: "money", tone: "gentle" });
  const [family, setFamily] = useState({ cost: "", freeAid: "", studentLoans: "", parentLoan: "", monthly: "" });
  const [campus, setCampus] = useState({ topic: "scholarships", audience: "", date: "", partner: "" });
  const [persist, setPersist] = useState({ barrier: "money", deadline: "", contact: "" });

  const directCost = useMemo(() => money(aid.tuition) + money(aid.housing) + money(aid.fees), [aid]);
  const fullCost = useMemo(() => directCost + money(aid.books) + money(aid.transport), [aid, directCost]);
  const giftAid = useMemo(() => money(aid.grants) + money(aid.scholarships), [aid]);
  const billGap = useMemo(() => directCost - giftAid - money(aid.loans) - money(aid.other), [aid, directCost, giftAid]);
  const fullGap = useMemo(() => fullCost - giftAid - money(aid.loans) - money(aid.other), [aid, fullCost, giftAid]);
  const familyGap = useMemo(() => money(family.cost) - money(family.freeAid) - money(family.studentLoans) - money(family.parentLoan), [family]);
  const print = () => window.print();

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tool");
    if (requested && tools.some(tool => tool.id === requested)) setActive(requested);
  }, []);

  const chooseTool = (id: string) => {
    setActive(id);
    window.history.replaceState({}, "", `/tools?tool=${id}`);
  };

  const downloadReminder = () => {
    if (!reminder.name || !reminder.deadline) return;
    const date = reminder.deadline.replaceAll("-", "");
    const escape = (value: string) => value.replace(/[\\,;]/g, match => `\\${match}`).replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Esther Funds Foundation//REACH//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", `UID:${Date.now()}@reach.estherfundsfoundation.org`, `DTSTART;VALUE=DATE:${date}`, `DTEND;VALUE=DATE:${date}`,
      `SUMMARY:${escape(reminder.name)} deadline`, "DESCRIPTION:Final deadline. Verify the date and time with the scholarship or school.",
      ...[20160,4320,1440].flatMap(minutes => ["BEGIN:VALARM", `TRIGGER:-PT${minutes}M`, "ACTION:DISPLAY", `DESCRIPTION:${escape(reminder.name)} is coming up`, "END:VALARM"]),
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `${reminder.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "eff-deadline"}.ics`; link.click(); URL.revokeObjectURL(url);
  };

  return <main className="tool-page">
    <header className="tool-header"><Link href="/">← REACH Action Hub</Link><span>EFF INTERACTIVE TOOLKITS</span><a href="https://portal.estherfundsfoundation.org/">Scholarship Portal ↗</a></header>
    <section className="tool-hero"><p className="kicker">NO HOMEWORK. JUST YOUR NEXT MOVE.</p><h1>Tap. Answer.<br/><em>Get a plan.</em></h1><p>Ten quick, private tools built around real student problems. Your answers stay in your browser and are not sent to EFF.</p></section>
    <section className="tool-shell">
      <div className="tool-picker" aria-label="Choose an interactive toolkit">{tools.map(t=><button type="button" key={t.id} className={`${t.color} ${active===t.id?"active":""}`} onClick={()=>chooseTool(t.id)}><small>{t.tag}</small><strong>{t.title}</strong><span>{t.desc}</span></button>)}</div>
      <div className="tool-workspace">
        {active==="essay" && <Tool title="Build your essay backbone" intro="Skip the blank page. Give us five short answers—messy is fine.">
          <Field label="What moment can the reader picture?" value={essay.moment} set={v=>setEssay({...essay,moment:v})} placeholder="Example: I was stocking the food pantry after class..." area/>
          <Field label="What made it difficult or meaningful?" value={essay.challenge} set={v=>setEssay({...essay,challenge:v})} placeholder="The pressure, choice, or problem"/>
          <Field label="What did you actually do?" value={essay.action} set={v=>setEssay({...essay,action:v})} placeholder="Your action—not only what happened to you"/>
          <Field label="What changed in you?" value={essay.lesson} set={v=>setEssay({...essay,lesson:v})} placeholder="A belief, skill, value, or direction"/>
          <Field label="What will education help you do next?" value={essay.goal} set={v=>setEssay({...essay,goal:v})} placeholder="Your specific next goal"/>
          <Result title="Your STORY outline" print={print}>
            <p><b>Scene:</b> {essay.moment||"Start with the moment a reader can see."}</p><p><b>Tension:</b> {essay.challenge||"Name what was at stake."}</p><p><b>Ownership:</b> {essay.action||"Show the choice you made."}</p><p><b>Reflection:</b> {essay.lesson||"Explain how you changed."}</p><p><b>Your next step:</b> {essay.goal||"Connect the scholarship to a real goal."}</p>
            <div className="result-prompt">Opening prompt: “{essay.moment||"In one specific moment..."}” Then show—not tell—why it mattered.</div>
          </Result>
        </Tool>}

        {active==="scholarship" && <Tool title="Turn one scholarship into a plan" intro="Enter the deadline and requirements. This creates a short action list you can reuse.">
          <Field label="Scholarship name" value={scholarship.name} set={v=>setScholarship({...scholarship,name:v})} placeholder="Example: Campus Leadership Scholarship"/>
          <Field label="Deadline" value={scholarship.deadline} set={v=>setScholarship({...scholarship,deadline:v})} placeholder="Month, day, and time zone if listed"/>
          <Choice label="Essay required?" value={scholarship.essay} set={v=>setScholarship({...scholarship,essay:v})} options={[["yes","Yes"],["no","No"],["unsure","Not sure"]]}/>
          <Choice label="Recommendation required?" value={scholarship.recommendation} set={v=>setScholarship({...scholarship,recommendation:v})} options={[["yes","Yes"],["no","No"],["unsure","Not sure"]]}/>
          <Choice label="Transcript required?" value={scholarship.transcript} set={v=>setScholarship({...scholarship,transcript:v})} options={[["yes","Yes"],["no","No"],["unsure","Not sure"]]}/>
          <Result title={`${scholarship.name||"Your scholarship"} action list`} print={print}>
            <p className="result-lead"><b>Deadline:</b> {scholarship.deadline||"Confirm the exact date, time, and time zone before starting."}</p>
            <ol><li>Open the official application and copy every eligibility rule into one checklist.</li><li>{scholarship.essay==="yes"?"Draft the essay early, then revise it for the exact prompt and word limit.":scholarship.essay==="unsure"?"Check whether an essay or short-answer response is required.":"No essay selected—focus on the application fields and required documents."}</li><li>{scholarship.recommendation==="yes"?"Ask your recommender now and send the deadline, prompt, résumé, and submission directions.":scholarship.recommendation==="unsure"?"Confirm whether a recommendation is required and who qualifies to write it.":"No recommendation selected."}</li><li>{scholarship.transcript==="yes"?"Request the correct official or unofficial transcript now.":scholarship.transcript==="unsure"?"Confirm which transcript format is accepted.":"No transcript selected."}</li><li>Submit before the final day, save the confirmation, and check for follow-up requests.</li></ol>
            <div className="resource-actions"><button type="button" onClick={()=>chooseTool("reminders")}>Build deadline reminders →</button><a href="https://portal.estherfundsfoundation.org/">Open the EFF Scholarship Portal ↗</a></div>
          </Result>
        </Tool>}

        {active==="fafsa" && <Tool title="Decode your FAFSA status" intro="Choose what you see. We will explain what it means and what to do next in plain language.">
          <Choice label="Where are you right now?" value={fafsa.status} set={v=>setFafsa({...fafsa,status:v})} options={[["started","Started, not submitted"],["waiting","Submitted, waiting"],["processed","Processed"],["action","Action required"],["verification","Selected for verification"],["nosai","No SAI shown"],["changed","Finances changed"],["offer","Aid offer received"]]}/>
          <Field label="Student Aid Index (SAI), if shown" value={fafsa.sai} set={v=>setFafsa({...fafsa,sai:v})} placeholder="Example: -1500 or 4200"/>
          <Field label="What message or problem do you see? (optional)" value={fafsa.note} set={v=>setFafsa({...fafsa,note:v})} placeholder="Do not enter an SSN, FSA ID, or password" area/>
          <Result title="Your FAFSA next move" print={print}>
            <p className="decoder-note"><b>SAI decoded:</b> {fafsa.sai?`An SAI of ${fafsa.sai} is an eligibility index schools use when building your aid offer. It is not a bill and not the amount your family must pay.`:"If an SAI appears in your FAFSA Submission Summary, it is an eligibility index—not your bill or a promise of aid."}</p>
            <FafsaSteps status={fafsa.status}/>
            {fafsa.note&&<div className="result-prompt"><b>Your note:</b> {fafsa.note}<br/>Use the exact message when contacting Federal Student Aid or your college; never email passwords or a Social Security number.</div>}
            <div className="resource-actions"><a href="https://studentaid.gov/fsa-id/sign-in/landing">Check FAFSA status ↗</a><a href="https://studentaid.gov/articles/fafsa-submission-summary/">Understand the Submission Summary ↗</a><a href="https://studentaid.gov/help-center/contact">Federal Student Aid Help Center ↗</a></div>
          </Result>
        </Tool>}

        {active==="aid" && <Tool title="Decode the real college gap" intro="Use annual numbers from the school's official aid offer.">
          <p className="field-section-title">ANNUAL COSTS</p><div className="field-grid"><Field label="Tuition" value={aid.tuition} set={v=>setAid({...aid,tuition:v})} prefix="$"/><Field label="Housing + meals" value={aid.housing} set={v=>setAid({...aid,housing:v})} prefix="$"/><Field label="Required fees" value={aid.fees} set={v=>setAid({...aid,fees:v})} prefix="$"/><Field label="Books + supplies" value={aid.books} set={v=>setAid({...aid,books:v})} prefix="$"/><Field label="Transportation + personal costs" value={aid.transport} set={v=>setAid({...aid,transport:v})} prefix="$"/></div>
          <p className="field-section-title">ANNUAL AID</p><div className="field-grid"><Field label="Grants" value={aid.grants} set={v=>setAid({...aid,grants:v})} prefix="$"/><Field label="Scholarships" value={aid.scholarships} set={v=>setAid({...aid,scholarships:v})} prefix="$"/><Field label="Accepted student loans" value={aid.loans} set={v=>setAid({...aid,loans:v})} prefix="$"/><Field label="Federal work-study offered" value={aid.workStudy} set={v=>setAid({...aid,workStudy:v})} prefix="$"/><Field label="Other confirmed bill credits" value={aid.other} set={v=>setAid({...aid,other:v})} prefix="$"/></div>
          <Result title="Your college cost snapshot" print={print}>
            <div className="aid-metrics"><div><small>NET PRICE AFTER GIFT AID</small><strong>{fmt(Math.max(fullCost-giftAid,0))}</strong></div><div><small>ESTIMATED BILL GAP</small><strong className={billGap>0?"warn":"good"}>{fmt(Math.max(billGap,0))}</strong></div><div><small>FULL COST GAP</small><strong className={fullGap>0?"warn":"good"}>{fmt(Math.max(fullGap,0))}</strong></div><div><small>ACCEPTED DEBT THIS YEAR</small><strong>{fmt(money(aid.loans))}</strong></div></div>
            <p><b>Important:</b> {fmt(money(aid.workStudy))} in work-study is shown separately because it is usually earned through wages after working; do not treat it like an upfront bill credit.</p>
            <ol><li>Ask for an itemized bill and a list of pending aid.</li><li>Confirm which grants and scholarships renew, their GPA or credit requirements, and how many years they last.</li><li>Ask whether housing, meal plans, health insurance, or fees can be reduced or waived.</li><li>Compare the four-year debt estimate: {fmt(money(aid.loans)*4)} if borrowing stayed the same—not only year one.</li></ol>
            <div className="resource-actions"><a href="https://studentaid.gov/articles/evaluating-financial-aid-offers/">How to evaluate aid offers ↗</a><button type="button" onClick={()=>chooseTool("balance")}>Build a tuition rescue plan →</button></div>
          </Result>
        </Tool>}

        {active==="balance" && <Tool title="Build a 48-hour tuition rescue plan" intro="Tell us the basics. We will organize the calls, emails, and questions.">
          <Field label="Balance" value={balance.amount} set={v=>setBalance({...balance,amount:v})} prefix="$"/><Field label="Deadline" value={balance.deadline} set={v=>setBalance({...balance,deadline:v})} placeholder="Example: August 2"/><Field label="College" value={balance.school} set={v=>setBalance({...balance,school:v})} placeholder="School name"/><Field label="What have you already tried?" value={balance.tried} set={v=>setBalance({...balance,tried:v})} placeholder="Calls, emails, appeals, payment plan..." area/>
          <Result title="Your rescue plan" print={print}><div className="result-tag">{fmt(money(balance.amount))} · {balance.deadline||"DEADLINE NEEDED"}</div><ol><li>Download the itemized bill and list every pending credit.</li><li>Email financial aid, student accounts, and the dean of students together at {balance.school||"your college"}.</li><li>Ask specifically about emergency, completion, retention, or institutional grants and a temporary hold review.</li><li>Reference what you already tried: {balance.tried||"add your attempts so staff do not restart the process"}.</li><li>Before withdrawing, request written consequences for aid, housing, balances, SAP, and re-enrollment.</li></ol><div className="result-prompt">Email opener: “My {fmt(money(balance.amount))} balance may interrupt my enrollment by {balance.deadline||"[deadline]"}. I am requesting a coordinated account review and written next steps.”</div></Result>
        </Tool>}

        {active==="reminders" && <Tool title="Put the deadline where you will see it" intro="Download one calendar event with alerts two weeks, three days, and one day before. EFF does not collect your information.">
          <Field label="Scholarship, FAFSA, bill, or application name" value={reminder.name} set={v=>setReminder({...reminder,name:v})} placeholder="Example: Smith Scholarship"/>
          <DateField label="Final deadline" value={reminder.deadline} set={v=>setReminder({...reminder,deadline:v})}/>
          <section className="tool-result"><div className="result-head"><div><small>PRIVATE CALENDAR FILE</small><h3>Your three reminders</h3></div><button type="button" disabled={!reminder.name||!reminder.deadline} onClick={downloadReminder}>Add to calendar ↓</button></div><div className="result-body"><ol><li><b>14 days before:</b> confirm eligibility and request documents.</li><li><b>3 days before:</b> complete a final review and submit if ready.</li><li><b>1 day before:</b> verify the confirmation and save a copy.</li></ol><p className="decoder-note">Your calendar app—not EFF—delivers these alerts. Always verify the exact closing time and time zone on the official application.</p></div><p className="result-disclaimer">This tool creates the file in your browser. It does not send your name, date, or deadline to EFF.</p></section>
        </Tool>}

        {active==="friend" && <Tool title="Know what to say" intro="Choose the problem and the tone. We will give you a caring script—not a lecture.">
          <Field label="Friend's first name (optional)" value={friend.name} set={v=>setFriend({...friend,name:v})} placeholder="First name only"/>
          <Choice label="What are they dealing with?" value={friend.need} set={v=>setFriend({...friend,need:v})} options={[['money','Money or tuition'],['housing','Food or housing'],['school','Thinking about leaving school'],['mental','Mental health'],['unsafe','Safety concern']]}/>
          <Choice label="How should it sound?" value={friend.tone} set={v=>setFriend({...friend,tone:v})} options={[['gentle','Gentle'],['direct','Direct'],['text','Quick text']]}/>
          <Result title="Your L.E.C.F. script" print={print}><p className="script">“{friend.name?friend.name+", ":""}{friend.tone==='direct'?"I care about you and I do not want you handling this alone.":friend.tone==='text'?"hey, I’m here. we can figure out one next step together.":"I noticed things have felt heavy lately. You do not have to explain everything, but I am here to listen."}”</p><p><b>Connect:</b> {friend.need==='mental'?"Offer to call or text 988 together and connect them to campus counseling.":friend.need==='unsafe'?"If danger is immediate, call 911. Do not promise secrecy when someone may be unsafe.":friend.need==='housing'?"Offer to look up 211, the campus basic-needs office, or FindHelp.org together.":friend.need==='school'?"Offer to sit with them while they contact an advisor or dean before withdrawing.":"Offer to help them email financial aid, student accounts, or the dean of students."}</p><p><b>Follow up:</b> “How did that conversation go? Want me to sit with you for the next step?”</p></Result>
        </Tool>}

        {active==="family" && <Tool title="Check the family funding plan" intro="See what is truly covered and whether new borrowing fits the family budget.">
          <div className="field-grid"><Field label="Annual direct cost" value={family.cost} set={v=>setFamily({...family,cost:v})} prefix="$"/><Field label="Grants + scholarships" value={family.freeAid} set={v=>setFamily({...family,freeAid:v})} prefix="$"/><Field label="Student loans" value={family.studentLoans} set={v=>setFamily({...family,studentLoans:v})} prefix="$"/><Field label="Proposed parent/private loan" value={family.parentLoan} set={v=>setFamily({...family,parentLoan:v})} prefix="$"/><Field label="Affordable monthly payment" value={family.monthly} set={v=>setFamily({...family,monthly:v})} prefix="$"/></div>
          <Result title="Family decision snapshot" print={print}><div className={`big-number ${familyGap>0?"warn":"good"}`}>{fmt(Math.abs(familyGap))}</div><p>{familyGap>0?"still uncovered after the amounts listed.":"listed funding covers the annual direct cost."}</p><ol><li>Ask the lender for the actual interest rate, fees, repayment start, and estimated monthly payment.</li><li>Do not rely on the student’s future income to make a parent loan affordable.</li><li>Ask the college for four-year cost and renewal estimates.</li><li>Your stated comfortable payment is {fmt(money(family.monthly))}/month. Compare the lender estimate to that number.</li></ol></Result>
        </Tool>}

        {active==="campus" && <Tool title="Build a REACH campus event" intro="Pick one problem. Leave with a simple event plan people can actually use.">
          <Choice label="Event focus" value={campus.topic} set={v=>setCampus({...campus,topic:v})} options={[['scholarships','Scholarships'],['fafsa','FAFSA help'],['basic','Basic needs'],['friend','Peer support'],['career','Career access']]}/><Field label="Who is it for?" value={campus.audience} set={v=>setCampus({...campus,audience:v})} placeholder="First-year students, commuters, student parents..."/><Field label="Target date" value={campus.date} set={v=>setCampus({...campus,date:v})} placeholder="Month or date"/><Field label="Campus partner" value={campus.partner} set={v=>setCampus({...campus,partner:v})} placeholder="Financial aid, counseling, student affairs..."/>
          <Result title="Your 60-minute event" print={print}><div className="result-tag">{campus.topic.toUpperCase()} · {campus.date||"DATE TBD"}</div><ol><li><b>0–10:</b> Welcome {campus.audience||"students"}, explain the goal, and set privacy expectations.</li><li><b>10–25:</b> Have {campus.partner||"a trusted campus partner"} teach one clear concept.</li><li><b>25–45:</b> Everyone completes one real action—not only listening.</li><li><b>45–55:</b> Questions and verified referrals.</li><li><b>55–60:</b> Each person names a next step and receives a follow-up link.</li></ol><p><b>Success measure:</b> Count students who completed an action, not only attendance.</p></Result>
        </Tool>}

        {active==="persist" && <Tool title="Build your stay-enrolled support plan" intro="Choose the biggest barrier. Get the offices, questions, and first message to use before changing enrollment.">
          <Choice label="What is putting enrollment at risk?" value={persist.barrier} set={v=>setPersist({...persist,barrier:v})} options={[["money","Tuition or balance"],["food","Food or housing"],["transport","Transportation"],["academic","Academic progress"],["care","Childcare or caregiving"],["wellness","Mental health or wellness"]]}/>
          <Field label="Decision or payment deadline" value={persist.deadline} set={v=>setPersist({...persist,deadline:v})} placeholder="Example: September 18"/>
          <Field label="Trusted campus contact, if you have one" value={persist.contact} set={v=>setPersist({...persist,contact:v})} placeholder="Advisor, dean, coach, professor, or office"/>
          <Result title="Your support-team plan" print={print}>
            <PersistSteps barrier={persist.barrier}/>
            <div className="result-prompt">“I am trying to remain enrolled, but {barrierLabel(persist.barrier).toLowerCase()} is creating an urgent barrier{persist.deadline?` before ${persist.deadline}`:""}. I am requesting a coordinated review of the support and options available before I change my enrollment. Please tell me the next step and any deadline in writing.”</div>
            <p><b>Loop in:</b> {persist.contact||"a trusted advisor or dean of students"}. Keep copies of your messages, forms, decisions, and confirmation numbers.</p>
            <div className="resource-actions"><a href="https://portal.estherfundsfoundation.org/resources">Open EFF resources ↗</a><a href="https://www.211.org/">Find local help through 211 ↗</a></div>
          </Result>
        </Tool>}
      </div>
    </section>
    <footer className="tool-footer"><strong>Esther Funds Foundation</strong><span>We are working to prevent college dropouts around the world.</span><Link href="/">Back to the Hub</Link></footer>
  </main>;
}

function Tool({title,intro,children}:{title:string;intro:string;children:React.ReactNode}){return <div className="tool-panel"><div className="panel-heading"><p className="kicker">QUICK TOOL · PRIVATE IN YOUR BROWSER</p><h2>{title}</h2><p>{intro}</p></div>{children}</div>}
function Field({label,value,set,placeholder,prefix,area}:{label:string;value:string;set:(v:string)=>void;placeholder?:string;prefix?:string;area?:boolean}){return <label className="tool-field"><span>{label}</span><div>{prefix&&<b>{prefix}</b>}{area?<textarea value={value} onChange={e=>set(e.target.value)} placeholder={placeholder}/>:<input value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} inputMode={prefix?"decimal":undefined}/>}</div></label>}
function DateField({label,value,set}:{label:string;value:string;set:(v:string)=>void}){return <label className="tool-field"><span>{label}</span><div><input type="date" value={value} onChange={e=>set(e.target.value)}/></div></label>}
function Choice({label,value,set,options}:{label:string;value:string;set:(v:string)=>void;options:string[][]}){return <fieldset className="tool-choice"><legend>{label}</legend><div>{options.map(([v,l])=><button type="button" key={v} className={value===v?"chosen":""} onClick={()=>set(v)}>{l}</button>)}</div></fieldset>}
function Result({title,children,print}:{title:string;children:React.ReactNode;print:()=>void}){return <section className="tool-result"><div className="result-head"><div><small>YOUR INSTANT RESULT</small><h3>{title}</h3></div><button onClick={print}>Save / print ↓</button></div><div className="result-body">{children}</div><p className="result-disclaimer">This is an educational planning tool, not a funding decision or guarantee. Verify requirements and availability with the responsible school or provider.</p></section>}

function FafsaSteps({status}:{status:string}) {
  const steps: Record<string,string[]> = {
    started: ["Finish every required section and invite each required contributor.", "Resolve missing signatures before submitting.", "List every school you are considering; adding a school does not commit you to attend."],
    waiting: ["Check your FAFSA status in your StudentAid.gov account.", "Watch for processing updates and requests from each college.", "After processing, review every tab in the FAFSA Submission Summary and correct errors if needed."],
    processed: ["Open the FAFSA Submission Summary and review Eligibility Overview, FAFSA Form Answers, School Information, and Next Steps.", "Confirm each intended college received your FAFSA.", "Remember: the Submission Summary is not a financial aid offer."],
    action: ["Open the exact alert and complete the requested correction or signature.", "If the instruction is unclear, contact Federal Student Aid or the college financial aid office using the exact message shown.", "Return to your dashboard and confirm the status changed."],
    verification: ["Read the college's request and use its secure upload method.", "Submit only the exact documents requested and keep a copy.", "Verification is a routine accuracy check; it does not mean you did something wrong."],
    nosai: ["Open Next Steps in the FAFSA Submission Summary to see what prevented calculation.", "Resolve rejected information, missing consent, contributor, identity, or signature issues.", "Ask the financial aid office to explain any unresolved code in plain language."],
    changed: ["Submit FAFSA using the required tax-year information; do not guess new figures unless instructed.", "Contact each college about a professional-judgment or special-circumstances review.", "Prepare documentation of income loss, unusual expenses, dependency changes, or other relevant circumstances."],
    offer: ["Separate grants and scholarships from loans and work-study.", "Compare the full cost of attendance and the direct bill gap.", "Confirm renewal rules and use the Aid Offer Decoder before accepting debt."],
  };
  return <ol>{(steps[status]||steps.started).map(step=><li key={step}>{step}</li>)}</ol>;
}

function barrierLabel(barrier:string) {
  return ({ money:"Tuition or balance", food:"Food or housing", transport:"Transportation", academic:"Academic progress", care:"Childcare or caregiving", wellness:"Mental health or wellness" } as Record<string,string>)[barrier] || "A college barrier";
}

function PersistSteps({barrier}:{barrier:string}) {
  const routes: Record<string,string[]> = {
    money: ["Financial aid", "Student accounts or bursar", "Dean of students or retention office"],
    food: ["Campus basic-needs or pantry office", "Housing office", "211 or a local benefits navigator"],
    transport: ["Dean of students", "Campus transportation", "Local transit or emergency-assistance office"],
    academic: ["Academic advisor", "Tutoring or success center", "Professor and financial aid for SAP consequences"],
    care: ["Student-parent or family resource office", "Academic advisor", "Local childcare-benefits navigator"],
    wellness: ["Campus counseling", "Dean of students", "Accessibility office; 988 for immediate crisis support"],
  };
  return <><p className="result-lead"><b>Barrier:</b> {barrierLabel(barrier)}</p><ol>{(routes[barrier]||routes.money).map((route,index)=><li key={route}><b>{index===0?"Start":"Also contact"}:</b> {route}. Ask what can be done before withdrawal, a schedule change, or a missed payment.</li>)}</ol></>;
}
