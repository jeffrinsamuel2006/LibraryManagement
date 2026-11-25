import { Router } from 'express';
import Member from '../models/Member.js';
import Loan from '../models/Loan.js';
const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const q = req.query.search?.trim();
    const filter = q ? { $or: ['name', 'email', 'phone', 'department'].map(field => ({ [field]: { $regex: q, $options: 'i' } })) } : {};
    res.json(await Member.find(filter).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, department } = req.body;
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !phone?.trim()) return res.status(400).json({ message: 'Enter a name, valid email and phone number.' });
    res.status(201).json(await Member.create({ name, email, phone, department }));
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, department } = req.body;
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !phone?.trim()) return res.status(400).json({ message: 'Enter a name, valid email and phone number.' });
    const member = await Member.findByIdAndUpdate(req.params.id, { name, email, phone, department }, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ message: 'Member not found.' });
    res.json(member);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    if (await Loan.exists({ member: req.params.id, status: 'Issued' })) return res.status(400).json({ message: 'Cannot delete a member with an active book issue.' });
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found.' });
    res.json({ message: 'Member deleted.' });
  } catch (e) { next(e); }
});
export default router;
