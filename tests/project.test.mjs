import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const fixture = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('Pink Demo', () => {
  it('keeps asset metadata paired with an existing asset or directory', async () => {
    async function check(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) await check(file);
        else if (entry.name.endsWith('.meta')) await stat(file.slice(0, -5));
      }
    }
    await check(path.join(fixture, 'assets'));
  });

  it('uses English labels in the scene and runtime UI', async () => {
    const scene = JSON.parse(await readFile(path.join(fixture, 'assets/main.scene'), 'utf8'));
    const labels = scene.filter(item => item.__type__ === 'cc.Label').map(item => item._string);
    assert.deepEqual(labels, [
      'Pink Demo · Click to Score',
      'Click the pink target to earn 1 point',
      'Score: 0',
      'Restart',
      'The target follows a fixed path for repeatable results'
    ]);
    const script = await readFile(path.join(fixture, 'assets/scripts/ClickGame.ts'), 'utf8');
    assert.ok(!/[\u3400-\u9fff]/u.test(script));
    assert.ok(script.includes("this.scoreLabel.string = 'Score: 0';"));
    assert.ok(script.includes('`Score: ${this.score}`'));
  });
  it('declares the supported PinK and COCOS versions', async () => {
    const project = JSON.parse(await readFile(path.join(fixture, 'package.json'), 'utf8'));
    assert.equal(project.name, 'pink-game-demo');
    assert.equal(project.type, '2d');
    assert.equal(project.creator.version, '3.8.8');
    assert.equal(project.pink.version, '1.127.0');
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    assert.match(project.uuid, uuidV4);
    assert.match(project.pink.uuid, uuidV4);
  });

  it('includes the scene, script, image, and animation used by the guide', async () => {
    const files = [
      'assets/main.scene',
      'assets/main.scene.meta',
      'assets/scripts/ClickGame.ts',
      'assets/scripts/ClickGame.ts.meta',
      'assets/resources/images/pink-target.png',
      'assets/resources/images/pink-target.png.meta',
      'assets/resources/images/rounded-panel.png',
      'assets/resources/images/rounded-panel.png.meta',
      'assets/animations/target-pulse.anim',
      'assets/animations/target-pulse.anim.meta'
    ];
    await Promise.all(files.map(async file => assert.equal((await stat(path.join(fixture, file))).isFile(), true)));
  });

  it('keeps scoring, movement, and reset deterministic', async () => {
    const script = await readFile(path.join(fixture, 'assets/scripts/ClickGame.ts'), 'utf8');
    assert.ok(script.includes('const TARGET_POSITIONS = ['));
    assert.ok(script.includes('this.score += 1;'));
    assert.ok(script.includes("this.scoreLabel.string = 'Score: 0';"));
    assert.ok(!script.includes('Math.random'));
  });

  it('extends the generated COCOS TypeScript configuration', async () => {
    const tsconfig = JSON.parse(await readFile(path.join(fixture, 'tsconfig.json'), 'utf8'));
    assert.equal(tsconfig.extends, './temp/tsconfig.cocos.json');
    assert.equal(tsconfig.compilerOptions.moduleResolution, 'Bundler');
    assert.equal(tsconfig.compilerOptions.skipLibCheck, true);
  });

  it('uses valid scene object references', async () => {
    const scene = JSON.parse(await readFile(path.join(fixture, 'assets/main.scene'), 'utf8'));
    const ids = JSON.stringify(scene).matchAll(/"__id__":(\d+)/g);
    for (const match of ids) assert.ok(Number(match[1]) < scene.length);
  });

  it('serializes the key UI nodes used by the guide', async () => {
    const scene = JSON.parse(await readFile(path.join(fixture, 'assets/main.scene'), 'utf8'));
    const names = new Set(scene.map(item => item._name).filter(Boolean));
    for (const name of ['Canvas', 'ScoreLabel', 'Target', 'TargetSprite', 'ResetButton', 'HintLabel']) {
      assert.equal(names.has(name), true);
    }
  });

  it('wires the controller Inspector properties to the scene components and nodes', async () => {
    const scene = JSON.parse(await readFile(path.join(fixture, 'assets/main.scene'), 'utf8'));
    const controllerNode = scene.find(item => item.__type__ === 'cc.Node' && item._name === 'GameController');
    const controller = scene[controllerNode._components[0].__id__];
    for (const [property, type, name] of [
      ['scoreLabel', 'cc.Label', 'ScoreLabel'],
      ['target', 'cc.Node', 'Target'],
      ['resetButton', 'cc.Node', 'ResetButton']
    ]) {
      const reference = controller[property]?.__id__;
      assert.ok(Number.isInteger(reference), `${property} must be serialized`);
      const object = scene[reference];
      assert.equal(object.__type__, type);
      const node = type === 'cc.Node' ? object : scene[object.node.__id__];
      assert.equal(node._name, name);
      if (type !== 'cc.Node') assert.ok(node._components.some(component => component.__id__ === reference));
    }
  });
});
