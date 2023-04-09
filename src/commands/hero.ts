import { getEmbedColorFromRarity } from '../utils/utils';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { getHeroes } from '../lib/storage';
import { Command } from '../types/Command';
import { WIKI_HEROES_URL, WIKI_HERO_CARDS_URL } from '../utils/constants';
import { findSimilarStrings } from '../utils/string';

export default class extends Command {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('hero')
        .setDescription(
          'Basic hero information such as talent, bonds, max stats etc.'
        )
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName('name')
            .setDescription('Name of the hero you want to search for.')
            .setAutocomplete(true)
        )
    );
  }

  public override async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const heroes = getHeroes();
    const heroCodes = heroes.map((hero) => hero.code);
    const similarHeroes = findSimilarStrings(focusedValue, heroCodes);
    await interaction.respond(
      similarHeroes.map((code) => ({
        name: heroes.get(code)!.name,
        value: code,
      }))
    );
  }

  public override async execute(interaction: ChatInputCommandInteraction) {
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
    const selectedHeroText = interaction.options
      .getString('name')!
      .toLowerCase();
    const selectedHero = getHeroes().get(selectedHeroText);
    if (!selectedHero) {
      await interaction.reply({
        content: `Hero with code ${selectedHeroText} not found!`,
        ephemeral: true,
      });
      return;
    }
    const sp = selectedHero.spHero;

    const secondLineClasses = selectedHero.startingClass.children.flatMap(
      (c) => c.children
    );
    const maxStats = secondLineClasses
      .map(
        (c) => `- **${c.name}**: HP: ${c.maxStats?.hp} \
      | ATK: ${c.maxStats?.atk} \
      | DEF: ${c.maxStats?.def} \
      | INT: ${c.maxStats?.int} \
      | MDEF: ${c.maxStats?.mdef} \
      | SKL: ${c.maxStats?.skill}`
      )
      .join('\n');

    let soldierBonusText = `**${secondLineClasses
      .map((c) => c.name)
      .join(' / ')}**: HP: ${selectedHero.soldierBonus.hp} \
      | ATK: ${selectedHero.soldierBonus.atk} \
      | DEF: ${selectedHero.soldierBonus.def} \
      | MDEF: ${selectedHero.soldierBonus.mdef}`;

    if (sp) {
      soldierBonusText = `${soldierBonusText}\n**${sp.name}**: HP: ${sp.soldierBonus.hp} \
      | ATK: ${sp.soldierBonus.atk} \
      | DEF: ${sp.soldierBonus.def} \
      | MDEF: ${sp.soldierBonus.mdef}`;
    }

    let eeText;
    const ee = selectedHero.exclusiveEquipment;
    if (ee)
      eeText = `**Name:** ${ee.name}\n**Effect:** ${ee.effect}\n**Slot:** ${ee.slot}`;

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: selectedHero.name,
          url: `${WIKI_HEROES_URL}/heroes/${encodeURI(selectedHero.code)}`,
          thumbnail: {
            url: `${WIKI_HERO_CARDS_URL}/${encodeURI(selectedHero.name)}.png`,
          },
          timestamp: new Date().toISOString(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
          },
          fields: [
            {
              name: `Talent: ${selectedHero.talent.name}`,
              value: selectedHero.talent.description,
            },
            ...(sp
              ? [
                  {
                    name: `SP Talent: ${sp.talent.name}`,
                    value: sp.talent.description,
                  },
                ]
              : []),
            ...(eeText
              ? [
                  {
                    name: 'Exclusive Equipment',
                    value: eeText,
                  },
                ]
              : []),
            {
              name: 'Lv70 Max Stats',
              value: maxStats,
            },
            {
              name: 'Soldier Bonus',
              value: soldierBonusText,
            },
          ],
        },
      ],
    });
  }
}
