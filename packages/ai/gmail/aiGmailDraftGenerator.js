import { AIExecutionEngine } from "../usage/aiExecutionEngine.js";
import { ContextBuilder } from "../context/contextBuilder.js";
import { DEFAULT_PROMPTS } from "../prompt/defaultPrompts.js";
import { emailDraftGenerator } from "../../business/index.js";

export class AIGmailDraftGenerator {
  constructor(options = {}) {
    this.executionEngine = options.executionEngine || new AIExecutionEngine();
    this.contextBuilder = options.contextBuilder || new ContextBuilder();
  }

  getPrompt() {
    return DEFAULT_PROMPTS.find(prompt => prompt.promptId === "PRM-000004");
  }

  async generateFromLead(input = {}, options = {}) {
    const deterministic = emailDraftGenerator.generateFromLead(input, options);
    const context = this.contextBuilder.buildForLead({
      company: { company_name: deterministic.leadIntake.lead.companyName },
      contact: {
        display_name: deterministic.leadIntake.lead.contactName,
        email: deterministic.leadIntake.lead.email,
        phone: deterministic.leadIntake.lead.phone
      },
      lead: deterministic.leadIntake.lead,
      rawText: deterministic.text,
      meta: {
        draftId: deterministic.draft.draftId
      }
    });

    const basePrompt = this.getPrompt();
    const prompt = {
      ...basePrompt,
      userTemplate: basePrompt.userTemplate.replace("{{email.draft}}", deterministic.text)
    };

    const aiResult = await this.executionEngine.runPrompt(prompt, context, {
      ...options,
      usageType: "draft",
      metadata: {
        draftId: deterministic.draft.draftId,
        ...(options.metadata || {})
      }
    });

    return {
      ...deterministic,
      aiResult,
      aiText: aiResult.result?.output || ""
    };
  }

  async generateFromProposal(proposal = {}, options = {}) {
    const deterministic = emailDraftGenerator.generateFromProposal(proposal, options);
    const context = this.contextBuilder.buildForLead({
      company: { company_name: proposal.customer?.companyName },
      contact: {
        display_name: proposal.customer?.contactName,
        email: proposal.customer?.email,
        phone: proposal.customer?.phone
      },
      lead: {
        message: proposal.sections?.find(section => section.type === "customer_needs")?.content || "",
        source: "proposal"
      },
      rawText: deterministic.text,
      meta: {
        draftId: deterministic.draft.draftId,
        proposalId: proposal.proposalId
      }
    });

    const basePrompt = this.getPrompt();
    const prompt = {
      ...basePrompt,
      userTemplate: basePrompt.userTemplate.replace("{{email.draft}}", deterministic.text)
    };

    const aiResult = await this.executionEngine.runPrompt(prompt, context, {
      ...options,
      usageType: "draft",
      metadata: {
        draftId: deterministic.draft.draftId,
        proposalId: proposal.proposalId,
        ...(options.metadata || {})
      }
    });

    return {
      ...deterministic,
      aiResult,
      aiText: aiResult.result?.output || ""
    };
  }
}

export const aiGmailDraftGenerator = new AIGmailDraftGenerator();
