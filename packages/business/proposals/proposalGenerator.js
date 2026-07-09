import { leadIntakeEngine } from "../leads/leadIntakeEngine.js";
import { buildProposalFromLeadIntake } from "./proposalBuilder.js";
import { renderProposalMarkdown, renderProposalPlainText } from "./proposalRenderer.js";

export class ProposalGenerator {
  generateFromLead(input = {}, options = {}) {
    const leadIntake = options.leadIntakeResult || leadIntakeEngine.analyze(input);
    const proposal = buildProposalFromLeadIntake(leadIntake, options);

    return {
      proposal,
      markdown: renderProposalMarkdown(proposal),
      plainText: renderProposalPlainText(proposal),
      leadIntake
    };
  }
}

export const proposalGenerator = new ProposalGenerator();
