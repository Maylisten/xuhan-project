# simple-ink 改造成纯 Ink CLI 的设计

## 目标

将 `apps/simple-ink` 从 Vite 模板状态整理为一个真正的 Ink 命令行应用，避免浏览器构建链路混入终端渲染项目。

## 范围

本次只做最小必要改造：

- 保留 `src/main.tsx` 作为 Ink 应用入口
- 移除 Vite 相关脚本与依赖
- 改为使用 Node + TypeScript 运行和构建
- 更新 README，使其反映 CLI 用法

本次不做：

- npm 包发布配置
- 单文件打包
- 双端（web + cli）共存
- 复杂交互界面设计

## 推荐方案

采用“最小 CLI 化”方案。

开发阶段使用 `tsx src/main.tsx` 直接运行 Ink 应用；构建阶段使用 `tsc` 输出到 `dist/`，再用 `node dist/main.js` 启动。这一方案和 Ink 的运行模型一致，配置最少，也最容易理解。

## 结构设计

### 入口

`src/main.tsx` 继续作为唯一入口，负责调用 `render(<App />)`。

### 脚本

`package.json` 调整为面向 CLI：

- `dev`: `tsx src/main.tsx`
- `build`: `tsc -p tsconfig.json`
- `start`: `node dist/main.js`
- `lint`: 保留现有 ESLint

### 依赖

保留运行时依赖：

- `ink`
- `react`

新增开发依赖：

- `tsx`

删除不再需要的依赖：

- `vite`
- `@vitejs/plugin-react`

### TypeScript 配置

将 TypeScript 配置调整为 Node CLI 场景：

- 输出目录为 `dist`
- 保留 JSX 配置以支持 Ink 的 React 组件写法
- 使用 Node 环境类型
- 去掉仅服务于 Vite 模板的拆分配置依赖（如果当前配置确实只为 Vite 服务）

## 数据流与运行方式

Ink 组件在 Node 进程内运行，直接渲染到终端：

1. 执行 `pnpm dev` 或等价命令
2. Node 通过 `tsx` 加载 `src/main.tsx`
3. `main.tsx` 调用 Ink `render`
4. Ink 将 React 组件输出到终端 TTY

构建后流程为：

1. 执行 `pnpm build`
2. TypeScript 输出 `dist/main.js`
3. 执行 `pnpm start`
4. Node 运行编译后的 CLI 入口

## 错误处理

本次不额外引入错误边界或复杂恢复机制，只保持最基本的可运行性。

如果后续加入用户输入、网络请求或文件读取，再针对系统边界补充错误处理。

## 验证方式

需要确认：

- `pnpm dev` 能直接在终端看到 Ink 输出
- `pnpm build` 成功产出 `dist/main.js`
- `pnpm start` 能运行构建产物
- `pnpm lint` 不报新的配置错误

## 变更文件

预计涉及：

- `apps/simple-ink/package.json`
- `apps/simple-ink/tsconfig.json`
- `apps/simple-ink/tsconfig.app.json` 或删除它
- `apps/simple-ink/tsconfig.node.json` 或删除它
- `apps/simple-ink/vite.config.ts` 或删除它
- `apps/simple-ink/README.md`
- 如有必要，微调 `apps/simple-ink/src/main.tsx`

## 取舍

不选择继续保留 Vite，是因为它主要服务浏览器开发体验，而当前应用目标运行时是终端。继续保留会让项目意图变得模糊，也会给脚本和配置增加噪音。

不提前引入 `tsup` 一类打包器，是因为当前目标只是让项目成为清晰可运行的 Ink CLI，而不是分发发布。
