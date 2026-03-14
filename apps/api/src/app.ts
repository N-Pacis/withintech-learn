import * as Sentry from '@sentry/node';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
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
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(compression());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.get('/docs-json', (_req, res) => res.json(swaggerDocument));
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;  // checks Postgres
    await redis.ping();                 // checks Redis
    res.status(200).json({
      status: 'ok',
      postgres: 'up',
      redis: 'up',
    });
  } catch (error:any) {
    res.status(503).json({
      status: 'degraded',
      error: error.message,
    });
  }
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
