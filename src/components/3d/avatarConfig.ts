// Single source of truth untuk avatar 3D di hero System Panel.
// Ganti file di public/models/avatar.glb tanpa ubah code.
export const AVATAR_MODEL_URL = '/models/avatar.glb';

export const AVATAR_CAMERA = {
  position: [0, 0.35, 4.4] as [number, number, number],
  fov: 32,
};

export const AVATAR_LABEL_DEMO = 'AVATAR // DEMO-HUMANOID-V1';
export const AVATAR_LABEL_CUSTOM = 'AVATAR // CUSTOM-GLB';

/**
 * CARA REPLACE DENGAN MODEL DIRIMU SENDIRI:
 * 1. Export dari Blender / Ready Player Me / VRoid sebagai .glb (single file, bukan .gltf terpisah)
 * 2. Target < 5MB. Compress + Draco kalau perlu.
 * 3. Y-up, menghadap +Z, tinggi ~1.7-1.8m, origin di kaki (feet at y=0)
 * 4. Taruh di: public/models/avatar.glb (timpa / tambah file)
 * 5. Tidak perlu ubah code — HeroAvatar otomatis deteksi file itu via HEAD request.
 *    Kalau ada -> pakai GLB custom. Kalau tidak ada -> fallback ke DemoHumanoid prosedural.
 * 6. Kalau model terlalu besar/kecil, atur di CustomAvatarModel.tsx (auto-scale sudah dihandle via Box3).
 */
