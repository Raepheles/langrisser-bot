import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { getHeroes } from '../lib/storage';
import { Command } from '../types/Command';
import { WIKI_HEROES_URL, WIKI_HERO_CARDS_URL } from '../utils/constants';
import { findSimilarStrings } from '../utils/string';
import { getEmbedColorFromRarity } from '../utils/utils';

export default class extends Command {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('bond')
        .setDescription('Hero bond information.')
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

    const bondReq = selectedHero.bondRequirements;
    const bondRequirementsText = `${bondReq.bond2}\n${bondReq.bond3}\n${bondReq.bond4}\n${bondReq.bond5}`;

    const heartBondText = `**Level 4**\n${selectedHero.heartBond?.lv4}\n**Level 7**\n${selectedHero.heartBond?.lv7}`;

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
              name: 'Bond Requirements',
              value: bondRequirementsText,
            },
            ...(bondReq.relatedBonds.length > 0
              ? [
                  {
                    name: 'Related Bonds',
                    value: bondReq.relatedBonds
                      .map(
                        (b) =>
                          `- **[${b.name}](${WIKI_HEROES_URL}/${encodeURI(
                            b.code
                          )})** ${b.type}: ${b.text}`
                      )
                      .join('\n'),
                  },
                ]
              : []),
            ...(selectedHero.heartBond
              ? [
                  {
                    name: 'Heart Bond Passives',
                    value: heartBondText,
                  },
                ]
              : []),
          ],
        },
      ],
    });
  }
}
