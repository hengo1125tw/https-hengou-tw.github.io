export function renderEmailDraftText(draft = {}) {
  return [
    `To: ${draft.to || ""}`,
    `Subject: ${draft.subject || ""}`,
    "",
    draft.body || ""
  ].join("\n");
}

export function renderEmailDraftMarkdown(draft = {}) {
  return [
    `# ${draft.subject || "Email Draft"}`,
    "",
    `- Draft ID: ${draft.draftId || ""}`,
    `- To: ${draft.to || ""}`,
    `- Type: ${draft.type || ""}`,
    `- Status: ${draft.status || ""}`,
    "",
    "## Body",
    "",
    draft.body || ""
  ].join("\n");
}
