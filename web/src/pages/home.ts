import { gsap, ScrollTrigger, $, $$, reduced, root, lenis, isWarm, openVeil, countUp, countOnScroll, marquee, onceVisible } from "../core";
import { initHeroGL } from "../hero-gl";

export default function home() {
  /* ---------------- Hero WebGL ---------------- */
  const hero = $("[data-hero]");
  const stage = $("[data-stage]");
  const tags = { ice: $("[data-tag=ice]"), fire: $("[data-tag=fire]") };
  const cursor = $(".cursor");
  let heroGL: Awaited<ReturnType<typeof initHeroGL>> = null;

  const setHeat = (h: number) => {
    gsap.to(root, { "--heat": h, duration: 0.6, overwrite: true });
    tags.ice.classList.toggle("is-hot", h < -0.3);
    tags.fire.classList.toggle("is-hot", h > 0.3);
    cursor.classList.toggle("is-ice", h < -0.3);
    cursor.classList.toggle("is-fire", h > 0.3);
    if (h !== 0) hero.classList.add("is-touched");
  };

  const glReady = initHeroGL({ canvas: $("[data-gl]") as HTMLCanvasElement, stage, reduced, onHeat: setHeat })
    .then((g) => { heroGL = g; if (g) document.body.classList.add("gl-ready"); return g; })
    .catch((err) => { console.warn("hero gl disabled", err); return null; });

  const heroTitle = $("[data-hero-title]");
  const heroWords = $$(".w", heroTitle);
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set(".reveal-up", { y: 24, autoAlpha: 0 });
  gsap.set([tags.ice, tags.fire], { autoAlpha: 0, scale: 0.8 });
    gsap.set(heroTitle, { "--ul": 0 });

  function intro() {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .add(() => { glReady.then((g) => g && gsap.to(g.state, { intro: 1, duration: 1.6, ease: "power2.out" })); })
      .fromTo(stage, { y: 80, scale: 0.94, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.8 }, 0)
      .to(heroWords, { yPercent: 0, duration: 1.4, stagger: 0.07 }, 0.25)
      .to(heroTitle, { "--ul": 1, duration: 1.2, ease: "expo.inOut" }, 1.0)
      .to(".reveal-up", { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08 }, 0.6)
      .to(tags.ice, { autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(1.6)" }, 1.0)
      .to(tags.fire, { autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(1.6)" }, 1.15)
      .add(() => { lenis.start(); countUp($$("[data-count]", hero)); }, 0.8);
  }

  if (reduced) {
    $("[data-veil]")?.remove();
    gsap.set([heroWords, ".reveal-up", tags.ice, tags.fire], { clearProps: "all" });
    glReady.then((g) => g && (g.state.intro = 1));
    lenis.start();
  } else {
    // the loader keeps counting until the hero textures are in (cap so it never hangs)
    Promise.race([glReady, new Promise((r) => setTimeout(r, isWarm ? 1200 : 2600))]).then(() => openVeil(0).then(intro));
  }

  if (!reduced) {
    gsap.to(stage, { scale: 0.86, yPercent: 8, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(heroTitle, { yPercent: -40, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to([".hero__top", ".hero__foot"], { y: -80, autoAlpha: 0, ease: "none", scrollTrigger: { trigger: hero, start: "10% top", end: "60% top", scrub: true } });
  }
  countOnScroll(hero);
  marquee($(".marquee__track"), 60);
  marquee($(".tmarquee__row"), 40);

  const mm = gsap.matchMedia();

  /* ---------------- Build: sketch → wireframe → UI → code → shipped ---------------- */
  const story = $("[data-story]");
  if (story) {
    const pin = $("[data-story-pin]", story);
    const media = $("[data-story-media]", story);
    const gap = $(".story__gap", story);
    const steps = $$("[data-forge-steps] li", story);
    const lines = $$(".cl", media);
    const status = $("[data-build-status]", media);
    const setStep = (i: number) => steps.forEach((s, k) => { s.classList.toggle("is-on", k === i); s.classList.toggle("is-done", k < i); });
    const pill = () => {
      const p = pin.getBoundingClientRect(), g = gap.getBoundingClientRect();
      return `inset(${g.top - p.top}px ${p.right - g.right}px ${p.bottom - g.bottom}px ${g.left - p.left}px round ${g.height / 2}px)`;
    };
    if (reduced) {
      gsap.set(media, { clipPath: "inset(0px 0px 0px 0px round 0px)" });
      setStep(4);
    } else {
      gsap.set(media, { clipPath: pill });
      gsap.set(".fl-wire, .fl-ui", { clipPath: "inset(0% 0% 100% 0%)" });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin, start: "top top", end: "+=430%", pin: true, scrub: 1, invalidateOnRefresh: true },
        onUpdate: () => {
          const t = tl.time();
          setStep(t < 2.3 ? 0 : t < 3.4 ? 1 : t < 4.6 ? 2 : t < 5.9 ? 3 : 4);
          const live = t > 5.9;
          status.textContent = live ? "live ✓" : "building…";
          status.classList.toggle("is-live", live);
          gsap.set("[data-forge-bar]", { scaleX: tl.progress() });
        },
      });
      tl.to("[data-story-l]", { xPercent: -60, autoAlpha: 0, ease: "power2.in", duration: 1 }, 0.15)
        .to("[data-story-r]", { xPercent: 60, autoAlpha: 0, ease: "power2.in", duration: 1 }, 0.15)
        .to("[data-story-kick]", { autoAlpha: 0, y: -20, duration: 0.4 }, 0)
        .to(media, { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "power2.inOut", duration: 1.3 }, 0.1)
        // the phone tilts up from the table and lands flat
        .from("[data-forge-phone]", { rotateX: 62, rotateZ: -16, y: 260, scale: 0.72, autoAlpha: 0, duration: 1.2, ease: "power3.out" }, 0.7)
        .from("[data-forge-steps]", { x: -80, autoAlpha: 0, duration: 0.6 }, 1.0)
        // scan-line wipes: sketch → wireframe → final UI
        .fromTo("[data-forge-scan]", { top: "0%", autoAlpha: 1 }, { top: "100%", duration: 1, ease: "none" }, 2.3)
        .to(".fl-wire", { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" }, 2.3)
        .fromTo("[data-forge-scan]", { top: "0%" }, { top: "100%", duration: 1, ease: "none" }, 3.4)
        .to(".fl-ui", { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" }, 3.4)
        .set("[data-forge-scan]", { autoAlpha: 0 }, 4.45)
        // design notes pop beside the phone during the wireframe and UI passes
        .from("[data-notes-wire] span", { autoAlpha: 0, scale: 0.6, x: (i) => (i % 2 ? -24 : 24), stagger: 0.14, duration: 0.3, ease: "back.out(2.2)" }, 2.45)
        .to("[data-notes-wire] span", { autoAlpha: 0, y: -10, duration: 0.2, stagger: 0.04 }, 3.3)
        .from("[data-notes-ui] span", { autoAlpha: 0, scale: 0.6, x: (i) => (i % 2 ? -24 : 24), stagger: 0.14, duration: 0.3, ease: "back.out(2.2)" }, 3.55)
        .to("[data-notes-ui] span", { autoAlpha: 0, y: -10, duration: 0.2, stagger: 0.04 }, 4.5)
        // code slides in beside the phone and types
        .to("[data-forge-phone]", { xPercent: 42, rotateY: -16, duration: 0.8, ease: "power2.inOut" }, 4.6)
        .from("[data-forge-code]", { xPercent: -30, rotateY: 22, autoAlpha: 0, duration: 0.7, ease: "back.out(1.4)" }, 4.7)
        .from(lines, { clipPath: "inset(0% 100% 0% 0%)", duration: 0.14, ease: "steps(12)", stagger: 0.14 }, 4.95)
        // ship it
        .to("[data-forge-code]", { autoAlpha: 0, xPercent: -20, duration: 0.5 }, 5.9)
        .to("[data-forge-phone]", { xPercent: 0, rotateY: 0, scale: 1.05, duration: 0.7, ease: "back.out(1.6)" }, 5.9)
        .from("[data-forge-push]", { yPercent: -180, autoAlpha: 0, duration: 0.5, ease: "back.out(2)" }, 6.3)
        .from("[data-forge-stores] span", { y: 40, autoAlpha: 0, scale: 0.7, stagger: 0.1, duration: 0.45, ease: "back.out(2.4)" }, 6.5)
        .to({}, { duration: 0.7 });
    }
  }

  /* ---------------- Services switcher ---------------- */
  const svc = $("[data-svc]");
  if (svc) {
    const scenes = $$(".scene", svc);
    const items = $$("[data-svc-list] li", svc);
    let cur = 0;
    const playScene = (s: HTMLElement) => {
      gsap.fromTo($$(".phone, .browser, .kpi, .chat, .term", s), { y: 60, autoAlpha: 0, rotate: (i) => (i % 2 ? 3 : -3) }, { y: 0, autoAlpha: 1, rotate: 0, duration: 1, ease: "expo.out", stagger: 0.08 });
      gsap.fromTo($$(".bub", s), { y: 20, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.45, delay: 0.3 });
      gsap.fromTo($$(".term__body .ln", s), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.28, delay: 0.3 });
      $$("[data-ticker]", s).forEach((el) => { const o = { v: 0 }; gsap.to(o, { v: Number(el.dataset.ticker), duration: 1.6, ease: "power3.out", onUpdate: () => (el.textContent = String(Math.round(o.v))) }); });
      gsap.fromTo($(".scene__cap", s), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", delay: 0.15 });
    };
    // split terminal into lines for the typing reveal
    $$(".term__body", svc).forEach((pre) => { pre.innerHTML = pre.innerHTML.split("\n").map((l) => `<span class="ln">${l}</span>`).join("\n"); });
    const show = (i: number) => {
      if (i === cur) return;
      const prev = scenes[cur], next = scenes[i];
      gsap.to(prev, { autoAlpha: 0, y: i > cur ? -50 : 50, scale: 0.97, duration: 0.5, ease: "power2.in", onComplete: () => prev.classList.remove("is-on") });
      next.classList.add("is-on");
      gsap.fromTo(next, { autoAlpha: 0, y: i > cur ? 50 : -50, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out", delay: 0.2 });
      playScene(next);
      items.forEach((li, k) => li.classList.toggle("is-on", k === i));
      cur = i;
    };
    mm.add("(min-width: 0px)", () => {
      scenes.forEach((s, k) => gsap.set(s, { autoAlpha: k === 0 ? 1 : 0 }));
      const st = ScrollTrigger.create({
        trigger: "[data-svc-pin]", start: "top top", end: () => `+=${(scenes.length - 1) * window.innerHeight * 0.75}`, pin: true, scrub: true, anticipatePin: 1,
        onUpdate: (s) => { gsap.set("[data-svc-bar]", { scaleY: s.progress }); show(Math.min(scenes.length - 1, Math.round(s.progress * (scenes.length - 1)))); },
        onEnter: () => playScene(scenes[0]),
      });
      items.forEach((li, k) => li.addEventListener("click", () => lenis.scrollTo(st.start + (st.end - st.start) * (k / (scenes.length - 1)), { duration: 1.2 })));
      return () => { scenes.forEach((s) => gsap.set(s, { clearProps: "all" })); };
    });
  }

  /* ---------------- Stack wheel (3D picker drum) ---------------- */
  const wheel = $("[data-wheel]");
  if (wheel) {
    const items = $$("[data-wheel-list] li", wheel);
    const idxEl = $("[data-wheel-idx]", wheel);
    const n = items.length;
    let pos = 0, cur = -1;
    const STEP = 64;
    const render = () => {
      items.forEach((li, i) => {
        const d = i - pos;
        const ad = Math.abs(d);
        const ang = Math.max(-80, Math.min(80, d * 17));
        gsap.set(li, { y: d * STEP * Math.cos((ang * Math.PI) / 360), rotateX: -ang, z: -ad * 18, autoAlpha: Math.max(0, 1 - ad * 0.19), scale: 1 - Math.min(ad, 4) * 0.04 });
      });
      const c = Math.round(pos);
      if (c !== cur) { cur = c; items.forEach((li, i) => li.classList.toggle("is-on", i === c)); idxEl.textContent = String(c + 1).padStart(2, "0"); }
    };
    render();
    if (!reduced) {
      const proxy = { p: 0 };
      gsap.to(proxy, { p: 1, ease: "none", onUpdate: () => { pos = proxy.p * (n - 1); render(); },
        scrollTrigger: { trigger: "[data-wheel-pin]", start: "top top", end: () => `+=${n * 70}`, pin: true, scrub: 0.6, anticipatePin: 1 } });
    }
  }

  /* ---------------- Odometer (rolling digits) ---------------- */
  const odometer = (el: HTMLElement, digits: number) => {
    // mechanical counter: every wheel rolls continuously (0-9 plus a trailing 0 so 9 -> 0 wraps seamlessly)
    el.innerHTML = Array.from({ length: digits }, () => `<span class="odo__col"><span class="odo__strip">${"01234567890".split("").map((d) => `<i>${d}</i>`).join("")}</span></span>`).join("");
    const cols = $$(".odo__col", el), strips = $$(".odo__strip", el);
    return (v: number) => {
      v = Math.max(0, v);
      strips.forEach((st, i) => {
        const place = 10 ** (digits - 1 - i);
        let pos = (v / place) % 10;
        // higher wheels only move while the wheel below passes 9 -> 0 (like a real odometer)
        if (place > 1) { const below = (v / (place / 10)) % 10; pos = Math.floor(pos) + (below > 9 ? below - 9 : 0); }
        st.style.transform = `translateY(${(-pos / 11) * 100}%)`;
        cols[i].classList.toggle("is-lead", i < digits - 1 && v < place - 0.5);
      });
    };
  };
  $$("[data-odo]").forEach((el) => {
    const end = Number(el.dataset.odo);
    const set = odometer(el, String(end).length);
    set(0);
    if (reduced) { set(end); return; }
    onceVisible(el, () => { const o = { v: 0 }; gsap.to(o, { v: end, duration: 2.4, ease: "power2.inOut", onUpdate: () => set(o.v), onComplete: () => set(end) }); });
  });
  gsap.fromTo(".stats__sweep", { xPercent: -60 }, { xPercent: 60, ease: "none", scrollTrigger: { trigger: ".stats", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------------- Ring: 150+ products, spinning with scroll ---------------- */
  const ring = $("[data-ring]");
  if (ring) {
    const wheelEl = $("[data-ring-wheel]", ring);
    const cards = $$(".rc", ring);
    const n = cards.length, step = 360 / n;
    const nameEl = $("[data-ring-name]", ring), typeEl = $("[data-ring-type]", ring);
    const R = () => Math.min(640, Math.max(260, innerWidth * 0.4));
    const place = () => cards.forEach((c, i) => { c.style.transform = `translate(-50%, -50%) rotateY(${i * step}deg) translateZ(${R()}px)`; });
    place();
    window.addEventListener("resize", place);
    const odoSet = odometer($("[data-odo-ring]", ring), 3);
    odoSet(0);
    let front = -1;
    const update = (rot: number) => {
      wheelEl.style.transform = `translateZ(${-R()}px) rotateY(${rot}deg)`;
      const idx = (((Math.round(-rot / step)) % n) + n) % n;
      if (idx !== front) {
        front = idx;
        cards.forEach((c, i) => c.classList.toggle("is-front", i === idx));
        nameEl.textContent = $("b", cards[idx]).textContent;
        typeEl.textContent = $("figcaption span", cards[idx]).textContent;
        if (!reduced) gsap.fromTo("[data-ring-cap]", { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "back.out(2)", overwrite: true });
      }
    };
    update(0);
    if (reduced) odoSet(150);
    else {
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1, ease: "none",
        scrollTrigger: { trigger: "[data-ring-pin]", start: "top top", end: "+=240%", pin: true, scrub: 1 },
        onUpdate: () => update(-proxy.p * 360 * 1.2),
      });
      gsap.from(".ring__title", { yPercent: 30, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ring, start: "top 70%" } });
      // quick, clean 0 -> 150 the moment the section shows up
      onceVisible(ring, () => { const o = { v: 0 }; gsap.to(o, { v: 150, duration: 2.6, ease: "power2.inOut", onUpdate: () => odoSet(o.v), onComplete: () => odoSet(150) }); }, "0px 0px -30% 0px");
    }
  }

  /* ---------------- Work: pinned horizontal reel (all screen sizes) ---------------- */
  mm.add("(min-width: 0px)", () => {
    const track = $("[data-work-track]");
    const pin = $("[data-work-pin]");
    const idx = $("[data-work-idx]");
    const bar = $("[data-work-bar]");
    const cases = $$(".case", track);
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: pin, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (s) => { gsap.set(bar, { scaleX: s.progress }); idx.textContent = String(Math.min(7, Math.round(s.progress * (cases.length - 1)) + 1)).padStart(2, "0"); },
      },
    });
    cases.forEach((c) => {
      $$(".phone, .browser, .stat-card", c).forEach((v, i) => {
        gsap.fromTo(v, { x: 50 + i * 30, rotate: i % 2 ? 3 : -2 }, { x: -20 - i * 10, rotate: 0, ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });
  });


  /* ---------------- Founders (headroom-safe parallax) ---------------- */
  $$(".pcard").forEach((card, i) => {
    const media = $(".pcard__media", card);
    if (reduced) return;
    gsap.fromTo(media, { clipPath: "inset(100% 0% 0% 0% round 26px)" }, { clipPath: "inset(0% 0% 0% 0% round 26px)", duration: 1.6, ease: "expo.inOut", delay: i * 0.15, scrollTrigger: { trigger: ".pduo", start: "top 75%" } });
    gsap.fromTo($("img", media), { yPercent: 0 }, { yPercent: -7, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from($$(".pcard__cap > *", card), { y: 30, autoAlpha: 0, stagger: 0.08, duration: 1, ease: "expo.out", delay: 0.6 + i * 0.15, scrollTrigger: { trigger: ".pduo", start: "top 75%" } });
  });

  /* ---------------- Opslin screens fan-in ---------------- */
  if (!reduced) {
    gsap.timeline({ scrollTrigger: { trigger: "[data-opslin]", start: "top 75%", end: "center center", scrub: 1 } })
      .from(".opslin__screens .s1", { rotateY: -28, rotateX: 12, x: 80, y: 60, autoAlpha: 0 }, 0)
      .from(".opslin__screens .s2", { rotateY: -28, rotateX: 12, x: 160, y: 120, autoAlpha: 0 }, 0.1)
      .from(".opslin__screens .s3", { rotateY: -28, rotateX: 12, x: 240, y: 180, autoAlpha: 0 }, 0.2);
  }

  /* ---------------- Flow: film-reel panels ---------------- */
  const flow = $("[data-flow]");
  if (flow) {
    const track = $("[data-flow-track]", flow);
    const panels = $$(".fp", flow);
    mm.add("(min-width: 0px)", () => {
      if (reduced) return;
      const dist = () => track.scrollWidth - innerWidth;
      const tw = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "[data-flow-pin]", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      panels.forEach((p) => {
        const st = (a: string, b: string) => ({ trigger: p, containerAnimation: tw, start: a, end: b, scrub: true });
        gsap.from($(".flow__word", p), { yPercent: 110, rotate: -5, ease: "none", scrollTrigger: st("left 95%", "left 40%") });
        gsap.fromTo($(".fp__n", p), { xPercent: 40 }, { xPercent: -40, ease: "none", scrollTrigger: st("left right", "right left") });
        gsap.from($(".fp__vis", p), { rotate: 14, scale: 0.55, autoAlpha: 0, ease: "none", scrollTrigger: st("left 90%", "left 35%") });
        gsap.from($$("p, .fp__t", p), { y: 40, autoAlpha: 0, ease: "none", scrollTrigger: st("left 80%", "left 40%") });
      });
    });
    if (!reduced) {
      gsap.to(".v-lens", { x: 70, y: -24, duration: 1.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.from(".v-notes rect", { scale: 0, transformOrigin: "50% 50%", stagger: 0.15, duration: 0.6, ease: "back.out(2.4)", repeat: -1, repeatDelay: 2.4 });
      const d = $<SVGPathElement>(".v-draw");
      if (d) { const L = d.getTotalLength(); gsap.fromTo(d, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2.4, ease: "power1.inOut", repeat: -1, repeatDelay: 0.8 }); }
      gsap.to(".v-pen", { x: -120, y: 20, rotate: -10, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".v-bars rect", { scaleX: 0.25, transformOrigin: "0 50%", stagger: 0.2, duration: 0.7, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".v-rocket", { y: -16, duration: 0.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".v-fire", { scaleY: 1.35, transformOrigin: "50% 0%", duration: 0.14, repeat: -1, yoyo: true });
    }
  }
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}
