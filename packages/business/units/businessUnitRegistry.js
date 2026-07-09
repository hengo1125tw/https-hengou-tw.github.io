import { BUSINESS_UNITS } from "./businessUnits.js";
import { validateBusinessUnit, toBusinessUnitSummary } from "./businessUnitSchema.js";

export class BusinessUnitRegistry {
  constructor(units = BUSINESS_UNITS) {
    this.units = new Map();
    units.forEach(unit => this.register(unit));
  }

  register(unit) {
    validateBusinessUnit(unit);
    this.units.set(unit.code, Object.freeze({ ...unit }));
    return this.getByCode(unit.code);
  }

  list(options = {}) {
    const units = Array.from(this.units.values());

    return units.filter(unit => {
      if (options.status && unit.status !== options.status) return false;
      if (options.category && unit.category !== options.category) return false;
      return true;
    });
  }

  listSummaries(options = {}) {
    return this.list(options).map(toBusinessUnitSummary);
  }

  getByCode(code) {
    return this.units.get(String(code || "").toUpperCase()) || null;
  }

  getById(id) {
    return this.list().find(unit => unit.businessUnitId === id) || null;
  }

  search(keyword = "") {
    const q = String(keyword || "").toLowerCase().trim();
    if (!q) return this.list();

    return this.list().filter(unit => {
      const haystack = [
        unit.code,
        unit.name,
        unit.displayName,
        unit.description,
        ...(unit.targetCustomers || []),
        ...(unit.mainProducts || []),
        ...(unit.salesKeywords || [])
      ].join(" ").toLowerCase();

      return haystack.includes(q);
    });
  }
}

export const businessUnitRegistry = new BusinessUnitRegistry();
