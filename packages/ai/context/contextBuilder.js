import { createEmptyContext } from "./contextSchema.js";
import {
  normalizeCompany,
  normalizeContact,
  normalizeLead,
  normalizeProduct,
  normalizeOpportunity
} from "./contextNormalizer.js";
import { buildTimelineContext } from "./timelineContext.js";
import { buildKnowledgeContext } from "./knowledgeContext.js";
import { buildPlaybookContext } from "./playbookContext.js";
import { buildBusinessUnitContext } from "./businessUnitContext.js";
import { buildProductCatalogContext } from "./productCatalogContext.js";
import { buildLeadIntakeContext } from "./leadIntakeContext.js";

export class ContextBuilder {
  constructor(options = {}) {
    this.defaults = options.defaults || {};
  }

  build(input = {}) {
    const base = createEmptyContext();

    const normalized = {
      company: normalizeCompany(input.company || this.defaults.company),
      contact: normalizeContact(input.contact || this.defaults.contact),
      lead: normalizeLead(input.lead || this.defaults.lead),
      product: normalizeProduct(input.product || this.defaults.product),
      opportunity: normalizeOpportunity(input.opportunity || this.defaults.opportunity)
    };

    const leadIntake = buildLeadIntakeContext({
      ...input,
      ...normalized
    });

    const businessUnit = buildBusinessUnitContext({
      ...input,
      ...normalized,
      businessUnitCode: leadIntake.result.businessUnit?.code
    });

    const productCatalog = buildProductCatalogContext({
      ...input,
      ...normalized,
      businessUnit,
      productSku: leadIntake.result.product?.sku
    });

    return {
      ...base,
      ...normalized,
      leadIntake,
      businessUnit,
      productCatalog,
      timeline: buildTimelineContext(input.timeline || input.timelineItems || this.defaults.timeline),
      knowledge: buildKnowledgeContext(input.knowledge || this.defaults.knowledge, input.knowledgeOptions || {}),
      playbook: buildPlaybookContext(input.playbook || this.defaults.playbook),
      meta: {
        ...base.meta,
        ...(this.defaults.meta || {}),
        ...(input.meta || {}),
        createdAt: new Date().toISOString()
      }
    };
  }

  buildForLead(input = {}) {
    return this.build({
      ...input,
      meta: {
        source: "lead",
        ...(input.meta || {})
      }
    });
  }

  buildForOpportunity(input = {}) {
    return this.build({
      ...input,
      meta: {
        source: "opportunity",
        ...(input.meta || {})
      }
    });
  }
}

export const contextBuilder = new ContextBuilder();
