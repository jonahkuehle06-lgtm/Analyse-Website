"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bewegung fuer den Kerzenchart im Kopfbereich (siehe CandleChart).
 *
 * - Die blassen Kerzen bauen sich von links nach rechts auf - am Telefon
 *   erst, wenn der Chart ins Bild kommt (dort liegt er beim Laden unter
 *   der Falz).
 * - Beim Scrollen bzw. Wischen laeuft eine weiche Lichtkante von links
 *   nach rechts ueber die Kerzen und laesst sie nacheinander in Weiss und
 *   Platin aufleuchten; beim Zurueckscrollen verblassen sie wieder. Eine
 *   feine Abtastlinie markiert die Kante.
 * - Die letzte Kerze lebt: ihr Schlusskurs zuckt ab und zu ein Stueck auf
 *   oder ab, die gestrichelte Kurslinie folgt, der Punkt am Ende pulsiert.
 *   Nur solange der Chart zu sehen ist.
 *
 * Je Bild wird einmal gemessen und nur die Lage zweier Ebenen gesetzt - die
 * Kerzen selbst werden nie neu gezeichnet. Ohne JavaScript bleibt der Chart
 * blass und ruhig; bei "Bewegung reduzieren" entfallen Aufbau, Abtastlinie
 * und lebende Kerze, das Aufleuchten folgt direkt dem Scrollen.
 */

type Fassung = {
  rahmen: HTMLElement;
  aufbau: HTMLElement;
  licht: HTMLElement;
  lichtInnen: HTMLElement;
  abtaster: HTMLElement | null;
  punkt: HTMLElement | null;
  /** Unverschobene oberste Ebene - Bezug fuer die Umrechnung */
  bezug: SVGSVGElement;
  /** Nur lebende Kerze und Kurslinie bekommen --dy, nicht das ganze SVG */
  live: SVGGElement | null;
  kurslinie: SVGGElement | null;
  ring: SVGCircleElement | null;
  /** Mitte und Schlusskurs je Kerze, in Einheiten des Zeichenbereichs */
  mitte: number[];
  schluss: number[];
  halb: number;
  xLive: number;
  liveHoehe: number;
  /** Gemessen, in Pixeln relativ zur Fassung: x = a * u + b, y = d * u + c */
  breite: number;
  kante: number;
  a: number;
  b: number;
  d: number;
  c: number;
  /** Erste deutlich sichtbare Kerze und Weg der Lichtkante */
  erste: number;
  von: number;
  bis: number;
  /** Aktuelle, sanft nachgezogene Lage der Lichtkante */
  kanteX: number | null;
  voll: boolean;
};

function fassung(rahmen: HTMLElement): Fassung | null {
  const aufbau = rahmen.querySelector<HTMLElement>(".kz-aufbau");
  const licht = rahmen.querySelector<HTMLElement>(".kz-licht");
  const lichtInnen = licht?.querySelector<HTMLElement>(":scope > .kz-innen");
  const bezug = rahmen.querySelector<SVGSVGElement>("svg.kz-live");
  if (!aufbau || !licht || !lichtInnen || !bezug) return null;

  // Lage der Kerzen aus den Angaben des Servers (alle ausser der lebenden)
  const schritt = Number(rahmen.dataset.schritt);
  const schluss = (rahmen.dataset.schluss ?? "").split(",").map(Number);
  const mitte = schluss.map((_, i) => (i + 0.5) * schritt);
  const halb = Number(rahmen.dataset.breite) / 2;
  const live = bezug.querySelector<SVGGElement>(".kerze-live");
  const abtaster = rahmen.querySelector<HTMLElement>(".abtaster");

  return {
    rahmen,
    aufbau,
    licht,
    lichtInnen,
    abtaster,
    punkt: abtaster?.querySelector<HTMLElement>(".abtaster-punkt") ?? null,
    bezug,
    live,
    kurslinie: bezug.querySelector<SVGGElement>(".kurslinie"),
    ring: bezug.querySelector<SVGCircleElement>(".kurspunkt-ring"),
    mitte,
    schluss,
    halb,
    xLive: Number(live?.getAttribute("data-x") ?? 0),
    liveHoehe: live?.querySelector<SVGRectElement>(".koerper")?.height.baseVal.value ?? 0,
    breite: 0,
    kante: 0,
    a: 1,
    b: 0,
    d: 1,
    c: 0,
    erste: 0,
    von: 0,
    bis: 0,
    kanteX: null,
    voll: false,
  };
}

export default function CandleChartMotion({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const huelle = ref.current;
    if (!huelle) return;
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fassungen = Array.from(huelle.querySelectorAll<HTMLElement>("[data-kerzen]"))
      .map(fassung)
      .filter((f): f is Fassung => f !== null);
    if (fassungen.length === 0 || fassungen.some((f) => f.mitte.length < 2)) return;

    /** Die angezeigte Fassung - die andere ist per CSS ausgeblendet. */
    let aktiv: Fassung | null = null;

    /** Nur bei Groessenaenderung: Fassung, Umrechnung, Weg der Lichtkante */
    const messen = () => {
      aktiv = null;
      for (const f of fassungen) {
        const box = f.rahmen.getBoundingClientRect();
        const ctm = f.bezug.getScreenCTM();
        if (!ctm || box.width === 0) continue;
        aktiv = f;
        f.breite = box.width;
        f.kante = parseFloat(getComputedStyle(f.rahmen).getPropertyValue("--kante")) || 44;
        f.a = ctm.a;
        f.b = ctm.e - box.left;
        f.d = ctm.d;
        f.c = ctm.f - box.top;
        // Links laeuft der Chart weich aus - die Kante startet dort, wo die
        // Kerzen deutlich zu sehen sind, und endet hinter der lebenden
        const ab = box.width * 0.08;
        f.erste = Math.max(0, f.mitte.findIndex((x) => f.a * x + f.b >= ab));
        f.von = f.a * (f.mitte[f.erste] - f.halb) + f.b - f.kante / 2;
        f.bis = f.a * (f.xLive + f.halb) + f.b + f.kante / 2;
        f.kanteX = null;
      }
    };

    // Ein Puls je Kursbewegung: zwei gleiche Animationen im Wechsel
    let pulsA = false;
    const pulsieren = (f: Fassung) => {
      if (!f.ring || ruhig) return;
      pulsA = !pulsA;
      f.ring.classList.toggle("puls-a", pulsA);
      f.ring.classList.toggle("puls-b", !pulsA);
    };

    // Waehrend des Aufbaus noch keine Abtastlinie - sie liefe sonst ueber
    // Kerzen, die noch gar nicht stehen
    let baut = false;
    const aufbauVerfolgen = (f: Fassung | null) => {
      // getAnimations fehlt nur in sehr alten Browsern - dann ohne Warten
      const laeufe =
        f && typeof f.aufbau.getAnimations === "function" ? f.aufbau.getAnimations() : [];
      baut = laeufe.length > 0;
      if (!baut) return;
      Promise.all(laeufe.map((l) => l.finished)).then(
        () => {
          baut = false;
          anfordern();
        },
        () => {},
      );
    };

    let bild = 0;
    const aktualisieren = () => {
      bild = 0;
      const f = aktiv;
      if (!f) return;

      // Fortschritt 0..1: beginnt, sobald der Chart gut im Bild ist (am
      // Desktop sofort mit dem ersten Scrollen), und ist fertig, bevor die
      // oberen Kerzen unter der Kopfzeile verschwinden
      const r = f.rahmen.getBoundingClientRect();
      const vh = document.documentElement.clientHeight || window.innerHeight;
      const mitteDok = r.top + window.scrollY + r.height / 2;
      const start = Math.max(0, mitteDok - 0.9 * vh);
      const ende = Math.max(start + 0.25 * vh, mitteDok - 0.4 * vh);
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / (ende - start)));

      // Lichtkante sanft nachziehen - glaettet die Spruenge des Mausrads
      const ziel = f.von + p * (f.bis - f.von);
      let x = f.kanteX === null || ruhig ? ziel : f.kanteX + (ziel - f.kanteX) * 0.3;
      if (Math.abs(ziel - x) < 0.5) x = ziel;
      f.kanteX = x;
      const t = x - f.breite - f.kante / 2;
      f.licht.style.transform = `translate3d(${t.toFixed(1)}px, 0, 0)`;
      f.lichtInnen.style.transform = `translate3d(${(-t).toFixed(1)}px, 0, 0)`;
      if (x !== ziel) anfordern();

      // Die lebende Kerze leuchtet, sobald die Kante sie erreicht
      const voll = x >= f.a * f.xLive + f.b;
      if (voll !== f.voll) {
        f.voll = voll;
        f.rahmen.classList.toggle("voll", voll);
        if (voll) pulsieren(f);
      }

      if (!ruhig && f.abtaster && f.punkt) {
        const laeuft = p > 0 && p < 1 && !baut;
        f.rahmen.classList.toggle("abtasten", laeuft);
        if (laeuft) {
          f.abtaster.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
          // Punkt auf dem Schlusskurs der Kerze unter der Kante
          const u = (x - f.b) / f.a;
          const schritt = f.mitte[1] - f.mitte[0];
          const i = Math.min(
            f.mitte.length - 1,
            Math.max(f.erste, Math.round((u - f.mitte[0]) / schritt)),
          );
          f.punkt.style.transform = `translate3d(0, ${(f.d * f.schluss[i] + f.c).toFixed(1)}px, 0)`;
        }
      }
    };
    function anfordern() {
      if (!bild) bild = requestAnimationFrame(aktualisieren);
    }

    // Lebende letzte Kerze: der Schlusskurs zuckt in unregelmaessigen
    // Abstaenden ein Stueck auf oder ab (hoechstens 7 px)
    let takt = 0;
    const ticken = () => {
      const f = aktiv;
      if (f?.live && f.liveHoehe > 0) {
        const einheit = f.d > 0 ? 1 / f.d : 1;
        const hoch = 7 * einheit;
        const runter = Math.min(5 * einheit, f.liveHoehe * 0.55);
        const dy = (-hoch + Math.random() * (hoch + runter)).toFixed(2);
        f.live.style.setProperty("--dy", dy);
        f.kurslinie?.style.setProperty("--dy", dy);
        if (f.voll) pulsieren(f);
      }
      takt = window.setTimeout(ticken, 1600 + Math.random() * 1600);
    };
    const tickenAn = () => {
      if (!takt && !ruhig) takt = window.setTimeout(ticken, 2200);
    };
    const tickenAus = () => {
      window.clearTimeout(takt);
      takt = 0;
    };

    messen();

    // Aufbau zurueckhalten, solange der Chart noch nicht zu sehen ist
    let wartet = false;
    if (!ruhig) {
      const r = huelle.getBoundingClientRect();
      const vh = document.documentElement.clientHeight || window.innerHeight;
      wartet = r.top > vh * 0.92;
      if (wartet) {
        fassungen.forEach((f) => f.rahmen.classList.add("aufbau-wartet"));
        baut = true;
      }
    }
    if (!wartet) aufbauVerfolgen(aktiv);

    const sicht = new IntersectionObserver(
      ([e]) => {
        if (wartet && e.intersectionRatio >= 0.25) {
          wartet = false;
          fassungen.forEach((f) => f.rahmen.classList.remove("aufbau-wartet"));
          aufbauVerfolgen(aktiv);
        }
        if (e.isIntersecting) tickenAn();
        else tickenAus();
      },
      { threshold: [0, 0.25] },
    );
    sicht.observe(huelle);

    const groesse = new ResizeObserver(() => {
      messen();
      anfordern();
    });
    groesse.observe(huelle);

    aktualisieren();
    window.addEventListener("scroll", anfordern, { passive: true });
    window.addEventListener("resize", anfordern, { passive: true });

    return () => {
      window.removeEventListener("scroll", anfordern);
      window.removeEventListener("resize", anfordern);
      cancelAnimationFrame(bild);
      tickenAus();
      sicht.disconnect();
      groesse.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}
