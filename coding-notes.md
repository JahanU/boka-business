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

New JSX Transform
- In a React Vite project, setting "jsx": "react-jsx" in your tsconfig.json is the modern standard.
What does it do?
- It enables the New JSX Transform introduced in React 17.
- Before: You had to import React from 'react' at the top of every single .jsx or .tsx file because the compiler turned JSX into React.createElement().
- With react-jsx: The compiler automatically imports the necessary transformation functions from the React package. You no longer need to import React manually unless you are using Hooks (like useState) or other exports.
Why it's better for your CI
- Smaller Bundles: The new transform can slightly reduce the size of your compiled code.
- Cleaner Code: It removes the "boilerplate" import from the top of your files.
- Performance: It allows for some optimizations in how components are rendered that createElement didn't support as efficiently.

Postgres
The error infinite recursion detected happens because the staff table RLS policy was trying to check the staff table to verify your permissions—creating a loop.

To fix this, we use a Security Definer function. This function runs with "system" privileges, allowing it to look up your business ID without triggering the RLS loop.

Please run this SQL block in your Supabase SQL Editor to fix it: