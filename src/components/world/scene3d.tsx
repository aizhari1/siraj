"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

function Knot({ accent, speed }: { accent: string; speed: number }) {
  const m = useRef<Mesh>(null);
  useFrame((_, dt) => { if (m.current) { m.current.rotation.x += dt * 0.25 * speed; m.current.rotation.y += dt * 0.35 * speed; } });
  return (
    <mesh ref={m} scale={1.25}>
      <torusKnotGeometry args={[1, 0.32, 160, 16]} />
      <meshStandardMaterial color={accent} wireframe emissive={accent} emissiveIntensity={0.6} />
    </mesh>
  );
}

export default function Scene3D({ accent, speed }: { accent: string; speed: number }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: false, powerPreference: "low-power" }} style={{ position: "absolute", inset: 0 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={30} color={accent} />
      <Knot accent={accent} speed={speed} />
    </Canvas>
  );
}
