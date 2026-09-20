# Pink Game Demo

A small 2D click-to-score game for the PinK user guide. Official repository: [SUD-GLOBAL/pink-game-demo](https://github.com/SUD-GLOBAL/pink-game-demo).

## Open and run

1. Install PinK 1.127.0 and an engine environment compatible with COCOS Creator 3.8.8.
2. Clone this repository, or choose **Code → Download ZIP** on GitHub and extract the archive.
3. Open the project root containing `package.json` and `assets/` in PinK, then wait for asset initialization to finish.
4. Open `assets/main.scene` and start the preview.

The score starts at 0. Click the pink target to earn 1 point and move it along a fixed cycle of five positions. Select **Restart** to reset the score and target position. To build the game, open **Build & Publish → Native Platform → web desktop**, use `assets/main.scene` as the startup scene, and select **Build**. The default output directory is `build/web-desktop/`.

## Project contents

- `assets/main.scene`: the entry scene, including the game interface, target, and restart button.
- `assets/scripts/ClickGame.ts`: node bindings, scoring, deterministic movement, and reset logic.
- `assets/resources/images/pink-target.png`: the target image, displayed through a circular mask.
- `assets/resources/images/rounded-panel.png`: a plain white rounded rectangle, sliced and tinted for the playfield, score card, and button.
- `assets/animations/target-pulse.anim`: the animation asset used by the guide.

## Edit the scene and gameplay

The complete interface is assembled from COCOS nodes in `assets/main.scene`. Edit layout, colors, images, and static Label text in the scene editor. For example, change the `Label` under `Canvas/ResetButton` to rename the Restart button. `ClickGame.ts` updates the score and target during play; it does not create or draw the interface.

Select `GameController` in the Hierarchy. Its `ClickGame` component exposes three Inspector references:

| Property | Scene reference |
| --- | --- |
| Score Label | The Label component on `Canvas/ScoreCard/ScoreLabel` |
| Target | The `Canvas/Target` node |
| Reset Button | The `Canvas/ResetButton` node |

These references are saved in the scene. Event listeners are attached when the component is enabled and removed when it is disabled. A missing reference reports an English error and disables the component; restore the reference in the Inspector instead of relying on an automatically rebuilt interface.

Keep each asset's `.meta` file and UUID together with the asset. COCOS generates the TypeScript configuration under `temp/`; do not commit generated files.

The root `uuid` identifies the COCOS project; `pink.uuid` identifies it in PinK. They are independently generated UUIDs and do not need to match. Keep these project IDs stable when maintaining this repository. Asset UUIDs are separate and preserve scene references.

## Validation and maintenance

Run the static project checks with Node.js 22 or later. No npm dependencies are required:

```bash
npm test
```

The checks cover version declarations, project UUIDs, asset metadata, tutorial resources, scene references, key nodes, English UI labels, and deterministic logic constraints. Verify actual gameplay in PinK / COCOS as well.

The `.gitignore` excludes dependencies, runtime caches, and build output. Maintain the game code in this repository. The [user guide repository](https://github.com/SUD-GLOBAL/pink-docs-public) captures screenshots from a sibling `pink-game-demo` checkout by default and supports `--demo-dir` for other locations. Screenshot sessions use temporary project copies. The Demo UI and its related screenshots use English; the handbook may explain them in other languages.

## Origin and license

The project was extracted from `examples/pink-demo/` in pink-docs-public commit `ba1f508a18175573aeb40b5fd483d3dd0a405085`. Its game behavior and existing asset identifiers were preserved; subsequent changes update the target image, UI language, light color palette, layout, and project metadata.

This repository uses the [MIT License](./LICENSE).
