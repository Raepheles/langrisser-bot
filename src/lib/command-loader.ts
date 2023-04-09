import { Collection, REST, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { Command } from '../types/Command';
import logger from './logger';
import { setCommands } from './storage';

export async function loadCommands() {
  const commandFilesPath = join(__dirname, '..', 'commands');
  const commandFiles = await readdir(commandFilesPath);
  const cmds: Collection<string, Command> = new Collection();
  for (const file of commandFiles.filter((f) => !f.endsWith('.map'))) {
    const module = await import(join(commandFilesPath, file));
    // eslint-disable-next-line new-cap
    const command = new module.default() as Command;
    cmds.set(command.data.name, command);
  }
  setCommands(cmds);

  // register commands
  const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = process.env;
  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN!);
  logger.info(`Started refreshing ${cmds.size} application (/) commands.`);
  const data = (await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID!), {
    body: cmds.map((cmd) => cmd.data.toJSON()),
  })) as unknown[];
  logger.info(
    { data },
    `Successfully reloaded ${data.length} application (/) commands.`
  );
}
