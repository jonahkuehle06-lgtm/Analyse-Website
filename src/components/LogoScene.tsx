"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Die PAX-Bildmarke als 3D-Modell, das langsam schwebt.
 *
 * three.js und das Modell werden erst geladen, wenn der Abschnitt in den
 * sichtbaren Bereich kommt - so belastet die Marke den ersten Seitenaufbau
 * nicht. Ist im System "Bewegung reduzieren" eingestellt, steht das Modell
 * still; fehlt WebGL, bleibt die Flaeche einfach leer.
 */
export default function LogoScene() {
  const host = useRef<HTMLDivElement>(null);
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) {
          setSichtbar(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!sichtbar || !host.current) return;
    const el = host.current;
    let abgebrochen = false;
    let aufraeumen: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (abgebrochen) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // kein WebGL - Flaeche bleibt leer
      }

      const breite = () => el.clientWidth || 1;
      const hoehe = () => el.clientHeight || 1;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(breite(), hoehe());
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, breite() / hoehe(), 0.1, 100);
      camera.position.set(0, 0, 6);

      // Spiegelungen - ohne sie wirkt Metall flach
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xc8ced6, 1.4);
      rim.position.set(-4, -1, -3);
      scene.add(rim);

      const gruppe = new THREE.Group();
      scene.add(gruppe);

      const materialien: Record<string, InstanceType<typeof THREE.MeshStandardMaterial>> = {
        tile_frame: new THREE.MeshStandardMaterial({
          color: 0x9aa1aa,
          metalness: 1,
          roughness: 0.28,
        }),
        monogram_P: new THREE.MeshStandardMaterial({
          color: 0xf2f4f6,
          metalness: 0.85,
          roughness: 0.16,
        }),
        monogram_backfill: new THREE.MeshStandardMaterial({
          color: 0x14171b,
          metalness: 0.5,
          roughness: 0.55,
        }),
      };

      const loader = new GLTFLoader();
      loader.load(
        "/pax-logo.glb",
        (gltf) => {
          if (abgebrochen) return;

          gltf.scene.traverse((kind) => {
            const mesh = kind as InstanceType<typeof THREE.Mesh>;
            if (!mesh.isMesh) return;
            const m = materialien[mesh.name] ?? materialien.tile_frame;
            mesh.material = m;
          });

          // Auf eine sinnvolle Groesse bringen und zentrieren
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const groesse = box.getSize(new THREE.Vector3());
          const mitte = box.getCenter(new THREE.Vector3());
          const skala = 2.6 / Math.max(groesse.x, groesse.y);
          gltf.scene.position.sub(mitte);
          gltf.scene.scale.setScalar(skala);
          gruppe.add(gltf.scene);
        },
        undefined,
        () => {}, // Ladefehler: Flaeche bleibt leer
      );

      const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      let frame = 0;

      const zeichnen = () => {
        frame = requestAnimationFrame(zeichnen);
        if (!ruhig) {
          const t = (performance.now() - start) / 1000;
          // Langsames Pendeln statt voller Drehung - die Marke soll lesbar bleiben
          gruppe.rotation.y = Math.sin(t * 0.32) * 0.5;
          gruppe.rotation.x = Math.sin(t * 0.23) * 0.16;
          gruppe.position.y = Math.sin(t * 0.45) * 0.09;
        }
        renderer.render(scene, camera);
      };
      zeichnen();

      const beiGroessenaenderung = () => {
        camera.aspect = breite() / hoehe();
        camera.updateProjectionMatrix();
        renderer.setSize(breite(), hoehe());
      };
      const ro = new ResizeObserver(beiGroessenaenderung);
      ro.observe(el);

      // Bei verdecktem Tab nicht weiterrechnen
      const beiSichtwechsel = () => {
        if (document.hidden) cancelAnimationFrame(frame);
        else zeichnen();
      };
      document.addEventListener("visibilitychange", beiSichtwechsel);

      aufraeumen = () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("visibilitychange", beiSichtwechsel);
        ro.disconnect();
        pmrem.dispose();
        Object.values(materialien).forEach((m) => m.dispose());
        scene.traverse((kind) => {
          const mesh = kind as InstanceType<typeof THREE.Mesh>;
          if (mesh.isMesh) mesh.geometry?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      abgebrochen = true;
      aufraeumen?.();
    };
  }, [sichtbar]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none mx-auto h-[280px] w-full max-w-[380px] sm:h-[340px] lg:h-[420px] lg:max-w-none"
    />
  );
}
