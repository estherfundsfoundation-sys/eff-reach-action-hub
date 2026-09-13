import {getChatGPTUser} from "@/app/chatgpt-auth";
import {adminEmails} from "@/lib/reach-shipping-admin";

type Row={id:string;tool:string;status:string;school:string|null;amount_cents:number|null;outcome:string;created_at:string};
const csv=(value:unknown)=>`"${String(value??"").replaceAll('"','""')}"`;

export async function GET(){
  const user=await getChatGPTUser();if(!user)return new Response("Sign in required.",{status:401});if(!adminEmails().has(user.email.toLowerCase()))return new Response("Not authorized.",{status:403});
  const {env}=await import("cloudflare:workers");if(!env.DB)return new Response("Database unavailable.",{status:503});let rows:Row[]=[];try{const result=await env.DB.prepare(`SELECT id,tool,status,school,amount_cents,outcome,created_at FROM student_defense_outcomes ORDER BY created_at DESC`).all<Row>();rows=result.results||[];}catch{return new Response("No outcome records exist yet.",{status:404});}
  const lines=[["id","tool","status","school","amount_usd","outcome","created_at"].map(csv).join(","),...rows.map((r)=>[r.id,r.tool,r.status,r.school,r.amount_cents===null?"":(r.amount_cents/100).toFixed(2),r.outcome,r.created_at].map(csv).join(","))];
  return new Response(lines.join("\r\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="reach-outcomes-${new Date().toISOString().slice(0,10)}.csv"`}});
}
