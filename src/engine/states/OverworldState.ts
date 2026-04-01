import { StateHandler } from '../StateMachine';
import { InputManager } from '../InputManager';
import { Camera } from '../map/Camera';
import { TileMapRenderer } from '../map/TileMapRenderer';
import { Player } from '../entities/Player';
import { EncounterSystem, WildEncounter } from '../encounters/EncounterSystem';
import { PALLET_ROUTE1, TileMapData } from '@/data/maps/pallet-route1';

export class OverworldState implements StateHandler {
  private map: TileMapData;
  private mapRenderer: TileMapRenderer;
  private player: Player;
  private camera: Camera;
  private encounterSystem: EncounterSystem;
  private time = 0;
  private transitionAlpha = 1; // fade in from black
  private onEncounter: (encounter: WildEncounter) => void;

  constructor(
    private input: InputManager,
    canvasWidth: number,
    canvasHeight: number,
    onEncounter: (encounter: WildEncounter) => void
  ) {
    this.map = PALLET_ROUTE1;
    this.mapRenderer = new TileMapRenderer(this.map);
    const tileSize = this.mapRenderer.getTileSize();
    const spawn = this.map.spawns.start;
    this.player = new Player(spawn.x, spawn.y, tileSize);
    this.camera = new Camera(canvasWidth, canvasHeight);
    this.encounterSystem = new EncounterSystem();
    this.onEncounter = onEncounter;
  }

  enter(): void {
    this.transitionAlpha = 1;
  }

  update(dt: number): void {
    this.time += dt;

    // Fade in
    if (this.transitionAlpha > 0) {
      this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 3);
    }

    const arrived = this.player.update(
      dt,
      this.input,
      this.map.layers.collision
    );

    const center = this.player.getCenterPixel();
    this.camera.follow(
      center.x,
      center.y,
      this.mapRenderer.getMapWidthPx(),
      this.mapRenderer.getMapHeightPx()
    );

    if (arrived) {
      const collisionTile =
        this.map.layers.collision[this.player.y]?.[this.player.x] ?? 0;
      if (collisionTile === 2) {
        const encounter = this.encounterSystem.check(this.map);
        if (encounter) {
          this.onEncounter(encounter);
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.mapRenderer.render(ctx, this.camera, this.time);
    this.player.render(ctx, this.camera);

    // Fade overlay
    if (this.transitionAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  exit(): void {
    // nothing to clean up
  }
}
