import { Direction, InputManager } from '../InputManager';
import { Camera } from '../map/Camera';

export class Player {
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
  direction: Direction = 'down';
  moving = false;

  private targetX = 0;
  private targetY = 0;
  private moveProgress = 0;
  private moveSpeed = 4; // tiles per second
  private startPixelX = 0;
  private startPixelY = 0;

  constructor(
    startX: number,
    startY: number,
    private tileSize: number
  ) {
    this.x = startX;
    this.y = startY;
    this.pixelX = startX * tileSize;
    this.pixelY = startY * tileSize;
  }

  /** Returns true if player just arrived at a new tile */
  update(dt: number, input: InputManager, collision: number[][]): boolean {
    if (!this.moving) {
      const dir = input.getDirection();
      if (dir) {
        this.direction = dir.dir;
        const nextX = this.x + dir.x;
        const nextY = this.y + dir.y;
        if (this.canMoveTo(nextX, nextY, collision)) {
          this.moving = true;
          this.targetX = nextX;
          this.targetY = nextY;
          this.moveProgress = 0;
          this.startPixelX = this.pixelX;
          this.startPixelY = this.pixelY;
        }
      }
      return false;
    }

    // Interpolate movement
    this.moveProgress += this.moveSpeed * dt;
    if (this.moveProgress >= 1) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.pixelX = this.x * this.tileSize;
      this.pixelY = this.y * this.tileSize;
      this.moving = false;
      return true; // arrived
    }

    this.pixelX =
      this.startPixelX +
      (this.targetX * this.tileSize - this.startPixelX) * this.moveProgress;
    this.pixelY =
      this.startPixelY +
      (this.targetY * this.tileSize - this.startPixelY) * this.moveProgress;

    return false;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const { x, y } = camera.worldToScreen(this.pixelX, this.pixelY);
    const size = this.tileSize;

    // Body
    ctx.fillStyle = '#f04040';
    ctx.fillRect(x + size * 0.15, y + size * 0.1, size * 0.7, size * 0.8);

    // Head
    ctx.fillStyle = '#ffd4a0';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size * 0.25, size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Hat (Pokemon trainer cap)
    ctx.fillStyle = '#f04040';
    ctx.fillRect(x + size * 0.2, y + size * 0.05, size * 0.6, size * 0.15);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + size * 0.35, y + size * 0.08, size * 0.15, size * 0.08);

    // Direction indicator (eyes)
    ctx.fillStyle = '#000';
    const eyeOffsetX =
      this.direction === 'left' ? -3 : this.direction === 'right' ? 3 : 0;
    const eyeOffsetY =
      this.direction === 'up' ? -2 : this.direction === 'down' ? 2 : 0;
    ctx.fillRect(
      x + size * 0.38 + eyeOffsetX,
      y + size * 0.23 + eyeOffsetY,
      2,
      2
    );
    ctx.fillRect(
      x + size * 0.55 + eyeOffsetX,
      y + size * 0.23 + eyeOffsetY,
      2,
      2
    );

    // Legs
    ctx.fillStyle = '#3050a0';
    ctx.fillRect(x + size * 0.25, y + size * 0.75, size * 0.2, size * 0.2);
    ctx.fillRect(x + size * 0.55, y + size * 0.75, size * 0.2, size * 0.2);
  }

  getCenterPixel(): { x: number; y: number } {
    return {
      x: this.pixelX + this.tileSize / 2,
      y: this.pixelY + this.tileSize / 2,
    };
  }

  private canMoveTo(tx: number, ty: number, collision: number[][]): boolean {
    if (ty < 0 || ty >= collision.length || tx < 0 || tx >= collision[0].length) {
      return false;
    }
    const tile = collision[ty][tx];
    return tile === 0 || tile === 2; // walkable or tall grass
  }
}
