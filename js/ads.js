(function () {
  const config = window.UG_ADS || { client: "", slots: {} };
  const preview = new URLSearchParams(location.search).has("ads");

  // A desktop rail is removed on small screens before any request, so a hidden
  // unit is never asked to fill. Auto ads still cover phones with anchor ads.
  if (window.matchMedia("(max-width: 1099px)").matches) {
    document.querySelectorAll(".ad-rail").forEach((rail) => rail.remove());
  }

  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const name = slot.getAttribute("data-slot");
    const unit = config.slots && config.slots[name];
    if (!config.client || !unit) {
      if (!preview) {
        slot.remove();
        return;
      }
      slot.innerHTML =
        '<p class="ad-label">Advertisement</p><div class="ad-preview">Reserved ' +
        name +
        " unit. It stays hidden until a slot ID is set.</div>";
      return;
    }
    slot.innerHTML = '<p class="ad-label">Advertisement</p>';
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", config.client);
    ins.setAttribute("data-ad-slot", unit);
    ins.setAttribute("data-ad-format", slot.getAttribute("data-format") || "auto");
    ins.setAttribute("data-full-width-responsive", "true");
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
