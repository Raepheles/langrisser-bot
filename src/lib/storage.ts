import { Collection } from 'discord.js';
import { Command } from '../types/Command';
import { Hero } from '../types/Hero';

export type SkillToHeroesCollection = Collection<
  string,
  Pick<Hero, 'code' | 'name'>[]
>;

let commands: Collection<string, Command>;
let startDate: Date;
let heroes: Collection<string, Hero>;
let skillToHeroes: SkillToHeroesCollection;

export function setCommands(cmds: Collection<string, Command>) {
  commands = cmds;
}

export function setStartDate(date: Date) {
  startDate = date;
}

export function setHeroes(_heroes: Collection<string, Hero>) {
  heroes = _heroes;
}

export function setSkillToHeroes(_skillToHeroes: SkillToHeroesCollection) {
  skillToHeroes = _skillToHeroes;
}

export function getSkillToHeroes() {
  return skillToHeroes;
}

export function getHeroes() {
  return heroes;
}

export function getStartDate() {
  return startDate;
}

export function getCommands() {
  return commands;
}
