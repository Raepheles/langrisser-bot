import {
  WIKI_HEROES_URL,
  WIKI_HERO_CARDS_URL,
  WIKI_SKILLS_URL,
} from './constants';

export function getHeroWikiUrl(heroCode: string) {
  const encodedHeroCode = encodeURIComponent(heroCode);
  return `${WIKI_HEROES_URL}/${encodedHeroCode}`;
}

export function getHeroThumbnailUrl(heroName: string) {
  const encodedHeroName = encodeURIComponent(heroName);
  return `${WIKI_HERO_CARDS_URL}/${encodedHeroName}.png`;
}

export function getSkillThumbnailUrl(skillName: string) {
  const encodedSkillName = encodeURIComponent(skillName);
  return `${WIKI_SKILLS_URL}/${encodedSkillName}.png`;
}

export function getHeroImageUrl(heroName: string, imageName?: string) {
  const encodedHeroName = encodeURIComponent(heroName);
  const encodedImageName = imageName
    ? encodeURIComponent(`${heroName} ${imageName}`)
    : encodedHeroName;
  return `${WIKI_HEROES_URL}/${encodedHeroName}/${encodedImageName}.png`;
}
