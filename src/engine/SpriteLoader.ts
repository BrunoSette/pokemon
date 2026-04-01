export class SpriteLoader {
  private cache = new Map<string, HTMLImageElement>();

  async load(url: string): Promise<HTMLImageElement> {
    const cached = this.cache.get(url);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
      img.src = url;
    });
  }

  get(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }

  async preloadPokemonSprites(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.load(`/sprites/${id}.png`);
      await new Promise((r) => setTimeout(r, 50));
      await this.load(`/sprites/back/${id}.png`);
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  static frontSprite(id: number): string {
    return `/sprites/${id}.png`;
  }

  static backSprite(id: number): string {
    return `/sprites/back/${id}.png`;
  }
}
