import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, '../../');

const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePackagePath(pkgName, isDist) {
  if (isDist) {
    return `${distPath}/${pkgName}`;
  }
  return `${pkgPath}/${pkgName}`;
}

export function getPackageJSON(pkgName) {
  const path = `${resolvePackagePath(pkgName)}/package.json`;
  const str = fs.readFileSync(path, { encoding: 'utf-8' });
  const object = JSON.parse(str);
  return object;
}

export function getBaseRollupPlugins(props) {
  const { typescript = {} } = props ?? {};
  return [cjs(), ts(typescript)];
}
