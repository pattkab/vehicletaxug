// Site-wide analytics and Search Console hooks for vehicletaxug.cc.
//
// Google Analytics 4: create a property at analytics.google.com, then paste
// the Measurement ID (G-XXXXXXXXXX) below. Leave blank to skip GA4.
//
// Google Search Console: after you verify the domain (or paste the HTML-tag
// content value below), submit https://vehicletaxug.cc/sitemap.xml.
//
// The built-in usage counter needs no account. Totals are on /stats.html.
window.UG_SITE = {
  gaMeasurementId: "",
  googleSiteVerification: "",
  counter: {
    base: "https://countapi.mileshilliard.com/api/v1",
    pageviews: "vehicletaxug_cc_pageviews",
    visitors: "vehicletaxug_cc_visitors",
    pagePrefix: "vehicletaxug_cc_p_",
  },
};
