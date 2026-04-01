import { BattlePokemon } from './BattlePokemon';

export interface CaptureResult {
  success: boolean;
  shakes: number; // 0-3
}

export function attemptCapture(wildPokemon: BattlePokemon): CaptureResult {
  const catchRate = wildPokemon.data.catchRate;
  const hpFactor =
    (3 * wildPokemon.maxHp - 2 * wildPokemon.currentHp) /
    (3 * wildPokemon.maxHp);
  const ballBonus = 1; // Pokeball = 1

  const modifiedRate = Math.min(255, catchRate * hpFactor * ballBonus);
  const shakeProbability = Math.floor(
    1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, modifiedRate)))
  );

  let shakes = 0;
  for (let i = 0; i < 3; i++) {
    if (Math.random() * 65536 < shakeProbability) {
      shakes++;
    } else {
      break;
    }
  }

  return { success: shakes === 3, shakes };
}
