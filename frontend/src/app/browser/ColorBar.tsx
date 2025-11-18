import Tooltip from "../components/Tooltip";
import { useState, useEffect } from "react";

interface ColorSegment {
  type: string;
  width: number;
  start?: number;
  end?: number;
  chromosome?: number;
}

interface ColorBarProps {
  segments: ColorSegment[];
  color_mapping: { [key: string]: string };
  interactible?: boolean;
  tooltipVisible?: boolean;
  letters?: boolean;
  height?: number;
  width?: string;
  onSegmentClick?: (start: number, end: number) => void;
}

const getBackgroundStyle = (color: string, displayLetters: boolean, isDark: boolean) => {
  if (displayLetters) {
    return {color: color};
  }
  return { backgroundColor: color };
};

export default function ColorBar({
  segments,
  color_mapping,
  interactible = true,
  letters = false,
  height = 30,
  width = "100%",
  onSegmentClick,
}: ColorBarProps) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const htmlElement = document.documentElement;
      const theme = htmlElement.getAttribute('data-theme');
      if (theme) {
        setIsDark(theme === 'dark');
      } else {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    checkDarkMode();

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  // Clear tooltip when segments data changes
  useEffect(() => {
    setTooltip(null);
  }, [segments, color_mapping]);

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find which segment the cursor is over
    let accumulatedWidth = 0;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentWidth = (segment.width / 100) * rect.width;

      if (x >= accumulatedWidth && x < accumulatedWidth + segmentWidth) {
        if (segment.type === "none" || !interactible) {
          setTooltip(null);
        } else {
          const text = `Type: ${segment.type} | Chromosome: ${segment.chromosome} | Start: ${segment.start} | End: ${segment.end}`;
          setTooltip({ text, x: e.clientX, y: e.clientY });
        }
        return;
      }
      accumulatedWidth += segmentWidth;
    }

    // If cursor is not over any segment, clear tooltip
    setTooltip(null);
  };

  const handleContainerMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <>
      <div
        style={{
          width,
          height: `${height}px`,
          display: "flex",
          overflow: "hidden",
          border: "1px solid var(--border)",
          borderRadius: "4px",
        }}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
      >
        {segments.map((segment, index) => {
          const mappedColor = color_mapping[segment.type];

          return (
            <div
              key={index}
              style={{
                display: "flex", alignItems: "center", justifyContent: 'center',
                width: `${segment.width}%`,
                height: "100%",
                position: "relative",
                cursor:
                  segment.type !== "none" && interactible ? "pointer" : "default",
                pointerEvents: segment.type !== "none" ? "auto" : "none",
                ...getBackgroundStyle(mappedColor, letters, isDark),
              }}
              onClick={() => {
                onSegmentClick(segment.start, segment.end);
              }}
            >
              {letters && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                  {segment.type}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Tooltip tooltip={tooltip} />
    </>
  );
}
