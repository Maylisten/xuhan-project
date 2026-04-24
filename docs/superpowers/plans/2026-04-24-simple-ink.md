# Simple Ink CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `apps/simple-ink` from a Vite template into a pure Ink CLI app that runs in the terminal with `tsx` in development and `tsc` + `node` in build/start flows.

**Architecture:** Keep a single Ink entrypoint at `apps/simple-ink/src/main.tsx`, remove browser-oriented Vite tooling, and make the package run as a Node CLI project. Use TypeScript for compilation, `tsx` for local execution, and keep the current example component minimal.

**Tech Stack:** Ink, React, TypeScript, tsx, ESLint, pnpm

---

## File Structure

- Modify: `apps/simple-ink/package.json` — replace Vite-oriented scripts/dependencies with CLI-oriented ones.
- Modify: `apps/simple-ink/tsconfig.json` — collapse Vite template references into a single Node-focused TypeScript config.
- Delete: `apps/simple-ink/tsconfig.app.json` — no longer needed after moving away from Vite split configs.
- Delete: `apps/simple-ink/tsconfig.node.json` — no longer needed after moving away from Vite split configs.
- Delete: `apps/simple-ink/vite.config.ts` — no longer needed for an Ink CLI app.
- Modify: `apps/simple-ink/README.md` — replace Vite template docs with Ink CLI usage instructions.
- Modify: `apps/simple-ink/src/main.tsx` — keep the Ink example compatible with the new build/run flow if needed.

### Task 1: Convert package scripts and dependencies

**Files:**

- Modify: `apps/simple-ink/package.json`
- Test: `apps/simple-ink/package.json` via `pnpm --filter simple-ink dev --help` equivalent script presence check

- [ ] **Step 1: Write the failing expectation by comparing current scripts against the target CLI scripts**

```json
{
  "scripts": {
    "dev": "tsx src/main.tsx",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "lint": "eslint ."
  }
}
```

Expected mismatch in current file:

- `dev` is `vite`
- `build` is `tsc -b && vite build`
- `start` is missing
- `preview` exists but should be removed

- [ ] **Step 2: Verify the mismatch exists before editing**

Run: `node -e "const p=require('./apps/simple-ink/package.json'); console.log(JSON.stringify(p.scripts,null,2))"`
Expected: output contains `vite` and does not contain a `start` script

- [ ] **Step 3: Write the minimal package.json update**

```json
{
  "name": "simple-ink",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx src/main.tsx",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "lint": "eslint ."
  },
  "dependencies": {
    "ink": "^7.0.1",
    "react": "^19.2.5"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "globals": "^17.5.0",
    "tsx": "^4.20.3",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.2"
  }
}
```

- [ ] **Step 4: Run a script check to verify the change**

Run: `node -e "const p=require('./apps/simple-ink/package.json'); console.log(p.scripts.dev, p.scripts.build, p.scripts.start, p.scripts.lint)"`
Expected: `tsx src/main.tsx tsc -p tsconfig.json node dist/main.js eslint .`

- [ ] **Step 5: Commit**

```bash
git add apps/simple-ink/package.json pnpm-lock.yaml
git commit -m "chore: convert simple-ink scripts to cli"
```

### Task 2: Replace Vite TypeScript config with a single Node CLI config

**Files:**

- Modify: `apps/simple-ink/tsconfig.json`
- Delete: `apps/simple-ink/tsconfig.app.json`
- Delete: `apps/simple-ink/tsconfig.node.json`
- Test: `apps/simple-ink/tsconfig.json`

- [ ] **Step 1: Write the failing expectation for a single CLI TypeScript config**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx",
    "strict": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Expected mismatch in current file:

- uses `references` instead of a single config
- depends on Vite split config files
- does not define `outDir` for CLI build output

- [ ] **Step 2: Verify the mismatch exists before editing**

Run: `node -e "const fs=require('fs'); console.log(fs.readFileSync('./apps/simple-ink/tsconfig.json','utf8'))"`
Expected: output contains `references`

- [ ] **Step 3: Write the minimal unified tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

Delete these files after the new config is in place:

```text
apps/simple-ink/tsconfig.app.json
apps/simple-ink/tsconfig.node.json
```

- [ ] **Step 4: Run TypeScript without emitting to verify config validity**

Run: `pnpm --dir ./apps/simple-ink exec tsc -p tsconfig.json --noEmit`
Expected: exits successfully with no errors

- [ ] **Step 5: Commit**

```bash
git add apps/simple-ink/tsconfig.json apps/simple-ink/tsconfig.app.json apps/simple-ink/tsconfig.node.json
git commit -m "chore: simplify simple-ink tsconfig"
```

### Task 3: Remove Vite config and confirm the Ink entrypoint works with CLI tooling

**Files:**

- Delete: `apps/simple-ink/vite.config.ts`
- Modify: `apps/simple-ink/src/main.tsx`
- Test: `apps/simple-ink/src/main.tsx`

- [ ] **Step 1: Write the failing expectation for the runtime entrypoint**

```tsx
import React, { useEffect, useState } from 'react';
import { render, Text } from 'ink';

const Counter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((previousCounter) => previousCounter + 1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text color="green">{counter} tests passed</Text>;
};

render(<Counter />);
```

Runtime expectation:

- `pnpm --dir ./apps/simple-ink dev` starts without referencing Vite
- output appears in the terminal

- [ ] **Step 2: Verify the current runtime path still depends on removed Vite files elsewhere**

Run: `node -e "const fs=require('fs'); console.log(fs.existsSync('./apps/simple-ink/vite.config.ts'))"`
Expected: `true` before deletion

- [ ] **Step 3: Keep or minimally normalize the Ink entrypoint and remove the unused Vite config**

Use this source for `apps/simple-ink/src/main.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
import { render, Text } from 'ink';

const Counter = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((previousCounter) => previousCounter + 1);
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text color="green">{counter} tests passed</Text>;
};

render(<Counter />);
```

Delete this file:

```text
apps/simple-ink/vite.config.ts
```

- [ ] **Step 4: Run the CLI entrypoint to verify Ink starts**

Run: `pnpm --dir ./apps/simple-ink dev`
Expected: terminal renders a green counter such as `0 tests passed`, then increments continuously

- [ ] **Step 5: Commit**

```bash
git add apps/simple-ink/src/main.tsx apps/simple-ink/vite.config.ts
git commit -m "chore: remove vite config from simple-ink"
```

### Task 4: Rewrite the README for CLI usage

**Files:**

- Modify: `apps/simple-ink/README.md`
- Test: `apps/simple-ink/README.md`

- [ ] **Step 1: Write the failing expectation for the README content**

```md
# simple-ink

A minimal Ink CLI app built with React and TypeScript.

## Scripts

- `pnpm dev` — run the Ink app in the terminal with tsx
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run the compiled CLI with Node
- `pnpm lint` — run ESLint
```

Expected mismatch in current file:

- starts with `# React + TypeScript + Vite`
- documents browser-oriented Vite behavior instead of terminal CLI behavior

- [ ] **Step 2: Verify the mismatch exists before editing**

Run: `node -e "const fs=require('fs'); const s=fs.readFileSync('./apps/simple-ink/README.md','utf8'); console.log(s.split('\n')[0])"`
Expected: `# React + TypeScript + Vite`

- [ ] **Step 3: Write the minimal CLI README**

```md
# simple-ink

A minimal Ink CLI app built with React and TypeScript.

## Scripts

- `pnpm dev` — run the Ink app in the terminal with tsx
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run the compiled CLI with Node
- `pnpm lint` — run ESLint
```

- [ ] **Step 4: Read back the first section to verify the rewrite**

Run: `node -e "const fs=require('fs'); console.log(fs.readFileSync('./apps/simple-ink/README.md','utf8'))"`
Expected: output starts with `# simple-ink` and lists the four CLI scripts

- [ ] **Step 5: Commit**

```bash
git add apps/simple-ink/README.md
git commit -m "docs: rewrite simple-ink readme for cli"
```

### Task 5: Verify the full CLI flow end-to-end

**Files:**

- Modify: `pnpm-lock.yaml`
- Test: `apps/simple-ink/package.json`
- Test: `apps/simple-ink/tsconfig.json`
- Test: `apps/simple-ink/src/main.tsx`
- Test: `apps/simple-ink/README.md`

- [ ] **Step 1: Write the failing verification checklist**

```text
1. Dependency install succeeds with tsx added and vite removed.
2. pnpm --dir ./apps/simple-ink lint passes.
3. pnpm --dir ./apps/simple-ink exec tsc -p tsconfig.json --noEmit passes.
4. pnpm --dir ./apps/simple-ink build writes dist/main.js.
5. pnpm --dir ./apps/simple-ink start runs the compiled Ink app.
```

Before edits, at least items 1, 4, and 5 do not hold for a pure CLI setup.

- [ ] **Step 2: Install dependencies and refresh the lockfile**

Run: `pnpm install`
Expected: lockfile updates to include `tsx` and remove unused Vite packages from `apps/simple-ink`

- [ ] **Step 3: Run verification commands**

Run: `pnpm --dir ./apps/simple-ink lint && pnpm --dir ./apps/simple-ink exec tsc -p tsconfig.json --noEmit && pnpm --dir ./apps/simple-ink build && test -f ./apps/simple-ink/dist/main.js`
Expected: all commands succeed and `dist/main.js` exists

- [ ] **Step 4: Run the built CLI artifact**

Run: `pnpm --dir ./apps/simple-ink start`
Expected: terminal renders the Ink counter from `dist/main.js`

- [ ] **Step 5: Commit**

```bash
git add pnpm-lock.yaml apps/simple-ink/package.json apps/simple-ink/tsconfig.json apps/simple-ink/src/main.tsx apps/simple-ink/README.md apps/simple-ink/tsconfig.app.json apps/simple-ink/tsconfig.node.json apps/simple-ink/vite.config.ts
git commit -m "feat: convert simple-ink to ink cli"
```
