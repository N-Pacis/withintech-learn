import * as Sentry from '@sentry/node';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const swaggerDocument = require('../swagger.json');
import router from './routes';
import { AppError } from './utils/errors';
import { prisma } from './db/prisma';
import redis from './db/redis';

const app = express();
Sentry.setupExpressErrorHandler(app);
const options = {
  customPath: '/docs',
  swaggerOptions: {
    url: '/docs-json',
  }
}

app.use(helmet({
  strictTransportSecurity: false,
  originAgentCluster: false,
  crossOriginOpenerPolicy: false,
}));
const allowedOrigins = [
  process.env.APP_URL,
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000'] : []),
].filter(Boolean) as string[];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({
  verify: (req: Request, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  },
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.get('/docs-json', (_req, res) => res.json(swaggerDocument));

// Liveness — just confirms the process is up (used by Docker healthcheck)
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

// Readiness — checks Postgres + Redis connectivity
app.get('/health/full', async (_req, res) => {
  const checks: Record<string, string> = {};
  let degraded = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'up';
  } catch {
    checks.database = 'down';
    degraded = true;
  }

  try {
    await redis.ping();
    checks.cache = 'up';
  } catch {
    checks.cache = 'down';
    degraded = true;
  }

  res.status(degraded ? 503 : 200).json({ status: degraded ? 'degraded' : 'ok', ...checks });
});

app.use(router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) Sentry.captureException(err);
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  Sentry.captureException(err);
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
