import { Router } from 'express';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.search?.trim();
    const filter = q ? { $or: ['title', 'author', 'category', 'isbn'].map(field => ({ [field]: { $regex: q, $options: 'i' } })) } : {};
    res.json(await Book.find(filter).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, author, category, isbn, totalCopies } = req.body;
    if (![title, author, category, isbn].every(v => v?.trim())) return res.status(400).json({ message: 'All book fields are required.' });
    if (!Number.isInteger(Number(totalCopies)) || Number(totalCopies) < 1) return res.status(400).json({ message: 'Total copies must be a positive whole number.' });
    const book = await Book.create({ title, author, category, isbn, totalCopies: Number(totalCopies), availableCopies: Number(totalCopies) });
    res.status(201).json(book);
  } catch (e) { if (e.code === 11000) return res.status(409).json({ message: 'ISBN already exists.' }); next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    const { title, author, category, isbn, totalCopies } = req.body;
    const issued = book.totalCopies - book.availableCopies;
    const total = Number(totalCopies);
    if (!title?.trim() || !author?.trim() || !category?.trim() || !isbn?.trim() || !Number.isInteger(total) || total < issued) return res.status(400).json({ message: 'Enter valid details. Total copies cannot be less than copies currently issued.' });
    Object.assign(book, { title, author, category, isbn, totalCopies: total, availableCopies: total - issued });
    await book.save(); res.json(book);
  } catch (e) { if (e.code === 11000) return res.status(409).json({ message: 'ISBN already exists.' }); next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const active = await Loan.exists({ book: req.params.id, status: 'Issued' });
    if (active) return res.status(400).json({ message: 'Cannot delete a book while copies are issued.' });
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json({ message: 'Book deleted.' });
  } catch (e) { next(e); }
});
export default router;
