## Vite config breakdown
- `import { defineConfig } from 'vite'`: enables typed/intellisense-backed export.
- `import react from '@vitejs/plugin-react'`: wires the React JSX transform + Fast Refresh plugin.
- `import { fileURLToPath, URL } from 'node:url'`: ESM-safe helpers to turn module URLs into file paths instead of using `__dirname`.
- `defineConfig({...})`: exports the configuration object.
  - `plugins: [react()]`: adds the React plugin.
  - `resolve.alias['@'] = fileURLToPath(new URL('./src', import.meta.url))`: lets you import with `@/` pointing to the `src` directory without long relative paths.

## ESM recap
- Modules use `import`/`export` instead of CommonJS's `require`/`module.exports`.
- Every file runs in its own scope; top-level bindings/variables don’t leak globally.
- Static analysis makes tree-shaking/dynamic `import()` easier.
- In Node/Vite, `.mjs` or `"type": "module"` enable ESM, and you use `import.meta.url` + `fileURLToPath` instead of `__dirname`.
- You can still import CommonJS packages; the reverse requires `import()` or transpilation.
