interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  color: string;
}

const COLORS = ['#17406b', '#2f6394', '#2dd4bf', '#e8b64c', '#8ed4ca'];
const LIFETIME_MS = 1800;

/** Fire a celebratory burst on a self-removing full-screen canvas. */
export function fireConfetti(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;z-index:50;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const parts: Particle[] = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    vx: -1.5 + Math.random() * 3,
    vy: 2.5 + Math.random() * 3.5,
    rot: Math.random() * Math.PI,
    vr: -0.12 + Math.random() * 0.24,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#ffffff',
  }));

  const t0 = performance.now();
  const frame = (t: number): void => {
    const elapsed = t - t0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / LIFETIME_MS);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (elapsed < LIFETIME_MS) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
