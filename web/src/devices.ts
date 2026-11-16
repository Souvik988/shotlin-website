/**
 * Realistic device mockups for every screenshot phone on the site.
 * <div class="phone"><img></div> becomes a titanium-framed phone with side buttons, a dynamic
 * island and glass glare. Screens keep a real 9:19.5 ratio; screenshots that are shorter than a
 * phone are top-aligned on their own background colour (sampled from the image) — never cropped.
 * Phones drop in once when they enter the screen, then float gently while visible.
 */
import { gsap, $$, reduced } from "./core";

const NO_DROP = ".scene .phone, .rc--ph";

function sampleBottom(img: HTMLImageElement): string | null {
  try {
    const c = document.createElement("canvas"); c.width = 8; c.height = 2;
    const x = c.getContext("2d")!;
    x.drawImage(img, 0, img.naturalHeight - 6, img.naturalWidth, 6, 0, 0, 8, 2);
    const d = x.getImageData(0, 0, 8, 2).data;
    let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
    const n = d.length / 4; return `rgb(${(r / n) | 0}, ${(g / n) | 0}, ${(b / n) | 0})`;
  } catch { return null; }
}

export function initDevices(scope: ParentNode = document) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const dev = e.target.querySelector(".phone__dev") as HTMLElement & { _float?: gsap.core.Tween; _dropped?: boolean };
    if (!dev) return;
    if (e.isIntersecting) {
      if (!dev._dropped) {
        dev._dropped = true;
        if (!(e.target as Element).matches(NO_DROP) && !reduced) {
          gsap.from(dev, { y: -110, rotation: gsap.utils.random(-9, 9), autoAlpha: 0, duration: 1.25, ease: "elastic.out(1, 0.7)", delay: gsap.utils.random(0, 0.2) });
        }
      }
      dev._float?.play();
    } else dev._float?.pause();
  }), { rootMargin: "0px 0px -8% 0px" });

  $$(".phone, .rc--ph", scope).forEach((ph) => {
    if (ph.querySelector(".phone__dev")) return;
    const img = ph.querySelector(":scope > img") as HTMLImageElement | null;
    if (!img) return;
    const dev = document.createElement("span");
    dev.className = "phone__dev";
    dev.innerHTML = '<i class="phone__btn phone__btn--a"></i><i class="phone__btn phone__btn--b"></i><i class="phone__btn phone__btn--c"></i><span class="phone__screen"></span>';
    const screen = dev.querySelector(".phone__screen") as HTMLElement;
    img.before(dev);
    screen.append(img);
    screen.insertAdjacentHTML("beforeend", '<i class="phone__island"></i><i class="phone__glare"></i>');
    const fit = () => {
      if (!img.naturalWidth) return;
      if (img.naturalWidth / img.naturalHeight > 0.5) {
        ph.classList.add("phone--short");
        const c = sampleBottom(img);
        if (c) screen.style.background = c;
      }
    };
    if (img.complete) fit(); else img.addEventListener("load", fit, { once: true });
    if (!reduced && !ph.classList.contains("rc--ph")) {
      (dev as HTMLElement & { _float?: gsap.core.Tween })._float = gsap.to(dev, { yPercent: -1.6, duration: gsap.utils.random(2.4, 3.4), repeat: -1, yoyo: true, ease: "sine.inOut", paused: true, delay: gsap.utils.random(0, 1) });
    }
    io.observe(ph);
  });
}
