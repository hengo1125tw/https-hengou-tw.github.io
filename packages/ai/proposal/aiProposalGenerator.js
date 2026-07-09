import { AIExecutionEngine } from "../usage/aiExecutionEngine.js";
import { ContextBuilder } from "../context/contextBuilder.js";
import { DEFAULT_PROMPTS } from "../prompt/defaultPrompts.js";
import { proposalGenerator } from "../../business/index.js";

export class AIProposalGenerator {
  constructor(options = {}) {
    this.executionEngine = options.executionEngine || new AIExecutionEngine();
    this.contextBuilder = options.contextBuilder || new ContextBuilder();
  }

  getPrompt() {
    return DEFAULT_PROMPTS.find(prompt => prompt.promptId === "PRM-000003");
  }

  async generateFromLead(input = {}, options = {}) {
    const deterministic = proposalGenerator.generateFromLead(input, options);
    const context = this.contextBuilder.buildForLead({
      company: { company_name: deterministic.leadIntake.lead.companyName },
      contact: {
        display_name: deterministic.leadIntake.lead.contactName,
        email: deterministic.leadIntake.lead.email,
        phone: deterministic.leadIntake.lead.phone
      },
      lead: deterministic.leadIntake.lead,
      rawText: deterministic.markdown,
      meta: {
        proposalId: deterministic.proposal.proposalId
      }
    });

    const prompt = {
      ...this.getPrompt(),
      userTemplate: this.getPrompt().userTemplate.replace("{{proposal.draft}}", deterministic.markdown)
    };

    const aiResult = await this.executionEngine.runPrompt(prompt, context, {
      ...options,
      usageType: "proposal",
      metadata: {
        proposalId: deterministic.proposal.proposalId,
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

export const aiProposalGenerator = new AIProposalGenerator();
