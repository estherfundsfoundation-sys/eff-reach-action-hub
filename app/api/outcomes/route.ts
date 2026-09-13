const tools=new Set(["counteroffer","recommendation","sap","grade","fees","employer","transcript","syllabus","degree","reverse","housing","grievance","hold","receipt","award","other"]);
const statuses=new Set(["resolved","improved","pending","no_change","referred"]);
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";

export async function POST(request:Request){
  let body:Record<string,unknown>;try{body=await request.json() as Record<string,unknown>;}catch{return Response.json({error:"Please check the form and try again."},{status:400});}
  if(clean(body.website,50))return Response.json({ok:true,reference:"RECEIVED"});
  const tool=clean(body.tool,40),status=clean(body.status,30),school=clean(body.school,160),outcome=clean(body.outcome,800);const amountRaw=Number(body.amount);const amount=Number.isFinite(amountRaw)?Math.min(Math.max(amountRaw,0),100000):null;
  if(!tools.has(tool)||!statuses.has(status)||outcome.length<10||body.consent!==true)return Response.json({error:"Complete the tool, status, short outcome, and consent fields."},{status:400});
  const {env}=await import("cloudflare:workers");if(!env.DB)return Response.json({error:"Impact check-ins are temporarily unavailable."},{status:503});
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS student_defense_outcomes(id TEXT PRIMARY KEY,tool TEXT NOT NULL,status TEXT NOT NULL,school TEXT,amount_cents INTEGER,outcome TEXT NOT NULL,consent_at TEXT NOT NULL,created_at TEXT NOT NULL)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_student_defense_outcomes_created ON student_defense_outcomes(created_at)`).run();
  const id=crypto.randomUUID(),now=new Date().toISOString();await env.DB.prepare(`INSERT INTO student_defense_outcomes(id,tool,status,school,amount_cents,outcome,consent_at,created_at) VALUES(?,?,?,?,?,?,?,?)`).bind(id,tool,status,school||null,amount===null?null:Math.round(amount*100),outcome,now,now).run();
  return Response.json({ok:true,reference:id.slice(0,8).toUpperCase()});
}
