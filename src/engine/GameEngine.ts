import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import { StateMachine } from './StateMachine';
import { SpriteLoader } from './SpriteLoader';
import { OverworldState } from './states/OverworldState';
import { BattleState } from './states/BattleState';
import { preloadAllPhase1 } from '@/data/pokeapi';
import { PHASE1_POKEMON_IDS } from '@/data/phase1-pokemon';
import { WildEncounter } from './encounters/EncounterSystem';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: GameLoop;
  private input: InputManager;
  private stateMachine: StateMachine;
  private spriteLoader: SpriteLoader;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    this.input = new InputManager();
    this.stateMachine = new StateMachine();
    this.spriteLoader = new SpriteLoader();

    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
  }

  async init(): Promise<void> {
    // Preload Pokemon data from API
    await preloadAllPhase1();

    // Preload sprites
    await this.spriteLoader.preloadPokemonSprites(PHASE1_POKEMON_IDS);

    // Register states
    const overworld = new OverworldState(
      this.input,
      this.canvas.width,
      this.canvas.height,
      (encounter: WildEncounter) => {
        this.stateMachine.transition('battle', encounter);
      }
    );

    const battle = new BattleState(
      this.input,
      this.spriteLoader,
      this.canvas.width,
      this.canvas.height,
      () => {
        this.stateMachine.transition('overworld');
      }
    );

    this.stateMachine.register('overworld', overworld);
    this.stateMachine.register('battle', battle);
  }

  start(): void {
    this.input.attach(window);
    this.stateMachine.transition('overworld');
    this.gameLoop.start();
  }

  destroy(): void {
    this.gameLoop.stop();
    this.input.detach(window);
  }

  private update(dt: number): void {
    this.stateMachine.update(dt);
    this.input.tick();
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.stateMachine.render(this.ctx);
  }
}
