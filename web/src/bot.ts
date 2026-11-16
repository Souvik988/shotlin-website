/**
 * Shotbot — the Shotlin guide.
 * The page is its world: headings, cards, buttons and panel edges are platforms.
 * It walks along them, hops between them (squash & stretch, sometimes a flip, jet boost for
 * long jumps), sits with its legs dangling, falls when its platform scrolls away, waves when
 * the cursor comes close, dozes off when you stop, and explains each section in a bubble.
 * In the footer a giant Shotbot peeks over the panel edge holding on with both hands.
 */
import { gsap, ScrollTrigger, $, $$, reduced, finePointer, lenis } from "./core";

const INK = "#0e0d0c";
const VB_H = 172;
const FEET = 160 / VB_H; // feet line
const SEAT = 140 / VB_H; // body bottom (sitting line)

export function botSVG(extra = "") {
  return `<svg class="botsvg ${extra}" viewBox="0 0 140 ${VB_H}" aria-hidden="true">
  <g class="b-flame"><path d="M58 146c4 14 8 22 12 24 4-2 8-10 12-24-4 4-8 3-12-4-4 7-8 8-12 4z" fill="#ff4d12" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M65 148c2 6 3 9 5 10 2-1 3-4 5-10-2 2-3 1-5-2-2 3-3 4-5 2z" fill="#ffd23f"/></g>
  <g class="b-legL"><path d="M57 134v18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><rect x="45" y="150" width="20" height="10" rx="5" fill="#ff5cc8" stroke="${INK}" stroke-width="3.5"/></g>
  <g class="b-legR"><path d="M83 134v18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><rect x="75" y="150" width="20" height="10" rx="5" fill="#ff5cc8" stroke="${INK}" stroke-width="3.5"/></g>
  <g class="b-armL"><path d="M44 110c-14 2-22 10-24 22" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="134" r="8" fill="#c8ff2e" stroke="${INK}" stroke-width="3.5"/></g>
  <g class="b-armR"><path d="M96 110c14 2 22 10 24 22" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="134" r="8" fill="#c8ff2e" stroke="${INK}" stroke-width="3.5"/></g>
  <rect x="42" y="98" width="56" height="42" rx="15" fill="#3048ff" stroke="${INK}" stroke-width="4"/>
  <text x="70" y="127" text-anchor="middle" font-family="Bricolage Grotesque Variable, sans-serif" font-weight="800" font-size="22" fill="#fff">s.</text>
  <rect x="61" y="90" width="18" height="10" rx="3" fill="${INK}"/>
  <g class="b-head">
    <line x1="70" y1="24" x2="70" y2="10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <circle class="b-orb" cx="70" cy="8" r="6.5" fill="#ff4d12" stroke="${INK}" stroke-width="3.5"/>
    <rect x="10" y="46" width="14" height="26" rx="7" fill="#ff5cc8" stroke="${INK}" stroke-width="3.5"/>
    <rect x="116" y="46" width="14" height="26" rx="7" fill="#ff5cc8" stroke="${INK}" stroke-width="3.5"/>
    <rect x="20" y="22" width="100" height="72" rx="26" fill="#c8ff2e" stroke="${INK}" stroke-width="4"/>
    <rect x="31" y="33" width="78" height="48" rx="16" fill="${INK}"/>
    <g class="b-eyes">
      <g class="b-eye"><rect x="45" y="44" width="15" height="22" rx="7.5" fill="#38d6ff"/><circle cx="55" cy="50" r="3" fill="#fff"/></g>
      <g class="b-eye"><rect x="80" y="44" width="15" height="22" rx="7.5" fill="#ff7a2e"/><circle cx="90" cy="50" r="3" fill="#fff"/></g>
    </g>
    <path class="b-mouth" d="M63 72q7 5 14 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;
}

const HAND = `<svg viewBox="0 0 90 60" aria-hidden="true"><path d="M8 52c-2-14 2-30 14-38 10-6 22-6 30-2 10-6 22-4 28 6 6 10 4 24-2 34" fill="#c8ff2e" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M30 18v34M46 14v38M62 18v34" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>`;

const PLATFORMS = [
  ".h2", ".phero__h", ".svc__h", ".hero__title .w", ".btn", ".eyebrow", ".kit__name", ".pj__top", ".feat h3", ".rule__tab",
  ".num", ".way", ".qa summary", ".quote", ".stat", ".pcard", ".ticker", ".logos__label", ".case__title", ".wheel__drum",
  ".vs__card h3", ".bcard h2", ".person h3", ".flow__word", ".tabs", ".footer__lead", ".mini", ".next__row li", ".hub__node",
  ".scene", ".post__body h2", ".cta__title", ".ring__title", ".pipe__card", ".odo",
].join(",");

function blinkLoop(svg: SVGSVGElement) {
  if (reduced) return;
  const eyes = svg.querySelectorAll(".b-eye");
  gsap.set(eyes, { transformOrigin: "50% 50%" });
  const blink = () => {
    if (!svg.isConnected) return;
    if (!svg.closest(".is-sleep")) gsap.timeline().to(eyes, { scaleY: 0.1, duration: 0.07 }).to(eyes, { scaleY: 1, duration: 0.12 });
    gsap.delayedCall(2 + Math.random() * 3.5, blink);
  };
  gsap.delayedCall(1.5, blink);
  gsap.to(svg.querySelector(".b-orb"), { fill: "#38d6ff", duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
}

function lookAt(eyes: Element, svg: Element, px: number, py: number, max = 5) {
  const r = svg.getBoundingClientRect();
  const a = Math.atan2(py - (r.top + r.height * 0.33), px - (r.left + r.width / 2));
  const d = Math.min(1, Math.hypot(px - r.left - r.width / 2, py - r.top) / 300);
  gsap.to(eyes, { x: Math.cos(a) * max * d, y: Math.sin(a) * max * 0.8 * d, duration: 0.35, ease: "power3", overwrite: true });
}

/* ------------------------------------------------------------------ footer peek */
function initPeek() {
  const peek = $("[data-peek]");
  if (!peek) return;
  peek.innerHTML = `<div class="peek__bot">${botSVG("botsvg--big")}</div><div class="peek__hand peek__hand--l">${HAND}</div><div class="peek__hand peek__hand--r">${HAND}</div>`;
  const big = $("svg", peek) as unknown as SVGSVGElement;
  blinkLoop(big);
  gsap.set(big.querySelectorAll(".b-flame, .b-armL, .b-armR, .b-legL, .b-legR"), { autoAlpha: 0 });
  if (finePointer) window.addEventListener("pointermove", (e) => { if (ScrollTrigger.isInViewport(peek, 0.01)) lookAt(big.querySelector(".b-eyes")!, big, e.clientX, e.clientY, 7); }, { passive: true });
  if (reduced) return;
  gsap.set(".peek__bot", { yPercent: 70 });
  gsap.set(".peek__hand", { yPercent: 120, rotate: (i) => (i ? 18 : -18) });
  const word = $("[data-footer-word]");
  if (word && !word.dataset.split) {
    word.dataset.split = "1";
    const dot = word.querySelector(".dot");
    word.innerHTML = [...(word.textContent || "").trim()].map((c) => `<span class="fl">${c}</span>`).join("");
    if (dot) word.lastElementChild?.append(dot);
  }
  const letters = $$(".fl");
  gsap.set(letters, { yPercent: 110 });
  gsap.timeline({ scrollTrigger: { trigger: ".footer", start: "top 70%" } })
    .to(".peek__hand", { yPercent: 0, rotate: 0, duration: 0.7, ease: "back.out(2.2)", stagger: 0.08 })
    .to(".peek__bot", { yPercent: 0, duration: 1.1, ease: "elastic.out(1, 0.55)" }, 0.25)
    .to(letters, { yPercent: 0, duration: 0.9, ease: "back.out(1.8)", stagger: 0.06 }, 0.35);
  letters.forEach((l) => l.addEventListener("pointerenter", () => gsap.fromTo(l, { yPercent: 0 }, { yPercent: -18, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" })));
  gsap.to(".peek__bot", { y: -6, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 });
}

/* ------------------------------------------------------------------ explorer */
export function initBot() {
  initPeek();
  let off = false;
  try { off = sessionStorage.getItem("sl-bot-off") === "1"; } catch { /* ignore */ }
  if (off) return;

  const g = document.createElement("div");
  g.className = "bot";
  g.innerHTML = `<i class="bot__shadow"></i><button class="bot__btn" type="button" aria-label="Shotbot, your guide — tap to jump to the next section">${botSVG()}</button><span class="bot__zzz" aria-hidden="true"><b>z</b><b>z</b><b>Z</b></span>
    <div class="bot__bubble" role="status" aria-live="polite"><b class="mono">Shotbot</b><p></p><div class="bot__row"><button class="bot__next mono" type="button">Next section ↓</button></div><button class="bot__x" type="button" aria-label="Hide Shotbot">×</button></div>`;
  document.body.append(g);
  const btn = $(".bot__btn", g);
  const svg = $("svg", g) as unknown as SVGSVGElement;
  const bubble = $(".bot__bubble", g), para = $("p", bubble), shadow = $(".bot__shadow", g);
  const eyes = svg.querySelector(".b-eyes")!;
  const P = (s: string) => svg.querySelector(s)!;
  const flame = P(".b-flame"), armL = P(".b-armL"), armR = P(".b-armR"), legL = P(".b-legL"), legR = P(".b-legR");
  gsap.set(armL, { svgOrigin: "44 110" }); gsap.set(armR, { svgOrigin: "96 110" });
  gsap.set(legL, { svgOrigin: "57 136" }); gsap.set(legR, { svgOrigin: "83 136" });
  gsap.set(flame, { svgOrigin: "70 146", scaleY: 0, autoAlpha: 0 });
  blinkLoop(svg);

  const size = () => btn.offsetWidth || 80;
  const H = () => size() * (VB_H / 140);
  type Mode = "floor" | "stand" | "jump" | "sit";
  const st = { mode: "floor" as Mode, el: null as Element | null, ox: 0, x: 24, y: innerHeight - 140, busy: false, idleAt: performance.now() + 3500, vel: 0, lastScroll: 0, lastAct: performance.now(), hidden: false, sleeping: false };

  const visibleRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 8) return null;
    if (r.top < 96 || r.top > innerHeight - 60 || r.right < 10 || r.left > innerWidth - 10) return null;
    if ((el as HTMLElement).offsetParent === null && getComputedStyle(el).position !== "fixed") return null;
    return r;
  };
  const standPos = (el: Element | null, ox: number, sitting = false) => {
    const s = size(), h = H();
    if (!el) return { x: gsap.utils.clamp(8, innerWidth - s - 8, st.x), y: innerHeight - h * FEET - 8 };
    const r = el.getBoundingClientRect();
    const x = gsap.utils.clamp(Math.max(6, r.left - s * 0.2), Math.min(innerWidth - s - 6, r.right - s * 0.8), r.left + ox);
    return { x, y: r.top - h * (sitting ? SEAT : FEET) + (sitting ? 2 : 1) };
  };
  const candidates = () => {
    const out: { el: Element; d: number }[] = [];
    for (const el of document.querySelectorAll(PLATFORMS)) {
      if (el === st.el || g.contains(el)) continue;
      const r = visibleRect(el);
      if (!r) continue;
      const d = Math.hypot(r.left + r.width / 2 - (st.x + size() / 2), r.top - st.y);
      if (d < innerWidth * 0.7) out.push({ el, d });
    }
    return out.sort((a, b) => a.d - b.d);
  };

  /* ---- poses ---- */
  const legsWalk = gsap.timeline({ paused: true, repeat: -1, yoyo: true })
    .fromTo(legL, { rotate: -24 }, { rotate: 24, duration: 0.18, ease: "sine.inOut" }, 0)
    .fromTo(legR, { rotate: 24 }, { rotate: -24, duration: 0.18, ease: "sine.inOut" }, 0)
    .fromTo(armL, { rotate: 18 }, { rotate: -14, duration: 0.18, ease: "sine.inOut" }, 0)
    .fromTo(armR, { rotate: 14 }, { rotate: -18, duration: 0.18, ease: "sine.inOut" }, 0);
  const rest = () => { legsWalk.pause(); gsap.to([legL, legR, armL, armR], { rotate: 0, scaleY: 1, duration: 0.3 }); };
  let kick: gsap.core.Timeline | null = null;
  const sitPose = (on: boolean) => {
    kick?.kill(); kick = null;
    if (on) {
      gsap.to([legL, legR], { scaleY: 0.82, duration: 0.3 });
      kick = gsap.timeline({ repeat: -1, yoyo: true }).to(legL, { rotate: -16, duration: 0.6, ease: "sine.inOut" }).to(legR, { rotate: 16, duration: 0.6, ease: "sine.inOut" }, 0.3);
    } else gsap.to([legL, legR], { scaleY: 1, rotate: 0, duration: 0.25 });
  };
  const wave = () => gsap.timeline().to(armR, { rotate: -120, duration: 0.25, ease: "back.out(2)" }).to(armR, { rotate: -95, duration: 0.16, repeat: 5, yoyo: true, ease: "sine.inOut" }).to(armR, { rotate: 0, duration: 0.3 });
  const setFlame = (on: boolean) => gsap.to(flame, { scaleY: on ? 1 : 0, autoAlpha: on ? 1 : 0, duration: 0.2 });
  const wake = () => {
    st.lastAct = performance.now();
    if (!st.sleeping) return;
    st.sleeping = false; g.classList.remove("is-sleep");
    gsap.to(eyes, { scaleY: 1, duration: 0.2 });
    gsap.fromTo(btn, { y: 0 }, { y: -18, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
  };

  /* ---- moves ---- */
  function jumpTo(el: Element | null, opts: { fall?: boolean; sit?: boolean } = {}) {
    if (st.busy) return;
    if (st.mode === "sit") sitPose(false);
    rest();
    const s = size();
    const r = el?.getBoundingClientRect();
    const ox = r ? gsap.utils.clamp(0, Math.max(0, r.width - s * 0.6), (r.width - s) * Math.random()) : 0;
    const from = { x: st.x, y: st.y };
    const to0 = standPos(el, ox, opts.sit);
    const dist = Math.hypot(to0.x - from.x, to0.y - from.y);
    const arc = opts.fall ? 10 : 60 + Math.min(240, dist * 0.3);
    const jet = !opts.fall && dist > 520;
    const flip = !opts.fall && !jet && dist > 240 && Math.random() < 0.35;
    const dir = to0.x < from.x ? -1 : 1;
    st.busy = true; st.mode = "jump";
    g.classList.toggle("is-left", dir < 0);
    const prog = { t: 0 };
    gsap.timeline({
      onComplete() {
        st.busy = false; st.el = el; st.ox = ox;
        st.mode = el ? (opts.sit ? "sit" : "stand") : "floor";
        if (opts.sit) sitPose(true);
        st.idleAt = performance.now() + gsap.utils.random(2400, 5200);
      },
    })
      .to(btn, { scaleY: 0.72, scaleX: 1.2, duration: 0.1, ease: "power2.out", transformOrigin: "50% 95%" })
      .add(() => { gsap.to([armL], { rotate: 50, duration: 0.2 }); gsap.to([armR], { rotate: -50, duration: 0.2 }); if (jet) setFlame(true); })
      .to(prog, {
        t: 1, duration: opts.fall ? 0.45 : 0.5 + Math.min(0.6, dist / 1500), ease: "none",
        onStart: () => { gsap.to(btn, { scaleY: 1.15, scaleX: 0.88, duration: 0.18, ease: "power2.out" }); },
        onUpdate() {
          const t = prog.t, to = standPos(el, ox, opts.sit);
          st.x = from.x + (to.x - from.x) * t;
          st.y = from.y + (to.y - from.y) * (opts.fall ? t * t : t) - arc * 4 * t * (1 - t);
          gsap.set(btn, { rotation: flip ? dir * 360 * gsap.parseEase("power2.inOut")(t) : dir * 10 * Math.sin(t * Math.PI) });
        },
      })
      .add(() => { setFlame(false); gsap.to([armL, armR], { rotate: 0, duration: 0.3 }); })
      .set(btn, { rotation: 0 })
      .to(btn, { scaleY: 0.7, scaleX: 1.25, duration: 0.09, ease: "power2.out" })
      .to(btn, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1,0.35)" });
  }
  function walkAlong() {
    const r = st.el?.getBoundingClientRect();
    if (!r || r.width < size() * 1.8 || st.mode !== "stand") return false;
    const target = gsap.utils.random(0, r.width - size() * 0.6);
    g.classList.toggle("is-left", target < st.ox);
    legsWalk.play();
    st.busy = true;
    gsap.to(st, { ox: target, duration: Math.abs(target - st.ox) / 95 + 0.3, ease: "sine.inOut", onComplete() { rest(); st.busy = false; st.idleAt = performance.now() + gsap.utils.random(1800, 4200); } });
    return true;
  }
  function walkFloor() {
    const target = gsap.utils.random(12, innerWidth - size() - 12);
    g.classList.toggle("is-left", target < st.x);
    legsWalk.play(); st.busy = true;
    gsap.to(st, { x: target, duration: Math.abs(target - st.x) / 140 + 0.3, ease: "sine.inOut", onComplete() { rest(); st.busy = false; st.idleAt = performance.now() + gsap.utils.random(1500, 3500); } });
  }
  function hop(sit = false) {
    const c = candidates();
    if (!c.length) { if (st.mode !== "floor") jumpTo(null, { fall: true }); return; }
    jumpTo(c[Math.floor(Math.random() * Math.min(5, c.length))].el, { sit });
  }
  function idleTrick() {
    const r = Math.random();
    if (r < 0.32) { if (!walkAlong()) hop(); }
    else if (r < 0.55) hop();
    else if (r < 0.7 && st.mode === "stand") { st.mode = "sit"; sitPose(true); gsap.to(st, { y: "+=0" }); st.idleAt = performance.now() + 6000; }
    else if (r < 0.82) { wave(); st.idleAt = performance.now() + 2600; }
    else if (r < 0.92) { // look around
      gsap.timeline().to(eyes, { x: -6, duration: 0.25 }).to(eyes, { x: 6, duration: 0.4, delay: 0.4 }).to(eyes, { x: 0, duration: 0.25, delay: 0.4 });
      st.idleAt = performance.now() + 2200;
    } else { // happy spin-jump in place
      gsap.timeline().to(btn, { y: -40, rotation: 360, duration: 0.55, ease: "power2.out" }).to(btn, { y: 0, duration: 0.35, ease: "bounce.out" }).set(btn, { rotation: 0 });
      st.idleAt = performance.now() + 2600;
    }
  }

  /* ---- speech ---- */
  let typing: number | undefined, hideT: gsap.core.Tween | undefined;
  const say = (msg: string, hold = 7) => {
    if (!msg) return;
    clearInterval(typing); hideT?.kill();
    gsap.fromTo(bubble, { autoAlpha: 0, scale: 0.6, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2.2)" });
    if (reduced) para.textContent = msg;
    else { let i = 0; para.textContent = ""; typing = window.setInterval(() => { para.textContent = msg.slice(0, ++i); if (i >= msg.length) clearInterval(typing); }, 17); }
    if (!st.busy && st.mode !== "jump") wave();
    hideT = gsap.to(bubble, { autoAlpha: 0, scale: 0.8, duration: 0.3, delay: innerWidth < 700 ? 4.5 : hold });
  };

  /* ---- sections: talk + run to the heading ---- */
  const perches = $$("[data-bot]");
  let active: HTMLElement | null = null, pending: HTMLElement | null = null, pendingSince = 0, frame = 0;
  const pick = () => {
    let best: HTMLElement | null = null, bestD = Infinity;
    const line = innerHeight * 0.38;
    for (const p of perches) {
      const r = p.getBoundingClientRect();
      if (r.bottom < 90 || r.top > innerHeight * 0.8 || r.width === 0) continue;
      const d = Math.abs(r.top - line);
      if (d < bestD) { bestD = d; best = p; }
    }
    const now = performance.now();
    if (best !== pending) { pending = best; pendingSince = now; return; }
    if (best && best !== active && now - pendingSince > 300) {
      active = best;
      say(best.dataset.bot!);
      wake();
      if (!st.busy && visibleRect(best) && !reduced) jumpTo(best, { sit: Math.random() < 0.4 });
    }
  };
  const next = () => {
    const y = lenis.scroll + 10;
    const t = perches.find((s) => s.getBoundingClientRect().top + lenis.scroll > y + innerHeight * 0.45);
    if (t) lenis.scrollTo(t, { offset: -innerHeight * 0.3, duration: 1.6 });
    else lenis.scrollTo(document.body.scrollHeight, { duration: 2 });
    wake();
  };

  /* ---- input ---- */
  btn.addEventListener("click", () => { next(); if (!reduced) gsap.fromTo(btn, { rotation: 0 }, { rotation: 360, duration: 0.7, ease: "back.out(1.4)" }); });
  $(".bot__next", g).addEventListener("click", next);
  g.addEventListener("pointerenter", () => { wake(); if (para.textContent && gsap.getProperty(bubble, "autoAlpha") === 0) say(para.textContent, 4); });
  $(".bot__x", g).addEventListener("click", (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem("sl-bot-off", "1"); } catch { /* ignore */ }
    gsap.to(g, { y: "+=200", autoAlpha: 0, duration: 0.6, ease: "back.in(2)", onComplete: () => g.remove() });
  });
  let near = false;
  window.addEventListener("pointermove", (e) => {
    lookAt(eyes, svg, e.clientX, e.clientY);
    const d = Math.hypot(e.clientX - (st.x + size() / 2), e.clientY - (st.y + H() / 2));
    if (d < 130 && !near) { near = true; wake(); if (!st.busy) wave(); }
    if (d > 200) near = false;
  }, { passive: true });
  lenis.on("scroll", ({ velocity }: { velocity: number }) => { st.vel = Math.abs(velocity); st.lastScroll = performance.now(); wake(); });

  /* ---- footer: the giant takes over ---- */
  const foot = $(".footer");
  if (foot) ScrollTrigger.create({
    trigger: foot, start: "top 75%",
    onEnter: () => { st.hidden = true; gsap.to(g, { autoAlpha: 0, scale: 0.4, duration: 0.5, ease: "back.in(2)" }); },
    onLeaveBack: () => { st.hidden = false; gsap.to(g, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }); },
  });

  /* ---- loop ---- */
  gsap.set(g, { x: st.x, y: st.y, autoAlpha: 0 });
  gsap.to(g, { autoAlpha: 1, duration: 0.6, delay: reduced ? 0 : 2.6 });
  gsap.delayedCall(reduced ? 0 : 3, () => { if (!active) say(document.body.dataset.botHello || "Hi, I'm Shotbot! I'll walk you through Shotlin."); });

  gsap.ticker.add(() => {
    if (st.hidden) return;
    const now = performance.now();
    if (++frame % 6 === 0) pick();
    if (!reduced) {
      const calm = now - st.lastScroll > 300;
      if ((st.mode === "stand" || st.mode === "sit") && !st.busy) {
        if (!st.el || !visibleRect(st.el)) {
          if (st.vel > 1.5) { st.el = null; jumpTo(null, { fall: true }); } else hop();
        } else if (calm && now > st.idleAt && !st.sleeping) idleTrick();
      } else if (st.mode === "floor" && !st.busy && calm && now > st.idleAt && !st.sleeping) {
        Math.random() < 0.5 ? hop() : walkFloor();
        st.idleAt = now + 1500;
      }
      // doze off after a while without scroll or pointer
      if (!st.sleeping && !st.busy && now - st.lastAct > 16000 && st.mode !== "jump") {
        st.sleeping = true; g.classList.add("is-sleep");
        if (st.mode === "stand") { st.mode = "sit"; sitPose(true); }
        gsap.to(eyes, { scaleY: 0.12, duration: 0.4 });
      }
    }
    if (st.mode !== "jump") {
      if (st.mode === "floor" && !st.busy) { const p = standPos(null, 0); st.y = p.y; st.x = p.x; }
      else if (st.mode !== "floor") { const p = standPos(st.el, st.ox, st.mode === "sit"); st.x = p.x; st.y = p.y; }
    }
    gsap.set(g, { x: st.x, y: st.y });
    gsap.set(shadow, { opacity: st.mode === "jump" ? 0.1 : 0.32, scaleX: st.mode === "jump" ? 0.5 : 1 });
    g.classList.toggle("is-flip", st.x > innerWidth * 0.55);
    g.classList.toggle("is-below", st.y < 190);
  });
}
