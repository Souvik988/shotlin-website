/**
 * Line-art doodles in the Stormlikes spirit: thick ink outlines, a few bold fills.
 * <div class="dz" data-doodles="eyes,heart,code,spark"></div> inside a position:relative section.
 * Items are placed around the edges (seeded, so layout is stable), pop in when seen,
 * float forever, drift with scroll, and every pair of eyes watches the cursor.
 */
import { gsap, ScrollTrigger, $$, reduced, finePointer } from "./core";

const K = "#0e0d0c", SW = 'stroke="#0e0d0c" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"';
const SHAPES: Record<string, string> = {
  eyes: `<svg viewBox="0 0 84 44"><ellipse cx="22" cy="22" rx="18" ry="19" fill="#fff" ${SW}/><ellipse cx="62" cy="22" rx="18" ry="19" fill="#fff" ${SW}/><g class="pup"><circle cx="22" cy="24" r="8" fill="${K}"/><circle cx="62" cy="24" r="8" fill="${K}"/><circle cx="25" cy="21" r="2.4" fill="#fff"/><circle cx="65" cy="21" r="2.4" fill="#fff"/></g></svg>`,
  heart: `<svg viewBox="0 0 48 44"><path d="M24 40C8 29 3 20 4 13 5 6 11 3 16 3c4 0 7 2 8 5 1-3 4-5 8-5 5 0 11 3 12 10 1 7-4 16-20 27z" fill="#ff5cc8" ${SW}/></svg>`,
  spark: `<svg viewBox="0 0 48 48"><path d="M24 3c2 12 6 17 21 21-15 4-19 9-21 21-2-12-6-17-21-21 15-4 19-9 21-21z" fill="#c8ff2e" ${SW}/></svg>`,
  star: `<svg viewBox="0 0 50 48"><path d="M25 3l6 14 15 1-12 10 4 15-13-8-13 8 4-15L4 18l15-1z" fill="#ffd23f" ${SW}/></svg>`,
  bolt: `<svg viewBox="0 0 40 56"><path d="M24 3 5 31h13l-4 22 21-30H22z" fill="#ffd23f" ${SW}/></svg>`,
  code: `<svg viewBox="0 0 64 54"><path d="M8 4h48a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H26l-12 9v-9H8a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z" fill="#fff" ${SW}/><path d="M22 16l-7 7 7 7M42 16l7 7-7 7M35 13l-6 20" fill="none" ${SW}/></svg>`,
  cursor: `<svg viewBox="0 0 40 46"><path d="M5 3l30 18-13 3 8 15-6 3-8-15-11 9z" fill="#fff" ${SW}/></svg>`,
  squiggle: `<svg viewBox="0 0 80 30"><path d="M3 15c8-12 14-12 18 0s10 12 18 0 14-12 18 0 10 12 18 0" fill="none" ${SW}/></svg>`,
  plus: `<svg viewBox="0 0 40 40"><path d="M20 4v32M4 20h32" fill="none" ${SW} stroke-width="5"/></svg>`,
  ring: `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="17" fill="#38d6ff" ${SW}/><circle cx="22" cy="22" r="7" fill="#fff" ${SW}/></svg>`,
  chat: `<svg viewBox="0 0 60 50"><path d="M30 4c15 0 26 8 26 19S45 42 30 42c-4 0-8-1-11-2L6 46l4-10c-4-4-6-8-6-13C4 12 15 4 30 4z" fill="#c8ff2e" ${SW}/><circle cx="20" cy="23" r="3" fill="${K}"/><circle cx="30" cy="23" r="3" fill="${K}"/><circle cx="40" cy="23" r="3" fill="${K}"/></svg>`,
  cloud: `<svg viewBox="0 0 70 46"><path d="M18 42h36c8 0 13-6 13-13s-6-12-13-12c-2-8-9-13-17-13-9 0-15 6-17 13-8 0-16 6-16 13s6 12 14 12z" fill="#fff" ${SW}/></svg>`,
};
const SIZE: Record<string, number> = { eyes: 74, heart: 40, spark: 42, star: 42, bolt: 30, code: 56, cursor: 30, squiggle: 70, plus: 26, ring: 34, chat: 52, cloud: 64 };

function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

export function initDoodles() {
  const pupils: SVGGElement[] = [];
  $$("[data-doodles]").forEach((zone, zi) => {
    const list = zone.dataset.doodles!.split(",").map((s) => s.trim()).filter((s) => SHAPES[s]);
    const rand = rng(97 + zi * 131);
    const items: HTMLElement[] = [];
    list.forEach((name, i) => {
      // margins only: doodles live at the left/right edges and never sit on top of content
      const left = (i + zi) % 2 === 0;
      const px = left ? 2.5 + rand() * 6 : 91.5 + rand() * 6;
      const py = 10 + (Math.floor(i / 2) / Math.max(1, Math.ceil(list.length / 2) - 1 || 1)) * 78 + rand() * 6;
      const d = document.createElement("i");
      d.className = `dd dd--${name}`;
      d.innerHTML = SHAPES[name];
      const s = SIZE[name] * (0.85 + rand() * 0.45);
      d.style.cssText = `left:${px.toFixed(1)}%;top:${Math.min(92, py).toFixed(1)}%;width:${(s * 0.85).toFixed(0)}px;--r:${(rand() * 40 - 20).toFixed(0)}deg`;
      zone.append(d);
      items.push(d);
      const p = d.querySelector(".pup") as SVGGElement | null;
      if (p) pupils.push(p);
    });
    if (reduced) return;
    gsap.set(items, { scale: 0, rotate: (i) => Number(items[i].style.getPropertyValue("--r").replace("deg", "")) });
    ScrollTrigger.create({
      trigger: zone.parentElement!, start: "top 80%", once: true,
      onEnter: () => gsap.to(items, { scale: 1, duration: 0.8, ease: "back.out(2.6)", stagger: { each: 0.07, from: "random" } }),
    });
    // idle float only while the zone is on screen; one parallax tween per zone (cheap)
    const floats = items.map((it) => gsap.to(it, { y: `+=${8 + rand() * 12}`, rotate: `+=${rand() * 16 - 8}`, duration: 2.2 + rand() * 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: rand(), paused: true }));
    new IntersectionObserver(([e]) => floats.forEach((f) => (e.isIntersecting ? f.play() : f.pause()))).observe(zone.parentElement!);
    gsap.fromTo(zone, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: zone.parentElement!, start: "top bottom", end: "bottom top", scrub: true } });
  });
  if (!pupils.length || !finePointer || reduced) return;
  window.addEventListener("pointermove", (e) => {
    pupils.forEach((p) => {
      const r = (p.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
      gsap.to(p, { x: Math.cos(a) * 6, y: Math.sin(a) * 5, duration: 0.3, ease: "power3", overwrite: true });
    });
  }, { passive: true });
}
