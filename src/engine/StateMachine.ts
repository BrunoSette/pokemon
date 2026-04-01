export type GameStateType = 'overworld' | 'battle' | 'transition';

export interface StateHandler {
  enter(context?: unknown): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  exit(): void;
}

export class StateMachine {
  private states = new Map<GameStateType, StateHandler>();
  private current: GameStateType | null = null;

  register(name: GameStateType, handler: StateHandler): void {
    this.states.set(name, handler);
  }

  transition(to: GameStateType, context?: unknown): void {
    if (this.current) {
      this.states.get(this.current)?.exit();
    }
    this.current = to;
    this.states.get(to)?.enter(context);
  }

  update(dt: number): void {
    if (this.current) {
      this.states.get(this.current)?.update(dt);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.current) {
      this.states.get(this.current)?.render(ctx);
    }
  }

  getCurrentState(): GameStateType | null {
    return this.current;
  }
}
