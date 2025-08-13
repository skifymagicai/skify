import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'body-parser';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));



import uploadRoutes from './routes/upload';
import analyzeRoutes from './routes/analyze';
import templateRoutes from './routes/template';
import exportRoutes from './routes/export';
import paymentRoutes from './routes/payment';
import moderationRoutes from './routes/moderation';
import musicLicenseRoutes from './routes/musicLicense';
import jobStatusRoutes from './routes/jobStatus';

app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api', templateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/moderate', moderationRoutes);
app.use('/api/music-license', musicLicenseRoutes);
app.use('/api/status', jobStatusRoutes);


const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Skify backend running on port ${PORT}`);
  });
}

export default app;
