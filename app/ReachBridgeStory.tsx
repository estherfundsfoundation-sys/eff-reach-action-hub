"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const tools = [
  ["Award Letter Decoder", "/tools/award"], ["FAFSA Decoder", "/tools/fafsa"],
  ["Tuition Rescue Plan", "/tools/balance"], ["Aid Counter-Offer", "/tools/counteroffer"],
  ["Emergency Terminal", "/defense?tool=tuition"], ["Stay-Enrolled Planner", "/tools/persist"],
  ["Scholarship Essay", "/tools/essay"], ["Scholarship Checklist", "/tools/scholarship"],
  ["Deadline Reminders", "/tools/reminders"], ["Family Funding Check", "/tools/family"],
  ["Résumé Builder", "/resume"], ["Interview Coach", "/eff-interview-coach/"],
  ["Help a Friend", "/reach-a-friend/walkthrough"],
] as const;

const chapters = [
  { eyebrow: "EFF’S RESPONSE TO COLLEGE DROPOUT PREVENTION", title: <>Before you<br/>drop out, <em>reach.</em></>, text: "Free, practical tools that help students solve the problems pushing them out of college—from balances and basic needs to academic pressure, mental health, and career uncertainty." },
  { eyebrow: "A PRACTICAL WAY FORWARD", title: <>Every barrier needs<br/>a <em>next step.</em></>, text: "The bridge forms from real tools: decode the aid letter, fix the FAFSA, rescue a balance, prepare an appeal, or plan the next 48 hours." },
  { eyebrow: "THE EFF STUDENT ACTION CENTER", title: <>We build it<br/><em>with you.</em></>, text: "Each bridge plank opens a free REACH tool. No account required to explore, and your answers stay in your browser." },
  { eyebrow: "YOU ARE NOT ALONE", title: <>Hold <em>on.</em></>, text: "You are not behind. You are building. And you were never supposed to do it alone." },
];

export default function ReachBridgeStory() {
  const shell = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches); sync();
    media.addEventListener("change", sync); return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = shell.current;
    if (!el || reduced) return;
    const update = () => setProgress(Math.max(0, Math.min(1, -el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight))));
    update(); addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [reduced]);

  useEffect(() => {
    const c = canvas.current, el = shell.current;
    if (!c || !el || reduced) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0, smooth = 0;
    const ease = (n:number) => { n=Math.max(0,Math.min(1,n)); return n*n*(3-2*n); };
    const resize = () => { const d=Math.min(devicePixelRatio,1.6); c.width=innerWidth*d; c.height=innerHeight*d; c.style.width=`${innerWidth}px`; c.style.height=`${innerHeight}px`; ctx.setTransform(d,0,0,d,0,0); };
    const draw = () => {
      const raw=Math.max(0,Math.min(1,-el.getBoundingClientRect().top/Math.max(1,el.offsetHeight-innerHeight))); smooth+=(raw-smooth)*.07;
      const w=innerWidth,h=innerHeight,p=smooth, mobile=w<760; ctx.clearRect(0,0,w,h); ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h);
      ctx.fillStyle="#f1ebfa"; ctx.beginPath(); ctx.moveTo(0,h*.45);ctx.lineTo(w*.31,h*.39);ctx.lineTo(w*.39,h);ctx.lineTo(0,h);ctx.fill();ctx.beginPath();ctx.moveTo(w,h*.44);ctx.lineTo(w*.69,h*.39);ctx.lineTo(w*.61,h);ctx.lineTo(w,h);ctx.fill();
      const bridgeY=h*(mobile?.43:.54), start=w*.31,end=w*.69, count=tools.length;
      for(let i=0;i<count;i++){const u=ease((p-(.16+i/count*.25))/.2),x=start+(end-start)*(i+.5)/count,fallY=h+80+i*16;ctx.save();ctx.translate(x,fallY+(bridgeY-fallY)*u);ctx.rotate((1-u)*(i%2?.8:-.7));ctx.fillStyle="#42127f";ctx.fillRect(-(end-start)/count*.38,-7,(end-start)/count*.76,14);ctx.restore();}
      const cross=ease((p-.51)/.22),x=start-12+(end-start+24)*cross;ctx.beginPath();ctx.arc(x,bridgeY-21-Math.abs(Math.sin(cross*Math.PI*7))*7,mobile?18:25,0,Math.PI*2);ctx.fillStyle="#7a4dd6";ctx.shadowColor="rgba(66,18,127,.3)";ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;
      if(p>.72){for(let i=0;i<(mobile?22:42);i++){const u=ease((p-(.72+i/(mobile?22:42)*.15))/.13),a=i*.74,rad=50+(i%5)*15;ctx.beginPath();ctx.arc(end+35+Math.cos(a)*rad,bridgeY-30+Math.sin(a)*rad*u+(1-u)*h*.7,4+(i%3),0,Math.PI*2);ctx.fillStyle=i%5===0?"#42127f":"#c9b4f2";ctx.fill();}}
      raf=requestAnimationFrame(draw);
    };
    resize(); addEventListener("resize",resize); draw(); return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);};
  }, [reduced]);

  if(reduced) return <section className="bridge-static" id="top"><p className="kicker">{chapters[0].eyebrow}</p><h1>{chapters[0].title}</h1><p>{chapters[0].text}</p><div><a href="#decision-guide-title">Find my next step</a><Link href="/reach-a-friend/walkthrough">Help a friend stay enrolled</Link></div><small>No account required to explore resources. Never email passwords, Social Security numbers, or verification codes.</small></section>;
  const active=progress<.2?0:progress<.47?1:progress<.74?2:3;
  return <section className="bridge-story" id="top" ref={shell}><div className="bridge-stage"><canvas ref={canvas} aria-hidden="true"/><div className="bridge-wash"/>
    {chapters.map((chapter,i)=><article className={`bridge-chapter ${i===active?"active":""} ${i%2?"right":""}`} key={chapter.eyebrow}><div><p className="kicker">{chapter.eyebrow}</p><h1>{chapter.title}</h1><p>{chapter.text}</p>
      {i===0&&<><div className="bridge-actions"><a className="bridge-button" href="#decision-guide-title">Find my next step</a><Link className="bridge-button ghost" href="/reach-a-friend/walkthrough">Help a friend stay enrolled</Link></div><small>No account required to explore resources. Never email passwords, Social Security numbers, or verification codes.</small></>}
      {i===2&&<a className="bridge-button" href="#downloads">See all tools</a>}{i===3&&<div className="bridge-final"><strong>R E A C H</strong><span><a className="bridge-button" href="#find-help">Find help now</a><a className="bridge-button ghost" href="#stay-enrolled">Browse resources</a></span></div>}
    </div></article>)}
    <div className={`bridge-labels ${active===2?"visible":""}`}>{tools.map(([name,href],i)=><a href={href} key={name} style={{left:`${11+i*6.45}%`,top:`${47+(i%2?5:0)}%`}}>{name}</a>)}</div>
    <div className="bridge-dots" aria-hidden="true">{chapters.map((_,i)=><i className={i===active?"active":""} key={i}/>)}</div><div className="bridge-scroll" aria-hidden="true">Scroll to build the bridge ↓</div>
  </div></section>;
}
