export class MemoryCache {
  constructor() { this.store = new Map(); }

  set(key, value, ttlMs = 300000) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  has(key) { return this.get(key) !== null; }
  delete(key) { return this.store.delete(key); }
  clear() { this.store.clear(); }
}

export const memoryCache = new MemoryCache();
