import { Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import * as THREE from "three";
import type { GlobeSkill } from "../data/globeSkills";
import { useTheme } from "../theme/themeContext";

function fibonacciSphere(n: number, radius: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius);
  });
}

const ICON_PX = 40;
const RADIUS = 3.3;
const DRAG_THRESHOLD = 6;
const UNMOUNT_DELAY_MS = 1500;

const _world = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _camDir = new THREE.Vector3();
const _ndc = new THREE.Vector3();
const _view = new THREE.Vector3();

type Pose = { rotationY: number; camera: THREE.Vector3 | null };

type GlobeProps = {
  count: number;
  radius: number;
  accent: string;
  items: RefObject<(HTMLAnchorElement | null)[]>;
  motion: boolean;
  light: boolean;
  poseRef: RefObject<Pose>;
};

function Globe({ count, radius, accent, items, motion, light, poseRef }: GlobeProps) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => fibonacciSphere(count, radius), [count, radius]);
  const shell = radius * 0.85;
  const iconWorld = THREE.MathUtils.clamp((radius * 0.8) / Math.sqrt(count), 0.32, 0.6);

  useLayoutEffect(() => {
    if (group.current) group.current.rotation.y = poseRef.current.rotationY;
  }, [poseRef]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const camera = state.camera as THREE.PerspectiveCamera;
    const { width, height } = state.size;

    if (motion) g.rotation.y += delta * 0.06;
    poseRef.current.rotationY = g.rotation.y;
    (poseRef.current.camera ??= new THREE.Vector3()).copy(camera.position);
    g.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();
    _camDir.copy(camera.position).normalize();
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);

    points.forEach((p, i) => {
      const el = items.current[i];
      if (!el) return;
      _world.copy(p).applyMatrix4(g.matrixWorld);

      const t = THREE.MathUtils.clamp((_dir.copy(_world).normalize().dot(_camDir) - 0.1) * 2, 0, 1);

      _ndc.copy(_world).project(camera);
      const x = (_ndc.x + 1) * 0.5 * width;
      const y = (1 - _ndc.y) * 0.5 * height;
      const depth = -_view.copy(_world).applyMatrix4(camera.matrixWorldInverse).z;
      const pxPerUnit = height / (2 * tanHalfFov * depth);
      const scale = ((iconWorld * pxPerUnit) / ICON_PX) * (0.8 + 0.4 * t);

      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
      el.style.opacity = String(t);
      el.style.zIndex = String(Math.round(t * 100));
      el.style.pointerEvents = t > 0.8 ? "auto" : "none";
      el.style.visibility = t < 0.02 ? "hidden" : "visible";
    });
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[shell, 2]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={light ? 0.35 : 0.1} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[shell, 2]} />
        <meshBasicMaterial
          color={accent}
          wireframe
          transparent
          opacity={light ? 0.1 : 0.03}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[shell * 0.98, 32, 32]} />
        <meshBasicMaterial
          color={light ? "#fff" : "#000"}
          transparent
          opacity={light ? 0.25 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[shell * 1.035, 32, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function FitCamera({ radius, poseRef }: { radius: number; poseRef: RefObject<Pose> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);

  useLayoutEffect(() => {
    if (poseRef.current.camera) camera.position.copy(poseRef.current.camera);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    camera.position.setLength(radius / Math.sin(Math.min(vFov, hFov) / 2));
  }, [camera, aspect, radius, poseRef]);

  return null;
}

const readToken = (el: Element, name: string, fallback: string) =>
  getComputedStyle(el).getPropertyValue(name).trim() || fallback;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function SkillsGlobe({ skills }: { skills: readonly GlobeSkill[] }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [colors, setColors] = useState({ accent: "#ffffff", bg: "#000000" });
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);
  const poseRef = useRef<Pose>({ rotationY: 0, camera: null });
  const [motion] = useState(() => !prefersReducedMotion());
  const light = theme === "light";

  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const read = () =>
      setColors({
        accent: readToken(el, "--fg", "#ffffff"),
        bg: readToken(el, "--bg", "#000000"),
      });
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const el = container.current;
    if (!el || !("IntersectionObserver" in window)) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
        else timer = setTimeout(() => setMounted(false), UNMOUNT_DELAY_MS);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY };
  };
  const onClickCapture = (e: React.MouseEvent) => {
    const start = dragStart.current;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="skills-globe">
      <div
        ref={container}
        className="skills-globe__stage"
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
      >
        {mounted && (
          <Canvas
            eventSource={container as RefObject<HTMLElement>}
            frameloop={visible ? "always" : "never"}
            camera={{ position: [0, 0, 9], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ alpha: true, antialias: true }}
          >
            {!light && <fog attach="fog" args={[colors.bg, 10, 25]} />}
            <FitCamera radius={RADIUS * 1.2} poseRef={poseRef} />
            <Float
              speed={motion ? 1 : 0}
              rotationIntensity={motion ? 0.2 : 0}
              floatIntensity={motion ? 0.2 : 0}
            >
              <Globe
                count={skills.length}
                radius={RADIUS}
                accent={colors.accent}
                items={items}
                motion={motion}
                light={light}
                poseRef={poseRef}
              />
            </Float>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={motion}
              autoRotateSpeed={0.8}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Canvas>
        )}

        <ul className="skills-globe__layer">
          {skills.map((skill, i) => {
            const Icon = skill.icon;
            return (
              <li key={skill.name} className="skills-globe__li">
                <a
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                  className="skills-globe__item"
                  href={skill.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  aria-label={
                    skill.link.includes("github.com")
                      ? t("habilidades.noGithub", { name: skill.name })
                      : skill.name
                  }
                >
                  <Icon className="skills-globe__icon" aria-hidden="true" />
                  <span className="skills-globe__label">{skill.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="meta skills-globe__hint">{t("habilidades.hint")}</p>
    </div>
  );
}
