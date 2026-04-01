import { BattlePokemon } from './BattlePokemon';
import { Move } from '@/data/phase1-moves';

export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move
): number {
  const level = attacker.level;
  const power = move.power;
  const atk =
    move.category === 'physical'
      ? attacker.stats.attack
      : attacker.stats.specialAttack;
  const def =
    move.category === 'physical'
      ? defender.stats.defense
      : defender.stats.specialDefense;

  const baseDamage = Math.floor(
    ((2 * level / 5 + 2) * power * atk) / def / 50 + 2
  );

  // STAB (same-type attack bonus)
  const stab = attacker.data.types.includes(move.type) ? 1.5 : 1.0;

  // Random factor 0.85-1.0
  const random = 0.85 + Math.random() * 0.15;

  return Math.max(1, Math.floor(baseDamage * stab * random));
}
