import { Riddle, DifficultyType } from '../types';

export function getDifficultyPriority(difficulty: DifficultyType): DifficultyType[] {
  switch (difficulty) {
    case 'maestro':
      return ['maestro', 'explorador', 'novato'];
    case 'explorador':
      return ['explorador', 'novato', 'maestro'];
    case 'novato':
    default:
      return ['novato', 'explorador', 'maestro'];
  }
}

/**
 * Regla de dificultad de reserva: si en un punto no hay prueba del nivel elegido,
 * se muestra la más cercana disponible, para que nadie se quede sin prueba.
 */
export function findBestRiddle(
  riddles: Riddle[],
  poiId: string,
  storyId: string,
  userDifficulty: DifficultyType
): Riddle | null {
  const priorities = getDifficultyPriority(userDifficulty);

  // 1. Prioridad: misma historia, dificultad exacta o más cercana
  for (const diff of priorities) {
    const found = riddles.find(
      (r) =>
        r.poiId === poiId &&
        !r.optional &&
        !r.isBonus &&
        (r.storyId === storyId || r.storyId === '*') &&
        (r.difficulty === diff || r.difficulty === '*')
    );
    if (found) return found;
  }

  // 2. Misma historia, cualquier prueba principal disponible
  const sameStory = riddles.find(
    (r) => r.poiId === poiId && !r.optional && !r.isBonus && (r.storyId === storyId || r.storyId === '*')
  );
  if (sameStory) return sameStory;

  // 3. Reserva cruzada: otra historia en ese mismo punto, siguiendo la prioridad de dificultad
  for (const diff of priorities) {
    const found = riddles.find(
      (r) => r.poiId === poiId && !r.optional && !r.isBonus && (r.difficulty === diff || r.difficulty === '*')
    );
    if (found) return found;
  }

  // 4. Cualquier prueba principal asociada a ese POI
  return riddles.find((r) => r.poiId === poiId && !r.optional && !r.isBonus) || null;
}
