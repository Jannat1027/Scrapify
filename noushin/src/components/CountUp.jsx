import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1300;

// A number that counts up from 0 when it first scrolls into view, e.g. 0 -> 2,180.
export default function CountUp({ value, suffix = "", className = "" }) {
  const [shown, setShown] = useState(0);
  const elementRef = useRef(null);

  useEffect(() => {
    let frameId = null;

    function animate() {
      const startTime = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - startTime) / DURATION_MS);
        const eased = 1 - (1 - progress) ** 3; // fast at first, slow at the end
        setShown(Math.round(value * eased));
        if (progress < 1) frameId = requestAnimationFrame(tick);
      }
      frameId = requestAnimationFrame(tick);
    }

    // Wait until the number is on screen before counting.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        animate();
      }
    });
    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [value]);

  return (
    <span ref={elementRef} className={className}>
      {`${shown.toLocaleString("en-IN")}${suffix}`}
    </span>
  );
}
