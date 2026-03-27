import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-sync');

const eventSchema = new mongoose.Schema({
  title: {type: String, required: true},
  date: {type: String, required: true},
  venue: String,
  venue_id: String,
  category: String,
  requested_by: String,
  requester_name: String,
  status: {type: String, default: 'pending', enum: ['pending', 'approved', 'rejected']},
  college_id: String,
  registration_fee: Number,
  max_capacity: Number,
  external_link: String,
  created_at: {type: Date, default: Date.now}
});

const Event = mongoose.model('Event', eventSchema);

app.get('/api/events', async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const events = await Event.find(filter).sort({created_at: -1});
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event({ ...req.body, status: 'pending' });
    await event.save();
    res.json({success: true, event});
  } catch (err) {
    res.status(400).json({success: false, message: err.message});
  }
});

app.patch('/api/events/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await Event.findByIdAndUpdate(req.params.id, { status });
    res.json({success: true});
  } catch (err) {
    res.status(400).json({success: false, message: err.message});
  }
});

app.delete('/api/events/:id', async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({success: true});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

