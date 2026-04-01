export type Direction = 'up' | 'down' | 'left' | 'right';

export class InputManager {
  private keys = new Set<string>();
  private bufferedKeys = new Set<string>(); // persists for at least 1 frame
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDown = (e: KeyboardEvent) => {
      this.keys.add(e.key);
      this.bufferedKeys.add(e.key);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key);
    };
  }

  /** Call once per frame to flush the buffer */
  tick(): void {
    this.bufferedKeys.clear();
  }

  attach(target: Window): void {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
  }

  detach(target: Window): void {
    target.removeEventListener('keydown', this.onKeyDown);
    target.removeEventListener('keyup', this.onKeyUp);
  }

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  isConfirm(): boolean {
    return this.isActive('Enter') || this.isActive(' ');
  }

  consumeConfirm(): boolean {
    if (this.isConfirm()) {
      this.keys.delete('Enter');
      this.keys.delete(' ');
      return true;
    }
    return false;
  }

  private isActive(key: string): boolean {
    return this.keys.has(key) || this.bufferedKeys.has(key);
  }

  getDirection(): { x: number; y: number; dir: Direction } | null {
    if (this.isActive('ArrowUp') || this.isActive('w') || this.isActive('W')) {
      return { x: 0, y: -1, dir: 'up' };
    }
    if (this.isActive('ArrowDown') || this.isActive('s') || this.isActive('S')) {
      return { x: 0, y: 1, dir: 'down' };
    }
    if (this.isActive('ArrowLeft') || this.isActive('a') || this.isActive('A')) {
      return { x: -1, y: 0, dir: 'left' };
    }
    if (this.isActive('ArrowRight') || this.isActive('d') || this.isActive('D')) {
      return { x: 1, y: 0, dir: 'right' };
    }
    return null;
  }

  getMenuDirection(): 'up' | 'down' | 'left' | 'right' | null {
    if (this.isActive('ArrowUp') || this.isActive('w') || this.isActive('W')) {
      this.keys.delete('ArrowUp'); this.keys.delete('w'); this.keys.delete('W');
      this.bufferedKeys.delete('ArrowUp'); this.bufferedKeys.delete('w'); this.bufferedKeys.delete('W');
      return 'up';
    }
    if (this.isActive('ArrowDown') || this.isActive('s') || this.isActive('S')) {
      this.keys.delete('ArrowDown'); this.keys.delete('s'); this.keys.delete('S');
      this.bufferedKeys.delete('ArrowDown'); this.bufferedKeys.delete('s'); this.bufferedKeys.delete('S');
      return 'down';
    }
    if (this.isActive('ArrowLeft') || this.isActive('a') || this.isActive('A')) {
      this.keys.delete('ArrowLeft'); this.keys.delete('a'); this.keys.delete('A');
      this.bufferedKeys.delete('ArrowLeft'); this.bufferedKeys.delete('a'); this.bufferedKeys.delete('A');
      return 'left';
    }
    if (this.isActive('ArrowRight') || this.isActive('d') || this.isActive('D')) {
      this.keys.delete('ArrowRight'); this.keys.delete('d'); this.keys.delete('D');
      this.bufferedKeys.delete('ArrowRight'); this.bufferedKeys.delete('d'); this.bufferedKeys.delete('D');
      return 'right';
    }
    return null;
  }
}
