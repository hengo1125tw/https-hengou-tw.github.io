export function renderProposalMarkdown(proposal = {}) {
  const lines = [];

  lines.push(`# ${proposal.title}`);
  lines.push("");
  lines.push(`提案編號：${proposal.proposalId}`);
  lines.push(`狀態：${proposal.status}`);
  lines.push(`客戶：${proposal.customer?.companyName || ""}`);
  lines.push(`聯絡人：${proposal.customer?.contactName || ""}`);
  lines.push(`業務線：${proposal.businessUnit?.displayName || ""}`);
  lines.push(`產品 / 服務：${proposal.product?.displayName || ""}`);
  lines.push(`優先級：${proposal.priority || ""}`);
  lines.push(`信心分數：${proposal.confidence ?? ""}`);
  lines.push("");

  (proposal.sections || []).forEach(section => {
    lines.push(`## ${section.title}`);
    lines.push("");
    if (section.content) lines.push(section.content);
    if (section.items?.length) {
      lines.push("");
      section.items.forEach(item => lines.push(`- ${item}`));
    }
    lines.push("");
  });

  if (proposal.riskNotes?.length) {
    lines.push("## 風險與注意事項");
    lines.push("");
    proposal.riskNotes.forEach(item => lines.push(`- ${item}`));
    lines.push("");
  }

  return lines.join("\n");
}

export function renderProposalPlainText(proposal = {}) {
  return renderProposalMarkdown(proposal).replace(/^#+\s/gm, "");
}
