import { Collection } from 'discord.js';
import { readFile } from 'fs/promises';
import mainLogger from '../lib/logger';
import {
  setHeroes,
  setSkillToHeroes,
  SkillToHeroesCollection,
} from '../lib/storage';
import {
  Hero,
  HeroBondRequirements,
  HeroClass,
  HeroExclusiveEquipment,
  HeroHeartBond,
  HeroSkill,
  HeroSkin,
  HeroSoldierBonus,
  HeroStats,
  HeroTalent,
  SPHeroClass,
  SPHeroUnlockRequirements,
} from '../types/Hero';
import { WIKI_BASE_URL } from './constants';
import { writeFile } from './file';
import { getAllHeroSkills } from './utils';

const logger = mainLogger.child({ module: 'parser' });

/**
 * Parses hero data from the Wikigrisser and caches it in a file.
 * If a cache file exists, it will be used instead of fetching the data again.
 * @param {boolean} [useCache=true] - Whether to use a cache file or fetch the data again.
 * @returns {Promise<void>}
 */
export async function parseHeroes(useCache: boolean = true) {
  if (useCache) {
    try {
      const heroesCacheText = await readFile('data/heroes.json', {
        encoding: 'utf-8',
      }).catch(() => {
        throw new Error('Could not read heroes cache.');
      });
      const heroesCache = JSON.parse(heroesCacheText) as Hero[];
      const heroesCollection = new Collection<string, Hero>();
      const skillToHeroes: SkillToHeroesCollection = new Collection();
      heroesCache.forEach((hero) => {
        heroesCollection.set(hero.code, hero);
        for (const skill of getAllHeroSkills(hero)) {
          skillToHeroes.set(skill.name, [
            ...(skillToHeroes.get(skill.name) || []),
            { code: hero.code, name: hero.name },
          ]);
        }
      });
      setHeroes(heroesCollection);
      setSkillToHeroes(skillToHeroes);
      return;
    } catch (error) {
      logger.error(
        error,
        'Error while reading heroes cache, parsing heroes instead.'
      );
    }
  }

  const res = await fetch(
    `${WIKI_BASE_URL}/_next/data/uTXyKG2OXH0L4envim6Nj/heroes/gallery.json`
  );
  if (!res.ok) {
    throw new Error('Error while fetching hero data');
  }
  const data = await res.json();
  const heroNames = Object.keys(data.pageProps.heroes);
  const parsedHeroes = await Promise.all(
    heroNames.map((name) =>
      fetch(
        `${WIKI_BASE_URL}/_next/data/uTXyKG2OXH0L4envim6Nj/heroes/${encodeURI(
          name
        )}.json`
      ).then((res) => ({ name, res }))
    )
  );

  const heroes: Collection<string, Hero> = new Collection();
  const skillToHeroes: SkillToHeroesCollection = new Collection();
  for (const parsedHero of parsedHeroes) {
    const { name, res } = parsedHero;
    if (!res.ok) {
      logger.error(`Error while fetching data for "${name}".`);
      continue;
    }
    const hero = (await res.json()).pageProps.heroData;

    const hasErrors = checkErrors(hero, name);
    if (hasErrors) {
      logger.error(
        `Error while validating data for "${name}", check debug logs for more info".`
      );
      continue;
    }

    try {
      const h = parseHero(hero);
      for (const skill of getAllHeroSkills(h)) {
        skillToHeroes.set(skill.name, [
          ...(skillToHeroes.get(skill.name) || []),
          { code: hero.code, name: hero.name },
        ]);
      }
      heroes.set(hero.name, h);
    } catch (error) {
      logger.error(error, `Unexpected error while parsing data for "${name}".`);
    }
  }
  setHeroes(heroes);
  setSkillToHeroes(skillToHeroes);
  writeFile('data/heroes.json', JSON.stringify(heroes.toJSON(), undefined, 2))
    .then(() => logger.info(`${heroes.size} heroes are cached.`))
    .catch((error) =>
      logger.error(error, 'Error while updating heroes cache.')
    );
}

function parseHero(hero: any): Hero {
  let awakeningSkill: HeroSkill | undefined;
  if (hero.threeCostSkill) {
    awakeningSkill = {
      name: hero.threeCostSkill.name,
      description: hero.threeCostSkill.description,
      cost: hero.threeCostSkill.cost,
      cd: hero.threeCostSkill.cd,
      range: hero.threeCostSkill.range,
      span: hero.threeCostSkill.span,
    };
  }

  const startingClass: HeroClass = parseStartingClass(
    hero.startingClass,
    hero.prettyName
  );

  const talent: HeroTalent = {
    name: hero.talent.name,
    description: hero.talent.description,
  };

  const bondRequirements: HeroBondRequirements = {
    bond2: hero.bondRequirments.bond2,
    bond3: hero.bondRequirments.bond3,
    bond4: hero.bondRequirments.bond4,
    bond5: hero.bondRequirments.bond5,
    bond4Hero: hero.bondRequirments.bond4Char ?? undefined,
    bond5Hero: hero.bondRequirments.bond5Char ?? undefined,
    relatedBonds: hero.bondRequirments.relatedBonds.map((h: any) => ({
      name: h.prettyName,
      code: h.name,
      text: h.text,
      type: h.type,
    })),
  };

  let exclusiveEquipment: HeroExclusiveEquipment | undefined;
  if (
    hero.exclusiveEquipment &&
    hero.exclusiveEquipment.name &&
    hero.exclusiveEquipment.effect &&
    hero.exclusiveEquipment.slot
  ) {
    exclusiveEquipment = {
      name: hero.exclusiveEquipment.name,
      effect: hero.exclusiveEquipment.effect,
      slot: hero.exclusiveEquipment.slot,
    };
  }

  const skins: HeroSkin[] = [];
  if (hero.skins) {
    for (const skin of hero.skins) {
      if (!skin.name || !skin.index || !skin.source) continue;
      const skinIndex = skin.index.match(/\d+/);
      if (!skinIndex) continue;
      const skinIndexNumber = +skinIndex[0];
      skins.push({
        name: skin.name,
        cost: skin.cost ? skin.cost.toString() : undefined,
        index: skinIndexNumber,
        source: skin.source,
        notes: skin.notes ?? undefined,
      });
    }
  }

  let heartBond: HeroHeartBond | undefined;
  if (hero.heartBond && hero.heartBond.lvl4 && hero.heartBond.lvl7) {
    heartBond = {
      lv4: hero.heartBond.lvl4,
      lv7: hero.heartBond.lvl7,
    };
  }

  let spHero: SPHeroClass | undefined;
  if (hero.spClass) {
    spHero = parseSpClass(hero.spClass, hero.prettyName);
  }

  return {
    code: hero.name,
    name: hero.prettyName,
    rarity: hero.rarity,
    awakeningSkill,
    startingClass,
    talent,
    bondRequirements,
    factions: hero.factions,
    exclusiveEquipment,
    soldierBonus: hero.soldierBonus,
    skins,
    heartBond,
    spHero,
  };
}

function parseSpClass(spObj: any, heroName: string): SPHeroClass {
  const base = parseStartingClass(spObj, heroName);

  const unlockRequirements: SPHeroUnlockRequirements = {
    stage1: spObj.unlockRequirments.stage1.map((x: any) => ({
      name: x.name ?? '???',
      requirement: x.requirement ?? '???',
    })),
    stage2: spObj.unlockRequirments.stage2.map((x: any) => ({
      name: x.name ?? '???',
      requirement: x.requirement ?? '???',
    })),
  };

  const talent: HeroTalent = {
    name: spObj.talent.name ?? '???',
    description: spObj.talent.description ?? '???',
  };

  const soldierBonus: HeroSoldierBonus = {
    atk: +spObj.soldierBonus.atk,
    def: +spObj.soldierBonus.def,
    hp: +spObj.soldierBonus.hp,
    mdef: +spObj.soldierBonus.mdef,
  };

  return {
    ...base,
    unlockRequirements,
    talent,
    soldierBonus,
  };
}

function parseStartingClass(heroClass: any, heroName: string): HeroClass {
  const children: HeroClass[] = [];
  for (const child of heroClass.children) {
    children.push(parseStartingClass(child, heroName));
  }
  const heroSkills = heroClass.skills
    .filter((s: any) => s)
    .map((skill: any) => ({
      name: skill.name,
      description: skill.description,
      span: skill.span ? skill.span.toString() : '-',
      range: skill.range ? skill.range.toString() : '-',
      cd: skill.cd ? skill.cd.toString() : '-',
      cost: skill.cost ? skill.cost.toString() : '-',
    }));
  let maxStats: HeroStats | undefined;
  if (heroClass.maxStats) {
    maxStats = {
      hp: heroClass.maxStats.hp,
      atk: heroClass.maxStats.atk,
      def: heroClass.maxStats.def,
      int: heroClass.maxStats.int,
      mdef: heroClass.maxStats.mdef,
      skill: heroClass.maxStats.skill,
    };
  }
  return {
    name: heroClass.name,
    skills: heroSkills,
    soldiers: heroClass.soldiers as string[],
    type: heroClass.heroType ?? '-',
    maxStats,
    children,
  };
}

function checkErrors(hero: any, name: string): boolean {
  if (!hero) {
    logger.debug(`Hero ${name} is undefined.`);
    return true;
  }
  if (!hero.name) {
    logger.debug(`Hero ${name} has no "name".`);
    return true;
  }
  if (!hero.prettyName) {
    logger.debug(`Hero ${name} has no "prettyName".`);
    return true;
  }
  if (!hero.rarity) {
    logger.debug(`Hero ${name} has no "rarity".`);
    return true;
  }

  // Validate awakening skill
  if (hero.threeCostSkill && validateSkill(hero.threeCostSkill, name))
    return true;

  // Validate Talent
  if (!hero.talent?.description && !hero.talent?.name) {
    logger.debug(`Hero ${name} has invalid "talent".`);
    return true;
  }

  // Validate starting class
  if (validateClass(hero.startingClass, name)) return true;

  // Validate bond requirements
  if (hero.bondRequirments && typeof hero.bondRequirments !== 'object') {
    if (validateBondRequirements(hero.bondRequirments, name)) return true;
    return false;
  }

  // Validate factions
  if (!Array.isArray(hero.factions)) {
    logger.debug(`Hero ${name} has invalid "factions".`);
    return true;
  }
  for (const faction of hero.factions) {
    if (typeof faction !== 'string') {
      logger.debug(`Hero ${name} has "factions" array with invalid values.`);
      return true;
    }
  }

  // Validate soldier bonus
  if (typeof hero.soldierBonus !== 'object') {
    logger.debug(`Hero ${name} has invalid "soldierBonus".`);
    return true;
  }
  if (
    typeof hero.soldierBonus.hp !== 'number' ||
    typeof hero.soldierBonus.atk !== 'number' ||
    typeof hero.soldierBonus.def !== 'number' ||
    typeof hero.soldierBonus.mdef !== 'number'
  ) {
    logger.debug(`Hero ${name} has invalid "soldierBonus" values.`);
    return true;
  }

  return false;
}

function validateBondRequirements(bondObj: any, heroName: string): boolean {
  if (typeof bondObj.bond2 !== 'string') {
    logger.debug(`Hero ${heroName} has invalid "bondRequirments.bond2".`);
    return true;
  }
  if (typeof bondObj.bond3 !== 'string') {
    logger.debug(`Hero ${heroName} has invalid "bondRequirments.bond3".`);
    return true;
  }
  if (typeof bondObj.bond4 !== 'string') {
    logger.debug(`Hero ${heroName} has invalid "bondRequirments.bond4".`);
    return true;
  }
  if (typeof bondObj.bond5 !== 'string') {
    logger.debug(`Hero ${heroName} has invalid "bondRequirments.bond5".`);
    return true;
  }
  if (!Array.isArray(bondObj.relatedBonds)) {
    logger.debug(
      `Hero ${heroName} has invalid "bondRequirments.relatedBonds".`
    );
    return true;
  }
  return false;
}

function validateClass(
  classObj: any,
  heroName: string,
  child: boolean = false
): boolean {
  if (!classObj || typeof classObj !== 'object') {
    if (child)
      logger.debug(`Hero ${heroName} has invalid child of "startingClass".`);
    else logger.debug(`Hero ${heroName} has invalid "startingClass".`);
    return true;
  }
  if (!classObj.name) {
    logger.debug(`Hero ${heroName} has no "startingClass.name".`);
    return true;
  }
  if (!classObj.children || !Array.isArray(classObj.children)) {
    if (child)
      logger.debug(
        `Hero ${heroName} has no "startingClass.$child.children" array`
      );
    else
      logger.debug(`Hero ${heroName} has no "startingClass.children" array.`);
    return true;
  }
  if (classObj.maxStats) {
    if (
      validateStats(
        classObj.maxStats,
        heroName,
        child ? 'startingClass.$child.maxStats' : 'startingClass.maxStats'
      )
    )
      return true;
  }
  for (const child of classObj.children) {
    if (validateClass(child, heroName, true)) return true;
  }
  return false;
}

function validateStats(
  heroStats: any,
  name: string,
  property: string
): boolean {
  if (!heroStats || typeof heroStats !== 'object') {
    logger.debug(`Hero ${name} has no "${property}".`);
    return true;
  }
  if (!heroStats.atk) {
    logger.debug(`Hero ${name} has no "${property}.atk".`);
    return true;
  }
  if (!heroStats.def) {
    logger.debug(`Hero ${name} has no "${property}.def".`);
    return true;
  }
  if (!heroStats.hp) {
    logger.debug(`Hero ${name} has no "${property}.hp".`);
    return true;
  }
  if (!heroStats.int) {
    logger.debug(`Hero ${name} has no "${property}.int".`);
    return true;
  }
  if (!heroStats.mdef) {
    logger.debug(`Hero ${name} has no "${property}.mdef".`);
    return true;
  }
  if (!heroStats.skill) {
    logger.debug(`Hero ${name} has no "${property}.skill".`);
    return true;
  }
  return false;
}

function validateSkill(skillObj: any, heroName: string): boolean {
  if (!skillObj || typeof skillObj !== 'object') {
    logger.debug(`Hero ${heroName} has invalid "threeCostSkill".`);
    return true;
  }
  if (!skillObj.cd) {
    logger.debug(`Hero ${heroName} has no "threeCostSkill.cd".`);
    return true;
  }
  if (!skillObj.cost) {
    logger.debug(`Hero ${heroName} has no "threeCostSkill.cost".`);
    return true;
  }
  if (!skillObj.description) {
    logger.debug(`Hero ${heroName} has no "threeCostSkill.description".`);
    return true;
  }
  if (!skillObj.name) {
    logger.debug(`Hero ${heroName} has no "threeCostSkill.name".`);
    return true;
  }
  if (!skillObj.range) {
    logger.debug(`Hero ${heroName} has no "threeCostSkill.range".`);
    return true;
  }
  if (!skillObj.span) {
    logger.debug(`Hero ${heroName} has no "threeCostSkill.span".`);
    return true;
  }
  return false;
}
