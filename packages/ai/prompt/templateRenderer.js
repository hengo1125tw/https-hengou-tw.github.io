function getValueByPath(context = {}, path = "") {
  return String(path)
    .split(".")
    .reduce((value, key) => {
      if (value === undefined || value === null) return undefined;
      return value[key];
    }, context);
}

export function renderTemplate(template = "", context = {}, options = {}) {
  const missing = [];
  const strict = options.strict ?? false;

  const output = String(template || "").replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_, key) => {
    const value = getValueByPath(context, key);

    if (value === undefined || value === null || value === "") {
      missing.push(key);
      return strict ? `{{${key}}}` : "";
    }

    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === "object") return JSON.stringify(item);
        return String(item);
      }).join("\n");
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  });

  return {
    output,
    missing: Array.from(new Set(missing))
  };
}
