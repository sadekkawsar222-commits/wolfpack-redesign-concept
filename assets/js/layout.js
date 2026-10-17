/* Shared header + footer for the inner pages. Runs synchronously before main.js. */
(() => {
  const tri = c => `<svg class="mega__tri" viewBox="0 0 40 40" style="color:${c}"><path d="M20 3L37 34H3Z M20 3l2 21 M37 34L22 24 M3 34l19-10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  const chev = '<svg viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>';
  const W = 'https://wolfpackadvising.com';

  const header = `
<div class="announce">
  <span class="pill">New</span>
  <span>Free AEO Grader. <span class="txt-long">Score your site for AI search in 60 seconds.</span></span>
  <a href="https://tools.wolfpackadvising.com/aeo-grader">Try it &rarr;</a>
  <button class="announce__x" aria-label="Dismiss announcement">&times;</button>
</div>
<header class="nav">
  <div class="wrap nav__in">
    <a class="nav__logo" href="index.html" aria-label="WolfPack Advising home"><img src="assets/img/logo-white.png" alt="WolfPack Advising" width="160" height="40"></a>
    <nav class="nav__links" aria-label="Primary">
      <div class="nav__item">
        <a class="nav__link" href="services.html">Services ${chev}</a>
        <div class="mega">
          <div class="mega__col">${tri('#00B4D8')}<h4>Upgrade Your Brand</h4><p>Brand and website people trust on sight.</p>
            <ul><li><a href="${W}/services/branding-and-design/">Branding</a></li><li><a href="${W}/services/websites/">Website</a></li><li><a href="${W}/services/review-management/">Review Management</a></li></ul></div>
          <div class="mega__col">${tri('#C8963E')}<h4>Get More Leads</h4><p>Show up first when customers search or scroll.</p>
            <ul><li><a href="${W}/services/advertising/">Advertising</a></li><li><a href="${W}/services/search-engine-optimization/">Search Engine Optimization</a></li><li><a href="${W}/services/search-engine-optimization/ai-engine-optimization/">AI Engine Optimization</a></li><li><a href="${W}/services/social-media-management/">Social Media Management</a></li></ul></div>
          <div class="mega__col">${tri('#1372E3')}<h4>Automate &amp; Grow</h4><p>Turn leads into revenue automatically.</p>
            <ul><li><a href="${W}/services/marketing-automation/">CRM &amp; Marketing Automation</a></li><li><a href="${W}/services/integrations/">Integrations</a></li><li><a href="${W}/services/reporting/">Reporting</a></li><li><a href="services.html">All services &rarr;</a></li></ul></div>
        </div>
      </div>
      <a class="nav__link" href="industries.html">Who We Help</a>
      <a class="nav__link" href="results.html">Results</a>
      <a class="nav__link" href="about.html">About</a>
      <div class="nav__item">
        <a class="nav__link" href="${W}/blog/">Resources ${chev}</a>
        <div class="mega mega--sm">
          <a href="${W}/blog/">Blog <span>&rarr;</span></a>
          <a href="https://podcast.wolfpackadvising.com/">Marketing Alpha Podcast <span>&rarr;</span></a>
          <a href="https://tools.wolfpackadvising.com/aeo-grader">AEO Grader <span>&rarr;</span></a>
          <a href="https://help.wolfpackadvising.com/">Help Center <span>&rarr;</span></a>
        </div>
      </div>
    </nav>
    <div class="nav__right">
      <a class="nav__phone" href="tel:+18773559653">(877) 355-9653</a>
      <a class="nav__login" href="https://my.wolfpackadvising.com/login">Login</a>
      <a class="btn btn--primary btn--sm" href="get-started.html">Get Started</a>
      <button class="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</header>
<nav class="mmenu" aria-label="Mobile">
  <a href="services.html">Services <small>01</small></a>
  <a href="industries.html">Who We Help <small>02</small></a>
  <a href="results.html">Results <small>03</small></a>
  <a href="about.html">About <small>04</small></a>
  <a href="${W}/blog/">Resources <small>05</small></a>
  <div class="mmenu__foot">
    <a class="btn btn--primary" href="get-started.html" style="font-size:14px;justify-content:center;border:0">Get Started</a>
    <a class="nav__phone" href="tel:+18773559653" style="font-size:16px;border:0">(877) 355-9653</a>
  </div>
</nav>`;

  const icon = {
    LinkedIn: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z',
    YouTube: 'M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM9.7 15V9l5.8 3z',
    Facebook: 'M14 8V6c0-.9.6-1.1 1-1.1h2.6V1h-3.6C10 1 9.3 3.9 9.3 5.7V8H7v4h2.3v11H14V12h3.2l.4-4z',
    Instagram: 'M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 1.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM17.2 5.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z',
    'X (Twitter)': 'M18.2 2H21l-6.5 7.4L22 22h-6l-4.7-6.1L5.8 22H3l7-8L2 2h6.1l4.2 5.6zm-1 18h1.6L7 3.8H5.3z',
    TikTok: 'M16.5 2h-3.3v13.2a2.9 2.9 0 1 1-2-2.8V9a6.3 6.3 0 1 0 5.3 6.2V8.5a7.6 7.6 0 0 0 4.5 1.4V6.6a4.5 4.5 0 0 1-4.5-4.6z',
    'Spotify podcast': 'M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5 15.9a.7.7 0 0 1-1 .2c-2.7-1.6-6-2-10-1.1a.7.7 0 1 1-.3-1.4c4.3-1 8-.6 11 1.3.3.2.4.6.3 1zm1.4-3.1a.9.9 0 0 1-1.2.3c-3-1.9-7.7-2.4-11.3-1.3a.9.9 0 1 1-.5-1.7c4.1-1.2 9.2-.6 12.7 1.5.4.3.5.8.3 1.2zm.1-3.2C14.9 8.5 8.9 8.3 5.4 9.4a1 1 0 1 1-.6-2c4-1.2 10.6-1 14.8 1.5a1 1 0 0 1-1 1.7z',
  };
  const links = {
    LinkedIn: 'https://www.linkedin.com/company/wolfpack-advising', YouTube: 'https://www.youtube.com/channel/UCVohafEWM8M5JcclbpcGsKw',
    Facebook: 'https://www.facebook.com/wolfpackadvising/', Instagram: 'https://www.instagram.com/wolfpack_advising/',
    'X (Twitter)': 'https://twitter.com/WolfPackAdv', TikTok: 'http://tiktok.com/@wolfpackadvising', 'Spotify podcast': 'https://open.spotify.com/show/1eSY6FVajUlrOvaEFjnD6b',
  };
  const socials = Object.keys(icon).map(k => `<a href="${links[k]}" aria-label="${k}"><svg viewBox="0 0 24 24" fill-rule="evenodd"><path d="${icon[k]}"/></svg></a>`).join('');

  const footer = `
<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <h2>Our Den</h2>
        <address>
          <a href="https://maps.app.goo.gl/Re9WSLUezJXy3F4w7">501 E Kennedy Blvd, STE 1400<br>Tampa, FL 33602</a>
          <span>Monday &ndash; Friday: 8am &ndash; 5pm</span>
          <a href="tel:+18773559653" style="font:600 22px var(--f-head);color:#fff">(877) 355-9653</a>
        </address>
        <div class="socials">${socials}</div>
      </div>
      <div><h2>Services</h2><ul><li><a href="${W}/services/websites/">Websites</a></li><li><a href="${W}/services/search-engine-optimization/">SEO</a></li><li><a href="${W}/services/advertising/">Advertising</a></li><li><a href="${W}/services/social-media-management/">SMM</a></li><li><a href="${W}/services/marketing-automation/">CRM</a></li><li><a href="services.html">All services</a></li></ul></div>
      <div><h2>Who We Serve</h2><ul><li><a href="${W}/industries/home-inspectors/">Home Inspectors</a></li><li><a href="${W}/industries/pest-control/">Pest Control</a></li><li><a href="${W}/industries/roofers/">Roofing</a></li><li><a href="${W}/industries/plumbers/">Plumbing</a></li><li><a href="industries.html">View all</a></li></ul></div>
      <div><h2>Resources</h2><ul><li><a href="${W}/blog/">Blog</a></li><li><a href="https://podcast.wolfpackadvising.com/">Podcast</a></li><li><a href="https://tools.wolfpackadvising.com/aeo-grader">AEO Grader</a></li><li><a href="https://help.wolfpackadvising.com/">Help Center</a></li><li><a href="results.html">Case Studies</a></li></ul></div>
      <div><h2>Company</h2><ul><li><a href="about.html">About Us</a></li><li><a href="${W}/about/team/">Team</a></li><li><a href="${W}/about/speaking/">Speaking</a></li><li><a href="${W}/about/careers/">Careers</a></li><li><a href="${W}/contact/">Contact</a></li><li><a href="${W}/tampa-digital-marketing-agency/">Tampa Digital Marketing Agency</a></li></ul></div>
    </div>
    <div class="foot__mark" aria-hidden="true">WOLFPACK</div>
    <div class="foot__base">
      <span>&copy; 2026 WolfPack Advising. All rights reserved.</span>
      <nav aria-label="Legal"><a href="${W}/privacy-policy/">Privacy Policy</a><a href="${W}/terms-of-service/">Terms of Use</a><a href="${W}/disclaimer/">Disclaimer</a><a href="${W}/sitemap_index.xml">Sitemap</a></nav>
    </div>
  </div>
</footer>`;

  const cta = `
<section class="cta" data-shape="cluster" data-x="0" data-y=".6" data-s=".55" data-o=".7" data-my=".62" data-ms=".42" data-mo=".5" data-rot="spin">
  <div class="wrap cta__in">
    <span class="eyebrow" data-reveal>Join the pack</span>
    <h2 class="h-xl" data-split>Join the 400+ companies that market like an <span class="grad">alpha.</span></h2>
    <p class="lead" data-reveal>Save time. Earn more. Become alpha.</p>
    <a class="btn btn--primary" href="get-started.html" style="padding:22px 38px;font-size:15px" data-reveal>Get Started <span class="btn__arrow"><svg viewBox="0 0 12 12"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg></span></a>
  </div>
  <div class="ticker marquee" aria-hidden="true"><div class="marquee__track"><span>Become an alpha online</span><span>Become an alpha online</span><span>Become an alpha online</span><span>Become an alpha online</span></div></div>
</section>`;

  const put = (sel, html) => document.querySelectorAll(sel).forEach(el => { el.outerHTML = html; });
  put('[data-include="header"]', header);
  put('[data-include="cta"]', cta);
  put('[data-include="footer"]', footer);

  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .mmenu a').forEach(a => {
    if (a.getAttribute('href') === page) { a.setAttribute('aria-current', 'page'); a.style.color = '#fff'; }
  });
})();
