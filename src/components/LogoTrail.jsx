import { useEffect, useRef, useState } from "react";

/* ============================================================
   Tracé du logo à travers le site
   Les nœuds du logo sont des éléments [data-logo-node] répartis dans
   les sections (A, B, C = les 3 apps en triangle ; S = l'étoile
   Adhara ; J = l'embranchement ; R et D = les deux « jambes »).
   Ce calque SVG relie leurs centres avec la même topologie que le
   logo, et chaque trait se dessine au fil du scroll. Un nœud
   s'allume (.is-lit) quand la ligne de balayage l'atteint.
   ============================================================ */
// Le logo complet : le triangle des offres, le point rouge (Proserpine),
// l'embranchement (À propos), puis les deux jambes (les fondateurs).
const EDGES = [["A", "B"], ["A", "C"], ["B", "C"], ["C", "S"], ["S", "J"], ["J", "R"], ["J", "D"]];
const SCAN = 0.62;        // ligne de balayage : 62 % de la hauteur d'écran
const MIN_SPAN = 260;     // longueur de scroll minimale pour dessiner un trait

export default function LogoTrail() {
  const svgRef = useRef(null);
  const [geo, setGeo] = useState({ w: 0, h: 0, lines: [] });
  const lineRefs = useRef([]);
  const nodesRef = useRef([]);

  // ---- mesure des positions (au montage, resize, changement de taille du contenu)
  useEffect(() => {
    const host = svgRef.current.parentElement;
    let raf = 0;
    const measure = () => {
      // positions de mise en page (offset*) : ignorent les transform CSS,
      // donc insensibles au fondu .reveal (translateY) et aux hovers.
      const pts = {};
      const els = [...host.querySelectorAll("[data-logo-node]")];
      els.forEach((el) => {
        let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
        while (n && n !== host) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
        pts[el.dataset.logoNode] = { x, y };
      });
      nodesRef.current = els.map((el) => ({ el, y: pts[el.dataset.logoNode].y }));
      const lines = EDGES.filter(([a, b]) => pts[a] && pts[b]).map(([a, b]) => {
        let p = pts[a], q = pts[b];
        if (q.y < p.y) [p, q] = [q, p];          // on dessine toujours de haut en bas
        return { x1: p.x, y1: p.y, x2: q.x, y2: q.y, len: Math.hypot(q.x - p.x, q.y - p.y) };
      });
      setGeo({ w: host.scrollWidth, h: host.scrollHeight, lines });
    };
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(host);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener("resize", schedule); };
  }, []);

  // ---- dessin progressif au scroll
  useEffect(() => {
    const host = svgRef.current.parentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const scanY = window.innerHeight * SCAN - host.getBoundingClientRect().top;
      geo.lines.forEach((l, i) => {
        const span = Math.max(l.y2 - l.y1, MIN_SPAN);
        const f = Math.min(1, Math.max(0, (scanY - l.y1) / span));
        const g = lineRefs.current[i];
        if (g) g.forEach((path) => path && (path.style.strokeDashoffset = String(l.len * (1 - f))));
      });
      nodesRef.current.forEach((n) => n.el.classList.toggle("is-lit", scanY >= n.y - 4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [geo]);

  return (
    <svg ref={svgRef} className="logotrail" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w || 1} ${geo.h || 1}`} aria-hidden="true">
      <defs>
        <filter id="logotrail-glow" filterUnits="userSpaceOnUse" x="-100" y="-100" width={geo.w + 200} height={geo.h + 200}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="logotrail-halo" filterUnits="userSpaceOnUse" x="-100" y="-100" width={geo.w + 200} height={geo.h + 200}>
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      {geo.lines.map((l, i) => {
        lineRefs.current[i] = lineRefs.current[i] || [];
        const common = { x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, strokeDasharray: l.len, strokeDashoffset: l.len };
        return (
          <g key={i}>
            {/* rail fantôme : le chemin complet, à peine visible */}
            <line {...common} className="logotrail__rail" strokeDasharray="none" strokeDashoffset="0" />
            <line {...common} className="logotrail__halo" filter="url(#logotrail-halo)" ref={(el) => (lineRefs.current[i][0] = el)} />
            <line {...common} className="logotrail__glow" filter="url(#logotrail-glow)" ref={(el) => (lineRefs.current[i][1] = el)} />
            <line {...common} className="logotrail__core" ref={(el) => (lineRefs.current[i][2] = el)} />
          </g>
        );
      })}
    </svg>
  );
}
