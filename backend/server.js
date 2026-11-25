import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import bookRoutes from './src/routes/books.js';
import memberRoutes from './src/routes/members.js';
import loanRoutes from './src/routes/loans.js';
import { protect } from './src/middleware/auth.js';
import { readDB } from './src/storage/db.js';

dotenv.config();
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'local-development-secret-change-before-deployment';
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', async (_req, res, next) => {
  try { await readDB(); res.json({ status: 'ok', storage: 'local-json', message: 'Smart Library API is running' }); }
  catch (error) { next(error); }
});
app.use('/api/auth', authRoutes);
app.use('/api/books', protect, bookRoutes);
app.use('/api/members', protect, memberRoutes);
app.use('/api/loans', protect, loanRoutes);
app.get('/api/dashboard', protect, async (_req, res, next) => {
  try {
    const db = await readDB();
    const active = db.loans.filter(l => l.status === 'Issued');
    res.json({ totalBooks: db.books.reduce((n,b) => n + Number(b.totalCopies || 0), 0), totalMembers: db.members.length, issuedBooks: active.length, overdueBooks: active.filter(l => new Date(l.dueDate) < new Date()).length });
  } catch (error) { next(error); }
});
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Server error' });
});
const PORT = process.env.PORT || 5000;
readDB().then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} (local JSON storage)`))).catch(error => { console.error('Storage initialization failed:', error); process.exit(1); });
