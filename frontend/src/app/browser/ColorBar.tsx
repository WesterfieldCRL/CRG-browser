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
  // For stripes and bars, we'll handle them differently with borders
  // Just return background color for now
  const bgColor = isDark ? "#1a2332" : "#ffffff";
  if (color === "stripes" || color === "bars") {
    return {
      backgroundColor: bgColor,
      border: `3px solid ${isDark ? "#999999" : "#555555"}`,
      boxSizing: 'border-box' as const,
    };
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
          const isEnhancer = mappedColor === "stripes";
          const isPromoter = mappedColor === "bars";

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
              {/* SVG overlay for enhancers (hashtag pattern - ##) */}
              {isEnhancer && !letters && (
                <svg
                  style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}
                >
                  <defs>
                    <pattern id={`hashtag-${index}-${isDark}`} patternUnits="userSpaceOnUse" width="8" height="30">
                      {/* Hashtag pattern with two horizontal bars at y=8 and y=17 */}
                      <line x1="0" y1="8" x2="8" y2="8" stroke={isDark ? "#ff4444" : "#d42626"} strokeWidth="2" />
                      <line x1="0" y1="17" x2="8" y2="17" stroke={isDark ? "#ff4444" : "#d42626"} strokeWidth="2" />
                      {/* Vertical line - centered with reduced spacing */}
                      <line x1="4" y1="0" x2="4" y2="30" stroke={isDark ? "#ff4444" : "#d42626"} strokeWidth="2" />
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width="100%" height="100%" fill={`url(#hashtag-${index}-${isDark})`} />
                </svg>
              )}

              {/* SVG overlay for promoters (diagonal slashes - ///) */}
              {isPromoter && !letters && (
                <svg
                  style={{ position: "absolute", width: "100%", height: "100%", pointerEvents: "none" }}
                >
                  <defs>
                    <pattern id={`slashes-${index}-${isDark}`} x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                      {/* Simple diagonal slashes */}
                      <line x1="0" y1="15" x2="15" y2="0" stroke={isDark ? "#4466ff" : "#153be2"} strokeWidth="2" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#slashes-${index}-${isDark})`} />
                </svg>
              )}

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
