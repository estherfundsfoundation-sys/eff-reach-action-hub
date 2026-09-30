"use client";

import { useState } from "react";

/* "In a workshop right now?" Type the code on the screen and go to MyEFF's room. */
export default function JoinCode({ base }: { base: string }) {
  const [v, setV] = useState("");
  return (
    <form className="wk-join" onSubmit={(e) => { e.preventDefault(); const c = v.trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (c) location.href = `${base}/${c}`; }}>
      <label htmlFor="wk-code">In a workshop right now? Type the code on the screen.</label>
      <div>
        <input id="wk-code" value={v} onChange={(e) => setV(e.target.value)} maxLength={8} autoComplete="off" autoCapitalize="characters" placeholder="ABC123" />
        <button className="sc-btn coral">Join</button>
      </div>
    </form>
  );
}
