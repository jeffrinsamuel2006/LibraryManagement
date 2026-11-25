import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './src/routes/auth.js';
import bookRoutes from './src/routes/books.js';
import memberRoutes from './src/routes/members.js';
import loanRoutes from './src/routes/loans.js';
import { protect } from './src/middleware/auth.js';
import Book from './src/models/Book.js';
import Member from './src/models/Member.js';
import Loan from './src/models/Loan.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'Smart Library API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', protect, bookRoutes);
app.use('/api/members', protect, memberRoutes);
app.use('/api/loans', protect, loanRoutes);

app.get('/api/dashboard', protect, async (_req, res, next) => {
  try {
    const [books, members, activeLoans, overdueLoans] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      Loan.countDocuments({ status: 'Issued' }),
      Loan.countDocuments({ status: 'Issued', dueDate: { $lt: new Date() } })
    ]);
    res.json({ totalBooks: books, totalMembers: members, issuedBooks: activeLoans, overdueBooks: overdueLoans });
  } catch (error) { next(error); }
});

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
