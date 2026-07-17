from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "downloads"
OUT.mkdir(parents=True, exist_ok=True)

PURPLE = colors.HexColor("#532783")
INK = colors.HexColor("#171827")
CREAM = colors.HexColor("#FFFAF1")
YELLOW = colors.HexColor("#FFD84A")
PINK = colors.HexColor("#F7B9D2")
BLUE = colors.HexColor("#A9DDEB")
GRAY = colors.HexColor("#5A5663")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=30, textColor=INK, alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name="CoverSub", parent=styles["BodyText"], fontName="Helvetica", fontSize=12, leading=17, textColor=GRAY, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=22, leading=25, textColor=PURPLE, spaceAfter=12))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=INK, spaceBefore=8, spaceAfter=7))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=GRAY))
styles.add(ParagraphStyle(name="Calloutx", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=INK))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(PURPLE); canvas.setLineWidth(1); canvas.line(0.65*inch, 0.52*inch, 7.85*inch, 0.52*inch)
    canvas.setFont("Helvetica-Bold", 7.5); canvas.setFillColor(PURPLE); canvas.drawString(0.65*inch, 0.34*inch, "ESTHER FUNDS FOUNDATION | EVERY FUTURE FULFILLED")
    canvas.setFont("Helvetica", 7.5); canvas.setFillColor(GRAY); canvas.drawRightString(7.85*inch, 0.34*inch, f"PAGE {doc.page}")
    canvas.restoreState()

def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def bullets(items):
    return [P(f"<b>•</b> {x}") for x in items]

def lines(rows=4, label=""):
    data=[]
    if label: data.append([P(f"<b>{label}</b>")])
    data += [[""] for _ in range(rows)]
    t=Table(data, colWidths=[7.05*inch], rowHeights=[0.28*inch]*len(data))
    t.setStyle(TableStyle([("LINEBELOW",(0,0),(-1,-1),0.5,colors.HexColor("#B8B3BE")),("VALIGN",(0,0),(-1,-1),"BOTTOM"),("LEFTPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
    return t

def checklist(items):
    data=[["☐", P(x)] for x in items]
    t=Table(data,colWidths=[0.28*inch,6.75*inch])
    t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("FONTNAME",(0,0),(0,-1),"Helvetica"),("FONTSIZE",(0,0),(0,-1),11),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
    return t

def callout(title, text, color=YELLOW):
    t=Table([[P(title,"Calloutx"),P(text)]],colWidths=[1.7*inch,5.3*inch])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),color),("BOX",(0,0),(-1,-1),1.2,INK),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10)]))
    return t

def cover(title, subtitle, audience):
    return [Spacer(1,0.45*inch),
        Table([[P("EFF", "CoverTitle")]], colWidths=[1.15*inch], rowHeights=[1.0*inch], style=TableStyle([("BACKGROUND",(0,0),(-1,-1),PURPLE),("TEXTCOLOR",(0,0),(-1,-1),WHITE),("BOX",(0,0),(-1,-1),2,INK),("VALIGN",(0,0),(-1,-1),"MIDDLE")])),
        Spacer(1,0.32*inch),P(title,"CoverTitle"),P(subtitle,"CoverSub"),Spacer(1,0.35*inch),
        callout("MADE FOR", audience, PINK),Spacer(1,0.28*inch),
        P("Use this toolkit as a planning guide. Requirements, deadlines, and availability are set by each school, scholarship, agency, or provider. EFF cannot guarantee funding or outside assistance.","Smallx"),
        Spacer(1,0.25*inch),P("portal.estherfundsfoundation.org  |  estherfundsfoundation.org","CoverSub"),PageBreak()]

def build(filename,title,subtitle,audience,sections):
    story=cover(title,subtitle,audience)
    for i,(heading,content) in enumerate(sections):
        story += [P(heading,"H1x")]
        for item in content:
            if isinstance(item, list):
                story.extend(item)
            else:
                story.append(item)
        if i < len(sections)-1: story += [Spacer(1,0.08*inch)]
    doc=SimpleDocTemplate(str(OUT/filename),pagesize=letter,rightMargin=.7*inch,leftMargin=.7*inch,topMargin=.65*inch,bottomMargin=.7*inch,title=title,author="Esther Funds Foundation")
    doc.build(story,onFirstPage=footer,onLaterPages=footer)

build("eff-scholarship-essay-workbook.pdf","Scholarship Essay Workbook","Turn your story into a focused, memorable scholarship essay.","High school seniors, college students, and adult learners",[
 ("1. Build your story bank",[P("Before writing, collect moments that reveal your values. Specific scenes are stronger than general claims."),checklist(["A challenge that changed how I think or act","A responsibility I carried for my family, school, work, or community","A moment I served, led, created, or solved a problem","A goal connected to my education and the people I hope to help"]),lines(4,"Three moments I could write about")]),
 ("2. Use the STORY structure",[callout("S - Scene","Open with a real moment the reader can picture."),callout("T - Tension","Explain the challenge, decision, or need without exaggerating.",PINK),callout("O - Ownership","Show what you did, learned, changed, or built.",BLUE),callout("R - Relevance","Connect the experience to your education and purpose."),callout("Y - Your next step","Explain what the scholarship makes possible."),Spacer(1,.12*inch),lines(6,"Draft your opening scene")]),
 ("3. Final review",[checklist(["I answered the exact prompt","My opening includes a specific scene","I showed growth with evidence","I named a realistic educational goal","I explained impact without promising perfection","I removed repeated ideas and checked the word limit","A trusted person reviewed grammar and clarity"]),callout("AI NOTE","Use technology to brainstorm or proofread, but keep the experiences, voice, and final claims truthful and your own.",PINK)])
])

build("eff-scholarship-application-organizer.pdf","Scholarship Application Organizer","A repeatable system for finding, preparing, and submitting strong applications.","Students applying to multiple scholarships",[
 ("Your reusable scholarship packet",[checklist(["One-page activities and honors list","Current unofficial transcript, when accepted","FAFSA Submission Summary or aid information only when securely requested","Two recommendation contacts with permission","A 300-word and 600-word personal essay","Professional headshot only when required","PDF copies of submitted applications and confirmations"]),callout("PROTECT YOUR DATA","Never pay to apply or email passwords, verification codes, Social Security numbers, tax returns, or full bank details.")]),
 ("Application tracker",[Table([[P("Scholarship","Calloutx"),P("Deadline","Calloutx"),P("Amount","Calloutx"),P("Status","Calloutx")]]+[["","","",""] for _ in range(8)],colWidths=[3.0*inch,1.35*inch,1.2*inch,1.45*inch],rowHeights=[.34*inch]+[.38*inch]*8,style=TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.6,INK),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),6)])),Spacer(1,.18*inch),lines(3,"This week's three application sessions")]),
 ("Before you press submit",[checklist(["Eligibility confirmed on the official source","Deadline and time zone verified","Every required question answered","Files open correctly and use clear filenames","Essay matches this scholarship's prompt","Contact information is current","I saved a copy and confirmation screenshot"]),P("Search more opportunities at <b>portal.estherfundsfoundation.org/scholarships</b>.")])
])

build("eff-fafsa-aid-appeal-toolkit.pdf","FAFSA + Financial Aid Appeal Toolkit","Get unstuck, document changed circumstances, and ask for the right review.","Students and FAFSA contributors",[
 ("FAFSA rescue checklist",[checklist(["Use only StudentAid.gov","Student and contributor each use their own FSA ID","Match legal names and dates exactly","Complete every contributor invitation","Provide required consent and signature","Review the FAFSA Submission Summary for errors","Send corrections and track school receipt"]),callout("NEED HELP?","Contact the Federal Student Aid Information Center or your school's financial aid office. Never share an FSA ID password.")]),
 ("When to request professional judgment",[P("Ask the financial aid office whether it can review documented circumstances that the FAFSA does not fully reflect."),bullets(["Job loss or major income reduction","Death, divorce, separation, or loss of family support","High unreimbursed medical or caregiving expenses","Housing instability or unusual dependency circumstances"]),P("Schools decide whether and how to adjust aid. An appeal does not guarantee additional funding."),lines(5,"What changed, when it changed, and how it affects college costs")]),
 ("Email template",[callout("SUBJECT","Request for Professional Judgment Review - [Student Name / ID]",PINK),P("Dear Financial Aid Office,<br/><br/>I am requesting guidance on a professional judgment review because [brief change] occurred on [date]. This change is not fully reflected in my current FAFSA information and affects my ability to cover [specific costs]. Please tell me which form and documents your office requires, the review timeline, and whether my account can be protected while the request is pending.<br/><br/>Thank you,<br/>[Name] | [Student ID] | [Phone]"),checklist(["Use the school's secure upload system","Keep copies of every submission","Ask for written confirmation and a follow-up date"])])
])

build("eff-financial-aid-offer-decoder.pdf","Financial Aid Offer Decoder","Separate free aid, work, loans, and the amount your family must actually cover.","Students and families comparing college offers",[
 ("Label every line",[Table([[P("Category","Calloutx"),P("What it means","Calloutx")],["Grants + scholarships","Free aid unless conditions are not met"],["Work-study","Wages earned through eligible employment; not an upfront bill credit"],["Federal loans","Borrowed by the student and repaid with interest"],["Parent/private loans","Borrowed separately; approval and terms vary"],["Estimated costs","May include indirect costs not billed by the college"]],colWidths=[1.7*inch,5.3*inch],style=TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.6,INK),("VALIGN",(0,0),(-1,-1),"TOP"),("PADDING",(0,0),(-1,-1),7)]))]),
 ("Calculate the real gap",[Table([[P("Item","Calloutx"),P("Amount","Calloutx")],["Tuition + required fees","$"],["Housing + meal plan","$"],["Other direct billed costs","$"],["Minus grants + scholarships","-$"],["Minus accepted loans","-$"],["Amount still due","$"]],colWidths=[5.3*inch,1.7*inch],rowHeights=[.34*inch]+[.38*inch]*6,style=TableStyle([("BACKGROUND",(0,0),(-1,0),YELLOW),("GRID",(0,0),(-1,-1),.6,INK),("PADDING",(0,0),(-1,-1),7)])),Spacer(1,.15*inch),P("Do not subtract work-study unless you have a job and know when wages will be paid.")]),
 ("Questions before accepting",[checklist(["Is each scholarship renewable, and what GPA is required?","What costs are billed directly?","Could grants change after verification?","How much debt would I have after four years?","What happens if housing, enrollment, or family income changes?","What is the graduation rate and typical time to finish?"])])
])

build("eff-tuition-balance-emergency-plan.pdf","Tuition Balance Emergency Action Plan","A 48-hour plan for holds, balances, payment deadlines, and enrollment risk.","Students facing an urgent college balance",[
 ("First 24 hours",[checklist(["Download an itemized account statement","List pending aid, outside scholarships, waivers, and credits","Email financial aid, student accounts, and the dean of students together","Ask about emergency, completion, retention, or institutional grants","Ask whether a temporary hold, extension, or fee review is available","Record names, dates, confirmation numbers, and promised follow-ups"]),callout("DO NOT RUSH","Before withdrawing, ask in writing how it affects aid, satisfactory academic progress, housing, insurance, balances, and re-enrollment.",PINK)]),
 ("Balance-response email",[callout("SUBJECT","Urgent Account Review Request - Enrollment at Risk",YELLOW),P("Hello,<br/><br/>I am requesting a coordinated review of my account because a balance of $[amount] may prevent my enrollment for [term]. I have already completed [FAFSA/payment/application steps]. Please confirm my itemized balance, pending aid, available emergency or completion funding, appeal options, and whether a temporary extension or hold review is possible while requests are pending.<br/><br/>My deadline is [date]. Please provide the next required action and response timeline in writing.<br/><br/>Thank you,<br/>[Name] | [Student ID]")]),
 ("Backup support map",[Table([[P("Need","Calloutx"),P("First contacts","Calloutx")],["Food / essentials","Campus pantry, basic-needs center, 211"],["Housing / utilities","Campus housing, 211, local community action agency"],["Transportation","Dean of students, transit aid, workforce programs"],["Childcare","Campus family center, ChildCare.gov, state subsidy"],["Mental-health crisis","Call or text 988; immediate danger call 911"]],colWidths=[2.0*inch,5.0*inch],style=TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.6,INK),("PADDING",(0,0),(-1,-1),7)]))])
])

build("eff-parent-family-college-guide.pdf","Parent + Family College Support Guide","Help your student plan, ask better questions, and borrow with care.","Parents, guardians, grandparents, and trusted supporters",[
 ("Your role in the process",[bullets(["Support organization without taking over the student's voice","Create your own FSA ID when invited as a FAFSA contributor","Discuss what the family can realistically contribute before choosing a school","Protect the student's privacy; use secure school systems for documents"]),callout("CONTRIBUTOR DOES NOT MEAN PAYER","Providing FAFSA information does not automatically make a parent responsible for college costs.",BLUE)]),
 ("Family college meeting",[checklist(["Compare net price, not sticker price","Separate grants, work-study, student loans, and parent/private loans","Review renewal rules and four-year cost estimates","Set a monthly affordability limit before borrowing","Name an emergency contact plan for balances, health, housing, and transportation"]),lines(5,"Our family's non-negotiables and questions")]),
 ("Before a Parent PLUS or private loan",[checklist(["We know the interest rate, fees, repayment start date, and monthly payment","We compared federal options and asked the school about additional aid","The borrower can repay without relying on the student's future income","We understand cosigner release, deferment, and default terms","We are not using retirement funds or unsafe high-cost debt without qualified advice"]),P("Find additional family tools at <b>portal.estherfundsfoundation.org/resources</b>.")])
])

build("eff-reach-for-a-friend-guide.pdf","REACH for a Friend Guide","Listen, encourage, connect, and follow up without carrying everything alone.","Friends, roommates, classmates, mentors, and student leaders",[
 ("Use L.E.C.F.",[callout("LISTEN","I noticed you seem overwhelmed. How are you really doing?"),callout("ENCOURAGE","I am glad you told me. You deserve support.",PINK),callout("CONNECT","Would it help if I sat with you while we contact someone?",BLUE),callout("FOLLOW UP","How did the financial aid or counseling conversation go?")]),
 ("Match support to the need",[Table([[P("Situation","Calloutx"),P("Connection","Calloutx")],["Food, housing, utilities","211, campus basic-needs office, FindHelp.org"],["Tuition / financial aid","Financial aid, student accounts, dean of students"],["Mental-health crisis","Call or text 988"],["Immediate danger","Call 911"],["Sexual violence","RAINN: 800-656-HOPE / rainn.org"],["Domestic violence","thehotline.org / 800-799-SAFE"]],colWidths=[2.3*inch,4.7*inch],style=TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.6,INK),("PADDING",(0,0),(-1,-1),7)]))]),
 ("Boundaries are care",[bullets(["Do not promise secrecy if someone may be unsafe","Do not act as a counselor, lender, or sole support person","Share only relevant resources instead of overwhelming them","Tell a trusted professional when the situation exceeds your role","Take care of your own wellbeing after a heavy conversation"]),callout("CHECK IN","One specific follow-up is more helpful than saying, Let me know if you need anything.",YELLOW)])
])

build("eff-campus-action-kit.pdf","EFF Campus Action Kit","Turn one student-retention problem into a focused event with a measurable next step.","Student leaders, chapters, advisors, and campus partners",[
 ("Choose one action",[checklist(["Scholarship Search Party","FAFSA completion or correction lab","Financial Aid Offer Decoder workshop","Basic-needs resource map and referral event","REACH peer-support conversation","Care package, pantry, or hygiene drive"]),lines(3,"Problem students are naming and our event response")]),
 ("Plan a 60-minute event",[Table([[P("Time","Calloutx"),P("Activity","Calloutx")],["0-10 min","Welcome, purpose, safety and privacy expectations"],["10-25 min","Teach one clear concept"],["25-45 min","Students complete one real action"],["45-55 min","Questions and verified referrals"],["55-60 min","Feedback and next-step commitment"]],colWidths=[1.2*inch,5.8*inch],style=TableStyle([("BACKGROUND",(0,0),(-1,0),PURPLE),("TEXTCOLOR",(0,0),(-1,0),WHITE),("GRID",(0,0),(-1,-1),.6,INK),("PADDING",(0,0),(-1,-1),7)])),Spacer(1,.15*inch),checklist(["Accessible room and time","Campus partner confirmed","Promotion includes what students will accomplish","No sensitive data collected on public forms","Follow-up resource email prepared"]) ]),
 ("Measure what mattered",[lines(2,"Students attended / completed an action"),lines(3,"Most common barriers or questions"),lines(3,"What we will improve or follow up on"),P("Connect students to the EFF Scholarship Portal at <b>portal.estherfundsfoundation.org</b>.")])
])

build("eff-stay-enrolled-plan.pdf","Stay-Enrolled Action Plan","Identify the barrier, protect your enrollment, and build a support team.","Any student considering stopping out or withdrawing",[
 ("Name the pressure point",[checklist(["Tuition balance or financial aid","Food or housing","Transportation or childcare","Academic standing or course load","Physical or mental health","Belonging, safety, or family responsibility","Work schedule or lost income"]),lines(4,"The problem, deadline, and consequence if nothing changes")]),
 ("Build your three-person team",[Table([[P("Role","Calloutx"),P("Name / office / contact","Calloutx")],["College decision-maker",""],["Trusted support person",""],["Community resource navigator",""],["Follow-up date",""],],colWidths=[2.4*inch,4.6*inch],rowHeights=[.34*inch]+[.48*inch]*4,style=TableStyle([("BACKGROUND",(0,0),(-1,0),YELLOW),("GRID",(0,0),(-1,-1),.6,INK),("PADDING",(0,0),(-1,-1),7)])),Spacer(1,.16*inch),P("Possible college contacts: financial aid, student accounts, dean of students, academic advisor, counseling, disability services, basic-needs center, or housing.")]),
 ("Before changing enrollment",[checklist(["Ask how withdrawal affects current and future aid","Ask about satisfactory academic progress and appeal rights","Confirm the final balance and refund consequences","Ask about incomplete grades, reduced load, leave, or emergency options","Get answers in writing and save copies","Create a return plan if stopping out becomes necessary"]),callout("CRISIS SUPPORT","Immediate danger: call 911. Mental-health crisis: call or text 988. Local essentials: dial 211.",PINK)])
])

print(f"Created {len(list(OUT.glob('eff-*.pdf')))} PDF toolkits in {OUT}")
