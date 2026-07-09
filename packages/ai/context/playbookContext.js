import { toText } from "../../core/utils/string.js";

export function buildPlaybookContext(playbook = {}) {
  const steps = Array.isArray(playbook.steps) ? playbook.steps : [];

  return {
    id: toText(playbook.id || playbook.playbook_id),
    name: toText(playbook.name || playbook.title),
    currentStep: toText(playbook.currentStep || playbook.current_step),
    nextStep: toText(playbook.nextStep || playbook.next_step),
    steps: steps.map((step, index) => ({
      order: step.order ?? index + 1,
      name: toText(step.name),
      description: toText(step.description),
      exitCriteria: toText(step.exitCriteria || step.exit_criteria)
    }))
  };
}
