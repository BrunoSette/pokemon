import { StateHandler } from '../StateMachine';
import { InputManager } from '../InputManager';
import { SpriteLoader } from '../SpriteLoader';
import { BattlePokemon, createBattlePokemon } from '../battle/BattlePokemon';
import { BattleRenderer } from '../battle/BattleRenderer';
import { calculateDamage } from '../battle/damage';
import { attemptCapture, CaptureResult } from '../battle/CaptureSystem';
import { WildEncounter } from '../encounters/EncounterSystem';
import { PokemonData, getCachedPokemon } from '@/data/pokeapi';
import { getMoveForPokemon } from '@/data/phase1-moves';
import { gameStore } from '@/stores/gameStore';
import { OwnedPokemon } from '../state/GameSaveState';

type BattlePhase =
  | 'intro'
  | 'menu'
  | 'player-attack'
  | 'enemy-attack'
  | 'capture-anim'
  | 'capture-result'
  | 'victory'
  | 'defeat'
  | 'run';

export class BattleState implements StateHandler {
  private playerPokemon!: BattlePokemon;
  private wildPokemon!: BattlePokemon;
  private renderer: BattleRenderer;
  private phase: BattlePhase = 'intro';
  private menuIndex = 0;
  private messages: string[] = [];
  private phaseTimer = 0;
  private playerSprite: HTMLImageElement | null = null;
  private wildSprite: HTMLImageElement | null = null;
  private captureResult: CaptureResult | null = null;
  private captureShakeTimer = 0;
  private captureCurrentShake = 0;
  private onBattleEnd: () => void;
  private menuOptions = ['FIGHT', 'BAG', 'POKéMON', 'RUN'];

  constructor(
    private input: InputManager,
    private spriteLoader: SpriteLoader,
    canvasWidth: number,
    canvasHeight: number,
    onBattleEnd: () => void
  ) {
    this.renderer = new BattleRenderer(canvasWidth, canvasHeight);
    this.onBattleEnd = onBattleEnd;
  }

  enter(context?: unknown): void {
    const encounter = context as WildEncounter;
    this.renderer.resetAnimatedHp();
    this.menuIndex = 0;
    this.messages = [];
    this.captureResult = null;
    this.captureCurrentShake = 0;

    // Build wild pokemon
    const wildData = getCachedPokemon(encounter.pokemonId);
    if (!wildData) {
      this.onBattleEnd();
      return;
    }
    this.wildPokemon = createBattlePokemon(wildData, encounter.level, false);

    // Build player pokemon from party
    const state = gameStore.getState();
    const partyPokemon = state.player.party[0];
    if (!partyPokemon) {
      this.onBattleEnd();
      return;
    }
    const playerData = getCachedPokemon(partyPokemon.pokemonId);
    if (!playerData) {
      this.onBattleEnd();
      return;
    }
    this.playerPokemon = createBattlePokemon(
      playerData,
      partyPokemon.level,
      true,
      partyPokemon.currentHp
    );

    // Mark as seen
    gameStore.markSeen(encounter.pokemonId);

    // Load sprites
    const frontUrl = SpriteLoader.frontSprite(encounter.pokemonId);
    const backUrl = SpriteLoader.backSprite(partyPokemon.pokemonId);
    this.wildSprite = this.spriteLoader.get(frontUrl) ?? null;
    this.playerSprite = this.spriteLoader.get(backUrl) ?? null;

    // Async load if not cached
    if (!this.wildSprite) {
      this.spriteLoader.load(frontUrl).then((img) => (this.wildSprite = img));
    }
    if (!this.playerSprite) {
      this.spriteLoader.load(backUrl).then((img) => (this.playerSprite = img));
    }

    this.phase = 'intro';
    this.phaseTimer = 0;
    this.messages = [
      `A wild ${wildData.name.toUpperCase()} appeared!`,
    ];
  }

  update(dt: number): void {
    this.phaseTimer += dt;
    this.renderer.updateAnimatedHp(this.playerPokemon, this.wildPokemon, dt);

    switch (this.phase) {
      case 'intro':
        if (this.phaseTimer > 1.5 || this.input.consumeConfirm()) {
          this.phase = 'menu';
          this.phaseTimer = 0;
          this.messages = ['What will you do?'];
        }
        break;

      case 'menu':
        this.handleMenuInput();
        break;

      case 'player-attack':
        if (this.phaseTimer > 1.2 || this.input.consumeConfirm()) {
          if (this.wildPokemon.currentHp <= 0) {
            this.phase = 'victory';
            this.phaseTimer = 0;
            this.messages = [
              `Wild ${this.wildPokemon.data.name.toUpperCase()} fainted!`,
              'You won!',
            ];
          } else {
            this.doEnemyAttack();
          }
        }
        break;

      case 'enemy-attack':
        if (this.phaseTimer > 1.2 || this.input.consumeConfirm()) {
          if (this.playerPokemon.currentHp <= 0) {
            this.phase = 'defeat';
            this.phaseTimer = 0;
            this.messages = [
              `${this.playerPokemon.data.name.toUpperCase()} fainted!`,
            ];
          } else {
            this.phase = 'menu';
            this.phaseTimer = 0;
            this.messages = ['What will you do?'];
          }
        }
        break;

      case 'capture-anim':
        this.updateCaptureAnimation(dt);
        break;

      case 'capture-result':
        if (this.phaseTimer > 1.5 || this.input.consumeConfirm()) {
          if (this.captureResult?.success) {
            this.addPokemonToParty();
            this.onBattleEnd();
          } else {
            this.doEnemyAttack();
          }
        }
        break;

      case 'victory':
        if (this.phaseTimer > 2 || this.input.consumeConfirm()) {
          this.syncPlayerHp();
          this.onBattleEnd();
        }
        break;

      case 'defeat':
        if (this.phaseTimer > 2 || this.input.consumeConfirm()) {
          // Heal party and return to overworld
          gameStore.healParty();
          this.onBattleEnd();
        }
        break;

      case 'run':
        if (this.phaseTimer > 1 || this.input.consumeConfirm()) {
          this.syncPlayerHp();
          this.onBattleEnd();
        }
        break;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    this.renderer.renderBackground(ctx);
    this.renderer.renderPokemonSprites(ctx, this.playerSprite, this.wildSprite);

    // HP bars
    if (this.wildPokemon) {
      this.renderer.renderHpBar(
        ctx,
        20,
        12,
        w * 0.42,
        this.wildPokemon,
        this.wildPokemon.currentHp / this.wildPokemon.maxHp
      );
    }
    if (this.playerPokemon) {
      this.renderer.renderHpBar(
        ctx,
        w * 0.53,
        h * 0.52,
        w * 0.42,
        this.playerPokemon,
        this.playerPokemon.currentHp / this.playerPokemon.maxHp,
        true
      );
    }

    // Type tags for wild pokemon
    if (this.wildPokemon) {
      let tagX = 24;
      for (const type of this.wildPokemon.data.types) {
        this.renderer.renderTypeTag(ctx, type, tagX, 68);
        tagX += 70;
      }
    }

    // Capture animation pokeball
    if (this.phase === 'capture-anim' || this.phase === 'capture-result') {
      const shakeAngle =
        this.phase === 'capture-anim'
          ? Math.sin(this.captureShakeTimer * 8) * 0.3
          : 0;
      this.renderer.renderPokeball(ctx, w * 0.62, h * 0.2, 40, shakeAngle);
    }

    // Bottom panel
    if (this.phase === 'menu') {
      const pokeballs = gameStore.getState().player.bag.pokeballs;
      this.renderer.renderMenu(ctx, this.menuOptions, this.menuIndex, pokeballs);
    } else {
      this.renderer.renderBattleLog(ctx, this.messages);
    }
  }

  exit(): void {
    // cleanup
  }

  private handleMenuInput(): void {
    const dir = this.input.getMenuDirection();
    if (dir === 'up' && this.menuIndex >= 2) this.menuIndex -= 2;
    if (dir === 'down' && this.menuIndex < 2) this.menuIndex += 2;
    if (dir === 'left' && this.menuIndex % 2 === 1) this.menuIndex -= 1;
    if (dir === 'right' && this.menuIndex % 2 === 0 && this.menuIndex < 3)
      this.menuIndex += 1;

    if (this.input.consumeConfirm()) {
      switch (this.menuIndex) {
        case 0: // FIGHT
          this.doPlayerAttack();
          break;
        case 1: // BAG
          this.doCapture();
          break;
        case 2: // POKEMON (not implemented in Phase 1)
          this.messages = ['No other Pokémon available!'];
          break;
        case 3: // RUN
          this.phase = 'run';
          this.phaseTimer = 0;
          this.messages = ['Got away safely!'];
          break;
      }
    }
  }

  private doPlayerAttack(): void {
    const move = this.playerPokemon.move;
    const damage = calculateDamage(this.playerPokemon, this.wildPokemon, move);
    this.wildPokemon.currentHp = Math.max(
      0,
      this.wildPokemon.currentHp - damage
    );

    this.phase = 'player-attack';
    this.phaseTimer = 0;
    this.messages = [
      `${this.playerPokemon.data.name.toUpperCase()} used ${move.name}!`,
      `It dealt ${damage} damage!`,
    ];
  }

  private doEnemyAttack(): void {
    const move = this.wildPokemon.move;
    const damage = calculateDamage(this.wildPokemon, this.playerPokemon, move);
    this.playerPokemon.currentHp = Math.max(
      0,
      this.playerPokemon.currentHp - damage
    );

    this.phase = 'enemy-attack';
    this.phaseTimer = 0;
    this.messages = [
      `Wild ${this.wildPokemon.data.name.toUpperCase()} used ${move.name}!`,
      `It dealt ${damage} damage!`,
    ];
  }

  private doCapture(): void {
    const hasBall = gameStore.usePokeball();
    if (!hasBall) {
      this.messages = ["You don't have any Pokéballs!"];
      return;
    }

    this.captureResult = attemptCapture(this.wildPokemon);
    this.captureCurrentShake = 0;
    this.captureShakeTimer = 0;
    this.phase = 'capture-anim';
    this.phaseTimer = 0;
    this.messages = ['You threw a Pokéball!'];
  }

  private updateCaptureAnimation(dt: number): void {
    if (!this.captureResult) return;

    this.captureShakeTimer += dt;

    // Each shake takes 0.6 seconds
    const targetShake = Math.min(
      this.captureResult.shakes,
      Math.floor(this.captureShakeTimer / 0.6)
    );

    if (targetShake > this.captureCurrentShake) {
      this.captureCurrentShake = targetShake;
    }

    // Animation complete
    const totalAnimTime =
      (this.captureResult.shakes + 1) * 0.6 + 0.3;
    if (this.captureShakeTimer >= totalAnimTime) {
      this.phase = 'capture-result';
      this.phaseTimer = 0;

      if (this.captureResult.success) {
        this.messages = [
          `Gotcha! ${this.wildPokemon.data.name.toUpperCase()} was caught!`,
        ];
      } else {
        this.messages = [
          `Oh no! The Pokémon broke free!`,
          `(${this.captureResult.shakes}/3 shakes)`,
        ];
      }
    }
  }

  private addPokemonToParty(): void {
    const owned: OwnedPokemon = {
      pokemonId: this.wildPokemon.data.id,
      nickname: null,
      level: this.wildPokemon.level,
      currentHp: this.wildPokemon.currentHp,
      maxHp: this.wildPokemon.maxHp,
      stats: { ...this.wildPokemon.stats },
      move: getMoveForPokemon(this.wildPokemon.data.id),
    };
    gameStore.addToParty(owned);
  }

  private syncPlayerHp(): void {
    gameStore.updatePartyPokemon(0, {
      currentHp: this.playerPokemon.currentHp,
    });
  }
}
