# Root Config Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move shared ESLint, Prettier, and TypeScript base configuration from `packages/configs` into the repository root while keeping package-level usage working.

**Architecture:** Root-level config files become the single source of truth for ESLint, Prettier, and TypeScript. Package-level config files remain only where the tool needs package-local context or overrides, with all tool runtime dependencies owned by the root package.

**Tech Stack:** pnpm workspace, ESLint flat config, Prettier, TypeScript

---

## File structure

### Files to create

- `eslint.config.mjs` — root ESLint flat config moved from `packages/configs/eslint.config.mjs`
- `prettier.config.cjs` — root Prettier base config moved from `packages/configs/prettier.config.cjs`
- `tsconfig.base.json` — root TypeScript base config moved from `packages/configs/tsconfig.base.json`
- `docs/superpowers/plans/2026-04-18-root-config-consolidation.md` — this implementation plan

### Files to modify

- `package.json` — move lint, format, and TypeScript tool dependencies to root devDependencies
- `packages/big-react/package.json` — remove `@xuhan/configs` dependency
- `packages/big-react/eslint.config.mjs` — import the root ESLint config by relative path
- `packages/big-react/prettier.config.cjs` — import the root Prettier config by relative path and keep local override
- `packages/big-react/tsconfig.json` — extend the root base TypeScript config by relative path
- `.gitignore` — stop ignoring `pnpm-lock.yaml` so the dependency graph change can be committed if needed

### Files to remove

- `packages/configs/package.json`
- `packages/configs/eslint.config.mjs`
- `packages/configs/prettier.config.cjs`
- `packages/configs/tsconfig.base.json`
- `packages/configs/README.md`

---

### Task 1: Move shared config files to the root

**Files:**

- Create: `eslint.config.mjs`
- Create: `prettier.config.cjs`
- Create: `tsconfig.base.json`
- Modify: `packages/big-react/eslint.config.mjs`
- Modify: `packages/big-react/prettier.config.cjs`
- Modify: `packages/big-react/tsconfig.json`

- [ ] **Step 1: Write the failing TypeScript config change**

Update `packages/big-react/tsconfig.json` to point at the future root base file.

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler"
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 2: Run typecheck to verify it fails before the root base file exists**

Run: `pnpm --filter @xuhan/big-react typecheck`
Expected: FAIL with an error indicating `../../tsconfig.base.json` cannot be found.

- [ ] **Step 3: Create the root TypeScript base config**

Create `tsconfig.base.json` with the current shared compiler options.

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 4: Rewrite the package ESLint wrapper to use the root config**

Replace `packages/big-react/eslint.config.mjs` with:

```js
import base from '../../eslint.config.mjs';

export default [...base];
```

- [ ] **Step 5: Create the root ESLint config**

Create `eslint.config.mjs` with the current shared rules.

```js
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'build/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,mts,cts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
];
```

- [ ] **Step 6: Rewrite the package Prettier override to use the root config**

Replace `packages/big-react/prettier.config.cjs` with:

```js
const base = require('../../prettier.config.cjs');

module.exports = {
  ...base,
  singleQuote: false,
};
```

- [ ] **Step 7: Create the root Prettier config**

Create `prettier.config.cjs` with the current shared defaults.

```js
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
};
```

- [ ] **Step 8: Run package-local checks to verify the new root config files resolve**

Run: `pnpm --filter @xuhan/big-react lint && pnpm --filter @xuhan/big-react format && pnpm --filter @xuhan/big-react typecheck`
Expected: the config files are discovered and loaded; any failure should now be about missing root dependencies rather than missing `@xuhan/configs` exports.

- [ ] **Step 9: Commit**

```bash
git add eslint.config.mjs prettier.config.cjs tsconfig.base.json packages/big-react/eslint.config.mjs packages/big-react/prettier.config.cjs packages/big-react/tsconfig.json
git commit -m "refactor: move shared configs to root"
```

### Task 2: Move tool dependencies to the root package

**Files:**

- Modify: `package.json`
- Modify: `packages/big-react/package.json`
- Modify: `.gitignore`
- Test: `pnpm-lock.yaml`

- [ ] **Step 1: Write the failing dependency state**

Remove the package dependency on `@xuhan/configs` from `packages/big-react/package.json` before the root owns the tooling dependencies.

```json
{
  "name": "@xuhan/big-react",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --check .",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  }
}
```

- [ ] **Step 2: Run package lint to verify the missing root-owned dependency state fails first**

Run: `pnpm --filter @xuhan/big-react lint`
Expected: FAIL because the root package does not yet declare all tool dependencies needed by the root config.

- [ ] **Step 3: Add tool dependencies to the root package**

Update the root `package.json` devDependencies to include the current shared tooling packages.

```json
{
  "name": "xuhan-projects",
  "private": true,
  "packageManager": "pnpm@8.15.9",
  "scripts": {
    "lint": "pnpm -r --if-present lint",
    "format": "pnpm -r --if-present format",
    "typecheck": "pnpm -r --if-present typecheck",
    "prepare": "husky",
    "commitlint": "commitlint --edit"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.8.1",
    "@commitlint/config-conventional": "^19.8.1",
    "@eslint/js": "^9.25.0",
    "eslint": "^9.25.0",
    "eslint-config-prettier": "^10.1.2",
    "eslint-plugin-prettier": "^5.2.6",
    "globals": "^16.5.0",
    "husky": "^9.1.7",
    "lint-staged": "^15.5.0",
    "prettier": "^3.5.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.30.1"
  }
}
```

- [ ] **Step 4: Stop ignoring the lockfile so the install result can be captured**

Update `.gitignore` by removing this line:

```gitignore
pnpm-lock.yaml
```

The remaining file should still include:

```gitignore
node_modules
.pnpm-store
.DS_Store
dist
build
coverage
*.tsbuildinfo
.vscode
```

- [ ] **Step 5: Install dependencies and update the lockfile**

Run: `pnpm install`
Expected: PASS and update `pnpm-lock.yaml` to reflect root-owned tooling dependencies.

- [ ] **Step 6: Re-run the package checks to verify the dependency move works**

Run: `pnpm --filter @xuhan/big-react lint && pnpm --filter @xuhan/big-react format && pnpm --filter @xuhan/big-react typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json packages/big-react/package.json .gitignore pnpm-lock.yaml
git commit -m "build: move tooling dependencies to workspace root"
```

### Task 3: Remove the obsolete shared config package and verify the workspace

**Files:**

- Remove: `packages/configs/package.json`
- Remove: `packages/configs/eslint.config.mjs`
- Remove: `packages/configs/prettier.config.cjs`
- Remove: `packages/configs/tsconfig.base.json`
- Remove: `packages/configs/README.md`
- Test: `package.json`
- Test: `packages/big-react/package.json`

- [ ] **Step 1: Delete the obsolete shared config package files**

Remove:

```text
packages/configs/package.json
packages/configs/eslint.config.mjs
packages/configs/prettier.config.cjs
packages/configs/tsconfig.base.json
packages/configs/README.md
```

- [ ] **Step 2: Run install to verify the workspace no longer expects the removed package**

Run: `pnpm install`
Expected: PASS with no workspace dependency errors for `@xuhan/configs`.

- [ ] **Step 3: Run full workspace verification**

Run: `pnpm lint && pnpm format && pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Run a focused sanity check against the package that used the old config package**

Run: `pnpm --filter @xuhan/big-react lint && pnpm --filter @xuhan/big-react format && pnpm --filter @xuhan/big-react typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -u packages/configs package.json packages/big-react/package.json pnpm-lock.yaml
git commit -m "refactor: remove shared config package"
```

## Self-review

### Spec coverage

- Root-owned ESLint, Prettier, and TypeScript base files are covered in Task 1.
- Root-owned dependency management is covered in Task 2.
- Removal of `packages/configs` and workspace verification is covered in Task 3.
- Preservation of package-level overrides and package-level TypeScript config is covered in Task 1 and verified again in Task 3.

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation wording remains.
- All code-modifying steps include concrete file content.
- All validation steps include exact commands and expected outcomes.

### Type consistency

- Root file names are consistently `eslint.config.mjs`, `prettier.config.cjs`, and `tsconfig.base.json`.
- Package paths consistently use `../../` relative imports and extends paths.
- The package kept as the validation target is consistently `@xuhan/big-react`.
