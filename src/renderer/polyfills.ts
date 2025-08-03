// Simple check and assign if needed
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

export {}; 