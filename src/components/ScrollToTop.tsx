import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset window scroll on route changes; hash targets are handled per-page. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
