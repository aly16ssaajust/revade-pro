// En-tête de page commun : sur-titre, titre, sous-titre et actions à droite.
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", flexWrap: "wrap", marginBottom: "32px" }}>
      <div>
        {eyebrow && (
          <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "10px" }}>
            {eyebrow}
          </p>
        )}
        <h1 style={{ color: "#004649", fontWeight: "600", fontSize: "32px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{title}</h1>
        {subtitle && <p style={{ color: "#5A6B72", fontSize: "14px", marginTop: "8px" }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>{children}</div>}
    </div>
  );
}
