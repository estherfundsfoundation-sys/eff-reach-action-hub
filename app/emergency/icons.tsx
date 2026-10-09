/* REACH Emergency: one line-icon set, drawn for this page (24px grid, 1.75 stroke,
   round joins), so nothing on it is an emoji. Colour follows currentColor. */
const P: Record<string, string> = {
  money: "M3 7h18v10H3z M7 7v10 M17 7v10 M12 10.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6",
  housing: "M3.5 11 12 4l8.5 7 M5.5 9.5V20h13V9.5 M10 20v-5h4v5",
  food: "M4 11h16 M5 11a7 7 0 0 0 14 0 M9 21h6 M12 18v3 M9 4c0 1.5 1 1.5 1 3 M13 4c0 1.5 1 1.5 1 3",
  hygiene: "M12 3.5c3 3.6 5.5 6.6 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2.9 2.5-5.9 5.5-9.5z M9.5 14a2.5 2.5 0 0 0 2.5 2.5",
  bills: "M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z",
  school: "M2.5 9 12 5l9.5 4L12 13z M6.5 11v4.5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V11 M21.5 9v5",
  health: "M9 3.5h6v5.5h5.5v6H15v5.5H9V15H3.5V9H9z",
  mind: "M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z",
  safety: "M12 3 19.5 6v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z M9 12l2.2 2.2L15.5 10",
  tech: "M5 6h14v9.5H5z M2.5 18.5h19 M10 18.5h4",
  ride: "M5 5.5h14v11H5z M5 12h14 M8 19v-2.5 M16 19v-2.5 M8.2 14.5h.01 M15.8 14.5h.01",
  child: "M12 7.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z M8 21v-6.5l-2-3 3.5-2h5l3.5 2-2 3V21 M10.5 21v-4h3v4",
  legal: "M12 4v16 M7 20h10 M5 7h14 M5 7l-2.5 6a3 3 0 0 0 5 0z M19 7l-2.5 6a3 3 0 0 0 5 0z",
  disaster: "M7 15a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 8.5a3.5 3.5 0 0 1 0 6.5z M9 18l-1 2.5 M13 18l-1 2.5 M17 18l-1 2.5",
  loss: "M12 21V11 M12 11c-3 0-5-2.2-5-5 2.8 0 5 2 5 5z M12 13c3 0 5-2.2 5-5-2.8 0-5 2-5 5z M8 21h8",
  phone: "M5 4h3.5l1.5 4-2 1.3a10.5 10.5 0 0 0 6.7 6.7L16 14l4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  text: "M4 5h16v11H9l-5 4z M8 9.5h8 M8 12.5h5",
  out: "M14 4h6v6 M20 4l-9 9 M18 14v5H5V6h5",
  alert: "M12 3.5 21.5 20h-19z M12 10v4.5 M12 17.2h.01",
  check: "M5 12.5l4.5 4.5L19 7.5",
  copy: "M8 8h11v12H8z M5 16V4h11",
  storm: "M7 15a4 4 0 0 1-.4-8A5.5 5.5 0 0 1 17 8.5a3.5 3.5 0 0 1 0 6.5z M12.5 13l-2 4h3l-2 4",
  flag: "M5 21V4 M5 4h11l-2 4 2 4H5",
};

export function Icon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const d = P[name];
  if (!d) return null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {d.split(" M").map((seg, i) => <path key={i} d={i ? `M${seg}` : seg} />)}
    </svg>
  );
}
