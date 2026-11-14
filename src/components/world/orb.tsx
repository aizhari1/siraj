"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

type Pose = { x: number; y: number; s: number; d: number; r: number; o: number; shape: number };
const POSES: Record<string, Pose> = {
  hero: { x: 1.9, y: 0, s: 1, d: 0.28, r: 0.18, o: 1, shape: 0 },
  services: { x: 1.9, y: 0, s: 0.9, d: 0.2, r: 0.3, o: 1, shape: 0 },
  projects: { x: 0, y: 0.2, s: 0.55, d: 0.12, r: 0.1, o: 0.5, shape: 3 },
  stats: { x: -1.9, y: 0, s: 0.8, d: 0.3, r: 0.25, o: 1, shape: 4 },
  process: { x: 1.9, y: 0, s: 0.7, d: 0.16, r: 0.2, o: 0.9, shape: 5 },
  cta: { x: 0, y: 0, s: 1.5, d: 0.32, r: 0.15, o: 0.85, shape: 0 },
  page: { x: 2.2, y: 0.4, s: 0.7, d: 0.14, r: 0.12, o: 0.55, shape: 0 },
};

const VS = "uniform float t,d;varying vec3 n,v;void main(){n=normalize(normalMatrix*normal);vec3 p=position+normal*sin(position.x*3.+t)*sin(position.y*3.+t*1.3)*sin(position.z*3.+t*.7)*d;vec4 m=modelViewMatrix*vec4(p,1.);v=-m.xyz;gl_Position=projectionMatrix*m;}";
const FS_BODY = "uniform vec3 a,b;varying vec3 n,v;void main(){float f=pow(1.-max(dot(normalize(n),normalize(v)),0.),2.2);gl_FragColor=vec4(mix(a*.16,b,f)+a*f*.7,.6+f*.4);}";
const FS_WIRE = "uniform vec3 b;void main(){gl_FragColor=vec4(b,.2);}";

/** One WebGL scene for the whole site. Each section declares a pose with data-orb="hero|services|…";
 *  the orb glides there, and hovering a service card morphs it into that service's shape. */
export default function Orb() {
  const pathname = usePathname();

  // Choose the pose from whichever [data-orb] section is under the middle of the screen
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("siraj:pose", { detail: "page" }));
    const els = new Set<Element>();
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) window.dispatchEvent(new CustomEvent("siraj:pose", { detail: (e.target as HTMLElement).dataset.orb })); }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    const scan = () => document.querySelectorAll("[data-orb]").forEach((el) => { if (!els.has(el)) { els.add(el); io.observe(el); } });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  useEffect(() => {
    const canvas = document.getElementById("orb-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const mob = window.innerWidth < 768;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, alpha: true, powerPreference: "low-power" }); }
    catch { document.getElementById("orb-fallback")?.setAttribute("data-on", "1"); return; }

    const css = getComputedStyle(document.documentElement);
    const U = {
      t: { value: 0 }, d: { value: 0.25 },
      a: { value: new THREE.Color(css.getPropertyValue("--color-brand").trim() || "#8B5CF6") },
      b: { value: new THREE.Color(css.getPropertyValue("--color-brand-light").trim() || "#C4B5FD") },
    };
    const solid = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS_BODY, transparent: true });
    const wire = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS_WIRE, transparent: true, wireframe: true });
    const geos = [
      new THREE.IcosahedronGeometry(1.3, mob ? 5 : 9), new THREE.BoxGeometry(1.7, 1.7, 1.7, 9, 9, 9), new THREE.ConeGeometry(1.2, 2.3, 48, 14),
      new THREE.TorusKnotGeometry(0.85, 0.28, mob ? 90 : 160, 18), new THREE.OctahedronGeometry(1.5, mob ? 4 : 7), new THREE.TorusGeometry(1.1, 0.42, 22, 60),
    ];
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    cam.position.z = 6;
    const group = new THREE.Group();
    const kids = geos.map((g) => { const o = new THREE.Group(); o.add(new THREE.Mesh(g, solid), new THREE.Mesh(g, wire)); o.scale.setScalar(0.0001); group.add(o); return o; });
    scene.add(group);

    const N = mob ? 450 : 1300, arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 4.5, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th); arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); arr[i * 3 + 2] = r * Math.cos(ph);
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    const pm = new THREE.PointsMaterial({ color: U.b.value, size: 0.022, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false });
    const points = new THREE.Points(pg, pm); scene.add(points);

    let pose = "page", override: number | null = null, px = 0, py = 0, vel = 0, lastY = window.scrollY, dd = 0.25, scl = 0.7;
    const pos = [0, 0], sk = [1, 0, 0, 0, 0, 0];
    const onPose = (e: Event) => { pose = String((e as CustomEvent).detail || "page"); if (reduced) settle(); };
    const onShape = (e: Event) => { override = (e as CustomEvent).detail ?? null; if (reduced) settle(); };
    const onMove = (e: PointerEvent) => { px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener("siraj:pose", onPose); window.addEventListener("siraj:shape", onShape);
    window.addEventListener("pointermove", onMove, { passive: true });

    function fit() {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mob ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix();
    }
    function frame() {
      const p = POSES[pose] ?? POSES.page;
      const side = document.documentElement.dir === "rtl" ? -1 : 1;
      const want = pose === "services" && override !== null ? override + 1 : p.shape;
      for (let i = 0; i < 6; i++) { sk[i] += ((i === want ? 1 : 0) - sk[i]) * 0.09; kids[i].scale.setScalar(Math.max(sk[i], 0.0001)); }
      const tx = mob ? 0 : p.x * side, ty = mob ? (pose === "projects" ? 0.2 : 1.15) : p.y, ts = mob ? p.s * 0.62 : p.s;
      pos[0] += (tx - pos[0]) * 0.06; pos[1] += (ty - pos[1]) * 0.06; scl += (ts - scl) * 0.06;
      group.position.set(pos[0], pos[1], 0); group.scale.setScalar(scl);
      dd += (Math.min(p.d + vel * 0.006, 0.6) - dd) * 0.08; U.d.value = dd;
      kids.forEach((o, i) => { if (sk[i] > 0.01) { o.rotation.y += p.r * 0.012; o.rotation.x = py * 0.5 + Math.sin(U.t.value * 0.3) * 0.1; } });
      group.rotation.y += (px * 0.6 - group.rotation.y) * 0.05; points.rotation.y += 0.0006 * (1 + vel * 0.05);
      canvas!.style.opacity = String(p.o * (mob ? 0.8 : 1));
      renderer.render(scene, cam);
    }
    function settle() { for (let i = 0; i < 80; i++) frame(); }

    fit(); window.addEventListener("resize", fit);
    let raf = 0, last = performance.now();
    if (reduced) settle();
    else {
      const loop = (n: number) => {
        raf = requestAnimationFrame(loop);
        U.t.value += (n - last) / 1000; last = n;
        vel += (Math.min(Math.abs(window.scrollY - lastY), 60) - vel) * 0.15; lastY = window.scrollY;
        frame();
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("siraj:pose", onPose); window.removeEventListener("siraj:shape", onShape);
      window.removeEventListener("pointermove", onMove); window.removeEventListener("resize", fit);
      geos.forEach((g) => g.dispose()); solid.dispose(); wire.dispose(); pg.dispose(); pm.dispose(); renderer.dispose();
    };
  }, []);

  return null;
}
