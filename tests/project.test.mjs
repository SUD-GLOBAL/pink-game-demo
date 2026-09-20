import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const fixture = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('Pink Demo', () => {
  it('声明固定的 PinK 与 COCOS 版本', async () => {
    const project = JSON.parse(await readFile(path.join(fixture, 'package.json'), 'utf8'));
    assert.equal(project.name, 'pink-game-demo');
    assert.equal(project.type, '2d');
    assert.equal(project.creator.version, '3.8.8');
    assert.equal(project.pink.version, '1.127.0');
  });

  it('包含教程引用的场景、脚本、图片和动画', async () => {
    const files = [
      'assets/main.scene',
      'assets/main.scene.meta',
      'assets/scripts/ClickGame.ts',
      'assets/scripts/ClickGame.ts.meta',
      'assets/resources/images/pink-target.png',
      'assets/resources/images/pink-target.png.meta',
      'assets/animations/target-pulse.anim',
      'assets/animations/target-pulse.anim.meta'
    ];
    await Promise.all(files.map(async file => assert.equal((await stat(path.join(fixture, file))).isFile(), true)));
  });

  it('计分、移动和重置行为保持确定性', async () => {
    const script = await readFile(path.join(fixture, 'assets/scripts/ClickGame.ts'), 'utf8');
    assert.ok(script.includes('const TARGET_POSITIONS = ['));
    assert.ok(script.includes('this.score += 1;'));
    assert.ok(script.includes("this.scoreLabel.string = '得分：0';"));
    assert.ok(!script.includes('Math.random'));
  });

  it('使用 COCOS 当前生成的 TypeScript 配置路径', async () => {
    const tsconfig = JSON.parse(await readFile(path.join(fixture, 'tsconfig.json'), 'utf8'));
    assert.equal(tsconfig.extends, './temp/tsconfig.cocos.json');
    assert.equal(tsconfig.compilerOptions.moduleResolution, 'Bundler');
    assert.equal(tsconfig.compilerOptions.skipLibCheck, true);
  });

  it('场景中的所有对象引用都指向有效索引', async () => {
    const scene = JSON.parse(await readFile(path.join(fixture, 'assets/main.scene'), 'utf8'));
    const ids = JSON.stringify(scene).matchAll(/"__id__":(\d+)/g);
    for (const match of ids) assert.ok(Number(match[1]) < scene.length);
  });

  it('把教程中的关键 UI 节点固化在场景中', async () => {
    const scene = JSON.parse(await readFile(path.join(fixture, 'assets/main.scene'), 'utf8'));
    const names = new Set(scene.map(item => item._name).filter(Boolean));
    for (const name of ['Canvas', 'ScoreLabel', 'Target', 'TargetSprite', 'ResetButton', 'HintLabel']) {
      assert.equal(names.has(name), true);
    }
  });
});
