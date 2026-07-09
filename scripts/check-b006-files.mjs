import fs from "fs";

const requiredFiles = [
  "packages/business/products/productConstants.js",
  "packages/business/products/products.js",
  "packages/business/products/productSchema.js",
  "packages/business/products/productRegistry.js",
  "packages/business/products/productClassifier.js",
  "packages/business/products/pricingRules.js",
  "packages/business/testing/testProductRegistry.mjs",
  "packages/business/testing/testProductClassifier.mjs",
  "packages/ai/context/productCatalogContext.js",
  "packages/ai/testing/testProductCatalogContext.mjs",
  "docs/engineering/PRODUCT_SERVICE_CATALOG.md",
  "tests/smoke/SMOKE_TEST_B006.md"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));

if (missing.length) {
  console.error("Missing B006 required files:");
  missing.forEach(file => console.error(`- ${file}`));
  process.exit(1);
}

console.log("B006 required files check passed.");
