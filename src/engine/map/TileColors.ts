// Ground tile colors
export const GROUND_COLORS: Record<number, string> = {
  0: '#7ec850', // grass
  1: '#d4a55a', // dirt path
  2: '#5090d0', // water
  3: '#4a8838', // dark grass
  4: '#d4c090', // sand
  5: '#c8b898', // floor tile
};

// Object colors/renders
export const OBJECT_COLORS: Record<number, { color: string; label?: string }> = {
  6:  { color: '#2d6e2d', label: '🌳' }, // tree
  7:  { color: '#8b6e4e', label: '═' },   // fence
  8:  { color: '#b85040', label: '🏠' },  // house
  9:  { color: '#a0804a', label: '📋' },  // sign
  10: { color: '#e8c040', label: '🌻' },  // flower
  11: { color: '#808080', label: '🪨' },  // rock
};

export function drawGroundTile(
  ctx: CanvasRenderingContext2D,
  tileId: number,
  x: number,
  y: number,
  size: number
): void {
  const color = GROUND_COLORS[tileId] ?? GROUND_COLORS[0];
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);

  // Add subtle pattern for grass
  if (tileId === 0) {
    ctx.fillStyle = '#6db840';
    for (let i = 0; i < 3; i++) {
      const gx = x + ((i * 13 + 5) % size);
      const gy = y + ((i * 17 + 7) % size);
      ctx.fillRect(gx, gy, 2, 4);
    }
  }

  // Water animation hint
  if (tileId === 2) {
    ctx.fillStyle = '#68a8e0';
    ctx.fillRect(x + 4, y + size / 3, size - 8, 2);
    ctx.fillRect(x + 8, y + (size * 2) / 3, size - 16, 2);
  }

  // Floor tile grid
  if (tileId === 5) {
    ctx.strokeStyle = '#b0a080';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
  }
}

export function drawTallGrass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number
): void {
  // Base grass
  ctx.fillStyle = '#5a9e38';
  ctx.fillRect(x, y, size, size);

  // Animated grass blades
  ctx.fillStyle = '#48882c';
  const sway = Math.sin(time * 2 + x * 0.1) * 2;
  for (let i = 0; i < 5; i++) {
    const gx = x + 4 + i * (size / 5);
    const gy = y + size - 14;
    ctx.beginPath();
    ctx.moveTo(gx + sway, gy);
    ctx.lineTo(gx + 4 + sway * 0.5, gy - 12);
    ctx.lineTo(gx + 8, gy);
    ctx.fill();
  }
}

export function drawObjectTile(
  ctx: CanvasRenderingContext2D,
  tileId: number,
  x: number,
  y: number,
  size: number
): void {
  const obj = OBJECT_COLORS[tileId];
  if (!obj) return;

  ctx.fillStyle = obj.color;

  if (tileId === 6) {
    // Tree — trunk + canopy
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + size * 0.35, y + size * 0.5, size * 0.3, size * 0.5);
    ctx.fillStyle = '#2d6e2d';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size * 0.35, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a8a3a';
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y + size * 0.3, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (tileId === 8) {
    // House
    ctx.fillStyle = '#c86050';
    ctx.fillRect(x + 2, y + size * 0.3, size - 4, size * 0.7);
    // Roof
    ctx.fillStyle = '#8b4040';
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.35);
    ctx.lineTo(x + size / 2, y + 2);
    ctx.lineTo(x + size, y + size * 0.35);
    ctx.fill();
    // Window
    ctx.fillStyle = '#80c8f0';
    ctx.fillRect(x + size * 0.3, y + size * 0.45, size * 0.15, size * 0.2);
    ctx.fillRect(x + size * 0.55, y + size * 0.45, size * 0.15, size * 0.2);
    // Door
    ctx.fillStyle = '#5a3020';
    ctx.fillRect(x + size * 0.38, y + size * 0.7, size * 0.24, size * 0.3);
  } else if (tileId === 7) {
    // Fence
    ctx.fillStyle = '#a08060';
    ctx.fillRect(x, y + size * 0.3, size, size * 0.15);
    ctx.fillRect(x, y + size * 0.6, size, size * 0.15);
    // Posts
    ctx.fillRect(x + 2, y + size * 0.2, 4, size * 0.6);
    ctx.fillRect(x + size - 6, y + size * 0.2, 4, size * 0.6);
  } else if (tileId === 9) {
    // Sign
    ctx.fillStyle = '#a08050';
    ctx.fillRect(x + size * 0.25, y + size * 0.5, size * 0.1, size * 0.5);
    ctx.fillStyle = '#d0b878';
    ctx.fillRect(x + size * 0.1, y + size * 0.2, size * 0.8, size * 0.35);
    ctx.strokeStyle = '#806030';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + size * 0.1, y + size * 0.2, size * 0.8, size * 0.35);
  } else if (tileId === 10) {
    // Flower
    ctx.fillStyle = '#40a030';
    ctx.fillRect(x + size * 0.45, y + size * 0.5, 3, size * 0.35);
    const colors = ['#f04040', '#f0e040', '#f070b0', '#4080f0'];
    const fc = colors[(Math.floor(x + y)) % colors.length];
    ctx.fillStyle = fc;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size * 0.4, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0e060';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size * 0.4, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (tileId === 11) {
    // Rock
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.moveTo(x + size * 0.1, y + size * 0.8);
    ctx.lineTo(x + size * 0.25, y + size * 0.2);
    ctx.lineTo(x + size * 0.6, y + size * 0.15);
    ctx.lineTo(x + size * 0.9, y + size * 0.4);
    ctx.lineTo(x + size * 0.85, y + size * 0.8);
    ctx.fill();
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath();
    ctx.moveTo(x + size * 0.25, y + size * 0.2);
    ctx.lineTo(x + size * 0.6, y + size * 0.15);
    ctx.lineTo(x + size * 0.5, y + size * 0.5);
    ctx.fill();
  }
}
