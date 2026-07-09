import { leadIntakeEngine } from "../leads/leadIntakeEngine.js";
import { proposalGenerator } from "../proposals/proposalGenerator.js";
import { buildEmailDraftFromLeadIntake, buildEmailDraftFromProposal } from "./emailDraftBuilder.js";
import { renderEmailDraftMarkdown, renderEmailDraftText } from "./emailDraftRenderer.js";
import { EMAIL_DRAFT_TYPE } from "./emailConstants.js";

export class EmailDraftGenerator {
  generateFromLead(input = {}, options = {}) {
    const leadIntake = options.leadIntakeResult || leadIntakeEngine.analyze(input);
    const draft = buildEmailDraftFromLeadIntake(leadIntake, {
      type: options.type || EMAIL_DRAFT_TYPE.MISSING_INFO,
      tone: options.tone
    });

    return {
      draft,
      text: renderEmailDraftText(draft),
      markdown: renderEmailDraftMarkdown(draft),
      leadIntake
    };
  }

  generateFromProposal(proposal = {}, options = {}) {
    const draft = buildEmailDraftFromProposal(proposal, options);

    return {
      draft,
      text: renderEmailDraftText(draft),
      markdown: renderEmailDraftMarkdown(draft),
      proposal
    };
  }

  generateProposalEmailFromLead(input = {}, options = {}) {
    const proposalResult = options.proposalResult || proposalGenerator.generateFromLead(input);
    const draftResult = this.generateFromProposal(proposalResult.proposal, {
      type: options.type || EMAIL_DRAFT_TYPE.PROPOSAL,
      tone: options.tone
    });

    return {
      ...draftResult,
      proposalResult
    };
  }
}

export const emailDraftGenerator = new EmailDraftGenerator();
