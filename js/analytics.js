(function () {
  const config = window.UG_SITE || {};
  const counter = config.counter || {};
  const base = (counter.base || "https://countapi.mileshilliard.com/api/v1").replace(/\/$/, "");

  function pageKey() {
    const path = (location.pathname || "/").replace(/^\//, "").replace(/\/$/, "") || "index";
    const slug = path
      .replace(/\.html$/i, "")
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_|_$/g, "")
      .toLowerCase() || "index";
    return (counter.pagePrefix || "vehicletaxug_cc_p_") + slug;
  }

  function hit(key) {
    if (!key) return Promise.resolve(null);
    return fetch(base + "/hit/" + encodeURIComponent(key), {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return null;
        const value = data.value;
        return typeof value === "number" ? value : Number(value);
      })
      .catch(() => null);
  }

  function get(key) {
    if (!key) return Promise.resolve(null);
    return fetch(base + "/get/" + encodeURIComponent(key), {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return null;
        const value = data.value;
        return typeof value === "number" ? value : Number(value);
      })
      .catch(() => null);
  }

  function trackUsage() {
    if (document.documentElement.getAttribute("data-no-analytics") === "1") return;
    const pageviewsKey = counter.pageviews || "vehicletaxug_cc_pageviews";
    const visitorsKey = counter.visitors || "vehicletaxug_cc_visitors";

    hit(pageviewsKey);
    hit(pageKey());

    try {
      const stamp = localStorage.getItem("ug-vehicle-visit");
      const today = new Date().toISOString().slice(0, 10);
      if (stamp !== today) {
        localStorage.setItem("ug-vehicle-visit", today);
        hit(visitorsKey);
      }
    } catch (error) {
      hit(visitorsKey);
    }
  }

  function loadGoogleAnalytics() {
    const id = (config.gaMeasurementId || "").trim();
    if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true, transport_type: "beacon" });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  function injectSearchConsole() {
    const token = (config.googleSiteVerification || "").trim();
    if (!token) return;
    if (document.querySelector('meta[name="google-site-verification"]')) return;
    const meta = document.createElement("meta");
    meta.name = "google-site-verification";
    meta.content = token;
    document.head.appendChild(meta);
  }

  window.UG_STATS = {
    get: get,
    hit: hit,
    pageKey: pageKey,
    keys: {
      pageviews: counter.pageviews || "vehicletaxug_cc_pageviews",
      visitors: counter.visitors || "vehicletaxug_cc_visitors",
      pagePrefix: counter.pagePrefix || "vehicletaxug_cc_p_",
    },
  };

  injectSearchConsole();
  loadGoogleAnalytics();
  trackUsage();
})();
