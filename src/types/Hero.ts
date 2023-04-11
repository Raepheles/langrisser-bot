export interface HeroRelatedBond {
  name: string;
  code: string;
  text: string;
  type: string;
}

export interface HeroBondRequirements {
  bond2: string;
  bond3: string;
  bond4: string;
  bond5: string;
  bond4Hero?: string;
  bond5Hero?: string;
  relatedBonds: HeroRelatedBond[];
}

export interface HeroExclusiveEquipment {
  name: string;
  effect: string;
  slot: string;
}

export interface HeroHeartBond {
  lv4: string;
  lv7: string;
}

export interface SPHeroStageRequirements {
  name: string;
  requirement: string;
}

export interface SPHeroUnlockRequirements {
  stage1: SPHeroStageRequirements[];
  stage2: SPHeroStageRequirements[];
}

export interface HeroTalent {
  name: string;
  description: string;
}

export interface HeroSkill {
  cd: string;
  cost: string;
  description: string;
  name: string;
  range: string;
  span: string;
}

export interface HeroStats {
  hp: string;
  atk: string;
  int: string;
  def: string;
  mdef: string;
  skill: string;
}

export interface HeroSoldierBonus {
  atk: number;
  def: number;
  hp: number;
  mdef: number;
}

export interface HeroSkin {
  index: number;
  cost?: string;
  name?: string;
  notes?: string;
  source?: string;
}

export interface HeroClass {
  type: string;
  maxStats?: HeroStats;
  name: string;
  skills: HeroSkill[];
  soldiers: string[];
  children: HeroClass[];
}

export interface SPHeroClass extends HeroClass {
  soldierBonus: HeroSoldierBonus;
  talent: HeroTalent;
  unlockRequirements: SPHeroUnlockRequirements;
}

export interface UnreleasedHero {
  released: boolean;
  code: string;
  name: string;
  rarity: string;
  talent: HeroTalent;
  soldierBonus: HeroSoldierBonus;
  classes: { name: string; maxStats: HeroStats }[];
  awakeningSkill?: HeroSkill & { thumbnailUrl: string };
  factions: string[];
  exclusiveEquipment?: HeroExclusiveEquipment;
  skills: (HeroSkill & { thumbnailUrl: string })[];
  skins: { name: string; url: string }[];
  thumbnailUrl: string;
  heartBond: HeroHeartBond;
  bondRequirements: HeroBondRequirements;
}

export interface ReleasedHero {
  released: boolean;
  code: string;
  name: string;
  rarity: string;
  skins: HeroSkin[];
  soldierBonus: HeroSoldierBonus;
  startingClass: HeroClass;
  talent: HeroTalent;
  awakeningSkill?: HeroSkill;
  heartBond?: HeroHeartBond;
  factions: string[];
  exclusiveEquipment?: HeroExclusiveEquipment;
  bondRequirements: HeroBondRequirements;
  spHero?: SPHeroClass;
}

export type Hero = ReleasedHero | UnreleasedHero;
