import { SlashCommandBooleanOption } from 'discord.js';
import { Hero, HeroClass, HeroSkill } from '../types/Hero';
import { EMBED_COLOR_R, EMBED_COLOR_SR, EMBED_COLOR_SSR } from './constants';

export function getAllHeroSkills(hero: Hero): HeroSkill[] {
  const skills: HeroSkill[] = [];
  if (hero.awakeningSkill) skills.push(hero.awakeningSkill);
  if (hero.spHero) skills.push(...hero.spHero.skills);

  const getChildSkills = (heroClass: HeroClass): HeroSkill[] => {
    const childSkills = heroClass.children.flatMap(getChildSkills);
    return [...heroClass.skills, ...childSkills];
  };

  skills.push(...getChildSkills(hero.startingClass));
  return skills;
}

export function getEmbedColorFromRarity(heroRarity: string) {
  switch (heroRarity) {
    case 'SSR':
      return EMBED_COLOR_SSR;
    case 'SR':
      return EMBED_COLOR_SR;
    case 'R':
      return EMBED_COLOR_R;
    case 'N→SSR':
      return EMBED_COLOR_SSR;
    default:
      return 0xffffff;
  }
}

export const ephemeralOptionAdder = (option: SlashCommandBooleanOption) =>
  option
    .setName('ephemeral')
    .setDescription(
      'Whether the bot reply should be visible only to you. Default: true'
    )
    .setRequired(false);
