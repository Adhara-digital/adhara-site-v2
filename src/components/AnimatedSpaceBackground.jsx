import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   ÆTHER / ADHARA — « La Traversée »
   Le scroll propulse la caméra à travers l'univers.

   Architecture des profondeurs :
     · constellation du Grand Chien  → à l'infini (phare, ne se rattrape pas)
     · champ d'étoiles infini        → recyclé en Z (voyage sans fin)
   Uniquement des étoiles : ni nébuleuse, ni planète, ni galaxie.

   DA : noir profond, rouge sang #8F1717, Adhara néon blanche.
   ============================================================ */

/* ---------- Constellation (positions réelles) ---------- */
const CANIS = {
  theta: { x: 0.47, y: 0.00, mag: 4.07 }, muliphein: { x: 0.32, y: 0.18, mag: 4.11 },
  sirius: { x: 0.61, y: 0.23, mag: -1.46 }, iota: { x: 0.44, y: 0.24, mag: 4.37 },
  mirzam: { x: 0.96, y: 0.29, mag: 1.98 }, omicron: { x: 0.47, y: 0.58, mag: 3.02 },
  wezen: { x: 0.25, y: 0.70, mag: 1.83 }, adhara: { x: 0.40, y: 0.83, mag: 1.50, brand: true },
  aludra: { x: 0.00, y: 0.84, mag: 2.45 }, furud: { x: 1.00, y: 0.88, mag: 3.02 }
};
const EDGES = [["sirius", "mirzam"], ["sirius", "theta"], ["sirius", "iota"], ["iota", "omicron"],
["omicron", "wezen"], ["wezen", "aludra"], ["wezen", "adhara"], ["adhara", "furud"], ["muliphein", "theta"]];

const SPREAD = 46;
const DEPTH = 1500;      // distance totale parcourue sur toute la page
const SLAB = 700;        // longueur du pavé d'étoiles recyclé
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- Fabriques de textures ---------- */
function radialTex(stops, size = 128) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
export default function AnimatedSpaceBackground() {
  const ref = useRef(null);
  const veilRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Sans WebGL (vieil appareil, accélération graphique coupée…), on
    // renonce à la 3D au lieu de faire planter tout le site.
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (err) {
      console.warn("WebGL indisponible : rendu 3D désactivé.", err);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.0019);   // dissout les lointains → profondeur
    const camera = new THREE.PerspectiveCamera(58, 1, 0.5, 4000);

    /* ---------- Textures ---------- */
    const dotTex = radialTex([[0, "rgba(255,255,255,1)"], [0.35, "rgba(255,255,255,0.55)"], [1, "rgba(255,255,255,0)"]], 64);
    const starTex = radialTex([[0, "rgba(255,255,255,1)"], [0.26, "rgba(255,226,220,0.88)"], [0.55, "rgba(200,44,40,0.42)"], [1, "rgba(143,23,23,0)"]]);
    const adharaTex = radialTex([[0, "rgba(255,255,255,1)"], [0.22, "rgba(255,238,232,0.96)"], [0.48, "rgba(226,64,52,0.55)"], [1, "rgba(143,23,23,0)"]]);

    /* ============================================================
       1. CHAMP D'ÉTOILES INFINI (3 strates + traînées de vitesse)
       ============================================================ */
    const strata = [];
    function makeStrata(count, spread, size, opacity) {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = rand(-spread, spread);
        pos[i * 3 + 1] = rand(-spread * 0.7, spread * 0.7);
        pos[i * 3 + 2] = rand(-SLAB, 40);
        // typage stellaire : majorité blanc-chaud, tirée vers le rouge ; quelques bleues (O/B)
        const r = Math.random();
        if (r < 0.42) { col[i * 3] = 0.78; col[i * 3 + 1] = 0.22; col[i * 3 + 2] = 0.20; }        // rouge
        else if (r < 0.90) { col[i * 3] = 0.96; col[i * 3 + 1] = 0.90; col[i * 3 + 2] = 0.88; }   // blanc chaud
        else { col[i * 3] = 0.66; col[i * 3 + 1] = 0.76; col[i * 3 + 2] = 1.0; }                  // bleue
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        size, map: dotTex, sizeAttenuation: true, vertexColors: true,
        transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, fog: true
      }));
      scene.add(pts);
      strata.push({ pts, pos, count, spread });
      return pts;
    }
    // comptes allégés : ces strates sont recalculées individuellement
    // à CHAQUE frame (recyclage infini) — garder ce budget raisonnable
    // évite le jank pendant le scroll, surtout combiné au voile de texte.
    makeStrata(1300, 300, 1.6, 0.85);   // lointaines
    makeStrata(800, 190, 2.5, 0.9);     // moyennes
    makeStrata(400, 120, 3.7, 0.95);    // proches

    // Traînées : dessinées seulement en vitesse (effet warp)
    const TRAIL_N = 650;   // n'est calculé que pendant les phases de vitesse (warp > 0.02)
    const trailPos = new Float32Array(TRAIL_N * 6);
    const trailCol = new Float32Array(TRAIL_N * 6);
    const trailSrc = [];
    for (let i = 0; i < TRAIL_N; i++) {
      trailSrc.push({ x: rand(-220, 220), y: rand(-150, 150), z: rand(-SLAB, 40), w: rand(0.45, 1) });
      const c = Math.random() < 0.45 ? [1, 0.34, 0.28] : [1, 0.92, 0.9];
      trailCol.set([c[0], c[1], c[2], 0, 0, 0], i * 6);
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
    const trailMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.LineSegments(trailGeo, trailMat));

    /* ============================================================
       2. CONSTELLATION À L'INFINI (le phare Adhara)
       ============================================================ */
    const nodes = {}; let ni = 0;
    for (const k in CANIS) {
      const s = CANIS[k];
      nodes[k] = new THREE.Vector3((s.x - 0.5) * SPREAD, (0.5 - s.y) * SPREAD * 1.02, ((ni++ * 53) % 13 - 6) * 0.6);
    }
    const sky = new THREE.Group();   // suit la caméra → jamais rattrapée
    scene.add(sky);
    const constel = new THREE.Group();
    sky.add(constel);

    const stars = [];
    const sizeFor = (mag) => Math.max(3.4, Math.min(11, 8 - mag * 1.6));
    for (const k in nodes) {
      const s = CANIS[k], brand = !!s.brand;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: brand ? adharaTex : starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false
      }));
      sp.position.copy(nodes[k]);
      const sz = brand ? 17 : sizeFor(s.mag);
      sp.scale.set(sz, sz, 1);
      sp.userData = { brand, sz, ph: rand(0, 7), tw: rand(0.8, 2.2) };
      constel.add(sp); stars.push(sp);
    }
    const lp = []; for (const [a, b] of EDGES) lp.push(nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z);
    const lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lp), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0xb52a2a, transparent: true, opacity: 0.3, fog: false });
    constel.add(new THREE.LineSegments(lineGeo, lineMat));

    // télémétrie orbitale autour d'Adhara
    const ringGroup = new THREE.Group();
    ringGroup.position.copy(nodes.adhara); ringGroup.rotation.set(1.15, 0.25, 0);
    constel.add(ringGroup);
    const R = 9, rp = []; for (let i = 0; i <= 128; i++) { const a = (i / 128) * 6.283; rp.push(Math.cos(a) * R, Math.sin(a) * R, 0); }
    const ringGeo = new THREE.BufferGeometry(); ringGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(rp), 3));
    ringGroup.add(new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0xff8a80, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, fog: false })));
    const tp = []; for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283, r0 = i % 6 === 0 ? R - 1.6 : R - 0.8; tp.push(Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a) * (R + 0.5), Math.sin(a) * (R + 0.5), 0); }
    const tickGeo = new THREE.BufferGeometry(); tickGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tp), 3));
    ringGroup.add(new THREE.LineSegments(tickGeo, new THREE.LineBasicMaterial({ color: 0xc73030, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, fog: false })));
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    marker.scale.set(3, 3, 1); ringGroup.add(marker);

    /* ============================================================
       Pilotage : scroll → avancée, vitesse → warp
       ============================================================ */
    let target = 0, prog = 0, speed = 0, warp = 0;
    const pointer = { x: 0, y: 0 }, look = { x: 0, y: 0 };

    function readScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      target = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    }
    const onScroll = readScroll;
    const onMove = (e) => { pointer.x = e.clientX / window.innerWidth - 0.5; pointer.y = e.clientY / window.innerHeight - 0.5; };
    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      const small = window.innerWidth < 760;
      constel.position.set(small ? 0 : 17, small ? 14 : 3, 0);
      constel.scale.setScalar(small ? 0.82 : 1);
    };

    /* ---------- Boucle ---------- */
    const clock = new THREE.Clock();
    let t = 0, raf;
    function animate() {
      const dt = Math.min(0.05, clock.getDelta()); t += dt;

      // avancée lissée + vitesse instantanée
      const prev = prog;
      prog += (target - prog) * (reduce ? 1 : 0.062);
      const inst = Math.abs(prog - prev) / Math.max(dt, 0.001);
      speed += (inst - speed) * 0.18;
      warp += (Math.min(1, speed * 2.6) - warp) * 0.1;
      if (reduce) { warp = 0; }

      // caméra : plongée le long de -Z + regard libre à la souris
      const camZ = 60 - prog * DEPTH;
      look.x += (pointer.x - look.x) * 0.045;
      look.y += (pointer.y - look.y) * 0.045;
      camera.position.set(look.x * 26, -look.y * 18, camZ);
      const fov = 58 + warp * 13;                       // le champ s'ouvre dans la vitesse
      if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
      camera.lookAt(look.x * 26 + look.x * 40, -look.y * 18 - look.y * 30, camZ - 100);
      camera.rotation.z = -look.x * 0.07 - warp * 0.03; // roulis APRÈS lookAt (sinon écrasé)

      // ---- étoiles : recyclage infini autour de la caméra ----
      for (const s of strata) {
        const p = s.pos;
        for (let i = 0; i < s.count; i++) {
          const zi = i * 3 + 2;
          const dz = p[zi] - camZ;
          if (dz > 60) { p[zi] -= SLAB; p[i * 3] = rand(-s.spread, s.spread); p[i * 3 + 1] = rand(-s.spread * 0.7, s.spread * 0.7); }
          else if (dz < 60 - SLAB) { p[zi] += SLAB; }
        }
        s.pts.geometry.attributes.position.needsUpdate = true;
      }

      // ---- traînées de vitesse ----
      trailMat.opacity = warp * 0.55;
      if (warp > 0.02) {
        const len = 6 + warp * 130;
        for (let i = 0; i < TRAIL_N; i++) {
          const s = trailSrc[i];
          let dz = s.z - camZ;
          if (dz > 40) { s.z -= SLAB; s.x = rand(-220, 220); s.y = rand(-150, 150); dz = s.z - camZ; }
          else if (dz < 40 - SLAB) { s.z += SLAB; dz = s.z - camZ; }
          const o = i * 6;
          trailPos[o] = s.x; trailPos[o + 1] = s.y; trailPos[o + 2] = s.z;
          trailPos[o + 3] = s.x; trailPos[o + 4] = s.y; trailPos[o + 5] = s.z + len * s.w;
        }
        trailGeo.attributes.position.needsUpdate = true;
      }

      // ---- ciel : la constellation reste à l'infini devant nous ----
      sky.position.z = camZ - 300;
      sky.rotation.y = -look.x * 0.10 + prog * 0.22;    // le point de vue tourne au fil du voyage
      sky.rotation.x = look.y * 0.05;
      for (const sp of stars) {
        const u = sp.userData;
        if (u.brand) {
          const p2 = reduce ? 1 : 1 + Math.sin(t * 3) * 0.14;
          sp.scale.set(u.sz * p2, u.sz * p2, 1);
          sp.material.opacity = 1 - warp * 0.25;
        } else {
          const tw = reduce ? 1 : 0.7 + 0.3 * Math.sin(t * u.tw + u.ph);
          sp.material.opacity = tw * (1 - warp * 0.45);
        }
      }
      lineMat.opacity = 0.3 * (1 - warp * 0.85);
      if (!reduce) { ringGroup.rotation.z += 0.13 * dt; const a = t * 0.6; marker.position.set(Math.cos(a) * R, Math.sin(a) * R, 0); }

      // voile de vitesse (CSS)
      if (veilRef.current) veilRef.current.style.opacity = String(warp * 0.55);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    readScroll(); prog = target; resize(); animate();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="starfield" aria-hidden="true" />
      <div ref={veilRef} className="warpveil" aria-hidden="true" />
    </>
  );
}
