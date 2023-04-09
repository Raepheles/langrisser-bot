import pino from 'pino';

const { LOGTAIL_TOKEN, NODE_ENV } = process.env;
const isTest = NODE_ENV === 'test';

const transports = pino.transport({
  targets: [
    ...(!isTest
      ? [
          {
            target: '@logtail/pino',
            options: {
              sourceToken: LOGTAIL_TOKEN,
            },
            level: 'trace',
          },
        ]
      : []),
    {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname,module,data' },
      level: 'info',
    },
  ],
});

const logger = pino(
  {
    level: 'trace',
    base: {
      module: 'main',
    },
    errorKey: 'error',
  },
  transports
);

export default logger;
