# UG Vehicle Taxes website

Static estimator for Uganda motor vehicle import taxes. CIF values are the URA Used Motor Vehicle Database reviewed on 1 August 2026. Open `index.html` from this folder, or from the repository root:

```bash
python3 -m http.server 8765 --directory website
```

Then open http://127.0.0.1:8765/

## Advertising

Every page loads AdSense for publisher `ca-app-pub-9402272089735179` and reserves manual units. `ads.txt` is in this folder. Slot IDs start blank, so the manual boxes stay hidden until you paste them into `js/ads-config.js`. Add `?ads=1` to any URL to see the reserved boxes.

In AdSense, add the live domain, wait for approval, then:

1. Turn on auto ads and enable anchor, vignette, side rail and in-page formats. That is Google’s own density optimiser.
2. Create four responsive display units and paste their slot IDs into `top`, `article`, `bottom` and `multiplex`.
3. Turn on Privacy messaging for the EEA, UK and US states. Do not add a second consent banner over Google’s message.
4. Do not click your own ads, and do not ask visitors to click them.

Manual units sit below the introduction, between sections of a long article, in a desktop sidebar, and above the footer. A multiplex unit sits at the end of long pages. They are not placed on the search button or beside the contact links. Empty slots are removed so the page does not show blank ad frames. On screens under 1100px the sidebar unit is removed before any ad request.

Auto ads on the publisher tag cover anchor and vignette placements. Turn those formats on in AdSense after the domain is approved. Create five units and paste their IDs into `top`, `article`, `bottom`, `multiplex` and `rail` in `js/ads-config.js`.

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

After the records propagate, enforce HTTPS in the GitHub Pages settings. Then add `https://vehicletaxug.cc` in AdSense and in Google Search Console, and submit `https://vehicletaxug.cc/sitemap.xml`.

The valuation file is about 3 MB. GitHub compresses it in transit. Cloudflare in front of the domain would make that download smaller for visitors in Uganda, with the DNS records pointed at Cloudflare and the origin set to the GitHub Pages host.
