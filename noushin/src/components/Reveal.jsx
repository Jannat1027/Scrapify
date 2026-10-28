import { useEffect, useRef, useState } from "react";

// Fades its content in the first time it scrolls into view.
//   from:  "up" (default), "left", "right", "zoom", "flip", "scatter" or "line"
//   delay: milliseconds to wait, used to make cards appear one after another
//   style: extra CSS variables, e.g. the --x/--y/--r start offset for "scatter"
//   as:    which HTML tag to render ("div" by default, "li" inside lists)
// Where each kind of entrance starts. --x/--y/--r come from the style prop for "scatter".
const START_POSITION = {
  up: "[--from:translateY(32px)]",
  left: "[--from:translateX(-90px)_rotate(-2deg)]",
  right: "[--from:translateX(90px)_rotate(2deg)]",
  zoom: "[--from:scale(.8)]",
  flip: "origin-bottom [--from:perspective(900px)_rotateX(40deg)_translateY(40px)]",
  scatter: "[--from:translate(var(--x),var(--y))_rotate(var(--r))_scale(.85)]",
  line: "",
};
const REVEAL_CLASSES =
  // --delay sits inside the shorthand: a separate transition-delay class would be reset by it.
  "[transition:opacity_.8s_ease_var(--delay,0ms),transform_1s_cubic-bezier(.2,.8,.2,1)_var(--delay,0ms)] motion-reduce:!opacity-100 motion-reduce:![transform:none]";

export default function Reveal({ from = "up", delay = 0, className = "", style = {}, as: Tag = "div", children, ...otherProps }) {
  const [visible, setVisible] = useState(false);
  const [arrived, setArrived] = useState(false);
  const elementRef = useRef(null);

  // IntersectionObserver tells us when the element scrolls into view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  // Once the entrance has finished, drop the reveal styles so hover effects aren't delayed or slowed.
  function handleTransitionEnd(event) {
    if (visible && event.target === event.currentTarget) setArrived(true);
  }

  // "in" marks a revealed element, so children can react to it (e.g. the How it works timeline).
  const HIDDEN = from === "line" ? "" : "opacity-0 [transform:var(--from)]";
  const classes = arrived ? `in ${className}` : `${REVEAL_CLASSES} ${START_POSITION[from]} ${visible ? "in" : HIDDEN} ${className}`;
  return (
    <Tag
      ref={elementRef}
      className={classes}
      style={{ ...style, "--delay": `${delay}ms` }}
      onTransitionEnd={handleTransitionEnd}
      {...otherProps}
    >
      {children}
    </Tag>
  );
}
