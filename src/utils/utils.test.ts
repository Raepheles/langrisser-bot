import { Hero } from '../types/Hero';
import { getAllHeroSkills } from './utils';

describe('getAllHeroSkills', () => {
  it('Should return all skills', () => {
    const result = getAllHeroSkills(heroElwin);
    expect(result).toEqual([
      {
        name: 'Eternal Glory',
        description:
          '[Passive] At the start of a map and when an ally dies, all "Legion of Glory" allies gain ATK/INT/DEF +20%, MDEF +30%, as well as the effect: Damage Dealt in battle +15%. For every ally death gain another +3% damage, up to 12%. Lasts 4 turns. Does not stack with other Fusion Powers.\n\n[Physical Damage] Attacks a single enemy, dealing 1.8x damage. Before battle, dispel 5 buffs and disable the enemy\'s passives for 2 turns. After battle inflict "Cannot be healed" for 2 turns. Cannot be dispelled.',
        cost: '•••',
        cd: '5',
        range: '1',
        span: 'Single',
      },
      {
        name: 'Reign of Glory',
        description:
          '[Active] When used, gain [Legendary Glory]: "Elwin\'s special equipment has 100% activate rate. Lasts 1 turn." Also gain [Immunity] for 2 turns. After use, may move 3 blocks and attack. If this unit is not a mixed troop, then may move 4 blocks instead. When this skill is used, duration of buffs will not decrease.',
        span: 'Single',
        range: 'Self',
        cd: '4',
        cost: '••',
      },
      {
        name: 'Force of Will',
        description:
          '[Passive] When an ally unit dies, restore 20% HP. Also gain [Lonely Resolve]: "When attacked, heal 30% HP before battle, and after battle, restore 30% of damage dealt as HP. Lasts 1 turn."',
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
      {
        name: 'Sun Slash',
        description:
          '[Physical Damage] Attacks a single enemy, dealing 1.5x damage. After battle, restores HP equal to 30% of damage dealt.',
        span: 'Single',
        range: '1',
        cd: '2',
        cost: '••',
      },
      {
        name: 'Detect',
        description:
          "[Passive] Critical hit rate+10%. After dealing damage, 50% chance to disable enemy's passive skills; 100% chance if crit. Lasts 2 turns.",
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
      {
        name: 'Crush',
        description:
          "[Passive] When HP% is higher than the enemy's, ATK+12% when entering battle.",
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
      {
        name: 'Roar',
        description:
          '[Physical Damage] Attacks a single enemy, dealing 1.3x damage. Before battle, dispels 2 enemy buffs and inflicts ATK-20%. Lasts 1 turn.',
        span: 'Single',
        range: '1',
        cd: '2',
        cost: '••',
      },
      {
        name: 'Eternal Light',
        description:
          '[Fusion Power] Active use. All "Legion of Glory" units receive ATK/INT/DEF+20% and MDEF+30%, as well as the effect: "When Unit HP is above 80%, damage dealt +15% in battle." Lasts 4 turns. Cannot be stacked with other Fusion Powers.',
        span: 'All',
        range: 'Self',
        cd: '3',
        cost: '••',
      },
      {
        name: 'Sword Soul',
        description:
          '[Physical Damage] Attacks a single enemy, dealing 1.8x damage. Before battle, dispels 5 buffs from enemies. Also inflict "Cannot be healed". Lasts 2 turns. Cannot be dispelled.',
        span: 'Single',
        range: '1',
        cd: '5',
        cost: '••',
      },
      {
        name: 'DEF Break',
        description:
          "[Passive] Before battle, 50% chance to reduce enemy's DEF by 20%. Lasts 1 turn.",
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
      {
        name: 'Barb',
        description:
          "[Passive] When attacked with a melee attack, after battle, if Unit HP is above 50%, triggers [Barb]: Deals FIxed Damage once to the enemy (Damage = 2.5x Hero's DEF)",
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
      {
        name: 'Frontal Assault',
        description:
          '[Physical Damage] Attacks a single enemy, dealing 1.7x damage. Before battle, adds 20% of ATK to DEF and deactivates enemy passive skills. Lasts 2 turns.',
        span: 'Single',
        range: '1',
        cd: '5',
        cost: '••',
      },
    ]);
  });
});

const heroElwin = {
  code: 'elwin',
  name: 'Elwin',
  awakeningSkill: {
    name: 'Eternal Glory',
    description:
      '[Passive] At the start of a map and when an ally dies, all "Legion of Glory" allies gain ATK/INT/DEF +20%, MDEF +30%, as well as the effect: Damage Dealt in battle +15%. For every ally death gain another +3% damage, up to 12%. Lasts 4 turns. Does not stack with other Fusion Powers.\n\n[Physical Damage] Attacks a single enemy, dealing 1.8x damage. Before battle, dispel 5 buffs and disable the enemy\'s passives for 2 turns. After battle inflict "Cannot be healed" for 2 turns. Cannot be dispelled.',
    cost: '•••',
    cd: '5',
    range: '1',
    span: 'Single',
  },
  startingClass: {
    skills: [
      {
        name: 'Sun Slash',
        description:
          '[Physical Damage] Attacks a single enemy, dealing 1.5x damage. After battle, restores HP equal to 30% of damage dealt.',
        span: 'Single',
        range: '1',
        cd: '2',
        cost: '••',
      },
      {
        name: 'Detect',
        description:
          "[Passive] Critical hit rate+10%. After dealing damage, 50% chance to disable enemy's passive skills; 100% chance if crit. Lasts 2 turns.",
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
    ],
    children: [
      {
        skills: [
          {
            name: 'Crush',
            description:
              "[Passive] When HP% is higher than the enemy's, ATK+12% when entering battle.",
            span: '-',
            range: '-',
            cd: '-',
            cost: '•',
          },
        ],
        children: [],
      },
      {
        skills: [
          {
            name: 'Roar',
            description:
              '[Physical Damage] Attacks a single enemy, dealing 1.3x damage. Before battle, dispels 2 enemy buffs and inflicts ATK-20%. Lasts 1 turn.',
            span: 'Single',
            range: '1',
            cd: '2',
            cost: '••',
          },
        ],
        children: [
          {
            skills: [
              {
                name: 'Eternal Light',
                description:
                  '[Fusion Power] Active use. All "Legion of Glory" units receive ATK/INT/DEF+20% and MDEF+30%, as well as the effect: "When Unit HP is above 80%, damage dealt +15% in battle." Lasts 4 turns. Cannot be stacked with other Fusion Powers.',
                span: 'All',
                range: 'Self',
                cd: '3',
                cost: '••',
              },
              {
                name: 'Sword Soul',
                description:
                  '[Physical Damage] Attacks a single enemy, dealing 1.8x damage. Before battle, dispels 5 buffs from enemies. Also inflict "Cannot be healed". Lasts 2 turns. Cannot be dispelled.',
                span: 'Single',
                range: '1',
                cd: '5',
                cost: '••',
              },
            ],
            children: [],
          },
        ],
      },
      {
        name: 'General',
        skills: [
          {
            name: 'DEF Break',
            description:
              "[Passive] Before battle, 50% chance to reduce enemy's DEF by 20%. Lasts 1 turn.",
            span: '-',
            range: '-',
            cd: '-',
            cost: '•',
          },
        ],
        children: [
          {
            skills: [
              {
                name: 'Barb',
                description:
                  "[Passive] When attacked with a melee attack, after battle, if Unit HP is above 50%, triggers [Barb]: Deals FIxed Damage once to the enemy (Damage = 2.5x Hero's DEF)",
                span: '-',
                range: '-',
                cd: '-',
                cost: '•',
              },
              {
                name: 'Frontal Assault',
                description:
                  '[Physical Damage] Attacks a single enemy, dealing 1.7x damage. Before battle, adds 20% of ATK to DEF and deactivates enemy passive skills. Lasts 2 turns.',
                span: 'Single',
                range: '1',
                cd: '5',
                cost: '••',
              },
            ],
            children: [],
          },
        ],
      },
    ],
  },
  spHero: {
    skills: [
      {
        name: 'Reign of Glory',
        description:
          '[Active] When used, gain [Legendary Glory]: "Elwin\'s special equipment has 100% activate rate. Lasts 1 turn." Also gain [Immunity] for 2 turns. After use, may move 3 blocks and attack. If this unit is not a mixed troop, then may move 4 blocks instead. When this skill is used, duration of buffs will not decrease.',
        span: 'Single',
        range: 'Self',
        cd: '4',
        cost: '••',
      },
      {
        name: 'Force of Will',
        description:
          '[Passive] When an ally unit dies, restore 20% HP. Also gain [Lonely Resolve]: "When attacked, heal 30% HP before battle, and after battle, restore 30% of damage dealt as HP. Lasts 1 turn."',
        span: '-',
        range: '-',
        cd: '-',
        cost: '•',
      },
    ],
  },
} as unknown as Hero;
