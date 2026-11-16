/**
 * "Start a project" — a 30-second brief builder in a modal, guided by Shotbot.
 * Opens from any [data-open-brief] element. Ends in a pre-written WhatsApp message (or email).
 */
import { gsap, $, $$, reduced, lenis, bindCursor } from "./core";
import { botSVG } from "./bot";

type Opt = { v: string; icon?: string; hint?: string; say?: string };
type Step = { key: string; label: string; q: string; bot: string; multi?: boolean; opts?: Opt[]; kind?: "range" | "form" | "review" };

const WA = "916297831930";
const STEPS: Step[] = [
  { key: "type", label: "Build", q: "What are we building?", multi: true, bot: "Hi! I'm Shotbot. Let's write your brief in 30 seconds. What are we building? Pick as many as you like.",
    opts: [
      { v: "Mobile app", icon: "home", hint: "Android & iOS", say: "Apps are our favourite thing — 150+ shipped and counting." },
      { v: "Launch kit", icon: "kits", hint: "Start from a proven product", say: "Smart. Launch kits are the fastest way to go live." },
      { v: "Web app / SaaS", icon: "custom", hint: "Dashboards, POS, CRM", say: "Dashboards and SaaS — Sayan's happy place." },
      { v: "AI agent", icon: "about", hint: "WhatsApp, RAG, MCP", say: "Ooh, AI! We build agents that do real work, with a human in the loop." },
      { v: "Website", icon: "blog", hint: "Fast, SEO-first, animated", say: "A site like this one? I'd love a new home to explore." },
      { v: "Not sure yet", icon: "contact", hint: "Let's figure it out", say: "Totally fine — that's what the first call is for." },
    ] },
  { key: "stage", label: "Stage", q: "Where is the idea right now?", bot: "Nice! Where's the idea right now?",
    opts: [
      { v: "Just an idea", hint: "We'll shape it together", say: "Love a blank page. We'll sketch it with you." },
      { v: "Designs ready", hint: "Figma or sketches", say: "Designs ready? We can start building quickly." },
      { v: "Live product", hint: "Needs fixes or growth", say: "A live product — we'll audit it first, then level it up." },
    ] },
  { key: "budget", label: "Budget", q: "What's the budget range?", kind: "range", bot: "Budgets help us suggest the right path — launch kit or custom. No judgement, promise.",
    opts: [{ v: "Under ₹1L" }, { v: "₹1L – ₹5L" }, { v: "₹5L – ₹15L" }, { v: "₹15L+" }, { v: "Not sure yet" }] },
  { key: "time", label: "Timeline", q: "When do you want to be live?", bot: "When should it be live?",
    opts: [{ v: "ASAP", hint: "Yesterday, ideally" }, { v: "1–3 months", hint: "A focused sprint" }, { v: "3–6 months", hint: "A bigger build" }, { v: "Flexible", hint: "Quality first" }] },
  { key: "you", label: "You", q: "Who should the founders reply to?", kind: "form", bot: "Last bit — who should Sayan and Souvik reply to?" },
  { key: "review", label: "Send", q: "Your brief is ready.", kind: "review", bot: "Looks great! Send it and a founder replies within one working day." },
];

export function initBrief() {
  const el = document.createElement("div");
  el.className = "bm";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Start a project");
  el.hidden = true;
  el.innerHTML = `
    <div class="bm__scrim" data-bm-close></div>
    <div class="bm__panel">
      <aside class="bm__side">
        <div class="bm__brand">shotlin<span class="dot"></span></div>
        <div class="bm__bot">${botSVG()}</div>
        <div class="bm__say" aria-live="polite"><b class="mono">Shotbot</b><p></p></div>
        <ol class="bm__steps mono">${STEPS.map((s, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span>${s.label}</li>`).join("")}</ol>
      </aside>
      <section class="bm__main">
        <button class="bm__x" type="button" data-bm-close aria-label="Close">×</button>
        <div class="bm__bar"><i></i></div>
        <div class="bm__stage" data-bm-stage></div>
        <div class="bm__nav">
          <button class="bm__back mono" type="button" data-bm-back>← Back</button>
          <button class="btn btn--primary bm__next" type="button" data-bm-next><span>Next</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
      </section>
    </div>`;
  document.body.append(el);

  const stage = $("[data-bm-stage]", el);
  const say = $(".bm__say p", el);
  const bot = $(".bm__bot svg", el);
  const next = $("[data-bm-next]", el) as HTMLButtonElement;
  const back = $("[data-bm-back]", el) as HTMLButtonElement;
  const bar = $(".bm__bar i", el);
  const steps = $$(".bm__steps li", el);
  const data: Record<string, string[] | string> = { type: [], stage: "", budget: "Not sure yet", time: "", name: "", contact: "", idea: "" };
  let i = 0, typing: number | undefined, lastFocus: Element | null = null;

  const talk = (msg: string) => {
    clearInterval(typing);
    if (reduced) { say.textContent = msg; return; }
    let k = 0; say.textContent = "";
    typing = window.setInterval(() => { say.textContent = msg.slice(0, ++k); if (k >= msg.length) clearInterval(typing); }, 15);
    gsap.fromTo(bot, { y: 0, rotate: 0 }, { y: -10, rotate: -4, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" });
    const arm = bot.querySelector(".b-armR");
    if (arm) gsap.fromTo(arm, { rotate: 0 }, { rotate: -110, svgOrigin: "96 110", duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" });
  };

  const optHTML = (s: Step) => (s.opts || []).map((o) => {
    const on = s.multi ? (data[s.key] as string[]).includes(o.v) : data[s.key] === o.v;
    return `<button type="button" class="bm__opt${o.icon ? " bm__opt--icon" : ""}${on ? " is-on" : ""}" data-v="${o.v}" aria-pressed="${on}">
      ${o.icon ? `<img src="/img/icons/${o.icon}.webp" alt="" width="64" height="64" />` : ""}<b>${o.v}</b>${o.hint ? `<small>${o.hint}</small>` : ""}<i class="bm__tick" aria-hidden="true">✓</i></button>`;
  }).join("");

  const render = (dir = 1) => {
    const s = STEPS[i];
    let body = "";
    if (s.kind === "range") {
      const idx = Math.max(0, s.opts!.findIndex((o) => o.v === data.budget));
      body = `<div class="bm__range"><output class="bm__val" data-val>${s.opts![idx].v}</output>
        <input type="range" min="0" max="${s.opts!.length - 1}" step="1" value="${idx}" aria-label="Budget" data-range />
        <div class="bm__ticks mono">${s.opts!.map((o) => `<span>${o.v.replace(" yet", "")}</span>`).join("")}</div></div>`;
    } else if (s.kind === "form") {
      body = `<div class="bm__form">
        <label class="bm__field"><span class="mono">Your name *</span><input name="name" autocomplete="name" value="${data.name as string}" placeholder="Priya Sharma" /></label>
        <label class="bm__field"><span class="mono">Email or WhatsApp (optional)</span><input name="contact" autocomplete="email" value="${data.contact as string}" placeholder="you@company.com" /></label>
        <label class="bm__field"><span class="mono">The idea in one line (optional)</span><textarea name="idea" rows="2" placeholder="A grocery app for my 3 stores in Pune…">${data.idea as string}</textarea></label>
        <p class="bm__err mono" data-err role="alert"></p></div>`;
    } else if (s.kind === "review") {
      const chips = [...(data.type as string[]), data.stage, data.budget, data.time].filter(Boolean).map((c) => `<li>${c}</li>`).join("");
      body = `<div class="bm__review"><ul class="bm__chips">${chips}</ul>
        <p class="bm__who"><b>${data.name || "You"}</b>${data.contact ? ` · ${data.contact}` : ""}</p>
        ${data.idea ? `<blockquote>“${data.idea}”</blockquote>` : ""}
        <div class="bm__send"><button type="button" class="btn btn--primary btn--lg" data-send="wa"><span>Send on WhatsApp</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        <button type="button" class="btn btn--ghost btn--lg" data-send="mail"><span>Send by email</span></button></div>
        <p class="mono bm__fine">No spam, no sales team. Just the founders.</p></div>`;
    } else body = `<div class="bm__opts${s.opts?.[0]?.icon ? " bm__opts--grid" : ""}">${optHTML(s)}</div>`;
    stage.innerHTML = `<p class="mono bm__k">Step ${i + 1} of ${STEPS.length}</p><h2 class="bm__q">${s.q}</h2>${body}`;
    steps.forEach((li, k) => { li.classList.toggle("is-on", k === i); li.classList.toggle("is-done", k < i); });
    gsap.to(bar, { scaleX: (i + 1) / STEPS.length, duration: 0.6, ease: "expo.out" });
    back.style.visibility = i === 0 ? "hidden" : "visible";
    next.style.display = s.kind === "review" ? "none" : "";
    if (!reduced) {
      gsap.from(stage.children, { x: 50 * dir, autoAlpha: 0, duration: 0.6, ease: "expo.out", stagger: 0.06 });
      gsap.from($$(".bm__opt", stage), { y: 30, autoAlpha: 0, scale: 0.92, duration: 0.55, ease: "back.out(1.8)", stagger: 0.05, delay: 0.1 });
    }
    talk(s.bot);
    wire(s);
    bindCursor(stage);
    (stage.querySelector(".bm__opt, input, textarea, [data-send]") as HTMLElement | null)?.focus({ preventScroll: true });
  };

  const wire = (s: Step) => {
    $$<HTMLButtonElement>(".bm__opt", stage).forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.v!;
      const o = s.opts!.find((x) => x.v === v)!;
      if (s.multi) {
        const arr = data[s.key] as string[];
        const at = arr.indexOf(v);
        at >= 0 ? arr.splice(at, 1) : arr.push(v);
        b.classList.toggle("is-on", at < 0); b.setAttribute("aria-pressed", String(at < 0));
        if (at < 0 && o.say) talk(o.say);
      } else {
        data[s.key] = v;
        $$(".bm__opt", stage).forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        if (o.say) talk(o.say);
        if (!reduced) gsap.delayedCall(0.55, go, [1]); else go(1);
      }
      if (!reduced) gsap.fromTo(b, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    }));
    const range = $<HTMLInputElement>("[data-range]", stage);
    if (range) range.addEventListener("input", () => {
      const v = s.opts![Number(range.value)].v;
      data.budget = v;
      const out = $("[data-val]", stage);
      out.textContent = v;
      if (!reduced) gsap.fromTo(out, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
      range.style.setProperty("--fill", `${(Number(range.value) / (s.opts!.length - 1)) * 100}%`);
    });
    if (range) range.style.setProperty("--fill", `${(Number(range.value) / (s.opts!.length - 1)) * 100}%`);
    $$<HTMLButtonElement>("[data-send]", stage).forEach((b) => b.addEventListener("click", () => send(b.dataset.send as "wa" | "mail")));
  };

  const collect = () => {
    $$<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]", stage).forEach((f) => { data[f.name] = f.value.trim(); });
  };
  const go = (dir: number) => {
    const s = STEPS[i];
    if (s.kind === "form") {
      collect();
      if (dir > 0 && !data.name) {
        $("[data-err]", stage).textContent = "Add your name so the founders know who to reply to.";
        talk("I need a name to pass on — first name is fine!");
        ($("input[name=name]", stage) as HTMLInputElement).focus();
        return;
      }
    }
    if (dir > 0 && s.key === "type" && !(data.type as string[]).length) { talk("Pick at least one — or tap \"Not sure yet\"."); return; }
    i = Math.max(0, Math.min(STEPS.length - 1, i + dir));
    render(dir);
  };

  const message = () => [
    `Hi Shotlin! I'm ${data.name}.`,
    (data.type as string[]).length ? `I want to build: ${(data.type as string[]).join(", ")}.` : "",
    data.stage ? `Stage: ${data.stage}.` : "",
    data.budget ? `Budget: ${data.budget}.` : "",
    data.time ? `Timeline: ${data.time}.` : "",
    data.idea ? `The idea: ${data.idea}` : "",
    data.contact ? `Reach me at: ${data.contact}` : "",
  ].filter(Boolean).join("\n");

  const send = (how: "wa" | "mail") => {
    const text = message();
    if (how === "wa") window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    else location.href = `mailto:hello@shotlin.in?subject=${encodeURIComponent("Project brief from " + data.name)}&body=${encodeURIComponent(text)}`;
    talk("Sent! A founder will reply within one working day. 🎉");
    if (!reduced) {
      const burst = document.createElement("div");
      burst.className = "bm__burst";
      burst.innerHTML = Array.from({ length: 18 }, (_, k) => `<i style="--c:${["#c8ff2e", "#3048ff", "#ff5cc8", "#ffd23f", "#38d6ff"][k % 5]}"></i>`).join("");
      $(".bm__main", el).append(burst);
      gsap.fromTo($$("i", burst), { x: 0, y: 0, scale: 0 }, { x: () => gsap.utils.random(-260, 260), y: () => gsap.utils.random(-220, 60), scale: () => gsap.utils.random(0.6, 1.4), rotate: () => gsap.utils.random(-180, 180), duration: 1.1, ease: "expo.out", stagger: 0.01, onComplete: () => burst.remove() });
      gsap.fromTo(bot, { y: 0 }, { y: -40, rotate: 360, duration: 0.7, ease: "power2.out", yoyo: true, repeat: 1 });
    }
  };

  const open = () => {
    if (!el.hidden) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    document.documentElement.classList.add("bm-open");
    lenis.stop();
    i = 0;
    render(1);
    if (!reduced) {
      gsap.fromTo($(".bm__scrim", el), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
      gsap.fromTo($(".bm__panel", el), { clipPath: "inset(100% 0% 0% 0% round 28px)", y: 40 }, { clipPath: "inset(0% 0% 0% 0% round 28px)", y: 0, duration: 0.9, ease: "expo.out" });
      gsap.from($(".bm__bot", el), { y: 120, rotate: -20, duration: 1, ease: "back.out(1.6)", delay: 0.2 });
    }
  };
  const close = () => {
    if (el.hidden) return;
    const done = () => { el.hidden = true; document.documentElement.classList.remove("bm-open"); lenis.start(); (lastFocus as HTMLElement | null)?.focus?.(); };
    if (reduced) return done();
    gsap.to($(".bm__panel", el), { clipPath: "inset(0% 0% 100% 0% round 28px)", duration: 0.55, ease: "expo.in" });
    gsap.to($(".bm__scrim", el), { autoAlpha: 0, duration: 0.5, onComplete: done });
  };

  next.addEventListener("click", () => go(1));
  back.addEventListener("click", () => go(-1));
  $$("[data-bm-close]", el).forEach((c) => c.addEventListener("click", close));
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA" && !(e.target as HTMLElement).classList.contains("bm__opt") && STEPS[i].kind !== "review") { e.preventDefault(); go(1); }
    if (e.key === "Tab") { // keep focus inside the dialog
      const f = $$<HTMLElement>("button:not([style*='hidden']), input, textarea", el).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // capture phase so it wins over the page-transition link handler
  document.addEventListener("click", (e) => {
    const t = (e.target as Element).closest?.("[data-open-brief]");
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    open();
  }, true);
  if (location.hash === "#brief") open();
}
