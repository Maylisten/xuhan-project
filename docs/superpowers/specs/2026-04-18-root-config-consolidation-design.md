# Root configuration consolidation design

## Goal

Move the shared ESLint, Prettier, and TypeScript base configuration out of `packages/configs` and into the repository root so workspace packages inherit from root-level files through normal repository structure.

## Scope

This change covers three configuration systems:

- ESLint flat config
- Prettier config
- TypeScript base config

This change also covers dependency ownership for the tooling required by those configs.

This change does not introduce new lint rules, formatting rules, or TypeScript behavior beyond what is already expressed in the current shared config, except where small path-based adjustments are required by the move.

## Current state

The repository currently publishes shared tooling config through the workspace package `@xuhan/configs`.

- `packages/configs/eslint.config.mjs` exports the shared ESLint flat config
- `packages/configs/prettier.config.cjs` exports the shared Prettier config
- `packages/configs/tsconfig.base.json` exports the shared TypeScript base config
- `packages/big-react` consumes those files through package imports

This structure creates an avoidable dependency-resolution boundary for runtime-loaded config files. The recent `globals` resolution error is a direct example: ESLint loaded config from the `@xuhan/configs` package context, and Node could not resolve a package imported by that config.

## Chosen approach

Use root-level config files as the single source of truth, while keeping thin package-level entry files only where the tool still benefits from package-local context.

### ESLint

Create a root `eslint.config.mjs` containing the full shared flat config.

Package-level ESLint config files may remain as thin wrappers when needed. Their only responsibility is to import the root config and optionally apply package-local overrides. If no package-local override is needed and root-level linting is sufficient, those files can be removed.

For the current repository, the safe default is to keep a thin `packages/big-react/eslint.config.mjs` wrapper unless verification proves root-only lint execution is enough for the intended workflow.

### Prettier

Create a root `prettier.config.cjs` containing the current shared defaults.

Packages inherit this automatically through Prettier's config lookup behavior. A package should keep its own `prettier.config.cjs` only when it has a real local override. In the current repo, `packages/big-react/prettier.config.cjs` should remain because it overrides `singleQuote`.

### TypeScript

Create a root `tsconfig.base.json` containing the current shared compiler options.

Each package keeps its own `tsconfig.json` and changes its `extends` path to the root base file using a relative path such as `../../tsconfig.base.json`.

Package-level TypeScript config files remain responsible for local `include`, `exclude`, and package-specific compiler options.

## Dependency ownership

All config-runtime dependencies move to the root `package.json` devDependencies.

That includes the packages currently needed to execute the shared ESLint, Prettier, and TypeScript configs:

- `@eslint/js`
- `eslint`
- `eslint-config-prettier`
- `eslint-plugin-prettier`
- `globals`
- `prettier`
- `typescript`
- `typescript-eslint`

After the move, `packages/configs/package.json` is no longer needed.

## File changes

### Add at repository root

- `eslint.config.mjs`
- `prettier.config.cjs`
- `tsconfig.base.json`

### Update in packages

- Update `packages/big-react/tsconfig.json` to extend the root TypeScript base config by relative path
- Update `packages/big-react/eslint.config.mjs` to import the root ESLint config through a relative path, or remove it if verification shows the package workflow works cleanly without a local file
- Keep `packages/big-react/prettier.config.cjs` as a thin override on top of the root Prettier config because it changes `singleQuote`
- Remove the `@xuhan/configs` dependency from `packages/big-react/package.json`

### Remove

- `packages/configs/`

## Execution model after the migration

The repository root becomes the ownership point for tool configuration and tool dependencies.

- Root commands such as `pnpm lint`, `pnpm format`, and `pnpm typecheck` continue to work from the root
- Package scripts may still run from their own directories, but they now resolve configuration from the root-level files or thin package-level wrappers
- No package distributes tool configuration as a runtime-consumed workspace dependency anymore

## Error handling and compatibility

This migration intentionally reduces config indirection.

The main compatibility concern is ESLint flat config resolution, because it does not behave like legacy layered `.eslintrc` inheritance. For that reason, the design prefers a thin package wrapper for ESLint unless verification proves it is unnecessary.

Prettier is expected to be straightforward because it naturally searches upward for config files.

TypeScript is expected to be straightforward because relative `extends` is explicit and local.

## Verification

The migration is complete when all of the following are true:

1. `packages/configs` is removed
2. Root `package.json` owns the lint, format, and TypeScript tool dependencies
3. `packages/big-react` no longer references `@xuhan/configs`
4. `pnpm install` succeeds
5. ESLint can load without package-resolution errors such as the current `globals` failure
6. Prettier resolves the intended root config plus package override
7. TypeScript resolves the root base config from package `tsconfig.json`
8. Root scripts and package scripts still run successfully for the current workspace

## Testing

Minimum validation for implementation:

- Run dependency installation
- Run `pnpm lint`
- Run `pnpm format`
- Run `pnpm typecheck`
- Run the corresponding package-level scripts for `packages/big-react` if those scripts remain part of the intended workflow

## Out of scope

- Introducing new shared packages for tooling config
- Changing the actual rule set beyond what is required for path relocation
- Reorganizing workspace package layout
- Adding project references, composite builds, or a monorepo task runner redesign

## Recommendation summary

Use a root-owned configuration model with thin per-package files only where the tool still needs local context. That matches the desired repository shape, removes avoidable runtime package resolution issues, and keeps TypeScript and package-specific overrides practical.
