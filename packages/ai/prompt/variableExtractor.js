export function extractVariables(template = "") {
  const source = String(template || "");
  const pattern = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g;
  const variables = new Set();
  let match;

  while ((match = pattern.exec(source)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

export function extractPromptVariables(prompt = {}) {
  return {
    system: extractVariables(prompt.systemPrompt || ""),
    user: extractVariables(prompt.userTemplate || ""),
    all: Array.from(new Set([
      ...extractVariables(prompt.systemPrompt || ""),
      ...extractVariables(prompt.userTemplate || "")
    ]))
  };
}
