"""Static page generator for the Shotlin multi-page site.

Run:  python scripts/site.py      (from web/)
Writes launch-kits/, custom/, about/, contact/, blog/, terms/, privacy/, refund/, 404.html,
public/sitemap.xml and public/robots.txt. Home (index.html) is built by build_home.py.
Shared nav / footer / CTA live in partials/ and are injected by vite.config.ts at build time.
"""
import json
import os
from html import escape
from urllib.parse import quote

SITE = "https://shotlin.in"
WA = "https://wa.me/916297831930"
UPDATED = "2026-11-15"
PAGES: list[str] = []

ICONS = {
    "store": "M4 9l1.5-5h13L20 9M4 9h16M4 9v11h16V9M9 20v-6h6v6",
    "map": "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
    "chat": "M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12Z",
    "card": "M3 6h18v12H3zM3 10h18M7 15h4",
    "tag": "M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01",
    "pulse": "M3 12h4l3-7 4 14 3-7h4",
    "scan": "M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 12h10",
    "bell": "M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4",
    "chart": "M4 20V10M10 20V4M16 20v-7M22 20H2",
    "truck": "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01",
    "box": "M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4 9-4M12 11v10",
    "gift": "M4 10h16v10H4zM2 7h20v3H2zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0",
    "wrench": "M14 7a4 4 0 0 0 5 5l-8 8a2.1 2.1 0 0 1-3-3l8-8a4 4 0 0 0-2-2z",
    "gavel": "M13 4l7 7M10 7l7 7M8 9l6-6M15 16l-6-6M3 21l7-7",
    "users": "M9 11a4 4 0 1 0 0-.01M2 21c0-4 3-6 7-6s7 2 7 6M17 7a3 3 0 1 1 0 6M22 21c0-3-2-5-5-5",
    "receipt": "M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6",
    "globe": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    "leaf": "M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7",
    "bolt": "M13 2 4 14h7l-1 8 9-12h-7l1-8z",
    "shield": "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z",
    "phone": "M7 2h10v20H7zM11 18h2",
    "layout": "M3 4h18v16H3zM3 9h18M9 9v11",
    "server": "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
    "spark": "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
}


def icon(name: str) -> str:
    return f'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="{ICONS[name]}"/></svg>'


PHONES = {"bakaloo-festive", "bakaloo-home", "dealker-home", "freshcart-home", "freshcart-vendor", "jimmywax-home", "lndry-customer", "lndry-partner", "radha-store"}


def shot(name: str, alt: str, url: str = "", extra: str = "", lazy=True) -> str:
    ld = ' loading="lazy"' if lazy else ""
    if name in PHONES:
        return f'<div class="phone {extra}"><img src="/img/work/{name}.webp" alt="{escape(alt)}"{ld} /></div>'
    return (f'<div class="browser {extra}"><div class="browser__bar"><i></i><i></i><i></i><span>{escape(url or alt)}</span></div>'
            f'<img src="/img/work/{name}.webp" alt="{escape(alt)}"{ld} /></div>')


def wa(text: str) -> str:
    return f"{WA}?text={quote(text)}"


def page(path: str, title: str, desc: str, body: str, page_id: str, ld: list | None = None, og_img="/img/hero/og.jpg", kw="", hello="") -> None:
    url = SITE + path
    crumbs = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"}]
    parts = [p for p in path.strip("/").split("/") if p]
    acc = ""
    for i, p in enumerate(parts):
        acc += "/" + p
        crumbs.append({"@type": "ListItem", "position": i + 2, "name": p.replace("-", " ").title(), "item": SITE + acc + "/"})
    graph = [{"@type": "BreadcrumbList", "itemListElement": crumbs}] if parts else []
    graph += ld or []
    ld_html = ""
    if graph:
        ld_html = '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False) + "</script>"
    kw_html = f'\n  <meta name="keywords" content="{escape(kw)}" />' if kw else ""
    html = f"""<!doctype html>
<html lang="en">
<head>
  <!-- @include head.html -->
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(desc)}" />{kw_html}
  <link rel="canonical" href="{url}" />
  <meta property="og:type" content="{'article' if page_id == 'post' else 'website'}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:title" content="{escape(title)}" />
  <meta property="og:description" content="{escape(desc)}" />
  <meta property="og:image" content="{SITE}{og_img}" />
  {ld_html}
</head>
<body data-page="{page_id}"{(' data-bot-hello="' + escape(hello) + '"') if hello else ""}>
  <!-- @include chrome.html -->

  <main id="main">
{body}
    <!-- @include cta.html -->
  </main>

  <!-- @include footer.html -->
</body>
</html>
"""
    out = path.strip("/")
    target = os.path.join(out, "index.html") if out else "index.html"
    if path.endswith(".html"):
        target = out
    os.makedirs(os.path.dirname(target) or ".", exist_ok=True)
    with open(target, "w", encoding="utf-8") as f:
        f.write(html)
    if page_id != "404":
        PAGES.append(path)


def phero(kicker: str, h1: str, sub: str, extra: str = "", cls: str = "") -> str:
    return f"""    <section class="phero {cls}" data-phero>
      <div class="phero__bg" aria-hidden="true"><i class="phero__orb phero__orb--ice"></i><i class="phero__orb phero__orb--fire"></i></div>
      <div class="dz" data-doodles="eyes,spark,code,heart,bolt,cursor,star,chat" aria-hidden="true"></div>
      <p class="eyebrow mono" data-up><span class="pill-dot"></span>{kicker}</p>
      <h1 class="phero__h" data-h1>{h1}</h1>
      <p class="phero__sub" data-up>{sub}</p>
{extra}
    </section>
"""


def ticker(words: list[str]) -> str:
    items = "".join(f"<span>{w}</span><i>✦</i>" for w in words)
    return f'    <div class="ticker" aria-hidden="true"><div class="ticker__track" data-ticker-track>{items}</div></div>\n'


def faq(items: list[tuple[str, str]], title='Frequently asked <span class="serif">questions.</span>') -> tuple[str, dict]:
    qa = "".join(f'<details class="qa"><summary>{escape(q)}<i></i></summary><div class="qa__a"><p>{a}</p></div></details>' for q, a in items)
    html = f"""    <section class="faq">
      <div class="faq__head">
        <p class="mono kicker">Answers</p>
        <h2 class="h2 split" data-bot="Quick answers to what founders ask us most.">{title}</h2>
        <p class="sec-head__sub">Still curious? <a href="{WA}" target="_blank" rel="noopener" class="u">Message us on WhatsApp</a> — a founder replies.</p>
      </div>
      <div class="faq__list">{qa}</div>
    </section>
"""
    import re
    ld = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", a)}} for q, a in items]}
    return html, ld


# =====================================================================
# DATA
# =====================================================================
KITS = [
    dict(slug="grocery-delivery", name="Grocery quick-commerce", brand="Bakaloo", study="https://souvikthecoder.in/work/bakaloo/", accent="#7b3fe4",
         tagline="Launch your own under-an-hour grocery delivery brand.",
         points=["Customer app, store app, rider app and admin HQ — re-branded as yours.",
                 "Visual storefront builder for banners, festive campaigns and collections.",
                 "Live coverage maps, delivery slots and a WhatsApp CRM with an AI agent."],
         apps=[("phone", "Customer app"), ("store", "Store & picker app"), ("truck", "Rider app"), ("layout", "Admin HQ")],
         feats=[("layout", "Storefront builder", "Banners, collections and festive themes without code."), ("map", "Delivery zones", "Draw coverage areas and slots on a live map."),
                ("chat", "WhatsApp CRM", "Shared inbox with an AI agent for first replies."), ("card", "Payments", "UPI, cards, wallets and cash on delivery."),
                ("tag", "Offers engine", "Coupons, first-order offers and loyalty."), ("pulse", "Live activity", "Orders, riders and stock in real time.")],
         shots=[("bakaloo-home", "Customer app home"), ("bakaloo-builder", "dash · theme builder"), ("bakaloo-festive", "Festive campaign"), ("bakaloo-coverage", "dash · coverage map"), ("bakaloo-activity", "dash · live activity")],
         stack=["Flutter", "Node.js", "PostgreSQL", "WhatsApp API", "Maps", "Agentic AI"]),
    dict(slug="fresh-delivery", name="Meat & fresh food delivery", brand="FreshCart", study="https://souvikthecoder.in/work/freshcart/", accent="#e5242b",
         tagline="Fresh cuts at the door in 30 minutes — B2C and B2B.",
         points=["Shopping app with B2C and B2B modes, weight-based cuts and voice search.",
                 "Vendor app for requests, supplies, payouts and earnings.",
                 "Admin panel for catalogue, pricing by weight, zones and riders."],
         apps=[("phone", "Customer app"), ("store", "Vendor app"), ("truck", "Rider flow"), ("layout", "Admin panel")],
         feats=[("box", "Weight-based cuts", "Price per kg, cut types and pack sizes."), ("users", "B2B mode", "Bulk pricing for hotels and restaurants."),
                ("spark", "Voice search", "Find items by speaking, in any accent."), ("bolt", "30-min delivery", "Slotting and nearest-store routing."),
                ("receipt", "Vendor payouts", "Earnings, settlements and supply requests."), ("bell", "Live tracking", "Push updates from cut to doorstep.")],
         shots=[("freshcart-home", "Customer app"), ("freshcart-vendor", "FreshCuts vendor app")],
         stack=["Flutter", "REST APIs", "Maps", "Payments", "Push"]),
    dict(slug="marketplace", name="Marketplace, auction & repair", brand="Dealker", study="https://souvikthecoder.in/work/dealker/", accent="#3048ff",
         tagline="Shop, bid and book repairs — one multi-vendor marketplace.",
         points=["Brand-led discovery with live deals and flash sales.",
                 "Auctions with live bidding, plus repair booking with pickup.",
                 "Vendor app, rider app and an ops dashboard to run it all."],
         apps=[("phone", "Shopper app"), ("store", "Vendor app"), ("truck", "Rider app"), ("layout", "Ops dashboard")],
         feats=[("tag", "Live deals", "Brand stores, flash sales and coupons."), ("gavel", "Auctions", "Timed bidding with anti-sniping rules."),
                ("wrench", "Repair booking", "Diagnose, quote, pick up and return."), ("users", "Multi-vendor", "Onboarding, catalogues and commissions."),
                ("truck", "Logistics", "Rider assignment and proof of delivery."), ("chart", "Ops analytics", "GMV, vendors and SLAs at a glance.")],
         shots=[("dealker-home", "Dealker marketplace app")],
         stack=["Flutter", "Node.js", "Marketplace", "Payments", "Maps"]),
    dict(slug="laundry-pos", name="On-demand services & POS", brand="LNDRY", study="https://souvikthecoder.in/work/lndry/", accent="#5b4cf5",
         tagline="Pickup-and-drop services with a counter POS and GST finance.",
         points=["Customer, partner and rider apps for pickup, processing and delivery.",
                 "Full counter POS — bookings, tags, payments and GST-ready finance.",
                 "SEO-ready marketing website to bring the first customers in."],
         apps=[("phone", "Customer app"), ("users", "Partner app"), ("truck", "Rider app"), ("receipt", "Counter POS")],
         feats=[("box", "Order lifecycle", "Pickup → process → quality check → delivery."), ("receipt", "GST finance", "Invoices, ledgers and tax reports."),
                ("store", "Multi-outlet", "Run many partner stores from one HQ."), ("bell", "WhatsApp updates", "Automatic status messages to customers."),
                ("card", "Payments", "UPI, cards, wallets and credit accounts."), ("globe", "Marketing site", "Fast, SEO-first landing pages.")],
         shots=[("lndry-customer", "LNDRY customer app"), ("lndry-pos-dashboard", "pos · dashboard"), ("lndry-partner", "LNDRY partner app"), ("lndry-pos-booking", "pos · booking"), ("lndry-pos-finance", "pos · finance"), ("lndry-website-home", "lndry.in")],
         stack=["Flutter", "Next.js", "Node.js", "POS", "WhatsApp"]),
    dict(slug="retail-ai", name="Retail inventory AI", brand="Radha", study="https://souvikthecoder.in/work/radha/", accent="#ff7a00", fg="#0e0d0c",
         tagline="Every barcode scan becomes a store action.",
         points=["Scan to update inventory, flag expiry and trigger restocks.",
                 "Audits and a live store health score for owners and managers.",
                 "Shopper-side nutrition scanning powered by computer vision."],
         apps=[("scan", "Scanner app"), ("chart", "Owner dashboard"), ("leaf", "Shopper scan"), ("bell", "Alerts")],
         feats=[("scan", "Barcode & OCR", "Read labels, batches and dates from the camera."), ("bell", "Expiry alerts", "Know what to discount before it is waste."),
                ("chart", "Health score", "One live number for every store."), ("box", "Inventory", "Stock levels, transfers and restock lists."),
                ("shield", "Audits", "Guided checklists with photo proof."), ("leaf", "Nutrition AI", "Nutrient insights for shoppers.")],
         shots=[("radha-store", "Radha store app")],
         stack=["Flutter", "Computer vision", "OCR", "AI", "Node.js"]),
    dict(slug="d2c-store", name="D2C brand store app", brand="Jimmy & Wax", study="https://souvikthecoder.in/work/jimmywax/", accent="#ffd23f", fg="#0e0d0c",
         tagline="A premium shopping app for a product brand.",
         points=["Rich catalogue with collections, best sellers and gift packs.",
                 "Smooth cart-to-order flow with payments and order tracking.",
                 "Push campaigns and offers to bring customers back."],
         apps=[("phone", "Shopping app"), ("layout", "Admin panel"), ("bell", "Campaigns"), ("card", "Checkout")],
         feats=[("gift", "Gift packs", "Bundles and curated kits."), ("tag", "Offers", "Coupons, combos and loyalty."),
                ("card", "Checkout", "UPI, cards and cash on delivery."), ("bell", "Push", "Campaigns, restocks and reminders."),
                ("box", "Orders", "Tracking, returns and invoices."), ("chart", "Insights", "Best sellers and repeat buyers.")],
         shots=[("jimmywax-home", "Jimmy & Wax app")],
         stack=["Flutter", "Commerce", "Payments", "Push"]),
]

PROJECTS = [
    dict(name="Bakaloo", cat="apps platforms", meta="Grocery quick commerce · Surat", accent="#7b3fe4", logo="bakaloo.webp", inv=True,
         points=["Customer app with an under-an-hour delivery promise.", "Visual storefront builder for campaigns and collections.", "Live coverage maps and activity for operations.", "WhatsApp CRM with an agentic AI assistant."],
         shots=[("bakaloo-builder", "dash.bakaloo.in"), ("bakaloo-home", "Bakaloo app")], link="https://souvikthecoder.in/work/bakaloo/"),
    dict(name="FreshCart", cat="apps", meta="Meat & seafood delivery · Hyderabad", accent="#e5242b", logo="freshcart.webp", word="FreshCart",
         points=["30-minute fresh delivery with B2C and B2B modes.", "Weight-based cuts and voice search.", "FreshCuts vendor app for supplies and earnings.", "Payments, maps and live order status."],
         shots=[("freshcart-home", "FreshCart app"), ("freshcart-vendor", "FreshCuts vendor")], link="https://souvikthecoder.in/work/freshcart/"),
    dict(name="Dealker", cat="apps platforms", meta="Electronics marketplace · Delhi", accent="#3048ff", logo="dealker.webp", inv=True,
         points=["Brand-led discovery with live deals.", "Auctions with real-time bidding.", "Repair booking with pickup and return.", "Vendor and rider apps plus an ops dashboard."],
         shots=[("dealker-home", "Dealker app")], link="https://souvikthecoder.in/work/dealker/"),
    dict(name="LNDRY", cat="apps platforms web", meta="Garment-care marketplace · Pune", accent="#5b4cf5", logo="lndry-horizontal.webp",
         points=["Customer, partner and rider apps.", "Counter POS with bookings and tags.", "GST-ready finance and reports.", "SEO marketing website at lndry.in."],
         shots=[("lndry-pos-dashboard", "pos.lndry.in"), ("lndry-customer", "LNDRY app")], link="https://souvikthecoder.in/work/lndry/"),
    dict(name="Radha", cat="apps", meta="Retail intelligence & nutrition AI", accent="#ff7a00", fg="#0e0d0c", logo="radha.webp", word="Radha",
         points=["Barcode scan turns into a store action.", "Inventory and expiry alerts.", "Audits and a live store health score.", "Nutrition scanning for shoppers."],
         shots=[("radha-store", "Radha app")], link="https://souvikthecoder.in/work/radha/"),
    dict(name="Jimmy & Wax", cat="apps", meta="Premium shoe-care commerce", accent="#ffd23f", fg="#0e0d0c", serif="Jimmy <i>&amp;</i> Wax",
         points=["Navy-and-gold catalogue of polishes and kits.", "Best sellers and gift packs.", "Smooth cart-to-order flow.", "Mobile-first, built in Flutter."],
         shots=[("jimmywax-home", "Jimmy & Wax app")], link="https://souvikthecoder.in/work/jimmywax/"),
    dict(name="Opslin", cat="platforms", meta="Self-hosted deployment platform · our own", accent="#4f7cff", logo="opslin.webp",
         points=["Connect your own Linux VPS and go live in minutes.", "Git push to a health-checked release.", "Databases, SSL, logs and one-click rollback.", "MCP beta so AI assistants can run deploys."],
         shots=[("opslin-overview", "dash.opslin.com"), ("opslin-servers", "dash.opslin.com/servers")], link="https://www.opslin.com/"),
    dict(name="Agnix Studio", cat="web games", meta="Cinematic studio website", accent="#c8ff2e", fg="#0e0d0c", logo="agnix-studio.webp",
         points=["Cinematic site for ANTAR — The Last Flame.", "Motion-led storytelling and trailers.", "Fast, responsive and SEO-ready.", "Built for a game studio launch."],
         shots=[("agnix-website-home", "agnixstudio.com")], link="https://www.sayanthecoder.in/work/antar"),
    dict(name="Rustbloom", cat="games", meta="2.5D platformer · Android & PC", accent="#b5653a", word="Rustbloom",
         points=["Story-mode 2.5D platformer.", "A flowering clockwork garden world.", "Built for Android and PC.", "Our own game, made in-house."],
         shots=[("rustbloom", "Rustbloom — gameplay")], link="https://www.agnixstudio.com/"),
]


def brand_mark(p: dict) -> str:
    if p.get("serif"):
        return f'<span class="pj__brand pj__brand--serif">{p["serif"]}</span>'
    if p.get("word") and not p.get("logo"):
        return f'<span class="pj__brand">{p["word"]}</span>'
    if p.get("word"):
        return f'<span class="pj__brand"><img src="/img/brands/{p["logo"]}" alt="" height="28" loading="lazy" />{p["word"]}</span>'
    inv = " pj__logo--inv" if p.get("inv") else ""
    return f'<img class="pj__logo{inv}" src="/img/brands/{p["logo"]}" alt="{escape(p["name"])}" height="30" loading="lazy" />'


def numbered(points: list[str], cls="nlist") -> str:
    return f'<ol class="{cls}">' + "".join(f'<li><span class="mono">{i+1:02d}</span>{escape(t)}</li>' for i, t in enumerate(points)) + "</ol>"


# =====================================================================
# LAUNCH KITS (index)
# =====================================================================
def build_kits_index():
    wall_imgs = ["bakaloo-home", "lndry-pos-dashboard", "freshcart-home", "bakaloo-builder", "dealker-home", "opslin-overview", "lndry-customer", "bakaloo-coverage", "radha-store", "lndry-pos-finance", "jimmywax-home", "bakaloo-activity"]
    cols = ""
    for c in range(6):
        imgs = "".join(f'<img src="/img/work/{wall_imgs[(c*2+k*5) % len(wall_imgs)]}.webp" alt="" loading="lazy" />' for k in range(3))
        cols += f'<div class="wall__col" data-wall-col>{imgs}{imgs}</div>'
    hero_extra = f"""      <div class="phero__ctas" data-up>
        <a href="#kits" class="btn btn--primary magnetic"><span>Explore the kits</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a>
        <a href="/contact/" class="btn btn--ghost magnetic"><span>Book a discovery call</span></a>
      </div>
      <div class="wall" aria-hidden="true"><div class="wall__inner">{cols}</div></div>"""
    body = phero("Launch kits · prebuilt apps &amp; SaaS",
                 'Prebuilt apps &amp; SaaS<br /><span class="serif">for startups.</span>',
                 "Skip the long wait and the big cost. Start from a product we've already shipped to real users — then make it yours.",
                 hero_extra, "phero--wall")
    body += ticker(["Android", "iOS", "Web", "Admin HQ", "Payments", "AI agents", "Your servers", "Your brand"])
    cards = ""
    for i, k in enumerate(KITS):
        vis = ""
        sh = k["shots"][:3]
        for j, (s, a) in enumerate(sh):
            vis += shot(s, a, a, f"kv{j+1}")
        cards += f"""
        <article class="kit" style="--accent:{k['accent']};--fg:{k.get('fg', '#fff')}" data-kit>
          <div class="kit__info">
            <p class="kit__n mono">Kit {i+1:02d} · proven at {escape(k['brand'])}</p>
            <h3 class="kit__name">{escape(k['name'])}</h3>
            <p class="kit__tag">{escape(k['tagline'])}</p>
            {numbered(k['points'])}
            <div class="kit__ctas">
              <a href="/launch-kits/{k['slug']}/" class="btn btn--light magnetic"><span>Check this out</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
              <a href="{wa(f"Hi Shotlin! I'm interested in the {k['name']} launch kit.")}" target="_blank" rel="noopener" class="kit__wa">Ask on WhatsApp ↗</a>
            </div>
          </div>
          <div class="kit__vis kit__vis--{len(sh)}">{vis}</div>
        </article>"""
    body += f"""    <section class="kits" id="kits">
      <div class="sec-head">
        <p class="mono kicker">SaaS &amp; app kits</p>
        <h2 class="h2 split" data-bot="Each kit is a real product already running. Pick one, make it yours.">Check our <span class="hl">launch kits.</span></h2>
        <p class="sec-head__sub">Every kit is a product running in production today — customer apps, partner apps and the dashboard to run the business.</p>
      </div>
      <div class="kits__stack">{cards}
      </div>
    </section>

    <section class="vs" data-vs>
      <div class="dz" data-doodles="eyes,heart,spark,plus,bolt" aria-hidden="true"></div>
      <div class="sec-head sec-head--center">
        <p class="mono kicker">Choose your path</p>
        <h2 class="h2 split" data-bot="Not sure which path? Launch kit = faster. Custom = built around your idea.">Launch kit <span class="serif">or</span> custom build?</h2>
      </div>
      <div class="vs__grid">
        <article class="vs__card vs__card--ice">
          <span class="mono">Launch kit</span>
          <h3>Proven product, <span class="serif">your brand.</span></h3>
          <ul><li>{icon('bolt')}Fastest route to launch</li><li>{icon('shield')}Already tested by real users</li><li>{icon('card')}Lower upfront cost</li><li>{icon('spark')}Customise branding &amp; features</li></ul>
          <a class="link-arrow" href="#kits">See the kits <span>↑</span></a>
        </article>
        <div class="vs__or serif" aria-hidden="true">or</div>
        <article class="vs__card vs__card--fire">
          <span class="mono">Custom build</span>
          <h3>Your idea, <span class="serif">from scratch.</span></h3>
          <ul><li>{icon('layout')}Designed around your workflow</li><li>{icon('spark')}Unique features &amp; integrations</li><li>{icon('server')}Architecture built to scale</li><li>{icon('users')}Founders on every decision</li></ul>
          <a class="link-arrow" href="/custom/">Custom builds <span>→</span></a>
        </article>
      </div>
    </section>
"""
    f_html, f_ld = faq([
        ("How long does it take to deliver a launch kit?", "Most of the work is branding, content, integrations and store review, because the product itself is already built. You get a written timeline after the first call."),
        ("Do you provide the complete source code?", "Yes. You own the code, the app store listings, the accounts and the servers."),
        ("Can I add features to a launch kit?", "Yes. Kits are a starting point — we add the features, integrations and workflows your business needs."),
        ("Do you provide maintenance and support after delivery?", "Yes. We monitor, update and improve the product after launch, deployed through Opslin on servers you own."),
        ("What technologies do the kits use?", "Flutter for Android and iOS, Next.js and Node.js for dashboards and APIs, PostgreSQL, and Docker-based deployment."),
    ])
    body += f_html
    ld = [f_ld, {"@type": "ItemList", "name": "Shotlin launch kits", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "url": f"{SITE}/launch-kits/{k['slug']}/", "name": k["name"] + " launch kit"} for i, k in enumerate(KITS)]}]
    page("/launch-kits/", "Prebuilt App & SaaS Launch Kits for Startups | Shotlin",
         "Prebuilt grocery delivery, marketplace, laundry POS, retail AI and D2C app kits — proven in production and rebranded for your startup. Android, iOS, web and admin included.",
         body, "kits", ld, hello="Welcome to the launch kits! Every one of these already runs a real business.", kw="prebuilt app for startups, grocery delivery app script, marketplace app development, laundry app with POS, white label app India, SaaS for startups")


# =====================================================================
# LAUNCH KIT detail
# =====================================================================
def build_kit(k: dict, idx: int):
    shots = k["shots"]
    hero_vis = "".join(shot(s, a, a, f"hv{j+1}", lazy=False) for j, (s, a) in enumerate(shots[:3]))
    apps = "".join(f'<li class="hub__node" style="--i:{i}">{icon(ic)}<span>{escape(n)}</span></li>' for i, (ic, n) in enumerate(k["apps"]))
    feats = "".join(f'<article class="feat">{icon(ic)}<h3>{escape(t)}</h3><p>{escape(d)}</p></article>' for ic, t, d in k["feats"])
    gallery = "".join(shot(s, a, a, "gal__item") for s, a in shots)
    others = "".join(f'<a class="mini" href="/launch-kits/{o["slug"]}/" style="--accent:{o["accent"]}"><span class="mono">Kit {j+1:02d}</span><b>{escape(o["name"])}</b><i>→</i></a>'
                     for j, o in enumerate(KITS) if o is not k)
    chips = "".join(f"<li>{escape(s)}</li>" for s in k["stack"])
    body = f"""    <section class="khero" style="--accent:{k['accent']};--fg:{k.get('fg', '#fff')}" data-khero>
      <div class="khero__copy">
        <nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/launch-kits/">Launch kits</a><span>/</span><span aria-current="page">{escape(k['name'])}</span></nav>
        <p class="eyebrow mono" data-up><span class="pill-dot"></span>Launch kit {idx+1:02d} · proven at {escape(k['brand'])}</p>
        <h1 class="phero__h phero__h--left" data-h1>{escape(k['name'])} <span class="serif">launch kit.</span></h1>
        <p class="phero__sub" data-up>{escape(k['tagline'])}</p>
        <div class="phero__ctas phero__ctas--left" data-up>
          <a href="{wa(f"Hi Shotlin! I want the {k['name']} launch kit for my business.")}" target="_blank" rel="noopener" class="btn btn--primary magnetic" data-cursor="Let's talk"><span>Get this kit</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <a href="/contact/" class="btn btn--ghost magnetic"><span>Book a discovery call</span></a>
        </div>
      </div>
      <div class="khero__vis khero__vis--{min(len(shots),3)}" data-khero-vis>{hero_vis}</div>
    </section>

    <section class="hub" data-hub>
      <div class="dz" data-doodles="bolt,spark,code,eyes,plus" aria-hidden="true"></div>
      <div class="sec-head sec-head--center">
        <p class="mono kicker">What's inside</p>
        <h2 class="h2 split" data-bot="Every kit ships with all the apps around one admin HQ. Watch them connect!">Everything to <span class="hl">run the business.</span></h2>
      </div>
      <div class="hub__map">
        <svg class="hub__lines" viewBox="0 0 800 420" preserveAspectRatio="none" aria-hidden="true">
          <path d="M400 210 L120 70" /><path d="M400 210 L680 70" /><path d="M400 210 L120 350" /><path d="M400 210 L680 350" />
        </svg>
        <div class="hub__core"><span class="mono">your brand</span><b>{escape(k['brand'])}-grade<br />platform</b></div>
        <ul class="hub__nodes">{apps}</ul>
      </div>
    </section>

    <section class="feats">
      <div class="sec-head">
        <p class="mono kicker">Features</p>
        <h2 class="h2 split" data-bot="These features are already built and tested in production.">Built in, <span class="serif">not bolted on.</span></h2>
        <ul class="chips chips--lg">{chips}</ul>
      </div>
      <div class="feats__grid">{feats}</div>
    </section>

    <section class="gal" data-gal style="--accent:{k['accent']};--fg:{k.get('fg', '#fff')}">
      <div class="gal__head">
        <p class="mono kicker kicker--light">Screens from production</p>
        <h2 class="h2 h2--light split" data-bot="Real screenshots from the live product. Scroll sideways through them.">Real screens. <span class="serif">Real users.</span></h2>
        <a class="link-arrow link-arrow--light" href="{k['study']}" target="_blank" rel="noopener">Full {escape(k['brand'])} case study <span>↗</span></a>
      </div>
      <div class="gal__track" data-gal-track>{gallery}</div>
    </section>

    <section class="others">
      <p class="mono kicker" data-bot="More kits to explore below.">More launch kits</p>
      <div class="others__row">{others}</div>
    </section>
"""
    ld = [{"@type": "Service", "name": f"{k['name']} launch kit", "serviceType": "App development", "description": k["tagline"] + " " + " ".join(k["points"]),
           "provider": {"@type": "Organization", "name": "Shotlin", "url": SITE + "/"}, "areaServed": "Worldwide",
           "url": f"{SITE}/launch-kits/{k['slug']}/"}]
    page(f"/launch-kits/{k['slug']}/", f"{k['name']} App Launch Kit — Prebuilt & Rebranded | Shotlin",
         f"{k['tagline']} {k['points'][0]} Android, iOS, web and admin — proven in production at {k['brand']}.",
         body, "kit", ld, hello="This kit is live in production. Scroll to see what is inside.", kw=f"{k['name'].lower()} app, {k['name'].lower()} app development, prebuilt {k['name'].lower()} solution, startup app India")


# =====================================================================
# CUSTOM BUILDS
# =====================================================================
def build_custom():
    names = "".join(f'<span>{escape(p["name"])}</span><i>✦</i>' for p in PROJECTS)
    hero_extra = f"""      <div class="phero__ctas" data-up>
        <a href="#projects" class="btn btn--primary magnetic"><span>See our projects</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a>
        <a href="/contact/" class="btn btn--ghost magnetic"><span>Discuss your idea</span></a>
      </div>
      <div class="bigmarq" aria-hidden="true"><div class="bigmarq__track" data-ticker-track>{names}</div></div>"""
    body = phero("Custom development · apps, SaaS, web &amp; AI",
                 'Custom development,<br /><span class="serif">from scratch.</span>',
                 "Your idea, engineered around your business — from the first line of code to the final launch.",
                 hero_extra)
    cards = ""
    for p in PROJECTS:
        vis = "".join(shot(s, a, a, f"pv{j+1}") for j, (s, a) in enumerate(p["shots"]))
        cards += f"""
        <article class="pj" data-cat="{p['cat']}" style="--accent:{p['accent']};--fg:{p.get('fg', '#fff')}">
          <a class="pj__media" href="{p['link']}" target="_blank" rel="noopener" data-cursor="Open" aria-label="{escape(p['name'])} case study">
            <div class="pj__vis pj__vis--{len(p['shots'])}">{vis}</div>
          </a>
          <div class="pj__body">
            <div class="pj__top">{brand_mark(p)}<span class="mono pj__meta">{escape(p['meta'])}</span></div>
            {numbered(p['points'], 'nlist nlist--sm')}
            <a class="link-arrow" href="{p['link']}" target="_blank" rel="noopener">View case study <span>↗</span></a>
          </div>
        </article>"""
    body += f"""    <section class="projects" id="projects" data-projects>
      <div class="sec-head">
        <p class="mono kicker">Projects</p>
        <h2 class="h2 split" data-bot="Use the filters to sort by apps, platforms, websites or games.">Our top <span class="hl">projects.</span></h2>
        <div class="tabs" role="tablist" aria-label="Filter projects" data-tabs>
          <button role="tab" aria-selected="true" data-filter="all" class="is-on">All</button>
          <button role="tab" aria-selected="false" data-filter="apps">Applications</button>
          <button role="tab" aria-selected="false" data-filter="platforms">Platforms</button>
          <button role="tab" aria-selected="false" data-filter="web">Websites</button>
          <button role="tab" aria-selected="false" data-filter="games">Games</button>
          <i class="tabs__pill" data-tabs-pill></i>
        </div>
      </div>
      <div class="pjgrid" data-pjgrid>{cards}
      </div>
    </section>

    <section class="caps" data-caps>
      <div class="sec-head sec-head--center">
        <p class="mono kicker">What we engineer</p>
        <h2 class="h2 split" data-bot="This orbit spins as you scroll: everything we can build for you.">One team, <span class="serif">every layer.</span></h2>
      </div>
      <div class="caps__orbit" data-orbit>
        <div class="caps__core">shotlin<span class="dot"></span></div>
        <ul>
          <li>{icon('phone')}Android &amp; iOS</li><li>{icon('layout')}Web &amp; SaaS</li><li>{icon('spark')}AI agents</li><li>{icon('server')}Cloud &amp; DevOps</li>
          <li>{icon('receipt')}POS &amp; CRM</li><li>{icon('globe')}SEO sites</li><li>{icon('bolt')}Games</li><li>{icon('shield')}Security</li>
        </ul>
      </div>
    </section>
"""
    f_html, f_ld = faq([
        ("How do you price a custom build?", "After a free discovery call we send a written scope with milestones and a fixed quote, so you know the cost before work starts."),
        ("Will I own the source code?", "Yes — the code, the accounts and the infrastructure are yours."),
        ("How involved will I be?", "You see working builds every week and talk directly to both founders on a shared channel."),
        ("Can you take over an existing app?", "Yes. We audit the codebase and infrastructure first, then propose a plan to stabilise and grow it."),
    ])
    body += f_html
    ld = [f_ld, {"@type": "Service", "name": "Custom app and software development", "serviceType": "Software development",
                 "provider": {"@type": "Organization", "name": "Shotlin", "url": SITE + "/"}, "areaServed": "Worldwide"}]
    page("/custom/", "Custom App, SaaS & Website Development from Scratch | Shotlin",
         "Tailor-made Android and iOS apps, SaaS platforms, POS and CRM systems, websites and AI agents — designed and engineered from scratch by Shotlin. See Bakaloo, LNDRY, Dealker and more.",
         body, "custom", ld, hello="Custom builds: your idea, engineered from scratch. Let me show you our work.", kw="custom app development, custom software development India, SaaS development company, Flutter app development, POS development, AI agent development")


# =====================================================================
# ABOUT
# =====================================================================
def build_about():
    body = f"""    <section class="ahero" data-ahero>
      <p class="eyebrow mono" data-up><span class="pill-dot"></span>About Shotlin · Kolkata, India</p>
      <h1 class="phero__h" data-h1>About <span class="serif">us.</span></h1>
      <p class="phero__sub" data-up>From idea to launch, we design and develop apps &amp; websites that scale with your business.</p>
      <div class="dz" data-doodles="eyes,heart,spark,code,star,bolt,chat,cursor" aria-hidden="true"></div>
      <div class="ahero__duo" data-ahero-duo>
        <figure class="aduo aduo--ice"><img src="/img/founders/sayan_park.webp" alt="Sayan Mondal, founder of Shotlin" /><figcaption><b>Sayan</b><span class="mono">Founder · Engineering &amp; cloud</span></figcaption></figure>
        <span class="aduo__amp serif" aria-hidden="true">&amp;</span>
        <figure class="aduo aduo--fire"><img src="/img/founders/souvik_office.webp" alt="Souvik, co-founder, COO and chief engineer of Shotlin" /><figcaption><b>Souvik</b><span class="mono">Co-founder · COO &amp; chief engineer</span></figcaption></figure>
      </div>
    </section>

    <section class="manifesto">
      <p class="mono kicker">Building the digital future</p>
      <p class="manifesto__text" data-fill>Technology isn't just code. It's trust, momentum and growth. We started Shotlin to give founders a team that builds like it's their own company — because we run two of our own.</p>
    </section>

    <section class="nums" aria-label="Shotlin in numbers">
      <div class="num"><b data-count="2">0</b><span>founders, zero middlemen</span></div>
      <div class="num"><b data-count="2">0</b><span>companies — Shotlin &amp; Opslin</span></div>
      <div class="num"><b><span data-count="150">0</span>+</b><span>projects shipped</span></div>
      <div class="num"><b data-count="4">0</b><span>cities live</span></div>
    </section>

    <section class="people">
      <div class="sec-head sec-head--center">
        <p class="mono kicker">Who we are</p>
        <h2 class="h2 split" data-bot="Meet the two humans behind me — both still write code every day.">Team behind <span class="hl">the wonders.</span></h2>
      </div>
      <article class="person person--ice" id="sayan">
        <figure class="person__media" data-person-media><img src="/img/founders/sayan_park.webp" alt="Sayan Mondal, founder of Shotlin" loading="lazy" /></figure>
        <div class="person__body">
          <p class="mono person__el">The systems architect</p>
          <h3>Sayan Mondal</h3>
          <p class="roles roles--lg" data-roles="Founder|DevOps engineer|Cloud architect|App developer"><span>Founder</span></p>
          <p class="person__bio">Founder of Shotlin and Opslin. Owns architecture, cloud and the systems that keep products alive at 2 a.m.</p>
          <ul class="chips"><li>Next.js</li><li>Flutter</li><li>Go</li><li>Docker / CI</li><li>AI agents</li><li>Unity</li></ul>
          <div class="person__links"><a href="https://www.sayanthecoder.in/" target="_blank" rel="noopener" class="link-arrow">sayanthecoder.in <span>↗</span></a><a href="https://www.linkedin.com/in/sayanthe-coder/" target="_blank" rel="noopener" class="link-arrow">LinkedIn <span>↗</span></a></div>
        </div>
      </article>
      <article class="person person--fire person--rev" id="souvik">
        <figure class="person__media" data-person-media><img src="/img/founders/souvik_office.webp" alt="Souvik, co-founder, COO and chief engineer of Shotlin" loading="lazy" /></figure>
        <div class="person__body">
          <p class="mono person__el">The operator who codes</p>
          <h3>Souvik</h3>
          <p class="roles roles--lg" data-roles="Co-founder &amp; COO|Chief engineer|Operator|Coder|Product lead"><span>Co-founder &amp; COO</span></p>
          <p class="person__bio">Co-founder, COO and chief engineer. Decides what to build, writes the code, and runs delivery until it ships — and keeps running.</p>
          <ul class="chips"><li>Flutter</li><li>AI &amp; MCP</li><li>Architecture</li><li>Three.js</li><li>Operations</li></ul>
          <div class="person__links"><a href="https://souvikthecoder.in/" target="_blank" rel="noopener" class="link-arrow">souvikthecoder.in <span>↗</span></a><a href="{WA}" target="_blank" rel="noopener" class="link-arrow">WhatsApp <span>↗</span></a></div>
        </div>
      </article>
    </section>

    <section class="rules" data-rules>
      <div class="rules__pin" data-rules-pin>
        <div class="rules__head">
          <p class="mono kicker">How we think</p>
          <h2 class="h2 split" data-bot="Our four promises. They stack up as you scroll — hold us to every one.">Four rules <span class="serif">we don't break.</span></h2>
        </div>
        <div class="rules__stack" data-rules-stack>
          <article class="rule" style="--c:#0e0d0c;--f:#c8ff2e"><div class="rule__tab"><span class="mono">01</span><b class="rule__name">Own the outcome</b>{icon('shield')}</div><div class="rule__body"><p class="rule__big">One team from the first sketch to the server it runs on.</p><p>No hand-offs, no blame games. If it breaks, it's ours to fix.</p></div></article>
          <article class="rule" style="--c:#3048ff;--f:#fff"><div class="rule__tab"><span class="mono">02</span><b class="rule__name">Ship every week</b>{icon('bolt')}</div><div class="rule__body"><p class="rule__big">Working builds on real devices, every single sprint.</p><p>You never wait months to see progress.</p></div></article>
          <article class="rule" style="--c:#c8ff2e;--f:#0e0d0c"><div class="rule__tab"><span class="mono">03</span><b class="rule__name">Honest scope</b>{icon('receipt')}</div><div class="rule__body"><p class="rule__big">A written plan and a fixed quote before we start.</p><p>No surprise invoices, no vague estimates.</p></div></article>
          <article class="rule" style="--c:#ff4d12;--f:#fff"><div class="rule__tab"><span class="mono">04</span><b class="rule__name">Stay after launch</b>{icon('pulse')}</div><div class="rule__body"><p class="rule__big">Monitoring, updates and growth long after go-live.</p><p>We stick around because we run products ourselves.</p></div></article>
        </div>
      </div>
    </section>

    <section class="pipe" data-pipe>
      <div class="sec-head sec-head--center">
        <p class="mono kicker">Two companies, one pipeline</p>
        <h2 class="h2 split" data-bot="Shotlin builds it, Opslin runs it. Watch the builds travel down the pipe!">We build it. <span class="hl">We run it.</span></h2>
      </div>
      <div class="pipe__row">
        <a class="pipe__card pipe__card--s" href="/"><span class="mono">The studio</span><b>shotlin<span class="dot"></span></b><p>Designs, builds &amp; launches products.</p><ul class="pipe__tags mono"><li>Apps</li><li>SaaS</li><li>AI</li><li>Web</li></ul></a>
        <div class="pipe__tube" aria-hidden="true"><i class="pipe__flow"></i><span class="pkt">app.apk</span><span class="pkt">api:v42</span><span class="pkt">web.zip</span><span class="pkt">db.sql</span><span class="pkt">ios.ipa</span></div>
        <a class="pipe__card pipe__card--o" href="https://www.opslin.com/" target="_blank" rel="noopener"><span class="mono">The platform</span><img src="/img/brands/opslin-white.webp" alt="Opslin" height="38" loading="lazy" /><p>Deploys &amp; runs them on servers you own.</p><ul class="pipe__tags mono"><li>SSL</li><li>Rollback</li><li>Logs</li><li>MCP</li></ul></a>
      </div>
    </section>
"""
    ld = [{"@type": "AboutPage", "url": SITE + "/about/", "name": "About Shotlin", "about": {"@type": "Organization", "name": "Shotlin", "url": SITE + "/"}},
          {"@type": "Person", "name": "Sayan Mondal", "jobTitle": "Founder", "worksFor": {"@type": "Organization", "name": "Shotlin"}, "url": "https://www.sayanthecoder.in/", "image": SITE + "/img/founders/sayan_park.webp"},
          {"@type": "Person", "name": "Souvik", "jobTitle": "Co-founder, COO & Chief Engineer", "worksFor": {"@type": "Organization", "name": "Shotlin"}, "url": "https://souvikthecoder.in/", "image": SITE + "/img/founders/souvik_office.webp"}]
    page("/about/", "About Shotlin — App & Software Studio Founded by Sayan Mondal & Souvik",
         "Shotlin is a product studio in Kolkata founded by Sayan Mondal and Souvik. We design and develop apps, SaaS and websites that scale — and run Opslin, our own deployment platform.",
         body, "about", ld, hello="This is my family: two founders, two companies, one standard.", og_img="/img/founders/sayan_park.webp")


# =====================================================================
# CONTACT
# =====================================================================
def build_contact():
    body = f"""    <section class="phero phero--contact" data-phero>
      <div class="phero__bg" aria-hidden="true"><i class="phero__orb phero__orb--ice"></i><i class="phero__orb phero__orb--fire"></i></div>
      <p class="eyebrow mono" data-up><span class="pill-dot"></span>Contact Shotlin</p>
      <h1 class="phero__h" data-h1>Have a question?<br /><span class="serif">Contact us now.</span></h1>
      <p class="phero__sub" data-up>A founder reads every message and replies within one working day.</p>
    </section>

    <section class="contact" id="contact">
      <div class="contact__ways">
        <a class="way way--wa magnetic" href="{wa("Hi Shotlin! I'd love to talk about a project.")}" target="_blank" rel="noopener">{icon('chat')}<span><small class="mono">WhatsApp · fastest</small><b>+91 62978 31930</b></span><i>↗</i></a>
        <a class="way magnetic" href="mailto:hello@shotlin.in?subject=Project%20enquiry">{icon('receipt')}<span><small class="mono">Email</small><b>hello@shotlin.in</b></span><i>→</i></a>
        <a class="way magnetic" href="tel:+916297831930">{icon('phone')}<span><small class="mono">Call</small><b>+91 62978 31930</b></span><i>→</i></a>
        <div class="way way--loc">
          <div class="radar" aria-hidden="true"><i></i><i></i><i></i><b></b></div>
          <span><small class="mono">Studio</small><b>Kolkata, West Bengal, India</b><em class="mono">22.57° N · 88.36° E · <span data-clock>--:--</span> IST</em></span>
        </div>
      </div>

      <form class="brief brief--light" data-brief novalidate>
        <p class="brief__step mono">Project brief · 30 seconds</p>
        <fieldset>
          <legend>What are we building?</legend>
          <div class="opts" data-group="type">
            <label><input type="checkbox" value="Launch kit" /><span>Launch kit</span></label>
            <label><input type="checkbox" value="Mobile app" /><span>Mobile app</span></label>
            <label><input type="checkbox" value="Website" /><span>Website</span></label>
            <label><input type="checkbox" value="SaaS / dashboard" /><span>SaaS / dashboard</span></label>
            <label><input type="checkbox" value="AI agent" /><span>AI agent</span></label>
            <label><input type="checkbox" value="DevOps / cloud" /><span>DevOps / cloud</span></label>
            <label><input type="checkbox" value="Game" /><span>Game</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Budget</legend>
          <div class="opts" data-group="budget">
            <label><input type="radio" name="budget" value="Under ₹1L" /><span>&lt; ₹1L</span></label>
            <label><input type="radio" name="budget" value="₹1L – ₹5L" /><span>₹1–5L</span></label>
            <label><input type="radio" name="budget" value="₹5L – ₹15L" /><span>₹5–15L</span></label>
            <label><input type="radio" name="budget" value="₹15L+" /><span>₹15L+</span></label>
            <label><input type="radio" name="budget" value="Not sure yet" /><span>Not sure</span></label>
          </div>
        </fieldset>
        <div class="field"><input id="f-name" name="name" type="text" autocomplete="name" placeholder=" " required /><label for="f-name">Your name</label></div>
        <div class="field"><textarea id="f-msg" name="msg" rows="2" placeholder=" "></textarea><label for="f-msg">A line about the idea (optional)</label></div>
        <button type="submit" class="btn btn--primary btn--block magnetic"><span>Send message on WhatsApp</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        <p class="brief__err mono" data-brief-err role="alert"></p>
        <p class="brief__fine mono">No spam, no sales team. Just the founders.</p>
      </form>
    </section>

    <section class="next" data-next>
      <div class="dz" data-doodles="chat,spark,heart,eyes" aria-hidden="true"></div>
      <p class="mono kicker" data-bot="After you send a message: reply in a day, a call, then a written plan.">What happens next</p>
      <ol class="next__row">
        <li><span class="mono">01</span><b>We reply</b><small>within one working day</small></li>
        <li><span class="mono">02</span><b>30-min call</b><small>with both founders</small></li>
        <li><span class="mono">03</span><b>Written plan</b><small>scope, timeline &amp; quote</small></li>
      </ol>
    </section>
"""
    ld = [{"@type": "ContactPage", "url": SITE + "/contact/", "name": "Contact Shotlin",
           "mainEntity": {"@type": "Organization", "name": "Shotlin", "email": "hello@shotlin.in", "telephone": "+91-62978-31930",
                          "address": {"@type": "PostalAddress", "addressLocality": "Kolkata", "addressRegion": "West Bengal", "addressCountry": "IN"},
                          "contactPoint": {"@type": "ContactPoint", "contactType": "sales", "telephone": "+91-62978-31930", "email": "hello@shotlin.in", "availableLanguage": ["English", "Hindi", "Bengali"]}}}]
    page("/contact/", "Contact Shotlin — Book a Free Discovery Call for Your App or Website",
         "Talk to the founders of Shotlin about your app, SaaS, website or AI project. WhatsApp +91 62978 31930 or email hello@shotlin.in — reply within one working day.",
         body, "contact", ld, hello="Fastest way to reach us? WhatsApp. Or fill the 30-second brief!")


# =====================================================================
# BLOG (data in blog_data.py)
# =====================================================================
from blog_data import POSTS
import re as _re


def _slug(t: str) -> str:
    return _re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def render_post_body(blocks) -> str:
    out = ""
    for kind, val in blocks:
        if kind == "p":
            out += f"<p>{escape(val)}</p>\n"
        elif kind == "ph":
            out += f"<p>{val}</p>\n"
        elif kind == "h2":
            out += f'<h2 id="{_slug(val)}">{escape(val)}</h2>\n'
        elif kind == "ul":
            out += "<ul>" + "".join(f"<li>{escape(x)}</li>" for x in val) + "</ul>\n"
        elif kind == "cta":
            out += f'<aside class="post__cta"><p>{escape(val)}</p><a class="btn btn--light btn--sm magnetic" href="/contact/" data-open-brief><span>Start a project</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></aside>\n'
    return out


TAGS = ["Strategy", "Pricing", "Engineering", "Launch", "Cloud", "AI"]


def build_blog():
    lead = POSTS[0]
    rows = ""
    for i, p in enumerate(POSTS):
        rows += f"""
        <a class="bc{' bc--wide' if i in (0, 3) else ''}" href="/blog/{p['slug']}/" data-tag="{p['tag']}" data-cursor="Read">
          <span class="bc__cover"><img src="{p['img']}" alt="" loading="lazy" width="1536" height="1024" /></span>
          <span class="bc__meta mono"><b>{p['tag']}</b>{p['mins']} min read</span>
          <h2 class="bc__t">{escape(p['title'])}</h2>
          <i class="bc__go" aria-hidden="true">→</i>
        </a>"""
    chips = '<button class="is-on" data-btag="all">All</button>' + "".join(f'<button data-btag="{t}">{t}</button>' for t in TAGS)
    body = f"""    <section class="bhero" data-bhero>
      <canvas class="bhero__ascii" data-ascii aria-hidden="true"></canvas>
      <div class="bhero__copy">
        <p class="eyebrow mono" data-up><span class="pill-dot"></span>Blog · notes from the studio</p>
        <h1 class="bhero__h" data-h1>Notes on building apps, SaaS &amp; AI <span class="serif">for startups.</span></h1>
      </div>
      <p class="bhero__hint mono" aria-hidden="true">move your cursor through the letters</p>
    </section>

    <section class="bfeat" data-bfeat aria-label="Featured article">
      <div class="bfeat__pin" data-bfeat-pin>
        <a class="bfeat__card" href="/blog/{lead['slug']}/" data-bfeat-card data-cursor="Read">
          <img src="{lead['img']}" alt="" />
          <span class="bfeat__shade"></span>
          <span class="bfeat__meta mono" data-bfeat-in>Featured · {lead['tag']} · {lead['mins']} min read</span>
          <b class="bfeat__t" data-bfeat-in>{escape(lead['title'])}</b>
          <span class="bfeat__go mono" data-bfeat-in>Read the article →</span>
        </a>
      </div>
    </section>

    <section class="blist" data-blog>
      <div class="blist__head">
        <p class="mono kicker" data-bot="Six notes so far. Filter by topic with the chips.">All articles</p>
        <div class="bchips" role="tablist" aria-label="Filter articles by topic" data-bchips>{chips}</div>
      </div>
      <div class="bgrid" data-brows>{rows}
      </div>
    </section>
""" + ticker([t for t in TAGS] + ["Flutter", "Opslin", "MCP", "Quick commerce"])
    ld = [{"@type": "Blog", "name": "Shotlin Blog", "url": SITE + "/blog/", "publisher": {"@type": "Organization", "name": "Shotlin", "url": SITE + "/"},
           "blogPost": [{"@type": "BlogPosting", "headline": p["title"], "url": f"{SITE}/blog/{p['slug']}/", "datePublished": UPDATED} for p in POSTS]}]
    page("/blog/", "Blog — App Development, SaaS, AI & Startup Notes | Shotlin",
         "Practical notes on building apps, SaaS, AI agents and cloud infrastructure for startups: launch kits vs custom builds, app costs in India, Flutter, MCP servers and more.",
         body, "blog", ld, hello="Studio notes for founders. Short, honest, useful.",
         kw="app development blog, startup app development India, Flutter for startups, grocery delivery app checklist, MCP server, SaaS development")

    for i, p in enumerate(POSTS):
        nxt = POSTS[(i + 1) % len(POSTS)]
        related = [q for q in POSTS if q is not p][:3]
        toc = "".join(f'<li><a href="#{_slug(v)}">{escape(v)}</a></li>' for k, v in p["body"] if k == "h2")
        take = "".join(f"<li>{escape(t)}</li>" for t in p["takeaways"])
        faq = "".join(f'<details class="qa"><summary>{escape(q)}<i></i></summary><div class="qa__a"><p>{escape(a)}</p></div></details>' for q, a in p["faq"])
        url = f"{SITE}/blog/{p['slug']}/"
        share = quote(url)
        rel = "".join(f'<a class="rel" href="/blog/{q["slug"]}/" data-cursor="Read"><span class="rel__img"><img src="{q["img"]}" alt="" loading="lazy" /></span><span class="mono">{q["tag"]} · {q["mins"]} min</span><b>{escape(q["title"])}</b></a>' for q in related)
        body = f"""    <div class="progress" aria-hidden="true"><i data-read-bar></i></div>
    <article class="post post--rich">
      <header class="post__head">
        <nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog/">Blog</a><span>/</span><span aria-current="page">{p['tag']}</span></nav>
        <p class="eyebrow mono" data-up><span class="pill-dot"></span>{p['tag']} · {p['mins']} min read · 15 Nov 2026</p>
        <h1 class="post__h" data-h1>{escape(p['title'])}</h1>
        <p class="post__lede" data-up>{escape(p['desc'])}</p>
        <div class="post__by" data-up><span class="post__av"><img src="/img/founders/sayan_park.webp" alt="" /><img src="/img/founders/souvik_office.webp" alt="" /></span><span>By <a href="https://www.sayanthecoder.in/" target="_blank" rel="noopener author">Sayan Mondal</a> &amp; <a href="https://souvikthecoder.in/" target="_blank" rel="noopener author">Souvik</a></span></div>
      </header>
      <figure class="post__media" data-post-media><img src="{p['img']}" alt="" /></figure>
      <div class="post__layout">
        <aside class="post__toc" data-toc>
          <div class="toc__ring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" pathLength="100"/><circle class="toc__arc" cx="22" cy="22" r="19" pathLength="100" data-toc-arc/></svg><span class="mono" data-toc-left>{p['mins']} min</span></div>
          <p class="mono toc__k">On this page</p>
          <ol>{toc}<li><a href="#faq">FAQ</a></li></ol>
          <div class="toc__share mono"><span>Share</span><a href="https://www.linkedin.com/sharing/share-offsite/?url={share}" target="_blank" rel="noopener">in</a><a href="https://x.com/intent/post?url={share}&amp;text={quote(p['title'])}" target="_blank" rel="noopener">X</a><a href="https://wa.me/?text={quote(p['title'] + ' ' + url)}" target="_blank" rel="noopener">WA</a></div>
        </aside>
        <div class="post__body" data-post-body>
          <section class="takeaways" aria-label="Key takeaways"><p class="mono">Key takeaways</p><ul>{take}</ul></section>
{render_post_body(p['body'])}
          <section class="post__faq" id="faq"><h2>Frequently asked questions</h2>{faq}</section>
        </div>
      </div>
      <footer class="post__foot">
        <div class="author"><span class="post__av post__av--lg"><img src="/img/founders/sayan_park.webp" alt="Sayan Mondal" /><img src="/img/founders/souvik_office.webp" alt="Souvik" /></span>
          <div><p class="mono">Written by the founders</p><p><a href="https://www.sayanthecoder.in/" target="_blank" rel="noopener">Sayan Mondal</a> (founder, engineering &amp; cloud) and <a href="https://souvikthecoder.in/" target="_blank" rel="noopener">Souvik</a> (co-founder, COO &amp; chief engineer) have shipped 150+ products across apps, SaaS, AI and infrastructure. They also run <a href="https://www.opslin.com/" target="_blank" rel="noopener">Opslin</a>.</p></div></div>
        <a class="nextpost" href="/blog/{nxt['slug']}/"><span class="mono">Next article</span><b>{escape(nxt['title'])}</b><i>→</i></a>
        <div class="related"><p class="mono kicker">Keep reading</p><div class="related__row">{rel}</div></div>
      </footer>
    </article>
"""
        authors = [{"@type": "Person", "name": "Sayan Mondal", "url": "https://www.sayanthecoder.in/"}, {"@type": "Person", "name": "Souvik", "url": "https://souvikthecoder.in/"}]
        ld = [{"@type": "BlogPosting", "headline": p["title"], "description": p["desc"], "image": SITE + p["img"], "datePublished": UPDATED, "dateModified": UPDATED,
               "author": authors, "publisher": {"@type": "Organization", "name": "Shotlin", "url": SITE + "/", "logo": {"@type": "ImageObject", "url": SITE + "/favicon.svg"}},
               "mainEntityOfPage": url, "articleSection": p["tag"], "keywords": p["tag"]},
              {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in p["faq"]]}]
        page(f"/blog/{p['slug']}/", f"{p['title']} | Shotlin Blog", p["desc"], body, "post", ld, og_img=p["img"], hello="Grab a coffee — I'll keep my place on the headings while you read.")



# =====================================================================
# LEGAL
# =====================================================================
LEGAL = {
    "terms": ("Terms &amp; conditions", "Terms & Conditions | Shotlin", "The terms that apply when you use the Shotlin website or engage Shotlin for app, software or website development.", [
        ("h2", "Who we are"), ("p", "Shotlin is a product studio based in Kolkata, India, reachable at hello@shotlin.in. These terms apply to this website and to projects we take on."),
        ("h2", "Project agreements"), ("p", "Every project is defined by a written proposal covering scope, milestones, timeline and fees. If anything in that proposal differs from these terms, the proposal wins."),
        ("h2", "Payments"), ("p", "Fees are invoiced per milestone as set out in the proposal. Work on a milestone begins once its payment is received, unless agreed otherwise in writing."),
        ("h2", "Ownership"), ("p", "Once a project is paid in full, you own the source code, designs and deliverables we created for you. Third-party libraries and services remain under their own licences."),
        ("h2", "Your responsibilities"), ("p", "You provide timely feedback, content, accounts and approvals needed to deliver the project, and confirm you have the rights to anything you share with us."),
        ("h2", "Liability"), ("p", "We build carefully and test thoroughly, but software can contain defects. Our total liability for a project is limited to the fees paid for that project."),
        ("h2", "Changes"), ("p", "We may update these terms. The latest version is always on this page."),
    ]),
    "privacy": ("Privacy policy", "Privacy Policy | Shotlin", "How Shotlin handles the information you share through this website, WhatsApp, email and calls.", [
        ("h2", "What we collect"), ("p", "Only what you choose to send us: your name, contact details and project information when you message us on WhatsApp, email us or book a call."),
        ("h2", "The project brief form"), ("p", "The brief form on this site does not store anything on our servers. It opens WhatsApp with your message pre-filled, and nothing is sent until you press send in WhatsApp."),
        ("h2", "How we use it"), ("p", "To reply to you, prepare proposals and deliver projects. We never sell your information or add you to marketing lists without asking."),
        ("h2", "Cookies & analytics"), ("p", "This website does not use advertising cookies. If we add privacy-friendly analytics in the future, this page will say so."),
        ("h2", "Third parties"), ("p", "Messages you send through WhatsApp or email are also handled by those providers under their own privacy policies."),
        ("h2", "Your choices"), ("p", "Email hello@shotlin.in to see, correct or delete the information we hold about you."),
    ]),
    "refund": ("Refund policy", "Refund Policy | Shotlin", "How refunds work for Shotlin projects, milestones and launch kits.", [
        ("h2", "Milestone-based work"), ("p", "Projects are billed per milestone. If you cancel before a milestone's work has started, the payment for that milestone is refunded in full."),
        ("h2", "Work in progress"), ("p", "If you cancel during a milestone, we refund the portion of that milestone not yet worked on and hand over everything completed so far."),
        ("h2", "Completed milestones"), ("p", "Milestones that have been delivered and approved are non-refundable, and the deliverables are yours to keep."),
        ("h2", "Launch kits"), ("p", "Setup and branding fees follow the same milestone rules. Third-party costs such as app store accounts, domains and servers are paid directly by you and are not refundable by us."),
        ("h2", "How to request a refund"), ("p", "Email hello@shotlin.in with your project name. We reply within five working days."),
    ]),
}


def build_legal():
    for slug, (h1, title, desc, blocks) in LEGAL.items():
        body = f"""    <article class="post post--legal">
      <header class="post__head">
        <nav class="crumbs mono" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span aria-current="page">{h1}</span></nav>
        <h1 class="post__h" data-h1>{h1}</h1>
        <p class="post__lede mono">Last updated 15 November 2026</p>
      </header>
      <div class="post__body" data-post-body>
{render_post_body(blocks)}
      </div>
    </article>
"""
        page(f"/{slug}/", title, desc, body, "legal")


def build_404():
    body = """    <section class="lost">
      <p class="mono kicker">Error 404</p>
      <h1 class="lost__h" data-h1>4<span class="lost__o" aria-hidden="true"></span>4</h1>
      <p class="phero__sub">This page went to the cloud and never came back.</p>
      <a href="/" class="btn btn--primary magnetic"><span>Back to home</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </section>
"""
    page("/404.html", "Page not found | Shotlin", "This page doesn't exist. Head back to Shotlin.", body, "404")


def build_sitemap():
    urls = ["/"] + [p for p in PAGES if p != "/"]
    prio = lambda u: "1.0" if u == "/" else "0.9" if u in ("/launch-kits/", "/custom/", "/contact/", "/about/") else "0.7"
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{UPDATED}</lastmod><priority>{prio(u)}</priority></url>\n" for u in urls)
    xml += "</urlset>\n"
    open("public/sitemap.xml", "w", encoding="utf-8").write(xml)
    open("public/robots.txt", "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")


if __name__ == "__main__":
    build_kits_index()
    for i, k in enumerate(KITS):
        build_kit(k, i)
    build_custom()
    build_about()
    build_contact()
    build_blog()
    build_legal()
    build_404()
    build_sitemap()
    print("pages:", len(PAGES))
