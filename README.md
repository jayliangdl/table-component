# React Table Component

一个基于 React + TypeScript + Vite 的可复用表格组件项目。

## 项目特性

- **框架**: React 18 + TypeScript
- **构建工具**: Vite (快速的开发服务器和构建工具)
- **开发工具**: ESLint + TypeScript 类型检查
- **样式**: CSS Modules (模块化CSS)

## 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 开发指南

### 项目结构
```
src/
├── components/     # 可复用组件
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
├── styles/        # 样式文件
└── App.tsx        # 主应用组件
```

### 组件开发
- 使用函数式组件 + Hooks
- 遵循 TypeScript 最佳实践
- 实现响应式设计
- 编写干净、可复用的代码
- 添加合适的类型定义

### 表格组件功能
- 数据排序
- 数据筛选
- 分页功能
- 响应式布局
- 类型安全的属性接口

## 技术栈详情

### Vite 插件

当前使用的官方插件：

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) - 使用 [Babel](https://babeljs.io/) 进行快速刷新
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) - 使用 [SWC](https://swc.rs/) 进行快速刷新

### ESLint 配置扩展

如果开发生产应用，建议更新配置以启用类型感知的 lint 规则：

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
