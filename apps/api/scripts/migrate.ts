import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

try {
  execSync('npx prisma migrate reset --force', {
    stdio: 'inherit',
    env: process.env,
    cwd: path.resolve(__dirname, '..'),
  });
} catch {
  process.exit(1);
}
