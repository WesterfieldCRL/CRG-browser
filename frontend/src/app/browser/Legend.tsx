interface LegendProps {
  color_map: { [key: string]: string };
  visible_types: Set<string>;
}

export default function Legend({ color_map, visible_types }: LegendProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "8px",
        padding: "8px",
        background: "var(--bg)",
        borderRadius: "4px",
        border: "1px solid var(--border)",
      }}
    >
      {Object.entries(color_map)
        .filter(([key]) => visible_types.has(key))
        .map(([name, color]) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: color,
                borderRadius: "3px",
                border: "1px solid var(--border)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "var(--text)",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
          </div>
        ))}
    </div>
  );
}
