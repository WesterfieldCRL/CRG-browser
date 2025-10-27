import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  tooltip: {
    text: string;
    x: number; // clientX coordinate for positioning
    y: number; // clientY coordinate for positioning
  } | null;
}

/**
 * Advanced Tooltip component that renders tooltip content in a React portal with
 * boundary-aware positioning and animated fade-in/out. Positioned relative to the viewport.
 * 
 * Accessibility:
 * - Uses role="tooltip" to help screen readers.
 * - Pointer events are disabled on tooltip to avoid blocking underlying UI interactions.
 */
export default function Tooltip({ tooltip }: TooltipProps) {
  // Create a ref for tooltip DOM element to measure size for smart positioning
  const tooltipRef = useRef<HTMLDivElement>(null);

  // State for computed position (top/left) after boundary constraints
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // State to control fade animation visibility
  const [visible, setVisible] = useState(false);

  // UseEffect triggers whenever tooltip prop changes (new tooltip or cleared)
  useEffect(() => {
    if (!tooltip) {
      // No tooltip data - start fade out, then hide after animation completes (200ms)
      setVisible(false);
      return;
    }

    // Tooltip must be shown - start fade in
    setVisible(true);

    // Calculate optimum position within viewport boundaries
    const calcPosition = () => {
      if (!tooltipRef.current) return;

      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const margin = 12; // offset margin from cursor
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = tooltip.x + margin;
      let top = tooltip.y + margin;

      // Prevent tooltip from overflowing right of viewport
      if (left + tooltipRect.width + margin > viewportWidth) {
        left = tooltip.x - tooltipRect.width - margin;
      }

      // Prevent tooltip from overflowing bottom of viewport
      if (top + tooltipRect.height + margin > viewportHeight) {
        top = tooltip.y - tooltipRect.height - margin;
      }

      // Prevent negative positions (off screen left/top)
      left = Math.max(left, margin);
      top = Math.max(top, margin);

      setPos({ top, left });
    };

    // Request position calculation after render
    setTimeout(calcPosition, 0);
  }, [tooltip]);

  // Render nothing if no tooltip content and invisible
  if (!tooltip && !visible) {
    return null;
  }

  // Create portal root div with id "tooltip-root" in public/index.html or dynamically here
  const tooltipRoot =
    document.getElementById("tooltip-root") || // try to find existing
    (() => {
      // otherwise create one and attach to body
      const root = document.createElement("div");
      root.id = "tooltip-root";
      document.body.appendChild(root);
      return root;
    })();

  return createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      aria-live="polite"
      className={`tooltip ${visible ? "visible" : ""}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {tooltip?.text}

      {/* Inline styles with CSS-in-JS for modularity */}
      <style>{`
        .tooltip {
          position: fixed; /* Fixed relative to viewport */
          pointer-events: none; /* Allows mouse events to pass through */
          background: rgba(18, 60, 124, 0.9);
          color: white;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.9rem;
          max-width: 260px;
          white-space: nowrap;
          user-select: none;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.15),
            0 0 12px rgba(18, 60, 124, 0.6);
          transition: opacity 0.2s ease, transform 0.2s ease;
          opacity: 0;
          transform: translateY(4px);
          z-index: 10000;
        }
        .tooltip.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>,
    tooltipRoot
  );
}
