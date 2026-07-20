import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

loadEnv({ path: '.env.local' });

export default defineConfig({
  schema: 'prisma/schema.prisma'
});