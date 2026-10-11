// Fond « ciel de nuit » repris de revade.fr : halos lumineux + petites étoiles.
// À placer dans un conteneur en position: relative et overflow: hidden.

const STARS = [
  [6, 18, 2], [14, 62, 1.5], [22, 34, 2.5], [29, 80, 1.5], [35, 12, 1.5],
  [41, 55, 2], [48, 26, 1.5], [55, 72, 2.5], [61, 8, 2], [67, 44, 1.5],
  [73, 88, 2], [79, 20, 1.5], [84, 60, 2.5], [90, 36, 1.5], [95, 76, 2],
  [10, 90, 1.5], [52, 92, 1.5], [70, 66, 1.5], [18, 48, 1], [88, 10, 1],
];

export default function NightSky() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background:
          "radial-gradient(ellipse 45% 60% at 18% 10%, rgba(183,215,232,0.16), transparent 70%)," +
          "radial-gradient(ellipse 35% 55% at 85% 85%, rgba(165,201,185,0.12), transparent 70%)",
      }} />
      {STARS.map(([x, y, size], i) => (
        <span key={i} style={{
          position: "absolute", left: `${x}%`, top: `${y}%`,
          width: `${size}px`, height: `${size}px`, borderRadius: "50%",
          background: i % 3 === 0 ? "#A5C9B9" : "#F4EDE4",
          opacity: 0.35 + (i % 4) * 0.12,
        }} />
      ))}
    </div>
  );
}
