import mongoose from 'mongoose';
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  department: { type: String, default: '', trim: true }
}, { timestamps: true });
export default mongoose.model('Member', memberSchema);
