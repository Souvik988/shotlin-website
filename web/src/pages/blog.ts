import { gsap, ScrollTrigger, Flip, $, $$, reduced, finePointer } from "../core";

/* ---------- ASCII particle word: characters fly in, scatter from the cursor, spring home ---------- */
function asciiHero(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const CH = "01{}<>/;=+*#&$%";
  const COLS = ["#0e0d0c", "#0e0d0c", "#0e0d0c", "#0e0d0c", "#3048ff", "#ff5cc8", "#7bbd00"];
  type P = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; c: string; col: string };
  let W = 0, H = 0, parts: P[] = [], fs = 12, visible = true;
  const m = { x: -9999, y: -9999 };
  const build = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const off = document.createElement("canvas"); off.width = Math.ceil(W); off.height = Math.ceil(H);
    const o = off.getContext("2d")!;
    const size = Math.min(W * 0.27, H * 0.95);
    o.font = `800 ${size}px "Bricolage Grotesque Variable", system-ui, sans-serif`;
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText("BLOG.", W / 2, H * 0.54);
    const d = o.getImageData(0, 0, off.width, off.height).data;
    const step = W < 700 ? 7 : 10;
    fs = step * 1.15;
    const old = parts;
    parts = [];
    for (let y = 0; y < off.height; y += step) for (let x = 0; x < off.width; x += step) {
      if (d[(y * off.width + x) * 4 + 3] > 140) {
        const prev = old[parts.length];
        parts.push({ hx: x, hy: y, x: prev ? prev.x : Math.random() * W, y: prev ? prev.y : H + Math.random() * H * 0.6, vx: 0, vy: 0, c: CH[(Math.random() * CH.length) | 0], col: COLS[(Math.random() * COLS.length) | 0] });
      }
    }
    if (reduced) parts.forEach((p) => { p.x = p.hx; p.y = p.hy; });
  };
  build();
  window.addEventListener("resize", () => build());
  canvas.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; });
  canvas.addEventListener("pointerleave", () => { m.x = m.y = -9999; });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(canvas);
  let t = 0;
  const tick = () => {
    if (!visible) return;
    t++;
    ctx.clearRect(0, 0, W, H);
    ctx.font = `600 ${fs}px "Geist Mono Variable", ui-monospace, monospace`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const R = 90;
    for (const p of parts) {
      const dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy;
      if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 7; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      p.vx += (p.hx - p.x) * 0.045; p.vy += (p.hy - p.y) * 0.045;
      p.vx *= 0.82; p.vy *= 0.82;
      p.x += p.vx; p.y += p.vy;
      if (t % 40 === 0 && Math.random() < 0.04) p.c = CH[(Math.random() * CH.length) | 0];
      ctx.fillStyle = p.col;
      ctx.fillText(p.c, p.x, p.y);
    }
  };
  if (reduced) { tick(); return; }
  gsap.ticker.add(tick);
}

export function blog() {
  const cv = $<HTMLCanvasElement>("[data-ascii]");
  if (cv) document.fonts.ready.then(() => asciiHero(cv));

  /* featured: the card grows into a full-bleed editorial hero */
  const card = $("[data-bfeat-card]");
  if (card && !reduced) {
    gsap.set("[data-bfeat-in]", { autoAlpha: 0, y: 40 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-bfeat-pin]", start: "top top", end: "+=140%", pin: true, scrub: 1 } });
    tl.fromTo(card, { clipPath: "inset(22% 26% 22% 26% round 26px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 }, 0)
      .fromTo($("img", card), { scale: 1.35 }, { scale: 1, ease: "power2.out", duration: 1.2 }, 0)
      .to("[data-bfeat-in]", { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0.75)
      .to({}, { duration: 0.3 });
  }

  /* cover cards: rise in, cover parallax, 3D tilt on hover, topic filters */
  const rows = $$(".bc");
  if (!reduced) {
    rows.forEach((r, i) => {
      gsap.from(r.children, { y: 70, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.06, delay: (i % 2) * 0.08, scrollTrigger: { trigger: r, start: "top 90%" } });
      gsap.fromTo($(".bc__cover img", r), { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: r, start: "top bottom", end: "bottom top", scrub: true } });
    });
    if (finePointer) rows.forEach((r) => {
      const cov = $(".bc__cover", r);
      const rx = gsap.quickTo(cov, "rotationX", { duration: 0.6, ease: "power3" }), ry = gsap.quickTo(cov, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(cov, { transformPerspective: 900 });
      r.addEventListener("pointermove", (e) => { const b = cov.getBoundingClientRect(); rx(((e.clientY - b.top) / b.height - 0.5) * -8); ry(((e.clientX - b.left) / b.width - 0.5) * 10); });
      r.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }
  const chips = $$("[data-bchips] button");
  chips.forEach((b) => b.addEventListener("click", () => {
    const tag = b.dataset.btag!;
    chips.forEach((c) => c.classList.toggle("is-on", c === b));
    const state = Flip.getState(rows);
    rows.forEach((r) => r.classList.toggle("is-hidden", tag !== "all" && r.dataset.tag !== tag));
    Flip.from(state, { duration: reduced ? 0 : 0.6, ease: "expo.inOut", absolute: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, x: 30, duration: 0.3 }),
      onComplete: () => { gsap.set(rows, { clearProps: "transform,position,top,left,width,height" }); ScrollTrigger.refresh(); } });
  }));
}

export function post() {
  const bar = $("[data-read-bar]");
  const body = $("[data-post-body]");
  const arc = $("[data-toc-arc]");
  const left = $("[data-toc-left]");
  const mins = Number((left?.textContent || "5").replace(/\D/g, "")) || 5;
  if (body) ScrollTrigger.create({
    trigger: body, start: "top 70%", end: "bottom 60%",
    onUpdate: (s) => {
      if (bar) gsap.set(bar, { scaleX: s.progress });
      if (arc) arc.style.strokeDashoffset = String(100 - s.progress * 100);
      if (left) left.textContent = s.progress > 0.97 ? "done ✓" : `${Math.max(1, Math.ceil(mins * (1 - s.progress)))} min`;
    },
  });
  // highlight the current section in the table of contents
  const links = $$<HTMLAnchorElement>("[data-toc] ol a");
  const heads = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean) as HTMLElement[];
  if (heads.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-on", a.hash === `#${e.target.id}`));
    }), { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach((h) => io.observe(h));
  }
  const media = $("[data-post-media]");
  if (media && !reduced) gsap.fromTo(media, { clipPath: "inset(10% 8% 10% 8% round 30px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: { trigger: media, start: "top 90%", end: "top 30%", scrub: true } });
  if (!reduced) {
    $$(".post__body > *").forEach((el) => gsap.from(el, { y: 30, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
    gsap.from(".takeaways li", { x: -20, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: "expo.out", scrollTrigger: { trigger: ".takeaways", start: "top 85%" } });
    gsap.from(".rel", { y: 60, autoAlpha: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".related", start: "top 85%" } });
  }
}
