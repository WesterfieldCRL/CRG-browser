interface Variant {
  type: string;
  start: number;
  end: number;
}

interface NucleotdiesDisplayProps {
  nucleotides: string;
  variants_list: Variant[];
}

export default function NucleotdiesDisplay({
  nucleotides,
  variants_list,
}: NucleotdiesDisplayProps) {
  return (
    <div
      style={{
        display: "grid",
        gridAutoFlow: "row",
        gridTemplateColumns: `repeat(${nucleotides?.length || 1}, 1fr)`,
        width: "100%",
        gap: "1px",
        height: "30px", // Match ColorBar default height
      }}
    >
      {nucleotides?.split("").map((char, index) => (
        <span
          key={index}
          style={{
            border: "1px solid var(--border)",
            background: "var(--panel-bg)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 0,
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
}
