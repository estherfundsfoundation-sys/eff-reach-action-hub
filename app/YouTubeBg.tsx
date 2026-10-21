"use client";

import { useEffect, useRef, useState } from "react";

/* A YouTube video playing as a silent background, with none of YouTube showing.
   The frame stays invisible until the player reports it is actually playing,
   then fades in; it is scaled past its edges so the title bar and logo are cut
   off, and it takes no clicks. Whatever sits underneath (EFF's own clips) shows
   until then, and again if the browser refuses to autoplay. Never loaded for
   reduced motion. */
export function YouTubeBg({ id, paused = false, className = "" }: { id: string; paused?: boolean; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [on, setOn] = useState(false);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setLoad(true);
    const onMsg = (e: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
      if (e.source !== ref.current?.contentWindow) return;
      let d: { event?: string; info?: unknown } | null = null;
      try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
      if (!d) return;
      const state = d.event === "onStateChange" ? d.info
        : d.event === "infoDelivery" && d.info && typeof d.info === "object" ? (d.info as { playerState?: number }).playerState
        : undefined;
      if (state === 1) setOn(true);
      else if (state === 0 || state === 2 || state === -1) setOn(false);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    const w = ref.current?.contentWindow;
    if (!w || !load) return;
    w.postMessage(JSON.stringify({ event: "command", func: paused ? "pauseVideo" : "playVideo", args: [] }), "*");
  }, [paused, load]);

  if (!load) return null;
  const q = `autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
  return (
    <div className={`ytbg${on ? " on" : ""} ${className}`} aria-hidden="true">
      <iframe ref={ref} src={`https://www.youtube-nocookie.com/embed/${id}?${q}`} title="" tabIndex={-1}
        allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => ref.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*")} />
    </div>
  );
}
