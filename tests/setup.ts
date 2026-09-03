/*
 * Node 22+ ships an experimental `localStorage` accessor on the global that
 * returns undefined unless --localstorage-file is passed, and vitest's jsdom
 * environment will not replace an accessor that is already there. A small
 * in-memory Storage is enough for code that says bare `localStorage`.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value));
  }
}

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: new MemoryStorage(),
});
