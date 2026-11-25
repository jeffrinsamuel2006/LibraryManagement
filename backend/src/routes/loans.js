import { Router } from 'express';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import Member from '../models/Member.js';
const router = Router();
router.get('/', async (_req, res, next) => {
  try {
    const loans = await Loan.find().populate('book', 'title author isbn').populate('member', 'name email').sort({ createdAt: -1 });
    res.json(loans);
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { bookId, memberId, dueDate } = req.body;
    if (!bookId || !memberId || !dueDate || new Date(dueDate) <= new Date()) return res.status(400).json({ message: 'Choose a book, member and a future due date.' });
    const [book, member] = await Promise.all([Book.findById(bookId), Member.findById(memberId)]);
    if (!book || !member) return res.status(404).json({ message: 'Selected book or member was not found.' });
    if (book.availableCopies < 1) return res.status(400).json({ message: 'No copies of this book are currently available.' });
    book.availableCopies -= 1;
    await book.save();
    const loan = await Loan.create({ book: book._id, member: member._id, dueDate: new Date(dueDate) });
    res.status(201).json(await loan.populate([{ path: 'book', select: 'title author isbn' }, { path: 'member', select: 'name email' }]));
  } catch (e) { next(e); }
});
router.patch('/:id/return', async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Issue record not found.' });
    if (loan.status === 'Returned') return res.status(400).json({ message: 'This book has already been returned.' });
    loan.status = 'Returned'; loan.returnDate = new Date();
    await loan.save();
    await Book.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } });
    res.json(await loan.populate([{ path: 'book', select: 'title author isbn' }, { path: 'member', select: 'name email' }]));
  } catch (e) { next(e); }
});
export default router;
