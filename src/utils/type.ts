import { Hero, ReleasedHero } from '../types/Hero';

export function isReleasedHero(hero: Hero): hero is ReleasedHero {
  return hero.released === true;
}
