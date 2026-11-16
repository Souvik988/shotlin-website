import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";
import { initElementsFx } from "./elements-fx";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
export { gsap, ScrollTrigger, SplitText, Flip };

export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
export const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const root = document.documentElement;
export const isWarm = root.classList.contains("warm");
if (reduced) root.classList.add("reduced");

/* ---------------- Smooth scroll ---------------- */
ScrollTrigger.config({ ignoreMobileResize: true });
export const lenis = new Lenis({ lerp: 0.11, smoothWheel: !reduced, wheelMultiplier: 1, touchMultiplier: 1.4 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href")!;
    const el = id === "#top" ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    lenis.start();
    lenis.scrollTo(el as HTMLElement, { offset: id === "#top" ? 0 : -20, duration: 1.4 });
  })
);

/* ---------------- Veil: contextual loader + page transitions ---------------- */
root.classList.add("ready"); // styles are in: reveal the page behind the loader
const veil = $("[data-veil]");
const core = veil ? $("[data-veil-core]", veil) : null;
const icon = veil ? ($("[data-veil-icon]", veil) as HTMLImageElement) : null;
const pctEl = veil ? $("[data-veil-pct]", veil) : null;
if (veil) veil.style.animation = "none";
try { sessionStorage.setItem("sl-v", "1"); } catch { /* private mode */ }
type W = Window & { __vdone?: boolean; __vp?: () => number; __vctx?: (p: string) => string[] };
const win = window as W;

type WL = W & { __vlog?: (n: number) => void };
const iconWrap = veil ? $("[data-veil-iconw]", veil) : null;
const setPct = (v: number) => { if (!veil) return; veil.style.setProperty("--p", String(v)); if (pctEl) pctEl.textContent = String(Math.round(v)); (win as WL).__vlog?.(v); };
function setContext(path: string) {
  if (!veil || !win.__vctx) return;
  const c = win.__vctx(path);
  $("[data-veil-label]", veil).textContent = c[1];
  $("[data-veil-sub]", veil).textContent = c[2];
  if (icon) icon.src = `/img/icons/${c[3]}.webp`;
}

/** finish the loader (count to 100, icon locks in) and lift it like a curtain */
export function openVeil(delay = 0) {
  if (!veil) return Promise.resolve();
  if (reduced) { win.__vdone = true; veil.remove(); return Promise.resolve(); }
  return new Promise<void>((res) => {
    win.__vdone = true;
    const o = { v: win.__vp ? win.__vp() : 60 };
    const main = $("#main");
    gsap.timeline({ delay, onComplete: () => { gsap.set(veil, { autoAlpha: 0, clipPath: "none" }); } })
      .to(o, { v: 100, duration: 0.35, ease: "power2.out", onUpdate: () => setPct(o.v) })
      .fromTo(iconWrap, { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, 0.3)
      .to(core, { y: -30, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 0.5)
      .fromTo(veil, { clipPath: "inset(0% 0% 0% 0% round 0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0% round 0% 0% 50% 50%)", duration: 0.8, ease: "expo.inOut" }, 0.6)
      .fromTo(main, { y: 70 }, { y: 0, duration: 1.1, ease: "expo.out", clearProps: "transform" }, 0.75)
      .add(() => res(), 0.8);
  });
}

function leaveTo(url: string, x = innerWidth / 2, y = innerHeight / 2) {
  if (reduced || !veil) { location.href = url; return; }
  setContext(new URL(url).pathname);
  setPct(0);
  gsap.set(veil, { autoAlpha: 1, clipPath: `circle(0% at ${x}px ${y}px)` });
  gsap.set(core, { autoAlpha: 0, y: 20 });
  const o = { v: 0 };
  gsap.timeline({ onComplete: () => { try { sessionStorage.setItem("sl-v", "1"); } catch { /* */ } location.href = url; } })
    .to(veil, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: 0.6, ease: "expo.inOut" })
    .to(core, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" }, 0.22)
    .to(o, { v: 55, duration: 0.45, ease: "power1.out", onUpdate: () => setPct(o.v) }, 0.2);
}
let lastClick = { x: innerWidth / 2, y: innerHeight / 2 };
document.addEventListener("pointerdown", (e) => { lastClick = { x: e.clientX, y: e.clientY }; }, { passive: true });

document.addEventListener("click", (e) => {
  const a = (e.target as Element).closest?.("a") as HTMLAnchorElement | null;
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (a.target === "_blank" || a.hasAttribute("download")) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) return; // in-page anchor
  if (url.href === location.href) { e.preventDefault(); return; }
  e.preventDefault();
  closeMenu();
  leaveTo(url.href, lastClick.x, lastClick.y);
});
// back/forward cache: never come back to a covered page
window.addEventListener("pageshow", (e) => { if (e.persisted && veil) gsap.set(veil, { autoAlpha: 0, clipPath: "none" }); });

/* ---------------- Reveals ---------------- */
/** big page headline: words rise from a mask */
export function heroHeadline(delay = 0) {
  const h = $("[data-h1]");
  const ups = $$("[data-up]");
  if (!h) return;
  if (reduced) return;
  const s = new SplitText(h, { type: "words", wordsClass: "hw", mask: "words" });
  gsap.from(s.words, { yPercent: 115, duration: 1.3, ease: "expo.out", stagger: 0.06, delay });
  gsap.from(ups, { y: 26, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: delay + 0.25 });
}

export function initSplits() {
  $$(".split").forEach((h) => {
    const s = new SplitText(h, { type: "words", wordsClass: "word", mask: "words" });
    if (reduced) return;
    gsap.from(s.words, { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.06, scrollTrigger: { trigger: h, start: "top 88%" } });
  });
  $$("[data-fill]").forEach((mt) => {
    const ms = new SplitText(mt, { type: "words,chars", charsClass: "ch" });
    gsap.to(ms.chars, { color: getComputedStyle(mt).getPropertyValue("--fill") || "#0e0d0c", stagger: 0.02, ease: "none", scrollTrigger: { trigger: mt, start: "top 80%", end: "bottom 45%", scrub: reduced ? false : 0.6 } });
  });
}

export function countUp(els: HTMLElement[]) {
  els.forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: reduced ? 0 : 1.8, ease: "power3.out", onUpdate: () => (el.textContent = String(Math.round(o.v))) });
  });
}
/** run fn once when el first becomes visible — independent of pins and scroll math */
export function onceVisible(el: Element, fn: () => void, margin = "0px 0px -12% 0px") {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(); } }), { rootMargin: margin });
  io.observe(el);
}
export function countOnScroll(skip?: Element | null) {
  $$("[data-count]").filter((el) => !skip?.contains(el)).forEach((el) => onceVisible(el, () => countUp([el])));
}

/** frames (phones, ring cards) take the exact ratio of the screenshot inside them — nothing gets cropped */
export function fitFrames(scope: ParentNode = document) {
  $$<HTMLImageElement>(".rc:not(.rc--ph) > img", scope).forEach((img) => {
    const apply = () => { if (img.naturalWidth) (img.parentElement as HTMLElement).style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`; };
    if (img.complete) apply(); else img.addEventListener("load", () => { apply(); ScrollTrigger.refresh(); }, { once: true });
  });
}
fitFrames();

/** infinite marquee; speeds up with scroll velocity */
export function marquee(track: HTMLElement | null, speed: number, dir = 1) {
  if (!track) return;
  const items = Array.from(track.children);
  items.forEach((n) => track.appendChild(n.cloneNode(true)));
  $$("img", track).forEach((i, k) => { if (k >= $$("img", track).length / 2) i.setAttribute("alt", ""); });
  const w = () => track.scrollWidth / 2;
  const tw = gsap.to(track, { x: () => -w() * dir, duration: () => w() / speed, ease: "none", repeat: -1, modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % w()) } });
  track.addEventListener("mouseenter", () => gsap.to(tw, { timeScale: 0.2, duration: 0.6 }));
  track.addEventListener("mouseleave", () => gsap.to(tw, { timeScale: 1, duration: 0.6 }));
  if (reduced) tw.pause();
  ScrollTrigger.create({ onUpdate: (s) => { const v = Math.min(Math.abs(s.getVelocity()) / 800, 3); gsap.to(tw, { timeScale: 1 + v, duration: 0.3, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 1, delay: 0.3 }); } });
}

/** "Founder|DevOps|…" rotating role line */
export function roles() {
  $$("[data-roles]").forEach((el) => {
    const list = el.dataset.roles!.split("|");
    if (list.length < 2 || reduced) return;
    let i = 0;
    const span = $("span", el);
    const next = () => {
      i = (i + 1) % list.length;
      gsap.timeline()
        .to(span, { yPercent: -110, duration: 0.45, ease: "power3.in" })
        .add(() => { span.textContent = list[i]; })
        .fromTo(span, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out" });
    };
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => { if (s.isActive) { (el as any)._t ??= setInterval(next, 2200); } else { clearInterval((el as any)._t); (el as any)._t = null; } } });
  });
}

/* ---------------- Nav ---------------- */
const nav = $("[data-nav]");
const cursor = $(".cursor");
export const DARK = ".opslin, .cta, .gal, .fam--opslin, .footer__panel";
const navTheme = () => {
  const y = 46;
  nav.classList.toggle("on-dark", $$(DARK).some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; }));
};
$$(DARK).forEach((sec) => {
  sec.addEventListener("pointerenter", () => cursor.classList.add("on-dark"));
  sec.addEventListener("pointerleave", () => cursor.classList.remove("on-dark"));
});
let lastY = 0;
lenis.on("scroll", ({ scroll }: { scroll: number }) => {
  nav.classList.toggle("is-scrolled", scroll > 40);
  navTheme();
  nav.classList.toggle("is-hidden", scroll > lastY && scroll > 600 && !root.classList.contains("menu-open"));
  lastY = scroll;
});
// active link
const here = location.pathname.replace(/index\.html$/, "");
$$<HTMLAnchorElement>(".nav__links a, .menu__links a").forEach((a) => {
  const p = new URL(a.href).pathname;
  if (p !== "/" && here.startsWith(p)) a.classList.add("is-active");
});

const burger = $("[data-burger]");
function closeMenu() {
  if (!root.classList.contains("menu-open")) return;
  root.classList.remove("menu-open");
  burger.setAttribute("aria-expanded", "false");
  $("[data-menu]").setAttribute("aria-hidden", "true");
  lenis.start();
}
burger.addEventListener("click", () => {
  const open = root.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", String(open));
  $("[data-menu]").setAttribute("aria-hidden", String(!open));
  open ? lenis.stop() : lenis.start();
  if (open) gsap.from(".menu__links a", { yPercent: 100, autoAlpha: 0, stagger: 0.05, duration: 0.9, ease: "expo.out", delay: 0.2 });
});

/* ---------------- Clock ---------------- */
const clocks = $$("[data-clock]");
const tick = () => {
  const t = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date());
  clocks.forEach((c) => (c.textContent = t));
};
tick(); setInterval(tick, 20_000);

/* ---------------- FAQ ---------------- */
$$<HTMLDetailsElement>(".qa").forEach((d) => {
  const sum = $("summary", d), body = $(".qa__a", d);
  sum.addEventListener("click", (e) => {
    e.preventDefault();
    if (d.open) {
      gsap.to(body, { height: 0, duration: 0.5, ease: "power3.inOut", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); ScrollTrigger.refresh(); } });
    } else {
      d.open = true;
      gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.6, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
    }
  });
});
gsap.from(".faq .qa", { y: 30, autoAlpha: 0, stagger: 0.07, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".faq__list", start: "top 85%" } });

/* ---------------- Brief form → WhatsApp ---------------- */
const brief = $("[data-brief]") as HTMLFormElement | null;
brief?.addEventListener("submit", (e) => {
  e.preventDefault();
  const types = $$<HTMLInputElement>("[data-group=type] input:checked", brief).map((i) => i.value);
  const budget = ($<HTMLInputElement>("[data-group=budget] input:checked", brief) || ({} as HTMLInputElement)).value;
  const nameEl = brief.elements.namedItem("name") as HTMLInputElement;
  const name = nameEl.value.trim();
  const msg = (brief.elements.namedItem("msg") as HTMLTextAreaElement).value.trim();
  const err = $("[data-brief-err]", brief);
  if (!name) { err.textContent = "Add your name so we know who to reply to."; nameEl.focus(); return; }
  err.textContent = "";
  const text = [`Hi Shotlin! I'm ${name}.`, types.length ? `I want to build: ${types.join(", ")}.` : "", budget ? `Budget: ${budget}.` : "", msg ? `About the idea: ${msg}` : ""].filter(Boolean).join("\n");
  window.open(`https://wa.me/916297831930?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

/* ---------------- CTA band, footer, mobile CTA ---------------- */
const ctaFx = $("[data-cta-fx]") as HTMLCanvasElement | null;
if (ctaFx && !reduced) initElementsFx(ctaFx);
gsap.from(".cta__row > *, .cta__facts li", { y: 40, autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".cta", start: "top 70%" } });
const mcta = $("[data-mcta]");
const ctaSec = $(".cta");
if (mcta && ctaSec && !location.pathname.startsWith("/contact")) {
  ScrollTrigger.create({ trigger: document.body, start: "600 top", endTrigger: ctaSec, end: "top bottom", onToggle: (s) => mcta.classList.toggle("is-on", s.isActive) });
}

/* ---------------- Cursor + magnetic ---------------- */
export function bindCursor(scope: ParentNode = document) {
  if (!finePointer || reduced) return;
  const label = $(".cursor__label");
  $$("a, button, summary, label, [data-cursor]", scope).forEach((el) => {
    if ((el as any)._cur) return; (el as any)._cur = 1;
    el.addEventListener("pointerenter", () => {
      const l = (el as HTMLElement).dataset.cursor;
      if (l) { label.textContent = l; cursor.classList.add("is-label"); } else cursor.classList.add("is-hover");
    });
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-label", "is-hover"));
  });
  $$(".magnetic", scope).forEach((m) => {
    if ((m as any)._mag) return; (m as any)._mag = 1;
    const mx = gsap.quickTo(m, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const my = gsap.quickTo(m, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    m.addEventListener("pointermove", (e) => {
      const r = m.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.3); my((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    m.addEventListener("pointerleave", () => { mx(0); my(0); });
  });
}
if (finePointer && !reduced) {
  root.classList.add("has-cursor");
  const dot = $(".cursor__dot"), ring = $(".cursor__ring");
  const dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
  window.addEventListener("pointermove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  bindCursor();
}

/* ---------------- Ticker strips ---------------- */
$$("[data-ticker-track]").forEach((t, i) => marquee(t, i % 2 ? 50 : 70, 1));

window.addEventListener("load", () => ScrollTrigger.refresh());
