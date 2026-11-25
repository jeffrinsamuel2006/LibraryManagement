import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDB, updateDB, newId, now } from '../storage/db.js';
const router = Router();
const emailOK = value => /^\S+@\S+\.\S+$/.test(value || '');
const tokenFor = user => jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
router.post('/register', async (req, res, next) => {
  try {
    const name = req.body.name?.trim(), email = req.body.email?.trim().toLowerCase(), password = req.body.password;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (!emailOK(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    const user = await updateDB(async db => {
      if (db.users.some(u => u.email === email)) return null;
      const created = { _id: newId(), name, email, password: await bcrypt.hash(password, 10), createdAt: now() };
      db.users.push(created); return created;
    });
    if (!user) return res.status(409).json({ message: 'An account with this email already exists.' });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});
router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase(), password = req.body.password || '';
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const db = await readDB(); const user = db.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Incorrect email or password.' });
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});
export default router;
