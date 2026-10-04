import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AVATAR_LABEL_CUSTOM, AVATAR_LABEL_DEMO, AVATAR_MODEL_URL } from './avatarConfig';

const AvatarScene = lazy(() => import('./AvatarScene'));

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function useReducedMotion(): boolean {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setV(mq.matches);
    const fn = (e: MediaQueryListEvent) => setV(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return v;
}

/**
 * Island untuk hero System Panel.
 * Dipakai di index.astro sebagai <HeroAvatar client:visible />
 * - SSR-safe (tidak render Canvas saat SSR)
 * - Lazy-load three.js via React.lazy
 * - Auto HEAD-check /models/avatar.glb -> custom / demo fallback
 * - Pause render saat off-screen / tab hidden
 * - Hormat prefers-reduced-motion + fallback non-WebGL
 */
export default function HeroAvatar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'demo' | 'custom'>('demo');
  const [inView, setInView] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
    let cancelled = false;
    fetch(AVATAR_MODEL_URL, { method: 'HEAD' })
      .then((r) => {
        if (!cancelled && r.ok) setMode('custom');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  if (webgl === false) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#262626] bg-[#0A0A0A] sm:h-[320px]">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-[#737373]">Avatar // Static</p>
        <p className="px-6 text-center text-sm text-[#A1A1A1]">WebGL tidak tersedia — panel statis dipakai.</p>
      </div>
    );
  }

  if (webgl === null) {
    return (
      <div
        aria-hidden="true"
        className="h-[280px] animate-pulse rounded-2xl border border-[#262626] bg-[#0A0A0A] sm:h-[320px]"
      />
    );
  }

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#0A0A0A]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-[#A1A1A1]">
          {mode === 'custom' ? AVATAR_LABEL_CUSTOM : AVATAR_LABEL_DEMO}
        </p>
        <span className="mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#7DD3A7]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3A7]" />
          Live
        </span>
      </div>
      <div className="h-[280px] sm:h-[320px]">
        {inView && !paused ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-[#737373]">Loading 3D…</p>
              </div>
            }
          >
            <AvatarScene mode={mode} modelUrl={AVATAR_MODEL_URL} reducedMotion={reducedMotion} />
          </Suspense>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="mono text-[10px] uppercase tracking-[0.22em] text-[#737373]">Paused off-screen</p>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
        <p className="mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">Drag to orbit</p>
        <p className="mono text-[10px] uppercase tracking-[0.18em] text-[#737373]">Y-up · Feet 0</p>
      </div>
    </div>
  );
}
