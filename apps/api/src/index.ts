import './instrument';
import app from './app';
import { configureBucketCors } from './services/storage.service';

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  configureBucketCors().catch((err) =>
    console.warn('S3 CORS configuration skipped:', err instanceof Error ? err.message : err),
  );
});
