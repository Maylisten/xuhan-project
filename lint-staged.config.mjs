export default {
  '*.{js,mjs,cjs,ts,mts,cts}': ['pnpm exec eslint --fix'],
  '*.{js,mjs,cjs,ts,mts,cts,json,md,yml,yaml}': ['pnpm exec prettier --write'],
};
