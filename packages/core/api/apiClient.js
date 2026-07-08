import { ApiError } from "../errors/ApiError.js";
import { buildQuery, withTimeout } from "./request.js";

export function createApiClient({ baseUrl = "", headers = {}, timeoutMs = 15000 } = {}) {
  async function request(method, path, { query = {}, body = null, customHeaders = {} } = {}) {
    const url = `${baseUrl}${path}${buildQuery(query)}`;
    const options = { method, headers: { "Content-Type": "application/json", ...headers, ...customHeaders } };
    if (body !== null) options.body = JSON.stringify(body);

    try {
      const response = await withTimeout(fetch(url, options), timeoutMs);
      const text = await response.text();
      let payload = null;
      try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
      if (!response.ok) throw new ApiError("API response is not OK", { status: response.status, url, method, details: payload });
      return payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || "API request failed", { url, method, details: error });
    }
  }
  return {
    get(path, options = {}) { return request("GET", path, options); },
    post(path, body = {}, options = {}) { return request("POST", path, { ...options, body }); },
    patch(path, body = {}, options = {}) { return request("PATCH", path, { ...options, body }); },
    delete(path, options = {}) { return request("DELETE", path, options); }
  };
}
