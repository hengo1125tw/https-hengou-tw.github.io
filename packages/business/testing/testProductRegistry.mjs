import { productRegistry } from "../index.js";

const products = productRegistry.list();

if (products.length < 20) {
  throw new Error("Expected at least 20 products/services");
}

const cosmo = productRegistry.getBySku("COSMO-LS-R902");
if (!cosmo) {
  throw new Error("COSMO-LS-R902 not found");
}

const protofabProducts = productRegistry.listActive({ businessUnitCode: "PROTOFAB_3D" });
if (protofabProducts.length < 3) {
  throw new Error("Expected ProtoFab products");
}

console.log("Product Registry check passed.");
console.log(JSON.stringify(productRegistry.listSummaries(), null, 2));
