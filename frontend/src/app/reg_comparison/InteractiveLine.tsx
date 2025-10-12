import React, { useState } from "react";
import Tooltip from "../components/Tooltip";

interface Shape {
  start: number;
  end: number;
  info: string;
  color?: string;
}

interface InteractiveLineProps {
  start: number;
  end: number;
  start_label: number;
  end_label: number;
  shapes: Shape[];
  height?: number;
  width?: string;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export default function InteractiveLine({
  start,
  end,
  start_label,
  end_label,
  shapes,
  width = "100%",
}: InteractiveLineProps) {
  const [tooltipInfo, setTooltipInfo] = useState<{
    info: string;
    x: number;
    y: number;
  } | null>(null);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Convert position to percentage
  const getPositionPercentage = (position: number) => {
    return ((position - start) / (end - start)) * 100;
  };

  // Handle shape click
  const handleShapeClick = (event: React.MouseEvent, shape: Shape) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipInfo({
      info: shape.info,
      x: event.clientX,
      y: rect.top - 30, // Tooltip above shape
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width,
        flexGrow: 1,
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Base line */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "2px",
          backgroundColor: "#000",
        }}
      >
        {/* Shapes */}
        {shapes.map((shape, index) => {
          const leftPos = getPositionPercentage(shape.start);
          const width = getPositionPercentage(shape.end) - leftPos;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${leftPos}%`,
                width: `${width}%`,
                height: "20px",
                backgroundColor: shape.color || "#3b82f6",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                borderRadius: "4px",
              }}
              onMouseMove={(e) =>
                setTooltip({
                  text: shape.info,
                  x: e.pageX + 12,
                  y: e.pageY + 12,
                })
              }
              onMouseLeave={() => setTooltip(null)}
              // onClick={(e) => handleShapeClick(e, shape)}
            />
          );
        })}
      </div>

      {/* Start and end labels */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "25px",
          marginTop: "10px",
        }}
      >
        <span>Start: {start_label}</span>
        <span>End: {end_label}</span>
      </div>

      {tooltip && <Tooltip tooltip={tooltip} />}
      {/* Tooltip */}
      {/* {tooltipInfo && (
        <div
          style={{
            position: "fixed",
            left: tooltipInfo.x,
            top: tooltipInfo.y,
            transform: "translate(-50%, -100%)",
            backgroundColor: "black",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            pointerEvents: "none",
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        >
          {tooltipInfo.info}
        </div>
      )} */}
    </div>
  );
}
