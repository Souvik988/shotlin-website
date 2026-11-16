import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/400-italic.css";
import "./style.css";
import "./pages.css";
import "./bold.css";
import "./scenes.css";
import "./brief.css";
import "./blog.css";
import "./devices.css";
import "./mobile.css";

import { ScrollTrigger, initSplits, roles, countOnScroll, openVeil, heroHeadline, lenis, isWarm } from "./core";
import { initBot } from "./bot";
import { initDoodles } from "./doodles";
import { initBrief } from "./brief";
import { initDevices } from "./devices";

const page = document.body.dataset.page || "";
initDevices();

const extras = () => {
  initDoodles();
  initBot();
  initBrief();
  ScrollTrigger.refresh();
};

document.fonts.ready.then(() => {
  initSplits();
  roles();
  ScrollTrigger.refresh();
});

if (page === "home") {
  import("./pages/home").then((m) => { m.default(); extras(); });
} else {
  import("./pages/inner").then((m) => { m.default(page); extras(); });
  countOnScroll();
  document.fonts.ready.then(() => {
    openVeil(isWarm ? 0 : 0.2).then(() => lenis.start());
    heroHeadline(isWarm ? 0.35 : 0.55);
  });
}
