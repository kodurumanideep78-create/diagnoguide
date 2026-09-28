import { useEffect, useRef, useState } from "react";

type Props = { progress: number; fallbackImage: string; reducedMotion: boolean };

const THREE_URL = "https://esm.sh/three@0.170.0";

function roundedClamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function HospitalScene({ progress, fallbackImage, reducedMotion }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const reducedMotionRef = useRef(false);
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let renderer: any;
    let observer: ResizeObserver | undefined;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      try {
        // Keep the renderer self-contained; the CDN module is loaded only in the browser.
        const THREE = await new Function("url", "return import(url)")(THREE_URL);
        if (disposed || !host.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xe7eeeb);
        scene.fog = new THREE.Fog(0xe7eeeb, 25, 84);
        const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 130);
        camera.position.set(0, 2.2, 5.6);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.setAttribute("aria-hidden", "true");
        host.current.replaceChildren(renderer.domElement);

        const mat = (color: number, roughness = 0.7, metalness = 0, extra: Record<string, unknown> = {}) =>
          new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
        const ivory = mat(0xf5f4ee, 0.72);
        const wall = mat(0xfaf9f5, 0.86);
        const oak = mat(0xb7a080, 0.82);
        const floorMat = mat(0xc9ccc5, 0.38);
        const dark = mat(0x27363a, 0.36, 0.45);
        const teal = mat(0x74c8c4, 0.28, 0.2, { emissive: 0x2b777b, emissiveIntensity: 0.38 });
        const glass = new THREE.MeshPhysicalMaterial({ color: 0xd4efee, roughness: 0.08, metalness: 0.05, transmission: 0.56, transparent: true, opacity: 0.34, thickness: 0.05, side: THREE.DoubleSide });
        const glow = new THREE.MeshBasicMaterial({ color: 0x9ce3dd });
        const roomFinishes = [
          { wall: 0xf8efea, floor: 0xe7ddd8, accent: 0xb87875, screen: 0x80d7d2, light: 0xffe4d8 },
          { wall: 0xf0eff7, floor: 0xdedce9, accent: 0x8288bb, screen: 0x8dcfe4, light: 0xe1e4ff },
          { wall: 0xeff6ef, floor: 0xd9e5dc, accent: 0x4e907b, screen: 0x7ed6cd, light: 0xd9f3e5 },
          { wall: 0xeaf3f2, floor: 0xd8e4e2, accent: 0x388187, screen: 0x7dcbd2, light: 0xc9edef },
          { wall: 0xeaf0f6, floor: 0xd6e0e9, accent: 0x5f8bac, screen: 0x7cc9ed, light: 0xd4e9fb },
          { wall: 0xf5eee8, floor: 0xe6dcd3, accent: 0x9d6b55, screen: 0x8ed7d4, light: 0xf7e0d0 },
          { wall: 0xf3f2e9, floor: 0xe3e0d1, accent: 0x879764, screen: 0x93c99b, light: 0xe9edcf },
          { wall: 0xeaf5f3, floor: 0xd6e9e5, accent: 0x34878b, screen: 0x76d0df, light: 0xc7f0ec },
          { wall: 0xf0edf4, floor: 0xe0dce8, accent: 0x796790, screen: 0x9ec7e8, light: 0xe6dcf5 },
        ] as const;

        const box = (parent: any, x: number, y: number, z: number, sx: number, sy: number, sz: number, material: any, cast = true) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
          mesh.position.set(x, y, z);
          mesh.castShadow = cast;
          mesh.receiveShadow = true;
          parent.add(mesh);
          return mesh;
        };
        const cylinder = (parent: any, x: number, y: number, z: number, rTop: number, rBottom: number, height: number, material: any, segments = 18) => {
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, segments), material);
          mesh.position.set(x, y, z);
          mesh.castShadow = true;
          parent.add(mesh);
          return mesh;
        };
        const sphere = (parent: any, x: number, y: number, z: number, r: number, material: any) => {
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), material);
          mesh.position.set(x, y, z);
          parent.add(mesh);
          return mesh;
        };

        scene.add(new THREE.HemisphereLight(0xf5fbff, 0x9b9f99, 2.0));
        const key = new THREE.DirectionalLight(0xfff8eb, 2.0);
        key.position.set(-5, 10, 8);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x81cfcc, 0.75);
        fill.position.set(8, 6, -24);
        scene.add(fill);

        // A single continuous corridor makes the scroll journey feel like one real wing.
        box(scene, 0, -0.16, -31, 4.55, 0.28, 77, floorMat, false);
        box(scene, 0, 4.55, -31, 4.55, 0.2, 77, ivory, false);
        const stride = 7.35;
        const waypoints: { x: number; y: number; z: number; tx: number; ty: number; tz: number }[] = [];

        const addSign = (parent: any, side: number, z: number, i: number, label: string) => {
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 180;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.fillStyle = "#f9fbf8";
          ctx.fillRect(0, 0, 512, 180);
          ctx.fillStyle = "#163d40";
          ctx.font = "700 44px Arial";
          ctx.fillText(`ROOM 0${i + 1}`, 28, 66);
          ctx.fillStyle = "#617a79";
          ctx.font = "500 27px Arial";
          ctx.fillText(label.toUpperCase().slice(0, 21), 28, 118);
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.6), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
          sign.position.set(side * 7.91, 3.45, z);
          sign.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
          parent.add(sign);
        };

        const addRoomMachine = (i: number, side: number, z: number) => {
          const group = new THREE.Group();
          const cx = side * 5.15;
          group.position.set(cx, 0, z);
          scene.add(group);
          const x = (n: number) => n * side;
          const finish = roomFinishes[i];
          const instrument = mat(i % 2 === 0 ? 0xf4f3ed : 0xf1f3ef, 0.34, 0.12);
          const accent = mat(finish.accent, 0.28, 0.18, { emissive: finish.accent, emissiveIntensity: 0.12 });
          const screen = mat(0x122b33, 0.18, 0.04, { emissive: finish.screen, emissiveIntensity: 0.44 });
          const rubber = mat(0x343b3d, 0.54, 0.08);

          // Shared patient platform and instrument shapes establish scale in every suite.
          if (i === 0) {
            box(group, x(-0.15), 0.95, 0.35, 0.7, 1.9, 0.62, instrument);
            box(group, x(-0.11), 1.8, 0.35, 0.92, 0.16, 0.78, dark);
            box(group, x(-0.72), 2.32, 0.42, 1.6, 0.14, 0.18, instrument);
            box(group, x(-1.24), 1.86, 0.45, 0.13, 0.84, 0.22, accent);
            box(group, x(0.45), 0.94, -1.05, 0.11, 1.85, 0.12, dark);
            box(group, x(0.7), 1.82, -1.05, 0.65, 0.55, 0.2, instrument);
            box(group, x(0.7), 1.83, -0.93, 0.44, 0.32, 0.025, screen);
          } else if (i === 4) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.28, 16, 48), instrument);
            ring.position.set(x(-0.25), 2.08, -0.1);
            ring.rotation.y = Math.PI / 2;
            ring.castShadow = true;
            group.add(ring);
            const inner = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.045, 12, 36), accent);
            inner.position.copy(ring.position);
            inner.rotation.copy(ring.rotation);
            group.add(inner);
            cylinder(group, x(-0.25), 0.72, -0.1, 0.55, 0.63, 0.18, dark);
            box(group, x(-0.6), 1.05, -0.1, 0.38, 0.2, 2.7, instrument);
            box(group, x(-0.6), 0.92, -0.1, 0.24, 0.12, 2.15, accent);
          } else if (i === 6) {
            box(group, x(0.15), 0.76, -0.15, 0.78, 0.34, 3.15, instrument);
            box(group, x(0.15), 0.97, -0.15, 0.84, 0.12, 3.28, dark);
            box(group, x(0.15), 1.06, -0.15, 0.82, 0.1, 3.18, instrument);
            box(group, x(0.8), 1.77, -0.15, 0.18, 1.45, 0.34, instrument);
            box(group, x(0.8), 2.48, -0.15, 1.0, 0.16, 2.8, instrument);
            box(group, x(0.8), 2.36, -0.15, 0.58, 0.08, 2.25, accent);
            box(group, x(0.97), 2.91, -1.37, 0.92, 0.64, 0.12, dark);
            box(group, x(0.97), 2.92, -1.30, 0.72, 0.43, 0.025, screen);
          } else if (i === 3 || i === 8) {
            box(group, x(0.3), 0.8, -0.25, 2.1, 1.55, 1.22, instrument);
            box(group, x(0.3), 1.65, -0.25, 1.7, 0.18, 0.96, accent);
            box(group, x(-0.75), 1.73, -0.25, 0.18, 2.0, 1.45, dark);
            box(group, x(-0.75), 2.36, -0.25, 0.2, 0.55, 1.1, instrument);
            box(group, x(-0.74), 2.38, -0.15, 0.04, 0.38, 0.78, screen);
            for (let vial = 0; vial < 4; vial++) cylinder(group, x(0.18 + vial * 0.19), 1.98, -0.24, 0.055, 0.055, 0.34, vial % 2 ? accent : dark, 10);
            if (i === 3) {
              box(group, x(0.35), 1.05, 0.57, 0.82, 0.12, 0.42, accent);
              for (let vial = 0; vial < 5; vial++) cylinder(group, x(-0.1 + vial * 0.2), 1.22, 0.57, 0.045, 0.045, 0.28, instrument, 10);
            } else {
              box(group, x(0.35), 1.93, 0.44, 0.95, 0.52, 0.06, dark);
              box(group, x(0.35), 1.94, 0.48, 0.76, 0.34, 0.025, screen);
              for (let vial = 0; vial < 5; vial++) cylinder(group, x(-0.1 + vial * 0.2), 1.17, 0.56, 0.04, 0.045, 0.28, accent, 10);
            }
          } else {
            // Ultrasound cart: clinical monitor, articulated support, and patient bed.
            box(group, x(0.86), 1.65, -0.15, 1.1, 0.78, 0.18, dark);
            box(group, x(0.86), 1.66, -0.045, 0.9, 0.56, 0.035, screen);
            box(group, x(0.86), 1.03, -0.12, 0.14, 1.0, 0.14, instrument);
            box(group, x(0.86), 0.45, -0.12, 0.72, 0.12, 0.9, instrument);
            for (const dx of [-0.26, 0.26]) for (const dz of [-0.29, 0.29]) {
              const wheel = cylinder(group, x(0.86 + dx), 0.14, -0.12 + dz, 0.07, 0.07, 0.06, rubber, 12);
              wheel.rotation.z = Math.PI / 2;
            }
            cylinder(group, x(-0.28), 0.66, 0.6, 0.17, 0.22, 0.34, dark);
            box(group, x(-0.28), 0.86, 0.6, 0.25, 0.16, 0.23, accent);
            box(group, x(-0.25), 1.02, 0.6, 0.11, 0.18, 0.12, instrument);
            box(group, x(-0.62), 0.96, -0.45, 0.56, 0.13, 2.8, instrument);
            box(group, x(-0.62), 1.05, -0.45, 0.12, 0.1, 2.55, accent);
            const cablePath = new THREE.CatmullRomCurve3([
              new THREE.Vector3(x(0.62), 1.31, -0.08),
              new THREE.Vector3(x(0.36), 1.25, 0.14),
              new THREE.Vector3(x(0.08), 1.12, 0.4),
              new THREE.Vector3(x(-0.24), 1.08, 0.57),
            ]);
            group.add(new THREE.Mesh(new THREE.TubeGeometry(cablePath, 20, 0.018, 7, false), dark));
            if (i === 5) {
              cylinder(group, x(-0.35), 1.42, 0.65, 0.022, 0.022, 0.72, dark, 10);
              box(group, x(-0.35), 1.79, 0.65, 0.1, 0.07, 0.1, accent);
            }
          }
          // Tidy foot plates and a little monitor glow give each room a lived-in scale.
          box(group, x(0.05), 0.11, -2.17, 2.0, 0.1, 0.1, dark);
          sphere(group, x(-0.35), 2.62, -1.96, 0.08, glow);
        };

        for (let i = 0; i < 9; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const z = -3.2 - i * stride;
          const finish = roomFinishes[i];
          const roomWall = mat(finish.wall, 0.82);
          const roomFloor = mat(finish.floor, 0.4);
          const roomAccent = mat(finish.accent, 0.3, 0.12, { emissive: finish.accent, emissiveIntensity: 0.08 });
          const roomGlow = new THREE.MeshBasicMaterial({ color: finish.light });
          for (const wallSide of [-1, 1]) {
            if (wallSide !== side) box(scene, wallSide * 2.19, 2.13, z, 0.16, 4.25, 5.65, wall, false);
            if (i < 8) box(scene, wallSide * 2.19, 2.13, z - stride / 2, 0.16, 4.25, stride - 5.75, wall, false);
          }
          // Each room is a distinct glass-fronted bay off the central corridor.
          box(scene, side * 5.12, -0.01, z, 5.9, 0.12, 5.75, roomFloor, false);
          box(scene, side * 8.05, 2.05, z, 0.18, 4.05, 5.78, roomWall, false);
          box(scene, side * 5.15, 4.12, z, 5.8, 0.12, 5.75, roomWall, false);
          // Clear opening and two glazed side panels; the door is visually transparent.
          for (const edge of [-1, 1]) {
            const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 3.85), glass);
            panel.position.set(side * 2.24, 2.0, z + edge * 2.36);
            panel.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
            scene.add(panel);
            box(scene, side * 2.18, 3.98, z + edge * 2.36, 0.08, 0.08, 1.0, roomAccent, false);
          }
          // Transom above the doorway, plus a warm acoustic accent inside each room.
          box(scene, side * 2.22, 3.83, z, 0.09, 0.25, 3.65, glass, false);
          box(scene, side * 7.92, 2.08, z - 2.88, 0.08, 3.7, 0.18, oak, false);
          box(scene, side * 7.92, 2.08, z + 2.83, 0.06, 2.75, 0.1, roomAccent, false);
          addSign(scene, side, z - 2.68, i, ["Mammography", "Pelvic ultrasound", "Breast ultrasound", "LBC & HPV lab", "Pelvic MRI", "Core biopsy", "DEXA scan", "Fetal Doppler", "Endocrine lab"][i]);
          const roomLight = new THREE.PointLight(finish.light, 1.05, 10);
          roomLight.position.set(side * 5.0, 3.2, z);
          scene.add(roomLight);
          addRoomMachine(i, side, z);
          // One ceiling strip and one floor guide per room mark the sequence.
          box(scene, 0, 4.4, z, 0.1, 0.035, 3.8, roomGlow, false);
          box(scene, side * 1.18, 0.012, z, 0.035, 0.018, 4.8, roomAccent, false);
          waypoints.push({ x: side * 3.48, y: 1.82, z: z + 2.05, tx: side * 5.2, ty: 1.54, tz: z - 0.2 });
        }

        // Wall and ceiling LED rails make the long corridor legible in perspective.
        for (const side of [-1, 1]) {
          box(scene, side * 1.45, 4.42, -31, 0.045, 0.04, 72, glow, false);
          box(scene, side * 2.08, 3.89, -31, 0.045, 0.045, 72, teal, false);
        }
        // Room 01 begins at the entrance so the very first frame already feels like a destination.
        const entrance = new THREE.PointLight(0xe8fff4, 0.8, 14);
        entrance.position.set(0, 3.3, 5);
        scene.add(entrance);

        const resize = () => {
          if (!host.current || !renderer) return;
          const { width, height } = host.current.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };
        observer = new ResizeObserver(resize);
        observer.observe(host.current);
        resize();

        let smoothProgress = 0;
        const render = () => {
          frame = requestAnimationFrame(render);
          const target = roundedClamp(progressRef.current, 0, 8);
          if (reducedMotionRef.current) smoothProgress = target;
          else smoothProgress += (target - smoothProgress) * 0.055;
          const lo = Math.floor(smoothProgress);
          const hi = Math.min(8, lo + 1);
          const t = smoothProgress - lo;
          const a = waypoints[lo];
          const b = waypoints[hi];
          camera.position.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
          camera.lookAt(a.tx + (b.tx - a.tx) * t, a.ty + (b.ty - a.ty) * t, a.tz + (b.tz - a.tz) * t);
          renderer.render(scene, camera);
        };
        setWebglReady(true);
        render();
        cleanup = () => {
          cancelAnimationFrame(frame);
          observer?.disconnect();
          scene.traverse((obj: any) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((m: any) => { m.map?.dispose?.(); m.dispose?.(); });
            }
          });
          renderer?.dispose();
          renderer?.domElement.remove();
        };
      } catch (error) {
        console.warn("3D scene unavailable; showing the architectural fallback.", error);
      }
    };

    start();
    return () => {
      disposed = true;
      cleanup?.();
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      renderer?.dispose();
    };
  }, []);

  return (
    <div className={`scene-shell ${webglReady ? "scene-ready" : "scene-fallback"}`}>
      <div className="scene-fallback-image" style={{ backgroundImage: `url(${fallbackImage})` }} aria-hidden="true" />
      <div className="three-host" ref={host} />
      <div className="scene-vignette" aria-hidden="true" />
      <span className="sr-only">Three-dimensional diagnostic corridor. Rooms alternate left and right as the camera travels forward.</span>
    </div>
  );
}
