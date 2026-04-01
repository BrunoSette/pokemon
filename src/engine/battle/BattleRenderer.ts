import { BattlePokemon } from './BattlePokemon';

const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  grass: '#78c850',
  electric: '#f8d030',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

export class BattleRenderer {
  private canvasWidth: number;
  private canvasHeight: number;
  private animatedPlayerHp = 1;
  private animatedWildHp = 1;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  updateAnimatedHp(
    playerPokemon: BattlePokemon,
    wildPokemon: BattlePokemon,
    dt: number
  ): void {
    const targetPlayerHp = playerPokemon.currentHp / playerPokemon.maxHp;
    const targetWildHp = wildPokemon.currentHp / wildPokemon.maxHp;
    const speed = 2;
    this.animatedPlayerHp += (targetPlayerHp - this.animatedPlayerHp) * speed * dt;
    this.animatedWildHp += (targetWildHp - this.animatedWildHp) * speed * dt;

    if (Math.abs(this.animatedPlayerHp - targetPlayerHp) < 0.01) {
      this.animatedPlayerHp = targetPlayerHp;
    }
    if (Math.abs(this.animatedWildHp - targetWildHp) < 0.01) {
      this.animatedWildHp = targetWildHp;
    }
  }

  resetAnimatedHp(): void {
    this.animatedPlayerHp = 1;
    this.animatedWildHp = 1;
  }

  renderBackground(ctx: CanvasRenderingContext2D): void {
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#88c8e8');
    skyGrad.addColorStop(1, '#c8e8f8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Ground
    const groundGrad = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.7);
    groundGrad.addColorStop(0, '#90d060');
    groundGrad.addColorStop(1, '#68a838');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.5, w, h * 0.2);

    // Enemy platform
    ctx.fillStyle = '#78b848';
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h * 0.42, w * 0.2, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#60a030';
    ctx.beginPath();
    ctx.ellipse(w * 0.7, h * 0.43, w * 0.2, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player platform
    ctx.fillStyle = '#78b848';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.63, w * 0.22, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#60a030';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.64, w * 0.22, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPokemonSprites(
    ctx: CanvasRenderingContext2D,
    playerSprite: HTMLImageElement | null,
    wildSprite: HTMLImageElement | null
  ): void {
    const w = this.canvasWidth;
    const h = this.canvasHeight;

    ctx.imageSmoothingEnabled = false;

    // Wild Pokemon (front sprite, top-right)
    if (wildSprite) {
      ctx.drawImage(wildSprite, w * 0.55, h * 0.08, w * 0.28, w * 0.28);
    }

    // Player Pokemon (back sprite, bottom-left)
    if (playerSprite) {
      ctx.drawImage(playerSprite, w * 0.08, h * 0.32, w * 0.32, w * 0.32);
    }

    ctx.imageSmoothingEnabled = true;
  }

  renderHpBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    pokemon: BattlePokemon,
    animatedRatio: number,
    showXp: boolean = false
  ): void {
    const barHeight = 14;
    const padding = 10;
    const boxHeight = showXp ? 70 : 55;

    // Info box background
    ctx.fillStyle = '#2a3040';
    ctx.strokeStyle = '#f8d030';
    ctx.lineWidth = 2;
    this.roundRect(ctx, x, y, width, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Name and level
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(
      pokemon.data.name.toUpperCase(),
      x + padding,
      y + 20
    );
    ctx.fillStyle = '#f8d030';
    ctx.font = '12px monospace';
    ctx.fillText(`Lv${pokemon.level}`, x + width - 50, y + 20);

    // HP bar background
    const barX = x + padding;
    const barY = y + 28;
    const barW = width - padding * 2;
    ctx.fillStyle = '#404050';
    this.roundRect(ctx, barX, barY, barW, barHeight, 4);
    ctx.fill();

    // HP bar fill
    const hpRatio = Math.max(0, animatedRatio);
    const fillColor =
      hpRatio > 0.5 ? '#48d048' : hpRatio > 0.2 ? '#f8c030' : '#f04040';
    ctx.fillStyle = fillColor;
    if (hpRatio > 0) {
      this.roundRect(ctx, barX, barY, barW * hpRatio, barHeight, 4);
      ctx.fill();
    }

    // HP text
    ctx.fillStyle = '#ccc';
    ctx.font = '11px monospace';
    ctx.fillText(
      `${Math.max(0, pokemon.currentHp)}/${pokemon.maxHp}`,
      barX + barW - 70,
      barY + barHeight + 14
    );

    // HP label
    ctx.fillStyle = '#f8d030';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('HP', barX, barY + barHeight + 14);
  }

  renderMenu(
    ctx: CanvasRenderingContext2D,
    options: string[],
    selectedIndex: number,
    pokeballs: number
  ): void {
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const menuY = h * 0.72;
    const menuH = h * 0.28;

    // Menu background
    ctx.fillStyle = '#1a2030';
    ctx.strokeStyle = '#f8d030';
    ctx.lineWidth = 3;
    ctx.fillRect(0, menuY, w, menuH);
    ctx.strokeRect(1, menuY, w - 2, menuH);

    // Options in 2x2 grid
    const cols = 2;
    const optionW = (w - 40) / cols;
    const optionH = (menuH - 30) / 2;
    const icons = ['⚔️', '🎒', '🔴', '🏃'];

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = 20 + col * optionW;
      const oy = menuY + 12 + row * optionH;

      // Selected highlight
      if (i === selectedIndex) {
        ctx.fillStyle = '#f8d030';
        this.roundRect(ctx, ox - 4, oy - 2, optionW - 8, optionH - 6, 6);
        ctx.fill();
        ctx.fillStyle = '#1a2030';
      } else {
        ctx.fillStyle = '#2a3a50';
        this.roundRect(ctx, ox - 4, oy - 2, optionW - 8, optionH - 6, 6);
        ctx.fill();
        ctx.fillStyle = '#fff';
      }

      ctx.font = 'bold 16px monospace';
      const icon = icons[i] || '';
      ctx.fillText(`${icon} ${opt}`, ox + 8, oy + optionH / 2 - 2);

      // Show pokeball count on BAG
      if (opt === 'BAG' && i !== selectedIndex) {
        ctx.fillStyle = '#aaa';
        ctx.font = '11px monospace';
        ctx.fillText(`x${pokeballs}`, ox + optionW - 50, oy + optionH / 2 - 2);
      }
    });
  }

  renderBattleLog(ctx: CanvasRenderingContext2D, messages: string[]): void {
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    const logY = h * 0.72;
    const logH = h * 0.28;

    // Log background
    ctx.fillStyle = '#1a2030';
    ctx.strokeStyle = '#f8d030';
    ctx.lineWidth = 3;
    ctx.fillRect(0, logY, w, logH);
    ctx.strokeRect(1, logY, w - 2, logH);

    // Messages
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    const displayMessages = messages.slice(-3);
    displayMessages.forEach((msg, i) => {
      ctx.fillText(msg, 20, logY + 30 + i * 24);
    });

    // "Press ENTER" prompt
    ctx.fillStyle = '#f8d030';
    ctx.font = '12px monospace';
    ctx.fillText('▶ Press ENTER', w - 150, logY + logH - 15);
  }

  renderPokeball(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    shakeAngle: number = 0
  ): void {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(shakeAngle);

    // Top half (red)
    ctx.fillStyle = '#f04040';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, Math.PI, 0);
    ctx.fill();

    // Bottom half (white)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI);
    ctx.fill();

    // Center line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2, 0);
    ctx.stroke();

    // Center button
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderTypeTag(
    ctx: CanvasRenderingContext2D,
    type: string,
    x: number,
    y: number
  ): void {
    const color = TYPE_COLORS[type] || '#888';
    const text = type.toUpperCase();
    ctx.font = 'bold 10px monospace';
    const textWidth = ctx.measureText(text).width;
    const padX = 6;
    const padY = 3;

    ctx.fillStyle = color;
    this.roundRect(ctx, x, y, textWidth + padX * 2, 16, 3);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.fillText(text, x + padX, y + 12);
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
