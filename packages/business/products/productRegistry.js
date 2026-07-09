import { PRODUCTS } from "./products.js";
import { PRODUCT_STATUS } from "./productConstants.js";
import { validateProduct, toProductSummary } from "./productSchema.js";

export class ProductRegistry {
  constructor(products = PRODUCTS) {
    this.products = new Map();
    products.forEach(product => this.register(product));
  }

  register(product) {
    validateProduct(product);
    this.products.set(product.sku, Object.freeze({ ...product }));
    return this.getBySku(product.sku);
  }

  list(options = {}) {
    return Array.from(this.products.values()).filter(product => {
      if (options.status && product.status !== options.status) return false;
      if (options.businessUnitCode && product.businessUnitCode !== options.businessUnitCode) return false;
      if (options.type && product.type !== options.type) return false;
      if (options.pricingModel && product.pricingModel !== options.pricingModel) return false;
      return true;
    });
  }

  listActive(options = {}) {
    return this.list({ ...options, status: PRODUCT_STATUS.ACTIVE });
  }

  listSummaries(options = {}) {
    return this.list(options).map(toProductSummary);
  }

  getBySku(sku = "") {
    return this.products.get(String(sku || "").toUpperCase()) || null;
  }

  getById(productId = "") {
    return this.list().find(product => product.productId === productId) || null;
  }

  search(keyword = "", options = {}) {
    const q = String(keyword || "").toLowerCase().trim();
    const products = this.list(options);

    if (!q) return products;

    return products.filter(product => {
      const haystack = [
        product.sku,
        product.name,
        product.displayName,
        product.description,
        product.businessUnitCode,
        ...(product.targetCustomers || []),
        ...(product.keywords || []),
        ...(product.deliverables || [])
      ].join(" ").toLowerCase();

      return haystack.includes(q);
    });
  }
}

export const productRegistry = new ProductRegistry();
