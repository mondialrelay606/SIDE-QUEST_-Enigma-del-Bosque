import { ForestPack } from '../types';
import forestsJson from '../../data/forests.json';

export const SEED_FOREST_PACKS: ForestPack[] = forestsJson as unknown as ForestPack[];
