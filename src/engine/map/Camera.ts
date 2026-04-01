export class Camera {
  x = 0;
  y = 0;

  constructor(
    public width: number,
    public height: number
  ) {}

  follow(
    targetX: number,
    targetY: number,
    mapWidthPx: number,
    mapHeightPx: number
  ): void {
    this.x = targetX - this.width / 2;
    this.y = targetY - this.height / 2;

    // Clamp to map bounds
    this.x = Math.max(0, Math.min(this.x, mapWidthPx - this.width));
    this.y = Math.max(0, Math.min(this.y, mapHeightPx - this.height));
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx - this.x, y: wy - this.y };
  }

  isVisible(wx: number, wy: number, w: number, h: number): boolean {
    return (
      wx + w > this.x &&
      wy + h > this.y &&
      wx < this.x + this.width &&
      wy < this.y + this.height
    );
  }
}
