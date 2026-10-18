"use client";

import { useEffect } from "react";

/**
 * Blendet Bereiche mit data-reveal sanft ein, sobald sie ins Bild scrollen.
 *
 * - Was beim Laden schon sichtbar ist, wird nie versteckt (kein Flackern).
 * - Ohne JavaScript oder bei "Bewegung reduzieren" bleibt alles sofort
 *   sichtbar: versteckt wird nur, solange <html> die Klasse reveal-on traegt.
 * - Spaeter eingefuegte Inhalte (Seitenwechsel, Filter) werden ueber einen
 *   MutationObserver ebenfalls erfasst.
 */
export default function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    const vorbereiten = (el: Element) => {
      if (el.hasAttribute("data-reveal-bound")) return;
      el.setAttribute("data-reveal-bound", "");
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-visible");
        return;
      }
      io.observe(el);
    };

    document.querySelectorAll("[data-reveal]").forEach(vorbereiten);
    document.documentElement.classList.add("reveal-on");

    const mo = new MutationObserver((liste) => {
      for (const m of liste) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches("[data-reveal]")) vorbereiten(n);
          n.querySelectorAll("[data-reveal]").forEach(vorbereiten);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
