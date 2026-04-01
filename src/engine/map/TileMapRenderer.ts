import { TileMapData } from '@/data/maps/pallet-route1';
import { Camera } from './Camera';
import { drawGroundTile, drawObjectTile, drawTallGrass } from './TileColors';

export class TileMapRenderer {
  private scale = 3;
  private renderSize: number;

  constructor(private mapData: TileMapData) {
    this.renderSize = mapData.tileSize * this.scale; // 16 * 3 = 48
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, time: number): void {
    const size = this.renderSize;
    const startCol = Math.max(0, Math.floor(camera.x / size));
    const startRow = Math.max(0, Math.floor(camera.y / size));
    const endCol = Math.min(
      this.mapData.width,
      Math.ceil((camera.x + camera.width) / size) + 1
    );
    const endRow = Math.min(
      this.mapData.height,
      Math.ceil((camera.y + camera.height) / size) + 1
    );

    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const worldX = col * size;
        const worldY = row * size;
        const { x, y } = camera.worldToScreen(worldX, worldY);

        // Ground layer
        const groundTile = this.mapData.layers.ground[row]?.[col] ?? 0;
        drawGroundTile(ctx, groundTile, x, y, size);

        // Tall grass (from collision layer)
        const collisionTile = this.mapData.layers.collision[row]?.[col] ?? 0;
        if (collisionTile === 2) {
          drawTallGrass(ctx, x, y, size, time);
        }

        // Objects layer
        const objectTile = this.mapData.layers.objects[row]?.[col] ?? 0;
        if (objectTile > 0) {
          drawObjectTile(ctx, objectTile, x, y, size);
        }
      }
    }
  }

  getTileSize(): number {
    return this.renderSize;
  }

  getMapWidthPx(): number {
    return this.mapData.width * this.renderSize;
  }

  getMapHeightPx(): number {
    return this.mapData.height * this.renderSize;
  }
}
