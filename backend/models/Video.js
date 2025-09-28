import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  duration: String,
  thumbnail: String,
  category: {
    type: String,
    enum: ['Teasers', 'Promos', 'Reels', 'short-film', 'other'],
    default: 'other'
  },
  client: String,
  year: Number,
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const video = mongoose.model('Video', videoSchema);
export default video