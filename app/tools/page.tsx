"use client";

import { useMemo, useState } from "react";

const tools = [
  { id: "essay", tag: "WRITE", title: "Essay Story Builder", desc: "Turn one real moment into a scholarship-ready outline.", color: "yellow" },
  { id: "aid", tag: "CALCULATE", title: "Aid Offer Decoder", desc: "See the real college gap without financial-aid jargon.", color: "blue" },
  { id: "balance", tag: "ACT FAST", title: "Tuition Rescue Plan", desc: "Get a personalized 48-hour plan for a balance or hold.", color: "pink" },
  { id: "friend", tag: "SHOW UP", title: "Help-a-Friend Script", desc: "Know what to say and where to connect them.", color: "lavender" },
  { id: "family", tag: "DECIDE", title: "Family Funding Check", desc: "Pressure-test a college or loan decision together.", color: "yellow" },
  { id: "campus", tag: "CREATE", title: "Campus Event Builder", desc: "Build a useful REACH event in under three minutes.", color: "blue" },
];

const money = (value: string) => Number(value.replace(/[^0-9.]/g, "")) || 0;
const fmt = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function InteractiveTools() {
  const [active, setActive] = useState("essay");
  const [essay, setEssay] = useState({ moment: "", challenge: "", action: "", lesson: "", goal: "" });
  const [aid, setAid] = useState({ tuition: "", housing: "", fees: "", grants: "", loans: "", other: "" });
  const [balance, setBalance] = useState({ amount: "", deadline: "", school: "", tried: "" });
  const [friend, setFriend] = useState({ name: "", need: "money", tone: "gentle" });
  const [family, setFamily] = useState({ cost: "", freeAid: "", studentLoans: "", parentLoan: "", monthly: "" });
  const [campus, setCampus] = useState({ topic: "scholarships", audience: "", date: "", partner: "" });

  const gap = useMemo(() => money(aid.tuition) + money(aid.housing) + money(aid.fees) - money(aid.grants) - money(aid.loans) - money(aid.other), [aid]);
  const familyGap = useMemo(() => money(family.cost) - money(family.freeAid) - money(family.studentLoans) - money(family.parentLoan), [family]);
  const print = () => window.print();

  return <main className="tool-page">
    <header className="tool-header"><a href="/">← REACH Action Hub</a><span>EFF INTERACTIVE TOOLKITS</span><a href="https://portal.estherfundsfoundation.org/">Scholarship Portal ↗</a></header>
    <section className="tool-hero"><p className="kicker">NO HOMEWORK. JUST YOUR NEXT MOVE.</p><h1>Tap. Answer.<br/><em>Get a plan.</em></h1><p>Six quick, private tools built around real student problems. Your answers stay in your browser and are not sent to EFF.</p></section>
    <section className="tool-shell">
      <div className="tool-picker" aria-label="Choose an interactive toolkit">{tools.map(t=><button key={t.id} className={`${t.color} ${active===t.id?"active":""}`} onClick={()=>setActive(t.id)}><small>{t.tag}</small><strong>{t.title}</strong><span>{t.desc}</span></button>)}</div>
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

        {active==="aid" && <Tool title="Decode the real college gap" intro="Use annual numbers from the school's official aid offer.">
          <div className="field-grid"><Field label="Tuition" value={aid.tuition} set={v=>setAid({...aid,tuition:v})} prefix="$"/><Field label="Housing + meals" value={aid.housing} set={v=>setAid({...aid,housing:v})} prefix="$"/><Field label="Required fees" value={aid.fees} set={v=>setAid({...aid,fees:v})} prefix="$"/><Field label="Grants + scholarships" value={aid.grants} set={v=>setAid({...aid,grants:v})} prefix="$"/><Field label="Accepted student loans" value={aid.loans} set={v=>setAid({...aid,loans:v})} prefix="$"/><Field label="Other confirmed credits" value={aid.other} set={v=>setAid({...aid,other:v})} prefix="$"/></div>
          <Result title="Your estimated gap" print={print}><div className={`big-number ${gap>0?"warn":"good"}`}>{fmt(Math.max(gap,0))}</div><p>{gap>0?"This is the amount still needing a verified plan. Work-study is usually earned as wages, so do not count it as upfront bill credit.":"Your listed confirmed aid covers these direct costs. Double-check renewal rules and indirect expenses."}</p><ol><li>Ask for an itemized bill and pending-aid list.</li><li>Ask what aid renews next year and under what GPA rules.</li><li>Compare the four-year gap—not only year one.</li></ol></Result>
        </Tool>}

        {active==="balance" && <Tool title="Build a 48-hour tuition rescue plan" intro="Tell us the basics. We will organize the calls, emails, and questions.">
          <Field label="Balance" value={balance.amount} set={v=>setBalance({...balance,amount:v})} prefix="$"/><Field label="Deadline" value={balance.deadline} set={v=>setBalance({...balance,deadline:v})} placeholder="Example: August 2"/><Field label="College" value={balance.school} set={v=>setBalance({...balance,school:v})} placeholder="School name"/><Field label="What have you already tried?" value={balance.tried} set={v=>setBalance({...balance,tried:v})} placeholder="Calls, emails, appeals, payment plan..." area/>
          <Result title="Your rescue plan" print={print}><div className="result-tag">{fmt(money(balance.amount))} · {balance.deadline||"DEADLINE NEEDED"}</div><ol><li>Download the itemized bill and list every pending credit.</li><li>Email financial aid, student accounts, and the dean of students together at {balance.school||"your college"}.</li><li>Ask specifically about emergency, completion, retention, or institutional grants and a temporary hold review.</li><li>Reference what you already tried: {balance.tried||"add your attempts so staff do not restart the process"}.</li><li>Before withdrawing, request written consequences for aid, housing, balances, SAP, and re-enrollment.</li></ol><div className="result-prompt">Email opener: “My {fmt(money(balance.amount))} balance may interrupt my enrollment by {balance.deadline||"[deadline]"}. I am requesting a coordinated account review and written next steps.”</div></Result>
        </Tool>}

        {active==="friend" && <Tool title="Know what to say" intro="Choose the problem and the tone. We will give you a caring script—not a lecture.">
          <Field label="Friend's first name (optional)" value={friend.name} set={v=>setFriend({...friend,name:v})} placeholder="First name only"/>
          <Choice label="What are they dealing with?" value={friend.need} set={v=>setFriend({...friend,need:v})} options={[['money','Money or tuition'],['housing','Food or housing'],['school','Thinking about leaving school'],['mental','Mental health'],['unsafe','Safety concern']]}/>
          <Choice label="How should it sound?" value={friend.tone} set={v=>setFriend({...friend,tone:v})} options={[['gentle','Gentle'],['direct','Direct'],['text','Quick text']]}/>
          <Result title="Your L.E.C.F. script" print={print}><p className="script">“{friend.name?friend.name+", ":""}{friend.tone==='direct'?"I care about you and I do not want you handling this alone.":friend.tone==='text'?"hey, I’m here. we can figure out one next step together.":"I noticed things have felt heavy lately. You do not have to explain everything, but I am here to listen."}”</p><p><b>Connect:</b> {friend.need==='mental'?"Offer to call or text 988 together and connect them to campus counseling.":friend.need==='unsafe'?"If danger is immediate, call 911. Do not promise secrecy when someone may be unsafe.":friend.need==='housing'?"Offer to look up 211, the campus basic-needs office, or FindHelp.org together.":friend.need==='school'?"Offer to sit with them while they contact an advisor or dean before withdrawing.":"Offer to help them email financial aid, student accounts, or the dean of students."}</p><p><b>Follow up:</b> “How did that conversation go? Want me to sit with you for the next step?”</p></Result>
        </Tool>}

        {active==="family" && <Tool title="Check the family funding plan" intro="See what is truly covered and whether new borrowing fits the family budget.">
          <div className="field-grid"><Field label="Annual direct cost" value={family.cost} set={v=>setFamily({...family,cost:v})} prefix="$"/><Field label="Grants + scholarships" value={family.freeAid} set={v=>setFamily({...family,freeAid:v})} prefix="$"/><Field label="Student loans" value={family.studentLoans} set={v=>setFamily({...family,studentLoans:v})} prefix="$"/><Field label="Proposed parent/private loan" value={family.parentLoan} set={v=>setFamily({...family,parentLoan:v})} prefix="$"/><Field label="Affordable monthly payment" value={family.monthly} set={v=>setFamily({...family,monthly:v})} prefix="$"/></div>
          <Result title="Family decision snapshot" print={print}><div className={`big-number ${familyGap>0?"warn":"good"}`}>{fmt(Math.abs(familyGap))}</div><p>{familyGap>0?"still uncovered after the amounts listed.":"listed funding covers the annual direct cost."}</p><ol><li>Ask the lender for the actual interest rate, fees, repayment start, and estimated monthly payment.</li><li>Do not rely on the student's future income to make a parent loan affordable.</li><li>Ask the college for four-year cost and renewal estimates.</li><li>Your stated comfortable payment is {fmt(money(family.monthly))}/month. Compare the lender estimate to that number.</li></ol></Result>
        </Tool>}

        {active==="campus" && <Tool title="Build a REACH campus event" intro="Pick one problem. Leave with a simple event plan people can actually use.">
          <Choice label="Event focus" value={campus.topic} set={v=>setCampus({...campus,topic:v})} options={[['scholarships','Scholarships'],['fafsa','FAFSA help'],['basic','Basic needs'],['friend','Peer support'],['career','Career access']]}/><Field label="Who is it for?" value={campus.audience} set={v=>setCampus({...campus,audience:v})} placeholder="First-year students, commuters, student parents..."/><Field label="Target date" value={campus.date} set={v=>setCampus({...campus,date:v})} placeholder="Month or date"/><Field label="Campus partner" value={campus.partner} set={v=>setCampus({...campus,partner:v})} placeholder="Financial aid, counseling, student affairs..."/>
          <Result title="Your 60-minute event" print={print}><div className="result-tag">{campus.topic.toUpperCase()} · {campus.date||"DATE TBD"}</div><ol><li><b>0–10:</b> Welcome {campus.audience||"students"}, explain the goal, and set privacy expectations.</li><li><b>10–25:</b> Have {campus.partner||"a trusted campus partner"} teach one clear concept.</li><li><b>25–45:</b> Everyone completes one real action—not only listening.</li><li><b>45–55:</b> Questions and verified referrals.</li><li><b>55–60:</b> Each person names a next step and receives a follow-up link.</li></ol><p><b>Success measure:</b> Count students who completed an action, not only attendance.</p></Result>
        </Tool>}
      </div>
    </section>
    <footer className="tool-footer"><strong>Esther Funds Foundation</strong><span>We are working to prevent college dropouts around the world.</span><a href="/">Back to the Hub</a></footer>
  </main>;
}

function Tool({title,intro,children}:{title:string;intro:string;children:React.ReactNode}){return <div className="tool-panel"><div className="panel-heading"><p className="kicker">QUICK TOOL · PRIVATE IN YOUR BROWSER</p><h2>{title}</h2><p>{intro}</p></div>{children}</div>}
function Field({label,value,set,placeholder,prefix,area}:{label:string;value:string;set:(v:string)=>void;placeholder?:string;prefix?:string;area?:boolean}){return <label className="tool-field"><span>{label}</span><div>{prefix&&<b>{prefix}</b>}{area?<textarea value={value} onChange={e=>set(e.target.value)} placeholder={placeholder}/>:<input value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} inputMode={prefix?"decimal":undefined}/>}</div></label>}
function Choice({label,value,set,options}:{label:string;value:string;set:(v:string)=>void;options:string[][]}){return <fieldset className="tool-choice"><legend>{label}</legend><div>{options.map(([v,l])=><button type="button" key={v} className={value===v?"chosen":""} onClick={()=>set(v)}>{l}</button>)}</div></fieldset>}
function Result({title,children,print}:{title:string;children:React.ReactNode;print:()=>void}){return <section className="tool-result"><div className="result-head"><div><small>YOUR INSTANT RESULT</small><h3>{title}</h3></div><button onClick={print}>Save / print ↓</button></div><div className="result-body">{children}</div><p className="result-disclaimer">This is an educational planning tool, not a funding decision or guarantee. Verify requirements and availability with the responsible school or provider.</p></section>}
