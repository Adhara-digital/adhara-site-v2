import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ============================================================
   Repère 3D pour la section "À propos" — remplace l'anneau
   orbital plat par un vrai volume : un polyèdre géométrique
   (le cœur) entouré d'un réseau de nœuds connectés façon
   circuit/neurones (même langage visuel blanc que le logo
   Adhara), avec quelques nœuds "actifs" qui s'illuminent en
   rouge — écho de l'étoile Adhara.
   ============================================================ */

function softDotTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.5)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function glowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,225,220,0.9)");
  grd.addColorStop(0.5, "rgba(199,48,42,0.55)");
  grd.addColorStop(1, "rgba(143,23,23,0)");
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// répartition régulière de points sur une sphère (spirale de Fibonacci)
function fibonacciSphere(count, radius) {
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
  }
  return pts;
}

export default function AboutNeuralOrb() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const dot = softDotTexture();
    const glow = glowTexture();

    /* ---------- cœur : polyèdre géométrique (icosaèdre) ---------- */
    const core = new THREE.Group();
    scene.add(core);
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 0);
    const coreEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(coreGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    core.add(coreEdges);
    // sommets du polyèdre, légèrement marqués
    const coreVerts = new THREE.Points(
      coreGeo,
      new THREE.PointsMaterial({ size: 0.09, map: dot, color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, sizeAttenuation: true })
    );
    core.add(coreVerts);

    /* ---------- réseau : nœuds + liens façon circuit/neurones ---------- */
    const network = new THREE.Group();
    scene.add(network);
    const NODE_COUNT = 30;
    const nodePts = fibonacciSphere(NODE_COUNT, 2.25);
    const activeIdx = new Set();
    while (activeIdx.size < 4) activeIdx.add(Math.floor(Math.random() * NODE_COUNT));

    // nœuds (sprites)
    const plainNodes = [];
    const glowNodes = [];
    nodePts.forEach((p, i) => {
      if (activeIdx.has(i)) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
        sp.position.copy(p);
        sp.scale.set(0.55, 0.55, 1);
        sp.userData = { base: p.clone(), phase: Math.random() * Math.PI * 2 };
        network.add(sp);
        glowNodes.push(sp);
      } else {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false }));
        sp.position.copy(p);
        sp.scale.set(0.16, 0.16, 1);
        network.add(sp);
        plainNodes.push(sp);
      }
    });

    // liens : chaque nœud relié à ses 2 plus proches voisins
    const linePts = [];
    const seen = new Set();
    nodePts.forEach((p, i) => {
      const dists = nodePts
        .map((q, j) => (j === i ? null : { j, d: p.distanceTo(q) }))
        .filter(Boolean)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      dists.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        linePts.push(p.x, p.y, p.z, nodePts[j].x, nodePts[j].y, nodePts[j].z);
      });
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePts), 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }));
    network.add(lines);

    /* ---------- redimensionnement ---------- */
    function resize() {
      const w = canvas.clientWidth || canvas.parentElement.clientWidth;
      const h = canvas.clientHeight || canvas.parentElement.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    /* ---------- boucle ---------- */
    const clock = new THREE.Clock();
    let raf;
    function animate() {
      const dt = Math.min(0.05, clock.getDelta());
      if (!reduce) {
        core.rotation.y += 0.12 * dt;
        core.rotation.x += 0.05 * dt;
        network.rotation.y -= 0.07 * dt;
        network.rotation.x += 0.03 * dt;
        const t = clock.elapsedTime;
        glowNodes.forEach((sp) => {
          const pulse = 1 + Math.sin(t * 1.8 + sp.userData.phase) * 0.28;
          sp.scale.set(0.55 * pulse, 0.55 * pulse, 1);
          sp.material.opacity = 0.75 + Math.sin(t * 1.8 + sp.userData.phase) * 0.25;
        });
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }

    resize();
    animate();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="about__mark-canvas" aria-hidden="true" />;
}
