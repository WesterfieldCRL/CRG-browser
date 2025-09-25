import React from "react";

export default function Tooltip({
  tooltip,
}: {
  tooltip: { text: string; x: number; y: number };
}) {
  return (
    <div
      className="tooltip"
      style={{ left: tooltip.x, top: tooltip.y }}
      role="tooltip"
    >
      {tooltip.text}
      <style>{`
        .tooltip {
          position: fixed;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 12px;
          border-radius: 4px;
          pointer-events: none;
          z-index: 1000;
          max-width: 250px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
