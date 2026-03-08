import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const swaggerDocument = require('../swagger.json');
import router from './routes';
import { AppError } from './utils/errors';

const app = express();

app.use(helmet({
  strictTransportSecurity: false,
  originAgentCluster: false,
  crossOriginOpenerPolicy: false,
}));
app.use(cors({ origin: process.env.APP_URL }));
app.use(express.json());
app.use(compression());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
