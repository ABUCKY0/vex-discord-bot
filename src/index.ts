import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
} from '@sapphire/framework';
import '@sapphire/plugin-logger/register';
import {Constants, Intents} from 'discord.js';
import {logLevel, robotEventsToken} from './lib/config';
import {RobotEventsClient, SeasonsRequestBuilder} from './lib/robot-events';
import {RobotEventsV1Client} from './lib/robot-events/v1';
import {SkillsCache} from './lib/skills-cache';

export const robotEventsClient = new RobotEventsClient({
  token: robotEventsToken,
});

export const robotEventsV1Client = new RobotEventsV1Client({});

export const skillsCache = new SkillsCache(
  robotEventsClient,
  robotEventsV1Client
);

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.Overwrite
);

const client = new SapphireClient({
  shards: 'auto',
  partials: [Constants.PartialTypes.CHANNEL],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  logger: {level: logLevel},
});

const main = async () => {
  await setupSkillsCache().catch(client.logger.error);
  try {
    client.logger.info('Logging in');
    await client.login();
    client.logger.info('Logged in');
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    throw error;
  }
};

const setupSkillsCache = async () => {
  const activeSeasons = await robotEventsClient.seasons
    .findAll(new SeasonsRequestBuilder().programIds(1, 4).active(true).build())
    .toArray();
  await skillsCache.init();
  setInterval(
    () => skillsCache.update(activeSeasons).catch(client.logger.error),
    3_600_000
  );
};

main();
