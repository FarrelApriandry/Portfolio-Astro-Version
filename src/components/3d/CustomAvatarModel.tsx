import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

type Props = {
  url: string;
  reducedMotion: boolean;
  targetHeight?: number;
};

/**
 * Loader untuk model custom kamu (/public/models/avatar.glb).
 * Auto-scale ke targetHeight + auto-ground (kaki di y=0) via Box3,
 * jadi model dari Blender / Ready Player Me / VRoid langsung pas framing
 * tanpa ubah kamera / lighting.
 */
export default function CustomAvatarModel({ url, reducedMotion, targetHeight = 2.1 }: Props) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(url);

  const { scene, scale, groundOffset } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = size.y > 0 ? targetHeight / size.y : 1;
    // kaki di y=0 -> setelah scale, min.y * s jadi offset
    return { scene: cloned, scale: s, groundOffset: -box.min.y * s };
  }, [gltf, targetHeight]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const px = state.pointer.x;
    const baseY = groundOffset - 1.05;
    const floatY = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.4) * 0.035;
    group.current.position.y = baseY + floatY;
    const ty = THREE.MathUtils.clamp(px * 0.45, -0.55, 0.55);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, ty, 3.2, delta);
  });

  useEffect(() => {
    return () => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          const mat = m.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else if (mat) mat.dispose();
        }
      });
    };
  }, [scene]);

  return (
    <group ref={group} scale={scale} position={[0, groundOffset - 1.05, 0]}>
      <primitive object={scene} />
    </group>
  );
}
