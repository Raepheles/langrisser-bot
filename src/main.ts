import './lib/set-envrionment-config';
import logger from './lib/logger';
import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands } from './lib/command-loader';
import { loadEvents } from './lib/event-loader';
import { setStartDate } from './lib/storage';
import { parseHeroes } from './utils/parser';

async function start() {
  const { DISCORD_BOT_TOKEN } = process.env;
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });
  await parseHeroes(); // Uses cache if available
  await loadCommands();
  await loadEvents(client);
  setStartDate(new Date());
  await client.login(DISCORD_BOT_TOKEN);
}

start().catch((error) =>
  logger.error({ error }, 'Error starting the application')
);
