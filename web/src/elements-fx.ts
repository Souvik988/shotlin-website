/**
 * Fire & ice particle field for dark sections.
 * Ice shards drift down on the left, embers rise on the right; the pointer stirs both.
 */
type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; r: number; vr: number; ice: boolean };

function sprite(color: string, size: number) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, color); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return c;
}

export function initElementsFx(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const ember = sprite("rgba(255,110,30,.9)", 64);
  const frost = sprite("rgba(120,210,255,.85)", 64);
  let w = 0, h = 0, dpr = 1, visible = false;
  const ps: P[] = [];
  const mouse = { x: -1e4, y: -1e4 };

  const resize = () => {
    const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize(); new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  canvas.parentElement!.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  canvas.parentElement!.addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e4; });

  const spawn = (ice: boolean): P => ice
    ? { ice, x: Math.random() * w * 0.55, y: -10, vx: 0.15 + Math.random() * 0.4, vy: 0.35 + Math.random() * 0.7, life: 0, max: 500 + Math.random() * 400, s: 1.5 + Math.random() * 3.5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.02 }
    : { ice, x: w * 0.45 + Math.random() * w * 0.55, y: h + 10, vx: -(0.1 + Math.random() * 0.5), vy: -(0.6 + Math.random() * 1.4), life: 0, max: 260 + Math.random() * 300, s: 1 + Math.random() * 3, r: 0, vr: 0 };

  const N = Math.min(160, Math.round(window.innerWidth / 9));
  let last = performance.now();
  const loop = (now: number) => {
    requestAnimationFrame(loop);
    if (!visible) { last = now; return; }
    const dt = Math.min((now - last) / 16.67, 3); last = now;
    while (ps.length < N) ps.push(spawn(ps.length % 2 === 0));
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life += dt;
      const t = now * 0.001;
      if (p.ice) { p.vx += Math.sin(t + p.y * 0.01) * 0.004; }
      else { p.vx += Math.sin(t * 3 + p.x * 0.02) * 0.02; p.vy -= 0.004 * dt; }
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22000) { const f = (1 - d2 / 22000) * 0.6; p.vx += (dx / Math.sqrt(d2 + 1)) * f; p.vy += (dy / Math.sqrt(d2 + 1)) * f; }
      p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      const k = p.life / p.max;
      if (k >= 1 || p.y > h + 20 || p.y < -30 || p.x < -30 || p.x > w + 30) { ps[i] = spawn(p.ice); continue; }
      const a = Math.sin(Math.min(k, 1) * Math.PI);
      ctx.globalAlpha = a * (p.ice ? 0.75 : 0.9);
      const sz = p.s * (p.ice ? 6 : 7);
      ctx.drawImage(p.ice ? frost : ember, p.x - sz / 2, p.y - sz / 2, sz, sz);
      if (p.ice && p.s > 3.2) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.strokeStyle = "rgba(190,235,255,.6)"; ctx.lineWidth = 0.8;
        ctx.beginPath(); for (let j = 0; j < 3; j++) { const an = (j * Math.PI) / 3; ctx.moveTo(Math.cos(an) * -p.s * 1.6, Math.sin(an) * -p.s * 1.6); ctx.lineTo(Math.cos(an) * p.s * 1.6, Math.sin(an) * p.s * 1.6); } ctx.stroke(); ctx.restore();
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  };
  requestAnimationFrame(loop);
}
