import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));



import uploadRoutes from './routes/upload.js';
import analyzeRoutes from './routes/analyze.js';
import templateRoutes from './routes/template.js';
import exportRoutes from './routes/export.js';
import paymentRoutes from './routes/payment.js';
import moderationRoutes from './routes/moderation.js';
import musicLicenseRoutes from './routes/musicLicense.js';
import jobStatusRoutes from './routes/jobStatus.js';

app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api', templateRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/moderate', moderationRoutes);
app.use('/api/music-license', musicLicenseRoutes);
app.use('/api/status', jobStatusRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Skify backend running on port ${PORT}`);
});

export default app;
