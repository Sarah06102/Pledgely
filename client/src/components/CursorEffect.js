import React, { useEffect, useRef, useState } from "react";

export default function CursorEffect() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRefPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Don't show custom cursor on touch devices
    if ("ontouchstart" in window) return;

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      const target = e.target;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.closest("a") ||
          target.closest("button") ||
          target.closest("[role='button']")
      );
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      const { x: mx, y: my } = mouseRef.current;
      const curr = cursorRefPos.current;
      const smooth = 0.15;
      const dotSmooth = 0.35;

      curr.x = lerp(curr.x, mx, smooth);
      curr.y = lerp(curr.y, my, dotSmooth);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${curr.x}px, ${curr.y}px)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("custom-cursor-active");
    } else {
      document.body.classList.remove("custom-cursor-active");
    }
    return () => document.body.classList.remove("custom-cursor-active");
  }, [isVisible]);

  if ("ontouchstart" in window) return null;

  return (
    <>
      <style>{`
        .cursor-effect-wrapper {
          pointer-events: none;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          mix-blend-mode: normal;
        }
        .cursor-effect-wrapper.hidden {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .cursor-effect-wrapper.visible {
          opacity: 1;
          transition: opacity 0.2s ease;
        }
        .cursor-ring {
          position: absolute;
          width: 40px;
          height: 40px;
          margin-left: -20px;
          margin-top: -20px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.15) 0%,
            rgba(244, 63, 94, 0.08) 40%,
            transparent 70%
          );
          border: 1px solid rgba(236, 72, 153, 0.25);
          transition: width 0.2s ease, height 0.2s ease, margin 0.2s ease,
            background 0.2s ease, border-color 0.2s ease;
        }
        .cursor-ring.hover {
          width: 56px;
          height: 56px;
          margin-left: -28px;
          margin-top: -28px;
          background: radial-gradient(
            circle,
            rgba(236, 72, 153, 0.2) 0%,
            rgba(244, 63, 94, 0.12) 50%,
            transparent 75%
          );
          border-color: rgba(236, 72, 153, 0.4);
        }
        .cursor-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          margin-left: -4px;
          margin-top: -4px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          box-shadow: 0 0 12px rgba(236, 72, 153, 0.5);
          transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease,
            margin 0.2s ease, box-shadow 0.2s ease;
        }
        .cursor-dot.hover {
          width: 6px;
          height: 6px;
          margin-left: -3px;
          margin-top: -3px;
          box-shadow: 0 0 16px rgba(236, 72, 153, 0.6),
            0 0 24px rgba(244, 63, 94, 0.3);
        }
      `}</style>
      <div
        className={`cursor-effect-wrapper ${isVisible ? "visible" : "hidden"}`}
        aria-hidden="true"
      >
        <div
          ref={cursorRef}
          className={`cursor-ring ${isPointer ? "hover" : ""}`}
        />
        <div
          ref={cursorDotRef}
          className={`cursor-dot ${isPointer ? "hover" : ""}`}
        />
      </div>
    </>
  );
}
