import { getBaseRollupPlugins, getPackageJSON, resolvePackagePath } from './utils.js';
import path from 'path';
import rollupPluginGeneratePackageJson from 'rollup-plugin-generate-package-json';

const { module = 'index.ts' } = getPackageJSON('react');

const pkgPath = resolvePackagePath('react');

const pkgDistPath = resolvePackagePath('react', true);

export default [
  {
    input: path.resolve(pkgPath, module),
    output: {
      file: `${pkgDistPath}/index.js`,
      name: `index.js`,
      format: 'umd',
    },
    plugins: [
      ...getBaseRollupPlugins({
        typescript: {
          tsconfig: path.resolve(pkgPath, 'tsconfig.json'),
        },
      }),
      rollupPluginGeneratePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ description, version }) => ({
          name: 'react',
          description,
          version,
          main: 'index.js',
        }),
      }),
    ],
  },
  {
    input: path.resolve(pkgPath, './src/jsx.ts'),
    output: [
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: `jsx-runtime.js`,
        format: 'umd',
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: `jsx-dev-runtime.js`,
        format: 'umd',
      },
    ],
    plugins: getBaseRollupPlugins({
      typescript: {
        tsconfig: path.resolve(pkgPath, 'tsconfig.json'),
      },
    }),
  },
];
