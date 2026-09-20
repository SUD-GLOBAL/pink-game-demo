import {
  _decorator,
  Camera,
  Canvas,
  Color,
  Component,
  Graphics,
  HorizontalTextAlignment,
  Label,
  Layers,
  Mask,
  Node,
  ResolutionPolicy,
  Sprite,
  SpriteFrame,
  UITransform,
  Vec3,
  VerticalTextAlignment,
  Widget,
  resources,
  tween,
  view,
} from 'cc';

const { ccclass } = _decorator;

const TARGET_POSITIONS = [
  new Vec3(0, -34, 0),
  new Vec3(250, 72, 0),
  new Vec3(-260, 60, 0),
  new Vec3(190, -122, 0),
  new Vec3(-180, -130, 0),
];

@ccclass('ClickGame')
export class ClickGame extends Component {
  private score = 0;
  private scoreLabel!: Label;
  private target!: Node;

  protected start(): void {
    view.setDesignResolutionSize(1280, 720, ResolutionPolicy.SHOW_ALL);
    this.buildInterface();
    this.resetGame();
  }

  private buildInterface(): void {
    const canvas = this.node.parent?.getChildByName('Canvas');
    const scoreLabel = canvas?.getChildByName('ScoreCard')?.getChildByName('ScoreLabel')?.getComponent(Label);
    const target = canvas?.getChildByName('Target');
    const reset = canvas?.getChildByName('ResetButton');

    if (canvas && scoreLabel && target && reset) {
      this.scoreLabel = scoreLabel;
      this.target = target;
      this.target.off(Node.EventType.TOUCH_END, this.onTargetClicked, this);
      this.target.on(Node.EventType.TOUCH_END, this.onTargetClicked, this);
      reset.off(Node.EventType.TOUCH_END, this.resetGame, this);
      reset.on(Node.EventType.TOUCH_END, this.resetGame, this);
      return;
    }

    // Keep the demo runnable if a learner accidentally removes one of the
    // tutorial nodes. The serialized scene is the normal path; this branch is
    // a recovery path that rebuilds the same interface from code.
    this.node.removeAllChildren();

    const fallbackCanvas = this.makeNode('Canvas', this.node, 1280, 720);
    fallbackCanvas.layer = Layers.Enum.UI_2D;
    fallbackCanvas.addComponent(Canvas);
    const canvasWidget = fallbackCanvas.addComponent(Widget);
    canvasWidget.isAlignLeft = canvasWidget.isAlignRight = true;
    canvasWidget.isAlignTop = canvasWidget.isAlignBottom = true;

    const cameraNode = new Node('UICamera');
    cameraNode.parent = fallbackCanvas;
    cameraNode.layer = Layers.Enum.UI_2D;
    cameraNode.setPosition(0, 0, 1000);
    const camera = cameraNode.addComponent(Camera);
    camera.projection = Camera.ProjectionType.ORTHO;
    camera.orthoHeight = 360;
    camera.visibility = Layers.Enum.UI_2D;
    fallbackCanvas.getComponent(Canvas)!.cameraComponent = camera;

    this.drawPanel(this.makeNode('Background', fallbackCanvas, 1280, 720), new Color(25, 23, 35, 255), 0);
    this.drawPanel(this.makeNode('Header', fallbackCanvas, 1120, 116, new Vec3(0, 254)), new Color(48, 42, 69, 255), 28);

    this.makeLabel('Title', fallbackCanvas, 'Pink Demo · 点击得分', 42, new Color(255, 104, 145, 255), new Vec3(0, 276));
    this.makeLabel('Subtitle', fallbackCanvas, '点击粉色目标，每次得 1 分', 22, new Color(210, 203, 225, 255), new Vec3(0, 235));

    const scoreCard = this.makeNode('ScoreCard', fallbackCanvas, 320, 92, new Vec3(0, 145));
    this.drawPanel(scoreCard, new Color(67, 57, 91, 255), 22);
    this.scoreLabel = this.makeLabel('ScoreLabel', scoreCard, '得分：0', 36, Color.WHITE, Vec3.ZERO).getComponent(Label)!;

    this.target = this.makeNode('Target', fallbackCanvas, 150, 150, TARGET_POSITIONS[0]);
    // Match the circular mask stored on Target in the normal scene.
    this.target.addComponent(Mask).type = Mask.Type.GRAPHICS_ELLIPSE;
    const fallback = this.makeNode('TargetFallback', this.target, 150, 150);
    this.drawTarget(fallback);
    const spriteNode = this.makeNode('TargetSprite', this.target, 150, 150);
    const sprite = spriteNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    spriteNode.active = false;
    this.target.on(Node.EventType.TOUCH_END, this.onTargetClicked, this);
    resources.load('images/pink-target/spriteFrame', SpriteFrame, (error, frame) => {
      if (error || !this.target?.isValid || !spriteNode.isValid) return;
      sprite.spriteFrame = frame;
      fallback.active = false;
      spriteNode.active = true;
    });

    const fallbackReset = this.makeNode('ResetButton', fallbackCanvas, 210, 64, new Vec3(0, -250));
    this.drawPanel(fallbackReset, new Color(255, 68, 120, 255), 20);
    this.makeLabel('ResetText', fallbackReset, '重新开始', 25, Color.WHITE, Vec3.ZERO);
    fallbackReset.on(Node.EventType.TOUCH_END, this.resetGame, this);

    this.makeLabel('HintLabel', fallbackCanvas, '目标按固定路线移动，结果始终可以复现', 18, new Color(164, 155, 184, 255), new Vec3(0, -310));
  }

  private onTargetClicked(): void {
    this.score += 1;
    this.scoreLabel.string = `得分：${this.score}`;
    const nextPosition = TARGET_POSITIONS[this.score % TARGET_POSITIONS.length] ?? TARGET_POSITIONS[0];
    tween(this.target)
      .to(0.08, { scale: new Vec3(1.16, 1.16, 1) })
      .to(0.12, { scale: Vec3.ONE })
      .call(() => this.target.setPosition(nextPosition))
      .start();
  }

  private resetGame(): void {
    this.score = 0;
    this.scoreLabel.string = '得分：0';
    this.target.setScale(Vec3.ONE);
    this.target.setPosition(TARGET_POSITIONS[0]);
  }

  private makeNode(name: string, parent: Node, width: number, height: number, position = Vec3.ZERO): Node {
    const node = new Node(name);
    node.parent = parent;
    node.layer = Layers.Enum.UI_2D;
    node.setPosition(position);
    node.addComponent(UITransform).setContentSize(width, height);
    return node;
  }

  private makeLabel(name: string, parent: Node, text: string, size: number, color: Color, position: Vec3): Node {
    const node = this.makeNode(name, parent, 720, Math.max(56, size + 16), position);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = size;
    label.lineHeight = size + 8;
    label.color = color;
    label.horizontalAlign = HorizontalTextAlignment.CENTER;
    label.verticalAlign = VerticalTextAlignment.CENTER;
    return node;
  }

  private drawPanel(node: Node, color: Color, radius: number): void {
    const size = node.getComponent(UITransform)!.contentSize;
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    if (radius > 0) graphics.roundRect(-size.width / 2, -size.height / 2, size.width, size.height, radius);
    else graphics.rect(-size.width / 2, -size.height / 2, size.width, size.height);
    graphics.fill();
  }

  private drawTarget(node: Node): void {
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = new Color(255, 68, 120, 255);
    graphics.circle(0, 0, 70);
    graphics.fill();
    graphics.fillColor = new Color(255, 180, 202, 255);
    graphics.circle(-18, 18, 25);
    graphics.fill();
  }
}
