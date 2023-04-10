import {
  ephemeralOptionAdder,
  getAllHeroSkills,
  getEmbedColorFromRarity,
} from '../utils/utils';
import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildEmoji,
  SlashCommandBuilder,
  SlashCommandStringOption,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { getHeroes, getSkills } from '../lib/storage';
import { Command } from '../types/Command';
import {
  WIKI_HEROES_URL,
  WIKI_HERO_CARDS_URL,
  WIKI_SKILLS_URL,
} from '../utils/constants';
import { findSimilarStrings } from '../utils/string';
import { Hero } from '../types/Hero';

interface CommandOptions {
  ephemeral: boolean;
  selectedHero: Hero;
  heroFactions: string;
}

const Option = {
  HERO_NAME: 'name',
} as const;

const Subcommand = {
  INFO: 'info',
  SKILL: 'skill',
  IMAGE: 'image',
  BOND: 'bond',
} as const;

export default class extends Command {
  constructor() {
    const heroNameOptionAdder = (option: SlashCommandStringOption) =>
      option
        .setRequired(true)
        .setName(Option.HERO_NAME)
        .setDescription('Name of the hero you want to search for.')
        .setAutocomplete(true);

    super(
      new SlashCommandBuilder()
        .setName('hero')
        .setDescription('Hero related commands.')
        .addSubcommand((subcommand) =>
          subcommand
            .setName(Subcommand.INFO)
            .setDescription(
              'Basic hero information such as talent, exclusive equipment, max stats etc.'
            )
            .addStringOption(heroNameOptionAdder)
            .addBooleanOption(ephemeralOptionAdder)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName(Subcommand.SKILL)
            .setDescription(
              'Shows a list of hero skills and their descriptions.'
            )
            .addStringOption(heroNameOptionAdder)
            .addBooleanOption(ephemeralOptionAdder)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName(Subcommand.IMAGE)
            .setDescription('Shows a list of hero images.')
            .addStringOption(heroNameOptionAdder)
            .addBooleanOption(ephemeralOptionAdder)
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName(Subcommand.BOND)
            .setDescription('Hero bond information.')
            .addStringOption(heroNameOptionAdder)
            .addBooleanOption(ephemeralOptionAdder)
        )
    );
  }

  public override async menuSelect(interaction: StringSelectMenuInteraction) {
    const chatInteractionUserId = interaction.message.interaction?.user.id;
    const selectInteractionUserId = interaction.user.id;
    // Only the user who started the interaction can use the menu
    if (chatInteractionUserId !== selectInteractionUserId) {
      await interaction.reply({
        content: 'You are not allowed to use this menu!',
        ephemeral: true,
      });
      return;
    }
    switch (interaction.customId) {
      case 'skill-select':
        await this.menuSkillSelect(interaction);
        break;
      case 'image-select':
        await this.menuImageSelect(interaction);
        break;
    }
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
    const subCommand = interaction.options.getSubcommand();
    const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;
    const selectedHeroText = interaction.options
      .getString(Option.HERO_NAME)!
      .toLowerCase();
    const selectedHero = getHeroes().get(selectedHeroText);
    if (!selectedHero) {
      await interaction.reply({
        content: `Hero with code ${selectedHeroText} not found!`,
        ephemeral: true,
      });
      return;
    }

    const { ADMIN_SERVER_ID } = process.env;

    const factionEmojiList: GuildEmoji[] = [];
    if (ADMIN_SERVER_ID) {
      selectedHero.factions.forEach((f) => {
        const emoji = interaction.guild?.emojis.cache.find((e) => e.name === f);
        if (emoji) factionEmojiList.push(emoji);
      });
    }

    const heroFactions = factionEmojiList.map((e) => e.toString()).join('');

    switch (subCommand) {
      case Subcommand.INFO:
        await this.commandInfo(interaction, {
          ephemeral,
          selectedHero,
          heroFactions,
        });
        break;
      case Subcommand.SKILL:
        await this.commandSkill(interaction, {
          ephemeral,
          selectedHero,
          heroFactions,
        });
        break;
      case Subcommand.IMAGE:
        await this.commandImage(interaction, {
          ephemeral,
          selectedHero,
          heroFactions,
        });
        break;
      case Subcommand.BOND:
        await this.commandBond(interaction, {
          ephemeral,
          selectedHero,
          heroFactions,
        });
        break;
      default:
        await interaction.reply({
          content: `Unknown subcommand ${subCommand}`,
          ephemeral: true,
        });
        break;
    }
  }

  private async menuSkillSelect(interaction: StringSelectMenuInteraction) {
    await interaction.deferUpdate();
    const skillName = interaction.values[0];
    const skill = getSkills().get(skillName);
    if (!skill) {
      await interaction.editReply({
        content: `Skill ${skillName} not found!`,
        embeds: [],
        components: [],
      });
      return;
    }

    const skillDescription = `**${skill.name}**\nCost: ${skill.cost} \
    | CD: ${skill.cd} | Range: ${skill.range} | Span: ${skill.span}\n${skill.description}`;

    await interaction.editReply({
      embeds: [
        {
          ...interaction.message.embeds[0].data,
          description: skillDescription,
          thumbnail: {
            url: encodeURI(`${WIKI_SKILLS_URL}/${skill.name}.png`),
          },
        },
      ],
    });
  }

  private async menuImageSelect(interaction: StringSelectMenuInteraction) {
    await interaction.deferUpdate();
    await interaction.editReply({
      embeds: [
        {
          ...interaction.message.embeds[0].data,
          description: undefined,
          image: { url: interaction.values[0] },
        },
      ],
    });
  }

  private async commandInfo(
    interaction: ChatInputCommandInteraction,
    { ephemeral, selectedHero, heroFactions }: CommandOptions
  ) {
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
          title: `${selectedHero.name} ${heroFactions}`,
          url: encodeURI(`${WIKI_HEROES_URL}/heroes/${selectedHero.code}`),
          thumbnail: {
            url: encodeURI(`${WIKI_HERO_CARDS_URL}/${selectedHero.name}.png`),
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

  private async commandSkill(
    interaction: ChatInputCommandInteraction,
    { ephemeral, selectedHero, heroFactions }: CommandOptions
  ) {
    const skills = getAllHeroSkills(selectedHero);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('skill-select')
        .setPlaceholder('Please select a skill')
        .addOptions(
          skills.map((skill) => ({
            label: skill.name,
            description: `${skill.description.substring(0, 45)}${
              skill.description.length > 45 ? '...' : ''
            }`,
            value: skill.name,
          }))
        )
    );

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          url: encodeURI(`${WIKI_HEROES_URL}/heroes/${selectedHero.code}`),
          description: 'Select the skill you want to see the details of',
          timestamp: new Date().toISOString(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
          },
        },
      ],
      components: [row],
    });
  }

  private async commandImage(
    interaction: ChatInputCommandInteraction,
    { ephemeral, selectedHero, heroFactions }: CommandOptions
  ) {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('image-select')
        .setPlaceholder('Please select a skin')
        .addOptions(
          {
            label: 'Base',
            description: 'Base skin',
            value: encodeURI(
              `${WIKI_HEROES_URL}/${selectedHero.name}/${selectedHero.name}.png`
            ),
          },
          ...(selectedHero.spHero
            ? [
                {
                  label: 'SP',
                  description: 'SP skin',
                  value: encodeURI(
                    `${WIKI_HEROES_URL}/${selectedHero.name}/${selectedHero.name} SP.png`
                  ),
                },
              ]
            : []),
          ...selectedHero.skins
            .filter((s) => s.name)
            .map((skin) => ({
              label: skin.name!,
              description: skin.name!,
              value: encodeURI(
                `${WIKI_HEROES_URL}/${selectedHero.name}/${selectedHero.name} Skin ${skin.index}.png`
              ),
            }))
        )
    );

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          url: encodeURI(`${WIKI_HEROES_URL}/heroes/${selectedHero.code}`),
          description: 'Select the skin you want to see',
          timestamp: new Date().toISOString(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
          },
        },
      ],
      components: [row],
    });
  }

  private async commandBond(
    interaction: ChatInputCommandInteraction,
    { ephemeral, selectedHero, heroFactions }: CommandOptions
  ) {
    const bondReq = selectedHero.bondRequirements;
    const bondRequirementsText = `${bondReq.bond2}\n${bondReq.bond3}\n${bondReq.bond4}\n${bondReq.bond5}`;

    const heartBondText = `**Level 4**\n${selectedHero.heartBond?.lv4}\n**Level 7**\n${selectedHero.heartBond?.lv7}`;

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          url: encodeURI(`${WIKI_HEROES_URL}/heroes/${selectedHero.code}`),
          thumbnail: {
            url: encodeURI(`${WIKI_HERO_CARDS_URL}/${selectedHero.name}.png`),
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
