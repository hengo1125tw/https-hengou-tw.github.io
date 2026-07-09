import { toText } from "../../core/utils/string.js";

export function buildTimelineContext(timelineItems = []) {
  const items = Array.isArray(timelineItems) ? timelineItems : [];

  const normalized = items.map(item => ({
    id: toText(item.id || item.timeline_id),
    type: toText(item.type || item.event_type),
    title: toText(item.title),
    description: toText(item.description || item.notes),
    outcome: toText(item.outcome),
    nextAction: toText(item.nextAction || item.next_action),
    eventTime: toText(item.eventTime || item.event_time || item.created_at)
  }));

  const latest = normalized.length
    ? normalized[normalized.length - 1].description || normalized[normalized.length - 1].title
    : "";

  return {
    latest,
    items: normalized
  };
}
