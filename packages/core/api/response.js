export function ok(data = null, message = "OK") {
  return { ok: true, message, data, error: null, timestamp: new Date().toISOString() };
}

export function fail(message = "Error", error = null) {
  return { ok: false, message, data: null, error, timestamp: new Date().toISOString() };
}
