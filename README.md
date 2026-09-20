# Pink Game Demo

PinK 用户手册配套的 2D 点击得分游戏。官方仓库：[SUD-GLOBAL/pink-game-demo](https://github.com/SUD-GLOBAL/pink-game-demo)。

## 打开与运行

1. 准备 PinK 1.127.0 和 COCOS Creator 3.8.8 对应的引擎环境。
2. 克隆本仓库，或在 GitHub 选择 **Code → Download ZIP** 并解压。
3. 在 PinK 中打开包含 `package.json` 和 `assets/` 的项目根目录，等待资源初始化完成。
4. 打开 `assets/main.scene` 并运行预览。

初始分数为 0。点击粉色目标，每次加 1 分，并沿固定的五个位置循环移动；点击“重新开始”后回到 0 分和初始位置。构建发布时选择 Web Desktop，并将 `assets/main.scene` 设为启动场景，默认输出目录为 `build/web-desktop/`。

## 项目内容

- `assets/main.scene`：包含游戏界面、目标和重置按钮的入口场景。
- `assets/scripts/ClickGame.ts`：节点绑定、计分、固定路线与重置逻辑。
- `assets/resources/images/pink-target.png`：目标图片。
- `assets/animations/target-pulse.anim`：教程使用的目标动画。

资源旁的 `.meta` 文件及 UUID 必须随资源一起保留。`temp/` 中的 TypeScript 配置由 COCOS 初始化生成，不应手工提交。

## 验证与维护

使用 Node.js 22 或更高版本运行静态项目校验，无需安装 npm 依赖：

```bash
npm test
```

校验覆盖版本声明、教程资源、场景对象引用、关键节点和确定性逻辑约束；实际游戏运行仍须在 PinK / COCOS 环境中验证。

运行缓存、依赖和构建产物由 `.gitignore` 排除。游戏代码在本仓库维护；[用户手册仓库](https://github.com/SUD-GLOBAL/pink-docs-public)的自动截图默认读取与其同级的 `pink-game-demo`，也支持 `--demo-dir` 指定路径。截图在临时副本中运行。

## 来源与许可

项目从 pink-docs-public 的提交 `ba1f508a18175573aeb40b5fd483d3dd0a405085` 中的 `examples/pink-demo/` 迁入，保留原始游戏行为与资源标识。

本仓库使用 [MIT License](./LICENSE)。
