# public/models/

Taruh model 3D dirimu di sini sebagai `avatar.glb`.

## Cara replace demo humanoid dengan model sendiri

1. Export dari Blender / Ready Player Me / VRoid sebagai **.glb** (single file).
2. Target ukuran **< 5MB**. Compress + Draco kalau perlu.
3. Orientasi:
   - Y-up
   - Menghadap +Z (ke arah kamera)
   - Origin di kaki (feet at y=0)
   - Tinggi ~1.7-1.8m (tidak wajib — auto-scale di `CustomAvatarModel.tsx` akan fit ke ~2.1 unit)
4. Simpan sebagai:
   ```
   public/models/avatar.glb
   ```
5. Tidak perlu ubah code.
   - `HeroAvatar.tsx` otomatis HEAD-check file ini.
   - Kalau ada → pakai `CustomAvatarModel` (GLB custom, label `AVATAR // CUSTOM-GLB`)
   - Kalau tidak ada / 404 → fallback ke `DemoHumanoid` prosedural (label `AVATAR // DEMO-HUMANOID-V1`)

## Test cepat
- `bun run dev` → buka hero → System Panel → viewport atas.
- Label kanan-atas harus ganti dari DEMO → CUSTOM setelah file ada.
- Drag untuk orbit terbatas (±35° azimuth, polar clamp). Zoom/pan dimatikan agar scroll halaman aman.
