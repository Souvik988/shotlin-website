import { gsap, ScrollTrigger, Flip, $, $$, reduced, finePointer, bindCursor } from "../core";
import { blog, post } from "./blog";

const mm = gsap.matchMedia();

/** shared: hero orbs follow the pointer a little */
function orbs() {
  const bg = $(".phero__bg");
  if (!bg || !finePointer || reduced) return;
  const o = $$(".phero__orb", bg);
  const qx = o.map((el) => gsap.quickTo(el, "x", { duration: 1.6, ease: "power3" }));
  const qy = o.map((el) => gsap.quickTo(el, "y", { duration: 1.6, ease: "power3" }));
  window.addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    qx.forEach((q, i) => q(x * (i ? -80 : 80))); qy.forEach((q, i) => q(y * (i ? -60 : 60)));
  }, { passive: true });
}

function rise(sel: string, trigger?: string, stagger = 0.08) {
  if (reduced) return;
  $$(sel).forEach((el, i) => {
    gsap.from(el, { y: 70, autoAlpha: 0, duration: 1.2, ease: "expo.out", delay: trigger ? (i % 4) * stagger : 0, scrollTrigger: { trigger: trigger ?? el, start: "top 88%" } });
  });
}

/* ---------------- Launch kits ---------------- */
function kits() {
  if (!reduced) {
    // tilted wall of screens: columns drift in opposite directions, scroll tips the wall
    $$("[data-wall-col]").forEach((c, i) => gsap.to(c, { yPercent: i % 2 ? 0 : -50, startAt: { yPercent: i % 2 ? -50 : 0 }, duration: 26 + i * 4, ease: "none", repeat: -1 }));
    gsap.to(".wall", { scale: 1.12, autoAlpha: 0.15, ease: "none", scrollTrigger: { trigger: ".phero", start: "top top", end: "bottom top", scrub: true } });
  }
  // stacking cards: each card shrinks back as the next one slides over it
  const cards = $$("[data-kit]");
  // (desktop and mobile alike) — dimming uses an overlay opacity, not a filter, to keep scrolling smooth
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (next && !reduced) gsap.to(c, { scale: 0.92, "--dim": 0.5, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top 18%", scrub: true } });
    if (!reduced) gsap.from($$(".phone, .browser", c), { y: 120, rotate: (k) => (k % 2 ? 6 : -6), stagger: 0.1, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "top 25%", scrub: true } });
  });
  if (!reduced) {
    gsap.from(".vs__card--ice", { xPercent: -30, rotate: -6, autoAlpha: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".vs__grid", start: "top 80%" } });
    gsap.from(".vs__card--fire", { xPercent: 30, rotate: 6, autoAlpha: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".vs__grid", start: "top 80%" } });
    gsap.from(".vs__or", { scale: 0, rotate: -120, duration: 1.2, ease: "back.out(2)", scrollTrigger: { trigger: ".vs__grid", start: "top 70%" } });
    gsap.from(".vs__card li", { x: -20, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: ".vs__grid", start: "top 70%" } });
  }
}

/* ---------------- Kit detail ---------------- */
function kit() {
  const vis = $$("[data-khero-vis] > *");
  if (!reduced) {
    gsap.from(vis, { y: 160, rotate: (i) => (i - 1) * 8, autoAlpha: 0, duration: 1.6, ease: "expo.out", stagger: 0.12, delay: 0.5 });
    vis.forEach((v, i) => gsap.to(v, { yPercent: -10 - i * 12, ease: "none", scrollTrigger: { trigger: "[data-khero]", start: "top top", end: "bottom top", scrub: true } }));
    if (finePointer) {
      const box = $("[data-khero-vis]");
      box.addEventListener("pointermove", (e) => {
        const r = box.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        vis.forEach((v, i) => gsap.to(v, { rotateY: x * (10 + i * 4), rotateX: -y * 8, duration: 0.8, ease: "power3" }));
      });
      box.addEventListener("pointerleave", () => gsap.to(vis, { rotateY: 0, rotateX: 0, duration: 1, ease: "power3" }));
    }
    // hub: lines draw from the core, nodes pop in
    const paths = $$<SVGPathElement>(".hub__lines path");
    paths.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
    gsap.timeline({ scrollTrigger: { trigger: "[data-hub]", start: "top 65%" } })
      .from(".hub__core", { scale: 0.4, autoAlpha: 0, duration: 1, ease: "back.out(1.8)" })
      .to(paths, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut", stagger: 0.12 }, 0.4)
      .from(".hub__node", { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: "back.out(2)", stagger: 0.12 }, 0.8);
    rise(".feat", ".feats__grid", 0.07);
  }
  // gallery: horizontal pin when it overflows
  mm.add("(min-width: 0px)", () => {
    const track = $("[data-gal-track]");
    if (!track || reduced) return;
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
    if (dist() < 40) { gsap.from(track.children, { y: 80, autoAlpha: 0, stagger: 0.1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: track, start: "top 80%" } }); return; }
    gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "[data-gal]", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true } });
  });
  rise(".mini", ".others__row", 0.06);
}

/* ---------------- Custom builds ---------------- */
function custom() {
  const grid = $("[data-pjgrid]");
  const cards = $$(".pj", grid);
  const tabs = $$("[data-tabs] button");
  const pill = $("[data-tabs-pill]");
  const movePill = (b: HTMLElement, instant = false) => gsap.to(pill, { x: b.offsetLeft, width: b.offsetWidth, duration: instant ? 0 : 0.6, ease: "expo.out" });
  document.fonts.ready.then(() => movePill(tabs[0], true));
  tabs.forEach((b) => b.addEventListener("click", () => {
    const f = b.dataset.filter!;
    tabs.forEach((t) => { t.classList.toggle("is-on", t === b); t.setAttribute("aria-selected", String(t === b)); });
    movePill(b);
    const state = Flip.getState(cards);
    cards.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && !c.dataset.cat!.split(" ").includes(f)));
    Flip.from(state, {
      duration: reduced ? 0 : 0.8, ease: "expo.inOut", scale: true, absolute: true, nested: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "expo.out" }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.4 }),
      onComplete: () => { gsap.set(cards, { clearProps: "transform,translate,width,height,top,left,position" }); ScrollTrigger.refresh(); },
    });
  }));
  if (!reduced) {
    cards.forEach((c) => {
      gsap.from(c.children, { y: 90, autoAlpha: 0, duration: 1.3, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: c, start: "top 90%" } });
      gsap.fromTo($$(".phone, .browser", c), { yPercent: 8 }, { yPercent: -8, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // capability orbit spins with scroll
    const ring = $("[data-orbit] ul");
    if (ring) {
      const items = $$("li", ring);
      items.forEach((li, i) => li.style.setProperty("--a", `${(360 / items.length) * i}deg`));
      gsap.to(ring, { rotate: 180, ease: "none", scrollTrigger: { trigger: "[data-caps]", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.to(items, { rotate: -180, ease: "none", scrollTrigger: { trigger: "[data-caps]", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.from(items, { scale: 0, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: "[data-caps]", start: "top 70%" } });
    }
  }
}

/* ---------------- About ---------------- */
function about() {
  if (reduced) return;
  // two portraits slam in from the sides like trading cards, then fan apart on scroll
  const duo = $("[data-ahero-duo]");
  if (duo) {
    gsap.from(".aduo--ice", { xPercent: -80, rotate: -24, autoAlpha: 0, duration: 1.4, ease: "back.out(1.4)", delay: 0.7 });
    gsap.from(".aduo--fire", { xPercent: 80, rotate: 24, autoAlpha: 0, duration: 1.4, ease: "back.out(1.4)", delay: 0.85 });
    gsap.from(".aduo__amp", { scale: 0, rotate: -180, duration: 1.1, ease: "back.out(2.4)", delay: 1.3 });
    // scroll fan-out uses x/y only so it never fights the entrance (xPercent/rotate)
    gsap.to(".aduo--ice", { x: -50, y: 40, ease: "none", scrollTrigger: { trigger: duo, start: "top 40%", end: "bottom top", scrub: 0.6 } });
    gsap.to(".aduo--fire", { x: 50, y: 40, ease: "none", scrollTrigger: { trigger: duo, start: "top 40%", end: "bottom top", scrub: 0.6 } });
    $$(".aduo", duo).forEach((f) => f.addEventListener("pointermove", (e) => {
      const r = f.getBoundingClientRect();
      gsap.to($("img", f), { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 10, rotateX: -((e.clientY - r.top) / r.height - 0.5) * 8, scale: 1.04, duration: 0.6, ease: "power3", transformPerspective: 900 });
    }));
    $$(".aduo", duo).forEach((f) => f.addEventListener("pointerleave", () => gsap.to($("img", f), { rotateY: 0, rotateX: 0, scale: 1, duration: 0.8 })));
  }
  $$("[data-person-media]").forEach((m, i) => {
    gsap.fromTo(m, { clipPath: i ? "inset(0% 0% 0% 100% round 28px)" : "inset(0% 100% 0% 0% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: m, start: "top 75%" } });
    gsap.fromTo($("img", m), { scale: 1.25, yPercent: -5 }, { scale: 1.05, yPercent: 5, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from($$(".person__body > *", m.parentElement!), { y: 40, autoAlpha: 0, stagger: 0.07, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: m, start: "top 65%" } });
  });
  rise(".num", ".nums", 0.08);
  // four rules stack like folder tabs: each one slides up over the last, leaving its tab visible
  const rules = $$(".rule");
  if (rules.length) {
    const TAB = () => ($(".rule__tab", rules[0])?.offsetHeight || 76);
    const place = () => rules.forEach((r, i) => { r.style.top = `${i * TAB()}px`; r.style.zIndex = String(i + 1); });
    place(); window.addEventListener("resize", place);
    // same pinned stack on every screen size (mobile included)
    gsap.set(rules.slice(1), { yPercent: 115 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-rules-pin]", start: "top top", end: "+=220%", pin: true, scrub: 1, anticipatePin: 1 } });
    rules.slice(1).forEach((r, i) => {
      tl.to(r, { yPercent: 0, duration: 1, ease: "power2.out" }, i * 1.1)
        .to(rules[i], { scale: 0.96, "--dim": 0.25, duration: 1, ease: "none" }, i * 1.1)
        .from($$(".rule__big, .rule__body p:not(.rule__big)", r), { y: 50, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, i * 1.1 + 0.4);
    });
    tl.to({}, { duration: 0.6 });
  }
  // pipeline: cards slide in from both sides, the tube fills
  if ($(".pipe")) {
    gsap.from(".pipe__card--s", { xPercent: -40, rotate: -6, autoAlpha: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".pipe__row", start: "top 80%" } });
    gsap.from(".pipe__card--o", { xPercent: 40, rotate: 6, autoAlpha: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".pipe__row", start: "top 80%" } });
    gsap.from(".pipe__flow", { scaleX: 0, transformOrigin: "left", duration: 1.2, ease: "power2.inOut", delay: 0.4, scrollTrigger: { trigger: ".pipe__row", start: "top 80%" } });
  }
}

/* ---------------- Contact ---------------- */
function contact() {
  if (reduced) return;
  gsap.from(".way", { x: -60, autoAlpha: 0, stagger: 0.09, duration: 1.2, ease: "expo.out", delay: 0.6 });
  gsap.from(".brief", { y: 80, autoAlpha: 0, duration: 1.4, ease: "expo.out", delay: 0.75 });
  gsap.from(".next__row li", { y: 50, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".next", start: "top 80%" } });
}

export default function inner(page: string) {
  orbs();
  ({ kits, kit, custom, about, contact, blog, post, legal: post } as Record<string, () => void>)[page]?.();
  bindCursor();
}
