/* A drawn initial, never a stock face. */
export default function Avatar({ initial, hue, size = 48, label }: { initial: string; hue: string; size?: number; label?: string }) {
  return (
    <svg className="pr-av" width={size} height={size} viewBox="0 0 48 48" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle cx="24" cy="24" r="23" fill={hue} />
      <circle cx="24" cy="24" r="23" fill="none" stroke="#FFD35A" strokeWidth="2" strokeDasharray="4 5" opacity=".75" />
      <circle cx="36" cy="11" r="4" fill="#FF6F61" />
      <text x="24" y="31" textAnchor="middle" fontFamily="Georama, Archivo, sans-serif" fontWeight="900" fontSize="21" fill="#fff">{initial}</text>
    </svg>
  );
}
