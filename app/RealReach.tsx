"use client";
/* REACH's own photos and videos (20 Oct 2026, Shayna: "i have pictures of reach i want them on the website
   throughout the website and videos as well … i want the ones i give to you used"). They live in MyEFF's
   media library (National → Photos & videos, public eff-media bucket) and are loaded from there, so nothing is
   copied. Her four Instagram posts are embedded from Instagram itself. Add a new one to PHOTOS/CLIPS/POSTS. */
import { useEffect, useRef } from "react";
import "./real-reach.css";

const BASE = "https://voljlrqyruluuqrfqwww.supabase.co/storage/v1/object/public/eff-media/";
type Photo = { src: string; tall: boolean };
type Clip = { src: string; poster: string; tall: boolean };

export const PHOTOS: Record<string, Photo> = {
  p5: { src: BASE + "2026/d3c2fde7-f7e5-4704-b735-94505eeec9d4.jpg", tall: true },
  p6: { src: BASE + "2026/d6373041-d376-46bc-9701-6a986c796dc8.jpg", tall: false },
  p7: { src: BASE + "2026/eb625356-5cf6-443d-ab38-2d4cc9a1e47e.jpg", tall: true },
};
const clip = (id: string, tall: boolean): Clip => ({ src: `${BASE}2026/video-${id}.mov`, poster: `${BASE}2026/video-${id}-poster.jpg`, tall });
export const CLIPS: Record<string, Clip> = {
  v1: clip("4afeef17-d5ed-47ad-b617-cf24fcd4a10a", true),
  v2: clip("9c2349bc-7b12-4a92-b5e5-424a708c7628", true),
  v3: clip("3287032f-5835-4846-8269-fd8d48c8da5c", false),
  v4: clip("f3c4746e-92c7-43ee-9980-34cdabbc6126", false),
};
const POSTS = ["DZnxaMJJNlE", "DesNpGvINUE", "Dek6k_2Rc_Q", "DeDK3FOR2z9"];

/* Muted, looping, only loads and plays while on screen; reduced motion keeps the poster. */
function Video({ c, label }: { c: Clip; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className={`rr-media${c.tall ? " tall" : ""}`} src={c.src} poster={c.poster} muted loop playsInline preload="none" aria-label={label} />;
}
function Img({ p, label }: { p: Photo; label: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`rr-media${p.tall ? " tall" : ""}`} src={p.src} alt={label} loading="lazy" />;
}

/* Home: REACH in real life. */
export function RealReachHome() {
  return (
    <section className="rr rr-home" aria-labelledby="rr-h">
      <div className="sc-wrap">
        <p className="rh-kick">REACH in real life</p>
        <h2 id="rr-h">Not a website. <em>A movement.</em></h2>
        <p className="rr-lede">Students, campuses and communities showing up for each other. This is what REACH looks like.</p>
        <div className="rr-wall">
          <Video c={CLIPS.v1} label="REACH students together" />
          <Img p={PHOTOS.p5} label="REACH with Esther Funds Foundation" />
          <Video c={CLIPS.v3} label="A REACH event" />
          <Img p={PHOTOS.p6} label="REACH students" />
          <Video c={CLIPS.v2} label="A moment from REACH" />
          <Img p={PHOTOS.p7} label="REACH on campus" />
          <Video c={CLIPS.v4} label="REACH in action" />
        </div>
        <p className="rh-kick" style={{ marginTop: 48 }}>Follow along</p>
        <div className="rr-ig">
          {POSTS.map((id) => (
            <iframe key={id} src={`https://www.instagram.com/p/${id}/embed`} title="REACH on Instagram" loading="lazy" allowTransparency />
          ))}
        </div>
      </div>
    </section>
  );
}

/* Subpages: one photo and one video under the page's header. */
export function RealStrip({ photo, video, line }: { photo: keyof typeof PHOTOS; video: keyof typeof CLIPS; line?: string }) {
  return (
    <section className="rr rr-strip" aria-label="REACH in real life">
      <div className="sc-wrap">
        <div className="rr-pair">
          <Img p={PHOTOS[photo]} label="REACH students" />
          <Video c={CLIPS[video]} label="REACH in real life" />
        </div>
        {line && <p className="rr-line">{line}</p>}
      </div>
    </section>
  );
}
