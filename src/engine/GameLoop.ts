export class GameLoop {
  private lastTime = 0;
  private running = false;
  private rafId = 0;

  constructor(
    private update: (dt: number) => void,
    private render: () => void
  ) {}

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private tick(time: number): void {
    if (!this.running) return;
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.update(Math.min(dt, 0.05));
    this.render();
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }
}
