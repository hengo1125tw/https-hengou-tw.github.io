import { businessUnitRegistry } from "../index.js";

const units = businessUnitRegistry.list();

if (units.length < 10) {
  throw new Error("Expected at least 10 business units");
}

const protofab = businessUnitRegistry.getByCode("PROTOFAB_3D");
if (!protofab) {
  throw new Error("PROTOFAB_3D not found");
}

const packaging = businessUnitRegistry.getByCode("PACKAGING_MATERIALS");
if (!packaging) {
  throw new Error("PACKAGING_MATERIALS not found");
}

console.log("Business Unit Registry check passed.");
console.log(JSON.stringify(businessUnitRegistry.listSummaries(), null, 2));
