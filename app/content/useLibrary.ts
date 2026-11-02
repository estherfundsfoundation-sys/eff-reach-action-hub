"use client";

/* The REACH Library hook: MyEFF's live list, or the generated copy while it loads or if it can't be reached. */
import { useEffect, useState } from "react";
import { rpc } from "../scholarships/lib";
import { FALLBACK } from "./library-data";
import type { LibItem } from "./library";

let cache: LibItem[] | null = null;
export function useLibrary() {
  const [items, setItems] = useState<LibItem[]>(cache || FALLBACK);
  const [live, setLive] = useState(Boolean(cache));
  useEffect(() => {
    if (cache) return;
    rpc<{ items: LibItem[] }>("eff_reach_library_public", {}).then((d) => { if (d?.items?.length) { cache = d.items; setItems(d.items); setLive(true); } }).catch(() => { /* keep the copy */ });
  }, []);
  return { items, live };
}

