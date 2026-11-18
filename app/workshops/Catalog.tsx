"use client";

import { useState } from "react";
import { SHELVES } from "./shelves";

/* The workshop catalog, one shelf at a time so the page stays short (18 Nov 2026). */
export default function Catalog() {
  const [k, setK] = useState(0);
  const sh = SHELVES[k];
  return (
    <div className="wk2-cat">
      <div className="wk2-tabs" role="tablist" aria-label="Kinds of workshop">
        {SHELVES.map((s, i) => (
          <button key={s.title} role="tab" aria-selected={i === k} className={i === k ? "on" : ""} onClick={() => setK(i)}>
            {s.title} <small>{s.items.length}</small>
          </button>
        ))}
      </div>
      <p className="rx-sub">{sh.line}</p>
      <div className="rx-grid three">
        {sh.items.map(([name, line]) => (
          <article key={name} className="rx-card wk2-card"><b>{name}</b><span>{line}</span></article>
        ))}
      </div>
    </div>
  );
}
