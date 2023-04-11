import { SlashCommandBooleanOption } from 'discord.js';
import {
  HeroClass,
  HeroExclusiveEquipment,
  HeroSkill,
  HeroSoldierBonus,
  ReleasedHero,
} from '../types/Hero';
import { EMBED_COLOR_R, EMBED_COLOR_SR, EMBED_COLOR_SSR } from './constants';

export function getAllHeroSkills(hero: ReleasedHero): HeroSkill[] {
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

export const getExclusiveEquipmentText = (ee?: HeroExclusiveEquipment) =>
  ee
    ? `**Name:** ${ee.name}\n**Effect:** ${ee.effect}\n**Slot:** ${ee.slot}`
    : undefined;

export const getMaxStatsOfClass = (
  heroClass: Pick<HeroClass, 'maxStats' | 'name'>
) => `- **${heroClass.name}**: HP: ${heroClass.maxStats?.hp} \
    | ATK: ${heroClass.maxStats?.atk} \
    | DEF: ${heroClass.maxStats?.def} \
    | INT: ${heroClass.maxStats?.int} \
    | MDEF: ${heroClass.maxStats?.mdef} \
    | SKL: ${heroClass.maxStats?.skill}`;

export const getSoldierBonusText = (
  heroClassList: Pick<HeroClass, 'name'>[],
  soldierBonus: HeroSoldierBonus
) => `**${heroClassList.map((c) => c.name).join(' / ')}**: HP: ${
  soldierBonus.hp
} \
  | ATK: ${soldierBonus.atk} \
  | DEF: ${soldierBonus.def} \
  | MDEF: ${soldierBonus.mdef}`;
