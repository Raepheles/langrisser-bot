import { ephemeralOptionAdder } from '../utils/utils';
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { getSkills, getSkillToHeroes } from '../lib/storage';
import { Command } from '../types/Command';
import {
  DefaultOptions,
  EMBED_COLOR_DEFAULT,
  WIKI_HEROES_URL,
  WIKI_SKILLS_URL,
} from '../utils/constants';
import { findSimilarStrings, splitStrings } from '../utils/string';

const Option = {
  ...DefaultOptions,
  SKILL_NAME: 'name',
} as const;

export default class extends Command {
  constructor() {
    super(
      new SlashCommandBuilder()
        .setName('skill')
        .setDescription('Shows skill information.')
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName(Option.SKILL_NAME)
            .setDescription('Name of the skill you want to search for.')
            .setAutocomplete(true)
        )
        .addBooleanOption(ephemeralOptionAdder)
    );
  }

  public override async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const skills = getSkills();
    const similarSkills = findSimilarStrings(
      focusedValue,
      skills.map((skill) => skill.name)
    );
    await interaction.respond(
      similarSkills.map((skill) => ({
        name: skill,
        value: skill,
      }))
    );
  }

  public override async execute(interaction: ChatInputCommandInteraction) {
    const ephemeral = interaction.options.getBoolean(Option.EPHEMERAL) ?? true;
    const selectedSkillText = interaction.options.getString(Option.SKILL_NAME)!;
    const skill = getSkills().get(selectedSkillText);
    if (!skill) {
      await interaction.reply({
        content: `Skill with name ${selectedSkillText} not found!`,
        ephemeral: true,
      });
      return;
    }

    const heroes = getSkillToHeroes().get(skill.name);
    const heroesFormatted = heroes?.map(
      (h) => `**[${h.name}](${WIKI_HEROES_URL}/${encodeURI(h.code)})**`
    );
    const heroesWithSkillList = heroesFormatted
      ? splitStrings(heroesFormatted, ', ', 1024)
      : [];
    const skillDescription = `**${skill.name}**\nCost: ${skill.cost} \
    | CD: ${skill.cd} | Range: ${skill.range} | Span: ${skill.span}\n${skill.description}`;

    await interaction.reply({
      ephemeral,
      embeds: [
        {
          color: EMBED_COLOR_DEFAULT,
          title: skill.name,
          description: skillDescription,
          thumbnail: {
            url: encodeURI(`${WIKI_SKILLS_URL}/${skill.name}.png`),
          },
          fields: heroesWithSkillList.map((h) => ({
            name: 'Heroes with this skill',
            value: h,
          })),
          timestamp: new Date().toISOString(),
          footer: {
            text: `Requested by ${interaction.user.tag}`,
          },
        },
      ],
    });
  }
}
