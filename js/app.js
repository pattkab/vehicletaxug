(function () {
  const tax = window.UgTax;
  const form = document.querySelector("#estimator");
  if (!form || !tax) return;

  const els = {
    make: document.querySelector("#make"),
    query: document.querySelector("#query"),
    matches: document.querySelector("#matches"),
    status: document.querySelector("#status"),
    description: document.querySelector("#description"),
    year: document.querySelector("#year"),
    cc: document.querySelector("#cc"),
    cif: document.querySelector("#cif"),
    hs: document.querySelector("#hs"),
    fuel: document.querySelector("#fuel"),
    klass: document.querySelector("#klass"),
    importYear: document.querySelector("#import-year"),
    duty: document.querySelector("#duty"),
    fx: document.querySelector("#fx"),
    rateNote: document.querySelector("#rate-note"),
    guideNote: document.querySelector("#guide-note"),
    output: document.querySelector("#output"),
    reg: document.querySelector("#registration"),
    stamp: document.querySelector("#stamp"),
    plate: document.querySelector("#plate"),
    motoExcise: document.querySelector("#moto-excise"),
    motoRow: document.querySelector("#moto-excise-row"),
    makes: document.querySelector("#makes"),
  };

  const countries = {
    JP: "Japan", DE: "Germany", GB: "United Kingdom", UK: "United Kingdom",
    SE: "Sweden", US: "United States", CN: "China", CA: "Canada", FR: "France",
    KR: "South Korea", IT: "Italy", KE: "Kenya", IN: "India", NL: "Netherlands",
    TH: "Thailand", BE: "Belgium", ZA: "South Africa", ES: "Spain", AU: "Australia",
    AE: "United Arab Emirates", TZ: "Tanzania",
  };
  const registrationFees = {
    none: 0,
    sedan: 1218000,
    estate3500: 1718000,
    passenger: 1218000,
    hiace: 818000,
    motorcycle: 268000,
    goods2: 918000,
    goods7: 1018000,
    tractor: 268000,
  };

  let catalog = null;
  let guideCif = null;
  let lastKlass = els.klass.value;
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const ugx = new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 });

  els.importYear.value = String(new Date().getFullYear());
  try {
    const savedRate = localStorage.getItem("ug-vehicle-fx");
    if (savedRate) els.fx.value = savedRate;
  } catch (error) {
    // Private browsing can block storage. The rate field still works.
  }

  function numberOrNull(value) {
    if (value === "" || value == null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function selectedMake() {
    const typed = els.make.value.trim().toLowerCase();
    if (!catalog || !typed) return "";
    return catalog.makes.find((make) => make.toLowerCase() === typed) || "";
  }

  function renderMatches() {
    if (!catalog) {
      els.matches.innerHTML = "";
      return;
    }
    const make = selectedMake();
    const tokens = els.query.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!make && tokens.length === 0) {
      els.matches.innerHTML = "";
      els.status.textContent = catalog.entries.toLocaleString("en-UG") + " guide rows loaded. Choose a make or type a model.";
      return;
    }
    const found = [];
    for (const row of catalog.rows) {
      const rowMake = catalog.makes[row[0]];
      if (make && rowMake !== make) continue;
      const hay = (rowMake + " " + row[1] + " " + (row[2] || "") + " " + row[5]).toLowerCase();
      if (tokens.every((token) => hay.includes(token))) found.push(row);
    }
    found.sort((a, b) => (b[2] || 0) - (a[2] || 0) || String(a[1]).localeCompare(String(b[1])));
    const shown = found.slice(0, 30);
    const countLabel = found.length > 30
      ? found.length.toLocaleString("en-UG") + " matches. Showing 30, newest year first."
      : found.length + " match" + (found.length === 1 ? "" : "es") + ".";
    els.status.textContent = countLabel;
    els.matches.innerHTML = "";
    shown.forEach((row) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      const title = document.createElement("span");
      title.textContent = row[1];
      const meta = document.createElement("small");
      const cc = row[3] ? row[3].toLocaleString("en-UG") + " cc · " : "";
      meta.textContent = (row[2] || "Year not in the guide") + " · " + cc + usd.format(row[4]) + " CIF · " + row[5];
      button.append(title, meta);
      button.addEventListener("click", () => applyRow(row));
      item.appendChild(button);
      els.matches.appendChild(item);
    });
  }

  function applyRow(row) {
    const make = catalog.makes[row[0]];
    els.make.value = make;
    els.description.value = row[1];
    els.year.value = row[2] ?? "";
    els.cc.value = row[3] ?? "";
    els.cif.value = row[4];
    els.hs.value = row[5];
    els.fuel.value = tax.fuelFromHs(row[5]);
    els.klass.value = tax.vehicleClass(row[5]);
    syncMotoExcise();
    guideCif = row[4];
    const origin = countries[row[6]] || row[6] || "origin not stated";
    els.guideNote.hidden = false;
    els.guideNote.textContent =
      "URA serial " + row[7] + " · " + origin + " · HS " + row[5] +
      ". For a used vehicle, URA uses this guide value rather than the invoice.";
    render();
  }

  function readInputs() {
    return {
      description: els.description.value.trim(),
      year: numberOrNull(els.year.value),
      cc: numberOrNull(els.cc.value),
      cif: numberOrNull(els.cif.value),
      hs: els.hs.value.trim(),
      fuel: els.fuel.value,
      klass: els.klass.value,
      importYear: numberOrNull(els.importYear.value),
      dutyRate: (numberOrNull(els.duty.value) || 0) / 100,
      fx: numberOrNull(els.fx.value),
    };
  }

  function syncMotoExcise() {
    if (!els.motoExcise || !els.motoRow) return;
    const moto = els.klass.value === "motorcycle";
    els.motoRow.hidden = !moto;
    if (moto && lastKlass !== "motorcycle") els.motoExcise.checked = true;
    if (!moto) els.motoExcise.checked = false;
    lastKlass = els.klass.value;
  }

  function render() {
    syncMotoExcise();
    const input = readInputs();
    if (input.cif == null || input.cif < 0) {
      els.output.innerHTML = "<p class=\"hint\">Enter a CIF in US dollars, or pick a vehicle from the guide.</p>";
      return;
    }
    const age = tax.ageYears(input.year, input.importYear);
    const levy = tax.environmental(age, input.klass);
    const excise = tax.exciseRate(input.fuel, input.cc, input.klass);
    const result = tax.calculate({
      cifUsd: input.cif,
      dutyRate: input.dutyRate,
      exciseRate: excise,
      environmentalRate: levy.blocked ? 0 : levy.rate,
    });
    const fx = input.fx && input.fx > 0 ? input.fx : null;
    const changed = guideCif != null && Math.abs(input.cif - guideCif) > 0.009;
    const parts = [];
    if (levy.blocked) {
      els.output.innerHTML =
        "<div class=\"ban\"><strong>This age is outside the import rule used here.</strong><p>" +
        levy.detail + "</p></div><p>Customs value " + usd.format(result.cif) +
        ". No clearance total is shown for a vehicle this estimator treats as not importable.</p>";
      return;
    }
    parts.push("<div class=\"totals\"><span>Customs charges</span><strong>" + usd.format(result.total) + "</strong></div>");
    if (fx) {
      const shillings = result.lines.reduce((sum, line) => sum + Math.round(line[2] * fx), 0);
      parts.push("<p class=\"ok-note\">" + ugx.format(shillings) + " at " + fx.toLocaleString("en-UG") + " shillings per dollar.</p>");
    }
    parts.push("<p>" + levy.detail + (age == null ? "" : " Age counted as " + age + " year" + (age === 1 ? "" : "s") + " (import year minus guide year).") + "</p>");
    if (changed) {
      parts.push("<p class=\"hint\">The CIF no longer matches the selected guide row. URA values used vehicles from the guide.</p>");
    }
    parts.push("<table class=\"lines\"><tbody>");
    parts.push(row("Customs value (CIF)", result.cif, fx));
    result.lines.forEach((line) => {
      parts.push(row(line[1], line[2], fx));
    });
    parts.push(row("Total customs charges", result.total, fx, true));
    parts.push("</tbody></table>");
    parts.push("<p class=\"fine\">Excise in this estimate is " + Math.round(excise * 100) + "% of CIF plus import duty. VAT is 18% of CIF plus import duty plus excise. Withholding tax is 6% of CIF. The environmental levy is " + Math.round((levy.blocked ? 0 : levy.rate) * 100) + "% of CIF. Infrastructure levy is 1.5% and the import declaration fee is 1%.</p>");
    if (isOfficialExample(input, excise, levy)) {
      parts.push("<p class=\"callout\">This matches URA’s published example: UGX 9,450,000 before the 1% import declaration fee, and UGX 9,540,000 with that fee included.</p>");
    }
    const local = localFees(input);
    if (local.total > 0) {
      parts.push("<h3>After customs, if you add them</h3><p>" + ugx.format(local.total) + ". " + local.note + "</p>");
    }
    els.output.innerHTML = parts.join("");
  }

  function row(label, amount, fx, strong) {
    const tag = strong ? "th" : "td";
    const shillings = fx ? ugx.format(Math.round(amount * fx)) : "—";
    return "<tr><" + tag + ">" + label + "</" + tag + "><" + tag + " class=\"num\">" + usd.format(amount) + "<br>" + shillings + "</" + tag + "></tr>";
  }

  function isOfficialExample(input, excise, levy) {
    return input.cif === 2500 && input.fx === 3600 && input.dutyRate === 0.25 && excise === 0 && !levy.blocked && levy.rate === 0.5;
  }

  function localFees(input) {
    const registration = registrationFees[els.reg.value] || 0;
    const stamp = els.stamp.checked ? (input.klass === "motorcycle" ? 30000 : 200000) : 0;
    const plate = Math.max(0, numberOrNull(els.plate.value) || 0);
    const motoExcise = input.klass === "motorcycle" && els.motoExcise && els.motoExcise.checked ? 500000 : 0;
    const parts = [];
    if (registration) parts.push("registration from the URA Taxman schedule of 30 December 2022");
    if (stamp) parts.push("stamp duty as summarised by PwC on 22 October 2026");
    if (motoExcise) parts.push("motorcycle first-registration excise of UGX 500,000 under the Excise Duty (Amendment) Act, 2026, in force from 1 July 2026");
    if (plate) parts.push("the digital plate fee you entered");
    return {
      total: registration + stamp + plate + motoExcise,
      note: parts.length ? parts.join("; ") + "." : "",
    };
  }

  document.querySelectorAll("[data-make]").forEach((button) => {
    button.addEventListener("click", () => {
      els.make.value = button.getAttribute("data-make");
      els.query.focus();
      renderMatches();
    });
  });

  document.querySelector("#example").addEventListener("click", () => {
    guideCif = null;
    els.guideNote.hidden = false;
    els.guideNote.textContent = "URA’s import FAQ example: FOB 2,000 + insurance 200 + freight 300 = CIF 2,500, exchanged at 3,600.";
    els.description.value = "URA FAQ example, car older than 9 years";
    els.year.value = "2016";
    els.importYear.value = "2026";
    els.cc.value = "1500";
    els.cif.value = "2500";
    els.hs.value = "8703.22.90";
    els.fuel.value = "petrol";
    els.klass.value = "passenger";
    els.duty.value = "25";
    els.fx.value = "3600";
    render();
  });

  form.addEventListener("submit", (event) => event.preventDefault());
  ["input", "change"].forEach((eventName) => {
    form.addEventListener(eventName, (event) => {
      if (event.target === els.make || event.target === els.query) renderMatches();
      if (event.target === els.fx && els.fx.value) {
        try { localStorage.setItem("ug-vehicle-fx", els.fx.value); } catch (error) { /* storage optional */ }
      }
      if (event.target !== els.query) render();
    });
  });

  fetch("data/valuations.json")
    .then((response) => {
      if (!response.ok) throw new Error("Guide file missing");
      return response.json();
    })
    .then((data) => {
      catalog = data;
      data.makes.forEach((make) => {
        const option = document.createElement("option");
        option.value = make;
        els.makes.appendChild(option);
      });
      els.status.textContent = data.entries.toLocaleString("en-UG") + " valuations from the URA database of 1 August 2026, the latest file published.";
      const params = new URLSearchParams(location.search);
      if (params.get("make")) els.make.value = params.get("make");
      if (params.get("q")) els.query.value = params.get("q");
      if (params.get("make") || params.get("q")) renderMatches();
    })
    .catch(() => {
      els.status.textContent = "The valuation guide did not load. You can still type a CIF and calculate.";
    });

  fetch("https://open.er-api.com/v6/latest/USD")
    .then((response) => response.json())
    .then((data) => {
      const market = data && data.rates && data.rates.UGX;
      if (!market) return;
      const rounded = Math.round(market);
      if (!els.fx.value) els.fx.value = String(rounded);
      els.rateNote.textContent = "A market rate is about UGX " + rounded.toLocaleString("en-UG") + " per USD. It is not URA’s monthly customs rate. Replace it with the rate on your declaration.";
      render();
    })
    .catch(() => {
      els.rateNote.textContent = "The market rate could not be fetched. Enter the shillings per dollar you want to use. URA publishes its own monthly customs rate.";
    });

  render();
})();
