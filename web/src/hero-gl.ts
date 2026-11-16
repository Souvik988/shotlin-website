/**
 * Hero "elemental reveal".
 * Base duo photo + an aligned fire/ice variant. The pointer paints a soft trail into a
 * low-res mask; a noise-eroded threshold of that mask uncovers the elemental version,
 * with an edge glow that is icy on Sayan's side and molten on Souvik's.
 * A depth map adds subtle 2.5D parallax. Scroll drives a full transformation.
 */

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main(){ vUv = p * .5 + .5; vUv.y = 1. - vUv.y; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uBase, uFx, uDepth, uTrail;
uniform vec2 uMouse;      // smoothed pointer, 0..1
uniform float uTime, uScroll, uIntro, uSplit;
uniform vec4 uEyes;       // x: ice pulse, y: fire pulse

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= .5; } return v; }

float blob(vec2 uv, vec2 c, float r){ vec2 d = (uv - c) * vec2(1.1875, 1.); return smoothstep(r, 0., length(d)); }

void main(){
  vec2 uv = vUv;
  float depth = texture2D(uDepth, uv).r;
  vec2 par = (uMouse - .5) * depth * vec2(-.018, -.012);
  vec2 suv = uv + par;

  vec4 base = texture2D(uBase, suv);
  vec4 fx   = texture2D(uFx, suv);

  float trail = texture2D(uTrail, uv).r;
  float n = fbm(uv * vec2(7., 6.) + vec2(0., -uTime * .25));
  float n2 = fbm(uv * 18. + uTime * .4);

  // eyes flare ("he notices you")
  float eyes = blob(uv, vec2(.327, .287), .065) * uEyes.x + blob(uv, vec2(.678, .292), .07) * uEyes.y;

  float field = trail + eyes + uScroll * 1.25 * (.55 + n * .9);
  float t = field + (n - .5) * .55 + (n2 - .5) * .12;
  float reveal = smoothstep(.42, .62, t);
  float edge = smoothstep(.30, .48, t) * (1. - smoothstep(.48, .66, t));

  vec4 col = mix(base, fx, reveal);

  float side = smoothstep(uSplit - .04, uSplit + .04, uv.x);
  vec3 ice  = mix(vec3(.12, .62, 1.), vec3(.75, .95, 1.), n2);
  vec3 fire = mix(vec3(1., .28, .04), vec3(1., .78, .2), n2);
  vec3 glow = mix(ice, fire, side);
  float a = max(base.a, fx.a);
  col.rgb += glow * edge * 1.6 * a;

  col *= uIntro;
  gl_FragColor = col;
}`;

type Opts = { canvas: HTMLCanvasElement; stage: HTMLElement; reduced: boolean; onHeat?: (h: number) => void };

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.decoding = "async"; i.src = src;
    i.onload = () => res(i); i.onerror = rej;
  });
}

export async function initHeroGL({ canvas, stage, reduced, onHeat }: Opts) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;

  const [base, fx, depth] = await Promise.all([
    loadImg("/img/hero/duo_base.webp"), loadImg("/img/hero/duo_fx.webp"), loadImg("/img/hero/duo_depth.webp"),
  ]);

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const tex = (src: TexImageSource, unit: number, name: string) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.uniform1i(gl.getUniformLocation(prog, name), unit);
    return t;
  };
  tex(base, 0, "uBase"); tex(fx, 1, "uFx"); tex(depth, 2, "uDepth");

  // trail mask (2D canvas, uploaded each frame)
  const tc = document.createElement("canvas"); tc.width = 256; tc.height = 216;
  const tx = tc.getContext("2d")!; tx.fillStyle = "#000"; tx.fillRect(0, 0, tc.width, tc.height);
  const trailTex = tex(tc, 3, "uTrail");

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uMouse = U("uMouse"), uTime = U("uTime"), uScroll = U("uScroll"), uIntro = U("uIntro"), uSplit = U("uSplit"), uEyes = U("uEyes");
  const SPLIT = 0.49; // seam between the two founders in the photo
  gl.uniform1f(uSplit, SPLIT);

  const state = { mx: .5, my: .4, tx: .5, ty: .4, px: -1, py: -1, inside: false, scroll: 0, intro: 0, lastMove: 0, auto: false, visible: true };

  const resize = () => {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  const paint = (x: number, y: number, r: number, a: number) => {
    const cx = x * tc.width, cy = y * tc.height, rr = r * tc.width;
    const g = tx.createRadialGradient(cx, cy, 0, cx, cy, rr);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)");
    tx.fillStyle = g; tx.beginPath(); tx.arc(cx, cy, rr, 0, Math.PI * 2); tx.fill();
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    state.inside = x > 0 && x < 1 && y > 0 && y < 0.85;
    state.tx = Math.min(Math.max(x, 0), 1); state.ty = Math.min(Math.max(y, 0), 1);
    if (state.inside) state.lastMove = performance.now();
    const heat = Math.max(-1, Math.min(1, (x - SPLIT) * 3));
    onHeat?.(state.inside ? heat : 0);
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  new IntersectionObserver(([en]) => { state.visible = en.isIntersecting; }, { threshold: 0 }).observe(stage);

  const eyes = { ice: 0, fire: 0 };
  if (import.meta.env.DEV) (window as unknown as { __hero: unknown }).__hero = { state, canvas, tc };
  let t0 = performance.now(), last = t0;

  // touch: a finger sliding over the founders reveals them too (still a surprise, never automatic)
  const onTouch = (e: TouchEvent) => {
    const p = e.touches[0]; if (!p) return;
    const r = canvas.getBoundingClientRect();
    const x = (p.clientX - r.left) / r.width, y = (p.clientY - r.top) / r.height;
    state.inside = x > 0 && x < 1 && y > 0 && y < 0.9;
    state.tx = Math.min(Math.max(x, 0), 1); state.ty = Math.min(Math.max(y, 0), 1);
    if (state.inside) state.lastMove = performance.now();
  };
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("touchend", () => { state.inside = false; }, { passive: true });

  let idleDrawn = false;
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    if (!state.visible) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const t = (now - t0) / 1000;
    // render only while something is happening — the hero costs nothing while idle
    const busy = state.inside || state.intro < 1 || now - state.lastMove < 4000 || Math.abs(state.tx - state.mx) + Math.abs(state.ty - state.my) > 0.002;
    if (!busy) { if (idleDrawn) return; idleDrawn = true; } else idleDrawn = false;

    // the reveal is a hover-only surprise: nothing moves on its own

    // fade trail
    tx.globalCompositeOperation = "source-over";
    tx.fillStyle = `rgba(0,0,0,${state.auto ? 0.05 : 0.035})`;
    tx.fillRect(0, 0, tc.width, tc.height);
    tx.globalCompositeOperation = "lighter";

    const pmx = state.mx, pmy = state.my;
    state.mx += (state.tx - state.mx) * Math.min(1, dt * 7);
    state.my += (state.ty - state.my) * Math.min(1, dt * 7);
    if (state.inside && !reduced) {
      const v = Math.hypot(state.mx - pmx, state.my - pmy);
      const steps = Math.max(1, Math.ceil(v / 0.01));
      for (let i = 1; i <= steps; i++) {
        const f = i / steps;
        paint(pmx + (state.mx - pmx) * f, pmy + (state.my - pmy) * f, 0.15 + Math.min(v * 2.5, 0.08), (state.auto ? 0.16 : 0.3) / steps + 0.04);
      }
    }

    // eye flares every few seconds, alternating
    const cyc = t % 7;
    eyes.ice = 0; eyes.fire = 0; void cyc;

    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, trailTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);

    gl.uniform2f(uMouse, state.mx, state.my);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, state.scroll);
    gl.uniform1f(uIntro, state.intro);
    gl.uniform4f(uEyes, reduced ? 0 : eyes.ice, reduced ? 0 : eyes.fire, 0, 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(frame);

  return {
    state,
    setScroll(v: number) { state.scroll = v; },
    setIntro(v: number) { state.intro = v; },
    burst(x: number, y: number) { for (let i = 0; i < 6; i++) paint(x, y, 0.1 + i * 0.03, 0.25); },
  };
}
