import {
  ephemeralOptionAdder,
  getAllHeroSkills,
  getEmbedColorFromRarity,
  getExclusiveEquipmentText,
  getMaxStatsOfClass,
  getSoldierBonusText,
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
import { findSimilarStrings } from '../utils/string';
import { Hero, UnreleasedHero } from '../types/Hero';
import {
  getHeroImageUrl,
  getHeroThumbnailUrl,
  getHeroWikiUrl,
  getSkillThumbnailUrl,
} from '../utils/url';
import { DefaultOptions, UNRELEASED_HERO_WARNING } from '../utils/constants';
import { isReleasedHero } from '../utils/type';

interface CommandOptions {
  ephemeral: boolean;
  selectedHero: Hero;
  heroFactions: string;
}

const Option = {
  ...DefaultOptions,
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
      case 'skill-select-unreleased':
        await this.menuSkillSelect(interaction, true);
        break;
      case 'image-select':
        await this.menuImageSelect(interaction);
        break;
      case 'image-select-unreleased':
        await this.menuImageSelect(interaction, true);
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
    const ephemeral = interaction.options.getBoolean(Option.EPHEMERAL) ?? true;
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

  private async menuSkillSelect(
    interaction: StringSelectMenuInteraction,
    unreleased = false
  ) {
    await interaction.deferUpdate();
    let description: string;
    let thumbnailUrl: string;
    if (unreleased) {
      const choice = JSON.parse(interaction.values[0]) as {
        h: string;
        s: string;
      };

      const hero = getHeroes().get(choice.h) as UnreleasedHero;
      const skill = [...hero.skills, hero.awakeningSkill].find(
        (s) => s?.name === choice.s
      );
      if (!skill) {
        await interaction.editReply({
          content: `Skill ${choice.s} not found!`,
          embeds: [],
          components: [],
        });
        return;
      }
      description = `**${skill.name}**\nCost: ${skill.cost} \
      | CD: ${skill.cd} | Range: ${skill.range} | Span: ${skill.span}\n${skill.description}`;
      thumbnailUrl = skill.thumbnailUrl;
    } else {
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

      description = `**${skill.name}**\nCost: ${skill.cost} \
        | CD: ${skill.cd} | Range: ${skill.range} | Span: ${skill.span}\n${skill.description}`;
      thumbnailUrl = getSkillThumbnailUrl(skill.name);
    }

    await interaction.editReply({
      embeds: [
        {
          ...interaction.message.embeds[0].data,
          description,
          thumbnail: {
            url: thumbnailUrl,
          },
        },
      ],
    });
  }

  private async menuImageSelect(
    interaction: StringSelectMenuInteraction,
    unreleased = false
  ) {
    await interaction.deferUpdate();
    const choice = JSON.parse(interaction.values[0]) as {
      h: string;
      s?: string;
    };
    let url;
    if (unreleased) {
      const hero = getHeroes().get(choice.h) as UnreleasedHero;
      const skin = hero.skins.find((s) => s.name === choice.s);
      url = skin?.url as string;
    } else {
      url = getHeroImageUrl(choice.h, choice.s);
    }
    await interaction.editReply({
      embeds: [
        {
          ...interaction.message.embeds[0].data,
          description: undefined,
          image: {
            url,
          },
        },
      ],
    });
  }

  private async commandInfo(
    interaction: ChatInputCommandInteraction,
    commandOptions: CommandOptions
  ) {
    const { ephemeral, selectedHero, heroFactions } = commandOptions;
    if (!isReleasedHero(selectedHero)) {
      await this.commandInfoUnreleased(interaction, commandOptions);
      return;
    }
    const sp = selectedHero.spHero;

    const secondLineClasses = selectedHero.startingClass.children.flatMap(
      (c) => c.children
    );
    const maxStats = secondLineClasses
      .map((c) => getMaxStatsOfClass(c))
      .join('\n');

    let soldierBonusText = getSoldierBonusText(
      secondLineClasses,
      selectedHero.soldierBonus
    );

    if (sp) {
      soldierBonusText = `${soldierBonusText}\n**${sp.name}**: HP: ${sp.soldierBonus.hp} \
      | ATK: ${sp.soldierBonus.atk} \
      | DEF: ${sp.soldierBonus.def} \
      | MDEF: ${sp.soldierBonus.mdef}`;
    }

    const eeText = getExclusiveEquipmentText(selectedHero.exclusiveEquipment);

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          url: getHeroWikiUrl(selectedHero.code),
          thumbnail: {
            url: getHeroThumbnailUrl(selectedHero.name),
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
    commandOptions: CommandOptions
  ) {
    const { ephemeral, selectedHero, heroFactions } = commandOptions;
    if (!isReleasedHero(selectedHero)) {
      await this.commandSkillUnreleased(interaction, commandOptions);
      return;
    }
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
          url: getHeroWikiUrl(selectedHero.code),
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
    commandOptions: CommandOptions
  ) {
    const { ephemeral, selectedHero, heroFactions } = commandOptions;
    if (!isReleasedHero(selectedHero)) {
      await this.commandImageUnreleased(interaction, commandOptions);
      return;
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('image-select')
        .setPlaceholder('Please select a skin')
        .addOptions(
          {
            label: 'Base',
            description: 'Base skin',
            value: JSON.stringify({ h: selectedHero.name }),
          },
          ...(selectedHero.spHero
            ? [
                {
                  label: 'SP',
                  description: 'SP skin',
                  value: JSON.stringify({ h: selectedHero.name, s: 'SP' }),
                },
              ]
            : []),
          ...selectedHero.skins
            .filter((s) => s.name)
            .map((skin) => ({
              label: skin.name!,
              description: skin.name!,
              value: JSON.stringify({
                h: selectedHero.name,
                s: `Skin ${skin.index}`,
              }),
            }))
        )
    );

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          url: getHeroWikiUrl(selectedHero.code),
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
    const isReleased = isReleasedHero(selectedHero);
    const bondReq = selectedHero.bondRequirements;
    const bondRequirementsText = `${bondReq.bond2}\n${bondReq.bond3}\n${bondReq.bond4}\n${bondReq.bond5}`;

    const heartBondText = `**Level 4**\n${selectedHero.heartBond?.lv4}\n**Level 7**\n${selectedHero.heartBond?.lv7}`;

    await interaction.reply({
      ephemeral,
      content: !isReleased ? UNRELEASED_HERO_WARNING : undefined,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          url: isReleased ? getHeroWikiUrl(selectedHero.code) : undefined,
          thumbnail: {
            url: isReleased
              ? getHeroThumbnailUrl(selectedHero.name)
              : selectedHero.thumbnailUrl,
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
                          `- **[${b.name}](${getHeroWikiUrl(b.code)})** ${
                            b.type
                          }: ${b.text}`
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

  private async commandInfoUnreleased(
    interaction: ChatInputCommandInteraction,
    commandOptions: CommandOptions
  ) {
    const { ephemeral, selectedHero, heroFactions } = commandOptions;
    if (isReleasedHero(selectedHero)) return;

    const eeText = getExclusiveEquipmentText(selectedHero.exclusiveEquipment);

    const maxStats = selectedHero.classes
      .map((c) => getMaxStatsOfClass(c))
      .join('\n');

    const soldierBonusText = getSoldierBonusText(
      selectedHero.classes,
      selectedHero.soldierBonus
    );

    await interaction.reply({
      ephemeral,
      content: UNRELEASED_HERO_WARNING,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
          thumbnail: {
            url: selectedHero.thumbnailUrl,
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

  private async commandSkillUnreleased(
    interaction: ChatInputCommandInteraction,
    commandOptions: CommandOptions
  ) {
    const { ephemeral, selectedHero, heroFactions } = commandOptions;
    if (isReleasedHero(selectedHero)) return;

    const selectOptions = selectedHero.skills.map((skill) => ({
      label: skill.name,
      description: `${skill.description.substring(0, 45)}${
        skill.description.length > 45 ? '...' : ''
      }`,
      value: JSON.stringify({
        h: selectedHero.code,
        s: skill.name,
      }),
    }));
    if (selectedHero.awakeningSkill) {
      selectOptions.unshift({
        label: selectedHero.awakeningSkill.name,
        description: `${selectedHero.awakeningSkill.description.substring(
          0,
          45
        )}${selectedHero.awakeningSkill.description.length > 45 ? '...' : ''}`,
        value: JSON.stringify({
          h: selectedHero.code,
          s: selectedHero.awakeningSkill.name,
        }),
      });
    }
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('skill-select-unreleased')
        .setPlaceholder('Please select a skill')
        .addOptions(selectOptions)
    );

    await interaction.reply({
      ephemeral,
      content: UNRELEASED_HERO_WARNING,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
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

  private async commandImageUnreleased(
    interaction: ChatInputCommandInteraction,
    commandOptions: CommandOptions
  ) {
    const { ephemeral, selectedHero, heroFactions } = commandOptions;
    if (isReleasedHero(selectedHero)) return;

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('image-select-unreleased')
        .setPlaceholder('Please select a skin')
        .addOptions(
          selectedHero.skins.map((skin) => ({
            label: skin.name,
            description: skin.name,
            value: JSON.stringify({
              h: selectedHero.code,
              s: skin.name,
            }),
          }))
        )
    );

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: getEmbedColorFromRarity(selectedHero.rarity),
          title: `${selectedHero.name} ${heroFactions}`,
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
}
