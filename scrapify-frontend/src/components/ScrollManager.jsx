import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router changes pages without reloading, so the browser no longer scrolls for us.
// This scrolls to the top on every new page, or to the #section named in the link (like /operator#top).
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Wait one moment so the new page has rendered the element we want.
    const timer = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null; // it shows nothing on screen
}
