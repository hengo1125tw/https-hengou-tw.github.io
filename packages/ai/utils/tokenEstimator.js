export function estimateTokens(text = "") {
  const value = String(text || "");
  if (!value) return 0;

  // Practical rough estimate:
  // English: about 4 chars / token.
  // Chinese: usually closer to 1.5 to 2 chars / token.
  const hasCjk = /[\u4e00-\u9fff]/.test(value);
  const divisor = hasCjk ? 2 : 4;

  return Math.ceil(value.length / divisor);
}

export function estimateMessagesTokens(messages = []) {
  return messages.reduce((total, message) => {
    return total + estimateTokens(message.role || "") + estimateTokens(message.content || "");
  }, 0);
}
