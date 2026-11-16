import json, re
P = json.load(open('../_assets/home_parts.json', encoding='utf-8'))
h = P['hero']
h = h.replace('<small>Co-founder &amp; COO · Product &amp; Ops</small>', '<small>Co-founder · COO &amp; Chief Engineer</small>')
h = h.replace('href="#contact" class="btn btn--primary magnetic"', 'href="/contact/" class="btn btn--primary magnetic" data-open-brief').replace('href="#contact"', 'href="/contact/"')
h = re.sub(r'<p class="hero__sub reveal-up">.*?</p>', '<p class="hero__sub reveal-up">Apps, SaaS, AI and the cloud they run on — built by two founders who ship.</p>', h, flags=re.S)
w = P['work'].replace('href="#contact"', 'href="/contact/" data-open-brief')
for a, b in [('#1c3a8a', '#3048ff'), ('#c9a24a', '#ffd23f;--fg:#0e0d0c'), ('#d4a24c', '#c8ff2e;--fg:#0e0d0c'), ('#ff7a00', '#ff7a00;--fg:#0e0d0c')]:
    w = w.replace('--accent:' + a, '--accent:' + b)
w = w.replace('<h2 class="h2 split">Products, <span class="serif">not</span> prototypes.</h2>', '<h2 class="h2 split" data-bot="A few favourites from 150+ projects, each with its own case study. Scroll sideways!">Products, <span class="hl">not prototypes.</span></h2>')
w = w.replace('( 03 ) — Selected work', 'Turning visions into digital reality')
w = re.sub(r'<p class="work__lead">.*?</p>', '<p class="work__lead">Featured from 150+ projects — real apps, dashboards and users across India.</p>', w, flags=re.S)
ring = '''<div class="ring" data-ring>
        <div class="ring__pin" data-ring-pin>
          <p class="mono kicker ring__kick">Turning visions into digital reality</p>
          <h2 class="ring__title" data-bot="150+ products shipped and counting. These are a few — the wheel spins as you scroll."><span class="ring__num"><span class="odo" data-odo-ring>000</span><i>+</i></span><span class="ring__sub">products <span class="serif">shipped.</span></span></h2>
          <div class="ring__stage" aria-hidden="true"><div class="ring__wheel" data-ring-wheel>
          <figure class="rc rc--ph" style="--accent:#7b3fe4"><img src="/img/work/bakaloo-home.webp" alt="" loading="lazy" /><figcaption><b>Bakaloo</b><span>Grocery app</span></figcaption></figure>
          <figure class="rc" style="--accent:#7b3fe4"><img src="/img/work/bakaloo-builder.webp" alt="" loading="lazy" /><figcaption><b>Bakaloo HQ</b><span>Storefront builder</span></figcaption></figure>
          <figure class="rc rc--ph" style="--accent:#e5242b"><img src="/img/work/freshcart-home.webp" alt="" loading="lazy" /><figcaption><b>FreshCart</b><span>Meat &amp; fish delivery</span></figcaption></figure>
          <figure class="rc rc--ph" style="--accent:#e5242b"><img src="/img/work/freshcart-vendor.webp" alt="" loading="lazy" /><figcaption><b>FreshCuts</b><span>Vendor app</span></figcaption></figure>
          <figure class="rc rc--ph" style="--accent:#3048ff"><img src="/img/work/dealker-home.webp" alt="" loading="lazy" /><figcaption><b>Dealker</b><span>Marketplace &amp; auctions</span></figcaption></figure>
          <figure class="rc" style="--accent:#5b4cf5"><img src="/img/work/lndry-pos-dashboard.webp" alt="" loading="lazy" /><figcaption><b>LNDRY POS</b><span>Counter POS &amp; GST</span></figcaption></figure>
          <figure class="rc rc--ph" style="--accent:#5b4cf5"><img src="/img/work/lndry-customer.webp" alt="" loading="lazy" /><figcaption><b>LNDRY</b><span>Laundry app</span></figcaption></figure>
          <figure class="rc rc--ph" style="--accent:#ff7a00"><img src="/img/work/radha-store.webp" alt="" loading="lazy" /><figcaption><b>Radha</b><span>Retail AI</span></figcaption></figure>
          <figure class="rc" style="--accent:#4f7cff"><img src="/img/work/opslin-overview.webp" alt="" loading="lazy" /><figcaption><b>Opslin</b><span>Deploy platform</span></figcaption></figure>
          <figure class="rc" style="--accent:#b5653a"><img src="/img/work/rustbloom.webp" alt="" loading="lazy" /><figcaption><b>Rustbloom</b><span>2.5D game</span></figcaption></figure>
          <figure class="rc" style="--accent:#c8a24a"><img src="/img/work/agnix-website-home.webp" alt="" loading="lazy" /><figcaption><b>Agnix Studio</b><span>Cinematic website</span></figcaption></figure>
          <figure class="rc rc--ph" style="--accent:#c9a24a"><img src="/img/work/jimmywax-home.webp" alt="" loading="lazy" /><figcaption><b>Jimmy &amp; Wax</b><span>D2C store app</span></figcaption></figure>
          </div></div>
          <p class="ring__cap mono" data-ring-cap><b data-ring-name>Bakaloo</b> · <span data-ring-type>Grocery app</span></p>
        </div>
      </div>
      '''
w = w.replace('<div class="work__intro">', ring + '<div class="work__intro">', 1)
o = P['opslin'].replace('( 05 ) — Our sister company', 'Our sister company').replace('<h2 class="h2 h2--light split">', '<h2 class="h2 h2--light split" data-bot="Opslin is our sister company. It deploys apps on servers YOU own.">')
o = re.sub(r'<p class="opslin__lead">.*?</p>', '<p class="opslin__lead">Every product needs a home. Connect a Linux VPS you own and go live in about five minutes — domains, SSL, databases, logs and one-click rollback.</p>', o, flags=re.S)
v = P['voices'].replace('<section class="voices" aria-label="Testimonials">', '<section class="voices" aria-label="Testimonials">\n      <div class="dz" data-doodles="heart,star,heart,chat,spark" aria-hidden="true"></div>').replace('( 07 ) — Kind words', 'Client testimonials').replace('Founders <span class="serif">talk.</span>', 'Happy clients. <span class="serif">Kind words.</span>')
P['stats'] = '''<section class="stats stats--odo" aria-label="Shotlin in numbers">
      <div class="stats__sweep" aria-hidden="true"></div>
      <div class="stat"><b><span class="odo" data-odo="150">000</span><i>+</i></b><p>projects shipped for startups &amp; brands</p></div>
      <div class="stat"><b><span class="odo" data-odo="25">00</span></b><p>tools in our everyday stack</p></div>
      <div class="stat"><b><span class="odo" data-odo="4">0</span></b><p>cities live: Surat, Hyderabad, Delhi, Pune</p></div>
      <div class="stat"><b>~<span class="odo" data-odo="5">0</span><small>min</small></b><p>to deploy on Opslin, our own platform</p></div>
    </section>'''
s_ = P['stats'].replace('x', 'x')
h = h.replace('<div class="hero__grid" aria-hidden="true"></div>', '<div class="hero__grid" aria-hidden="true"></div>\n      <div class="dz dz--hero" data-doodles="eyes,spark,code,heart,bolt,cursor" aria-hidden="true"></div>')
h = h.replace('<li><b data-count="7">0</b><span>brands shipped</span></li>', '<li><b><span data-count="150">0</span>+</b><span>projects shipped</span></li>')
h = re.sub(r'\s*<div class="hero__hint[^>]*>.*?</div>', '', h, flags=re.S)
h = h.replace('<span class="tag__icon">❄</span>', '<span class="tag__icon"><img src="/img/founders/sayan_park.webp" alt="" /></span>')
h = h.replace('<span class="tag__icon">🔥</span>', '<span class="tag__icon"><img src="/img/founders/souvik_office.webp" alt="" /></span>')
t = open('scripts/home.tpl.html', encoding='utf-8').read()
for k, val in dict(hero=h, logos=P['logos'], work=w, stats=s_, opslin=o, voices=v).items():
    t = t.replace('{{%s}}' % k, val)
open('index.html', 'w', encoding='utf-8').write(t)
print('ok', t.count('{{'))
