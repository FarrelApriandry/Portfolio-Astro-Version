import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import DemoHumanoid from './DemoHumanoid';
import CustomAvatarModel from './CustomAvatarModel';
import { AVATAR_CAMERA } from './avatarConfig';

type SceneProps = {
  mode: 'demo' | 'custom';
  modelUrl: string;
  reducedMotion: boolean;
};

function Rig({ children, reducedMotion }: { children: React.ReactNode; reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!ref.current || reducedMotion) return;
    const px = state.pointer.x;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, px * 0.12, 2.5, delta);
  });
  return <group ref={ref}>{children}</group>;
}

function Particles({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const N = 90;
    const positions = new Float32Array(N * 3);
    const speeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = 1.1 + Math.random() * 1.2;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = -1 + Math.random() * 2.6;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.15 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, []);
  useFrame((state, delta) => {
    if (!ref.current || reducedMotion) return;
    const pos = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < speeds.length; i++) {
      let y = (pos.getY(i) + speeds[i] * delta) as number;
      if (y > 1.6) y = -1;
      pos.setY(i, y);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const ang = Math.atan2(z, x) + delta * 0.08;
      const r = Math.hypot(x, z);
      pos.setX(i, Math.cos(ang) * r);
      pos.setZ(i, Math.sin(ang) * r);
    }
    pos.needsUpdate = true;
    ref.current.rotation.y = t * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#7DD3A7" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Stage() {
  return (
    <group position={[0, -1.06, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.25, 48]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[1.05, 1.12, 64]} />
        <meshBasicMaterial color="#7DD3A7" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.72, 0.735, 48]} />
        <meshBasicMaterial color="#262626" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <gridHelper args={[4, 16, '#1e1e1e', '#161616']} position={[0, -0.01, 0]} />
    </group>
  );
}

export default function AvatarScene({ mode, modelUrl, reducedMotion }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: AVATAR_CAMERA.position, fov: AVATAR_CAMERA.fov }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ background: 'transparent' }}
    >
      <fog attach="fog" args={['#0A0A0A', 6, 12]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 4]} intensity={1.4} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#7DD3A7" />
      <directionalLight position={[0, 3, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <Rig reducedMotion={reducedMotion}>
          {mode === 'custom' ? (
            <CustomAvatarModel url={modelUrl} reducedMotion={reducedMotion} />
          ) : (
            <DemoHumanoid reducedMotion={reducedMotion} />
          )}
        </Rig>
        <Stage />
        <Particles reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -1.05, 0]} opacity={0.65} scale={4} blur={2.4} far={2.2} color="#000000" />
      </Suspense>
      <OrbitControls
        target={[0, 0.35, 0]}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI * 0.32}
        maxPolarAngle={Math.PI * 0.58}
        minAzimuthAngle={-Math.PI * 0.35}
        maxAzimuthAngle={Math.PI * 0.35}
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
