# UG Vehicle Taxes website

Static estimator for Uganda motor vehicle import taxes. CIF values are the URA Used Motor Vehicle Database reviewed on 1 August 2026. Open `index.html` from this folder, or from the repository root:

```bash
python3 -m http.server 8765 --directory website
```

Then open http://127.0.0.1:8765/

## Advertising

Every page loads AdSense for publisher `ca-pub-9402272089735179` and reserves manual units. `ads.txt` is in this folder. Slot IDs start blank, so each reserved box shows an “Advertisement” placeholder until you paste unit IDs into `js/ads-config.js`. Add `?noads=1` to hide those placeholders.

In AdSense, add the live domain, wait for approval, then:

1. Turn on auto ads and enable anchor, vignette, side rail and in-page formats. That is Google’s own density optimiser.
2. Create five ad units and paste their slot IDs into `top`, `article`, `bottom`, `multiplex` and `rail` in `js/ads-config.js`.
3. Turn on Privacy messaging for the EEA, UK and US states. Do not add a second consent banner over Google’s message.
4. Do not click your own ads, and do not ask visitors to click them.

Manual units sit below the introduction, between sections of a long article, in a desktop sidebar, and above the footer. A multiplex unit sits at the end of long pages. Empty slots are removed so the page does not show blank ad frames. On screens under 1100px the sidebar unit is removed before any ad request.

## Usage statistics

Every public page runs `js/analytics.js`. Open **https://vehicletaxug.cc/stats.html** for page-view and distinct-visitor-day totals. That page is `noindex` and blocked in `robots.txt`.

Optional Google Analytics 4: create a GA4 property, then set `gaMeasurementId` in `js/site-config.js` to your `G-XXXXXXXXXX` id.

## Google Search / SEO

Technical SEO already on the site:

- Canonical URLs, Open Graph, Twitter cards, `hreflang`
- `robots.txt` and `sitemap.xml`
- FAQ, WebSite, WebApplication and BreadcrumbList JSON-LD
- Site search action on the calculator (`/?q=…`)

In [Google Search Console](https://search.google.com/search-console):

1. Add `https://vehicletaxug.cc` (domain or URL-prefix property).
2. Paste the HTML-tag verification value into `googleSiteVerification` in `js/site-config.js`, or upload the HTML file Google gives you into this folder.
3. Submit `https://vehicletaxug.cc/sitemap.xml`.
4. Request indexing for the home page and the main guides after the domain resolves to GitHub Pages.

## Where it is hosted

GitHub Pages serves the `website` folder from the Publish website workflow. The public address is `https://vehicletaxug.cc`. `CNAME`, `ads.txt`, `robots.txt` and `sitemap.xml` are in this folder so they are served at the domain root.

At the registrar for vehicletaxug.cc, set these records and remove any conflicting A or CNAME on the same names:

| Host | Type | Value |
| --- | --- | --- |
| `@` | A | 185.199.108.153 |
| `@` | A | 185.199.109.153 |
| `@` | A | 185.199.110.153 |
| `@` | A | 185.199.111.153 |
| `@` | AAAA | 2606:50c0:8000::153 |
| `@` | AAAA | 2606:50c0:8001::153 |
| `@` | AAAA | 2606:50c0:8002::153 |
| `@` | AAAA | 2606:50c0:8003::153 |
| `www` | CNAME | `pattkab.github.io` |

Spaceship currently has `@` → `185.199.108.153` and `www` → `pattkab.github.io`. Add the other three GitHub A records (and AAAA if you want) for redundancy. After DNS finishes propagating worldwide, turn on **Enforce HTTPS** in the GitHub Pages settings for [pattkab/vehicletaxug](https://github.com/pattkab/vehicletaxug). Then add the domain in AdSense and Search Console, and submit `https://vehicletaxug.cc/sitemap.xml`.

The valuation file is about 3 MB. GitHub compresses it in transit. Cloudflare in front of the domain would make that download smaller for visitors in Uganda, with the DNS records pointed at Cloudflare and the origin set to the GitHub Pages host.
