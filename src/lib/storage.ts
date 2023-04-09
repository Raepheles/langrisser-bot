import { Collection } from 'discord.js';
import { Command } from '../types/Command';
import { Hero } from '../types/Hero';

let commands: Collection<string, Command>;
let startDate: Date;
let heroes: Collection<string, Hero>;

export function setCommands(cmds: Collection<string, Command>) {
  commands = cmds;
}

export function setStartDate(date: Date) {
  startDate = date;
}

export function setHeroes(heros: Collection<string, Hero>) {
  heroes = heros;
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
