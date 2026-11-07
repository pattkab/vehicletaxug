(function () {
  const config = window.UG_ADS || { client: "", slots: {} };
  const hidePlaceholders = new URLSearchParams(location.search).has("noads");
  const client = (config.client || "").trim();

  // A desktop rail is removed on small screens before any request, so a hidden
  // unit is never asked to fill. Auto ads still cover phones with anchor ads.
  if (window.matchMedia("(max-width: 1099px)").matches) {
    document.querySelectorAll(".ad-rail").forEach((rail) => rail.remove());
  }

  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const name = slot.getAttribute("data-slot") || "display";
    const unit = config.slots && config.slots[name];

    if (!client || !unit) {
      if (hidePlaceholders) {
        slot.remove();
        return;
      }
      // Keep layout reserved until AdSense unit IDs are pasted into ads-config.js.
      slot.classList.add("ad-slot-placeholder");
      slot.setAttribute("aria-hidden", "true");
      slot.innerHTML =
        '<p class="ad-label">Advertisement</p>' +
        '<div class="ad-preview" data-slot-name="' +
        name +
        '">Ad placement reserved. Google ads will appear here once the site is approved and a unit ID is set.</div>';
      return;
    }

    slot.classList.remove("ad-slot-placeholder");
    slot.removeAttribute("aria-hidden");
    slot.innerHTML = '<p class="ad-label">Advertisement</p>';
    const format = slot.getAttribute("data-format") || "auto";
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", client);
    ins.setAttribute("data-ad-slot", unit);
    ins.setAttribute("data-ad-format", format);
    if (format !== "autorelaxed") {
      ins.setAttribute("data-full-width-responsive", "true");
    }
    slot.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      // A failed ad request must not break the calculator.
    }
  });

  document.querySelectorAll(".ad-rail").forEach((rail) => {
    if (!rail.querySelector(".ad-slot")) rail.remove();
  });
})();
