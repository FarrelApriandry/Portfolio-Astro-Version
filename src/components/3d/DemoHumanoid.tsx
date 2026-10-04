import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type Props = {
  reducedMotion: boolean;
};

/** Demo humanoid pria prosedural — placeholder. Origin kaki y=0, tinggi ~2.1. */
export default function DemoHumanoid({ reducedMotion }: Props) {
  const root = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#d8b59a', roughness: 0.65 }),
      shirt: new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.8 }),
      pants: new THREE.MeshStandardMaterial({ color: '#101010', roughness: 0.85 }),
      dark: new THREE.MeshStandardMaterial({ color: '#262626', roughness: 0.6, metalness: 0.3 }),
      accent: new THREE.MeshStandardMaterial({
        color: '#7DD3A7', roughness: 0.35, emissive: '#7DD3A7', emissiveIntensity: 0.4,
      }),
    }),
    []
  );

  useFrame((state, delta) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;
    const px = state.pointer.x;
    const py = state.pointer.y;
    const floatY = reducedMotion ? 0 : Math.sin(t * 1.4) * 0.035;
    const breathe = reducedMotion ? 1 : 1 + Math.sin(t * 2.1) * 0.008;
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y, THREE.MathUtils.clamp(px * 0.55, -0.6, 0.6), 3.2, delta
    );
    root.current.position.y = -1.05 + floatY;
    if (chest.current) {
      chest.current.scale.set(1, breathe, 1);
      if (!reducedMotion) chest.current.rotation.y = Math.sin(t * 0.7) * 0.04;
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, px * 0.35, 4, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -py * 0.18, 4, delta);
    }
    if (!reducedMotion && armL.current && armR.current) {
      armL.current.rotation.x = Math.sin(t * 1.4) * 0.06 - 0.08;
      armR.current.rotation.x = Math.sin(t * 1.4 + Math.PI) * 0.06 - 0.08;
    }
  });

  return (
    <group ref={root} position={[0, -1.05, 0]}>
      <group position={[-0.16, 0, 0]}>
        <mesh position={[0, 0.06, 0.05]} material={mats.dark}>
          <boxGeometry args={[0.16, 0.12, 0.3]} />
        </mesh>
        <mesh position={[0, 0.32, 0]} material={mats.pants}>
          <capsuleGeometry args={[0.09, 0.32, 8, 16]} />
        </mesh>
        <mesh position={[0, 0.72, 0]} material={mats.pants}>
          <capsuleGeometry args={[0.11, 0.32, 8, 16]} />
        </mesh>
      </group>
      <group position={[0.16, 0, 0]}>
        <mesh position={[0, 0.06, 0.05]} material={mats.dark}>
          <boxGeometry args={[0.16, 0.12, 0.3]} />
        </mesh>
        <mesh position={[0, 0.32, 0]} material={mats.pants}>
          <capsuleGeometry args={[0.09, 0.32, 8, 16]} />
        </mesh>
        <mesh position={[0, 0.72, 0]} material={mats.pants}>
          <capsuleGeometry args={[0.11, 0.32, 8, 16]} />
        </mesh>
      </group>
      <mesh position={[0, 0.98, 0]} material={mats.pants}>
        <capsuleGeometry args={[0.17, 0.12, 8, 16]} />
      </mesh>
      <group ref={chest} position={[0, 1.28, 0]}>
        <mesh material={mats.shirt}>
          <capsuleGeometry args={[0.24, 0.42, 12, 24]} />
        </mesh>
        <mesh position={[0, 0.12, 0.21]} material={mats.accent}>
          <boxGeometry args={[0.18, 0.03, 0.02]} />
        </mesh>
      </group>
      <mesh position={[-0.3, 1.52, 0]} material={mats.shirt}>
        <sphereGeometry args={[0.1, 20, 20]} />
      </mesh>
      <mesh position={[0.3, 1.52, 0]} material={mats.shirt}>
        <sphereGeometry args={[0.1, 20, 20]} />
      </mesh>
      <group ref={armL} position={[-0.32, 1.5, 0]}>
        <mesh position={[0, -0.22, 0]} material={mats.shirt}>
          <capsuleGeometry args={[0.075, 0.3, 8, 16]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={mats.skin}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
      </group>
      <group ref={armR} position={[0.32, 1.5, 0]}>
        <mesh position={[0, -0.22, 0]} material={mats.shirt}>
          <capsuleGeometry args={[0.075, 0.3, 8, 16]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={mats.skin}>
          <sphereGeometry args={[0.07, 16, 16]} />
        </mesh>
      </group>
      <mesh position={[0, 1.68, 0]} material={mats.skin}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 16]} />
      </mesh>
      <group ref={head} position={[0, 1.9, 0]}>
        <mesh material={mats.skin}>
          <sphereGeometry args={[0.17, 28, 28]} />
        </mesh>
        <mesh position={[0, 0.055, -0.02]} scale={[1.02, 0.75, 1.02]} material={mats.dark}>
          <sphereGeometry args={[0.172, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        <mesh position={[0, 0.01, 0.155]} material={mats.dark}>
          <boxGeometry args={[0.26, 0.045, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}

