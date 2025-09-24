import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import { buildSessionStore } from './config/session.js';
import authRoutes from './routes/auth.js';
import newsRoutes from './routes/news.js';

dotenv.config();

const app = express();

// Config
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Sessions
const sessionStore = buildSessionStore();
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'changeme',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7
    },
    store: sessionStore
  })
);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

// Start
await connectToDatabase();
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


