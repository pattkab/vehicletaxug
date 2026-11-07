(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.UgTax = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const PASSENGER_PETROL = ["870321", "870322", "870323", "870324"];
  const PASSENGER_DIESEL = ["870331", "870332", "870333"];
  const HYBRID = ["870340", "870350", "870360", "870370", "870220", "870230"];
  const ELECTRIC = ["870380", "870240", "870460", "871160"];
  const GOODS_DIESEL = ["870421", "870422", "870423", "870441"];
  const GOODS_PETROL = ["870431", "870432", "870451"];
  const HEAVY_GOODS = ["870422", "870423", "870432", "870433"];
  const SPECIAL = ["8701", "8705", "8709", "8716", "8427", "8429", "8414", "8479"];

  function digits(hs) {
    return String(hs || "").replace(/\D/g, "");
  }

  function fuelFromHs(hs) {
    const six = digits(hs).slice(0, 6);
    if (PASSENGER_PETROL.includes(six) || GOODS_PETROL.includes(six)) return "petrol";
    if (PASSENGER_DIESEL.includes(six) || GOODS_DIESEL.includes(six) || six === "870210" || six === "870290") {
      return "diesel";
    }
    if (HYBRID.includes(six)) return "hybrid";
    if (ELECTRIC.includes(six)) return "electric";
    if (six.startsWith("8711")) return six === "871160" ? "electric" : "petrol";
    return "unknown";
  }

  function vehicleClass(hs) {
    const head = digits(hs).slice(0, 4);
    const six = digits(hs).slice(0, 6);
    if (head === "8711") return "motorcycle";
    if (SPECIAL.includes(head)) return "special";
    if (head === "8704") return HEAVY_GOODS.includes(six) ? "goods-heavy" : "goods-light";
    return "passenger";
  }

  function ageYears(manufactureYear, importYear) {
    if (manufactureYear == null || importYear == null) return null;
    if (!Number.isFinite(manufactureYear) || !Number.isFinite(importYear)) return null;
    return importYear - manufactureYear;
  }

  function environmental(age, vehicleClassName) {
    if (vehicleClassName === "special") {
      return {
        rate: 0,
        blocked: false,
        detail:
          "Tractors, trailers and special-purpose headings are not given the passenger-car levy here. Confirm the heading with URA.",
      };
    }
    if (age == null) {
      return {
        rate: 0,
        blocked: false,
        detail: "Enter the manufacture year to apply the environmental levy and the 15-year rule.",
      };
    }
    if (vehicleClassName === "goods-heavy") {
      return {
        rate: age >= 9 ? 0.2 : 0,
        blocked: false,
        detail:
          age >= 9
            ? "Goods vehicle of 4 tonnes or more: 20% of CIF from 9 years old. This class may still be imported after 15 years."
            : "Under 9 years: no environmental levy.",
      };
    }
    if (vehicleClassName === "goods-light" || vehicleClassName === "motorcycle") {
      if (age >= 15) {
        return {
          rate: 0,
          blocked: true,
          detail: "URA’s public table does not allow this class at 15 years or older.",
        };
      }
      if (age >= 9) {
        return { rate: 0.2, blocked: false, detail: "From 9 years and under 15: 20% of CIF." };
      }
      return { rate: 0, blocked: false, detail: "Under 9 years: no environmental levy." };
    }
    if (age >= 15) {
      return {
        rate: 0,
        blocked: true,
        detail: "Passenger vehicles 15 years or older from the year of manufacture are not allowed for import.",
      };
    }
    if (age >= 9) {
      return {
        rate: 0.5,
        blocked: false,
        detail: "Passenger vehicle, 9 years or older: 50% of CIF.",
      };
    }
    return { rate: 0, blocked: false, detail: "Under 9 years: no environmental levy." };
  }

  function exciseRate(fuel, engineCc, vehicleClassName) {
    if (vehicleClassName !== "passenger") return 0;
    if (fuel === "hybrid" || fuel === "electric") return 0;
    if (engineCc != null && engineCc > 2000 && (fuel === "petrol" || fuel === "diesel" || fuel === "unknown")) {
      return 0.1;
    }
    return 0;
  }

  function money(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function calculate(input) {
    const cif = Math.max(0, Number(input.cifUsd) || 0);
    const dutyRate = Math.max(0, Number(input.dutyRate) || 0);
    const excise = Math.max(0, Number(input.exciseRate) || 0);
    const levy = Math.max(0, Number(input.environmentalRate) || 0);
    const importDuty = money(cif * dutyRate);
    const exciseDuty = money(excise * (cif + importDuty));
    const vat = money(0.18 * (cif + importDuty + exciseDuty));
    const withholding = money(0.06 * cif);
    const environmentalLevy = money(levy * cif);
    const infrastructure = money(0.015 * cif);
    const declaration = money(0.01 * cif);
    const lines = [
      ["importDuty", "Import duty", importDuty],
      ["excise", "Excise duty", exciseDuty],
      ["vat", "VAT", vat],
      ["withholding", "Withholding tax", withholding],
      ["environmental", "Environmental levy", environmentalLevy],
      ["infrastructure", "Infrastructure levy", infrastructure],
      ["declaration", "Import declaration fee", declaration],
    ];
    const total = money(lines.reduce((sum, line) => sum + line[2], 0));
    return {
      cif: money(cif),
      importDuty,
      exciseDuty,
      vat,
      withholding,
      environmentalLevy,
      infrastructure,
      declaration,
      total,
      lines,
    };
  }

  return {
    fuelFromHs,
    vehicleClass,
    ageYears,
    environmental,
    exciseRate,
    calculate,
    money,
  };
});
