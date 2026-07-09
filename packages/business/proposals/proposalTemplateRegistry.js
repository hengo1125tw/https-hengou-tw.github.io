import { PROPOSAL_TEMPLATES } from "./proposalTemplates.js";

export class ProposalTemplateRegistry {
  constructor(templates = PROPOSAL_TEMPLATES) {
    this.templates = new Map();
    templates.forEach(template => this.register(template));
  }

  register(template = {}) {
    if (!template.templateId || !template.businessUnitCode) {
      throw new Error("Proposal template requires templateId and businessUnitCode");
    }

    this.templates.set(template.businessUnitCode, Object.freeze({ ...template }));
    return this.getByBusinessUnit(template.businessUnitCode);
  }

  getByBusinessUnit(businessUnitCode = "OTHER") {
    return this.templates.get(String(businessUnitCode || "OTHER").toUpperCase()) || this.templates.get("OTHER") || null;
  }

  list() {
    return Array.from(this.templates.values());
  }
}

export const proposalTemplateRegistry = new ProposalTemplateRegistry();
