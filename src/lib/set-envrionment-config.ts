import { config } from 'dotenv';

const env = process.env.NODE_ENV;
switch (env) {
  case 'development':
    config({ path: '.env.dev' });
    break;
  case 'production':
    config();
    break;
  case 'test':
    config({ path: '.env.test' });
    break;
}
