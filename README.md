# Useful Tools - Chrome 扩展

一款基于 Vue 3 + TypeScript + Vite 的 Chrome 扩展，在任意网页中提供「离开一下」、计算器、颜色提取器等实用小工具。

## 功能特性

| 功能 | 说明 | 快捷键 |
|------|------|--------|
| **离开一下** | 临时离开时模糊当前页面，显示自定义提示文案，保护隐私 | `Ctrl + Alt + B` |
| **计算器** | 页面内悬浮计算器，支持拖拽，基础四则运算 | `Ctrl + Alt + C` |
| **颜色提取器** | 取色器 + 放大镜，实时显示 HEX/RGB，点击复制 | `Ctrl + Alt + P` |

- 工具开关与状态通过扩展 Popup 控制，并同步到当前标签页
- 支持 Chrome Manifest V3
- 本地开发支持热更新（Vite + WebSocket）

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建**: Vite 6
- **UI**: Naive UI
- **状态**: Pinia
- **存储**: Chrome Storage API、IndexedDB
- **样式**: Sass

## 环境要求

- Node.js 18+
- pnpm 9+

## 安装与使用

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发（popup + content 热更新）
pnpm run dev
```

在 Chrome 中打开 `chrome://extensions/`，开启「开发者模式」，选择「加载已解压的扩展程序」，指向构建输出目录（如 `dist-popup` 或脚本指定的输出路径）。

### 生产构建

```bash
# 完整构建（类型检查 + 多入口 Vite 构建 + 后处理）
pnpm run build
```

构建产物会生成在项目根目录下，可按脚本提示选择打包为 zip。

### 其他脚本

```bash
pnpm run build:prod   # 直接执行生产构建命令（无交互）
pnpm run content      # 仅监听 content 脚本 TypeScript 编译
pnpm run serve        # Vite 预览
```

## 项目结构

```
src/
├── background/          # Service Worker（Manifest V3）
├── popup/               # 扩展弹窗（入口、工具开关菜单）
├── contentPage/         # 注入页面的 Vue 应用（各工具 UI）
│   └── components/      # 离开一下、计算器、颜色提取器、布局等
├── content/             # Content Script 入口
├── stores/              # Pinia 状态
├── utils/               # 工具函数、Storage、Logger 等
├── constants/           # 常量、快捷键配置
└── types/               # 类型定义
scripts/                 # 构建、打包、后处理脚本
public/                  # 静态资源、manifest.json
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Alt + B` | 切换「离开一下」模糊层 |
| `Ctrl + Alt + C` | 打开/关闭计算器 |
| `Ctrl + Alt + P` | 打开/关闭颜色提取器 |

颜色提取器开启后，按 `ESC` 可关闭。

## 许可证

见 [LICENSE](./LICENSE) 文件。
