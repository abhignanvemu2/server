import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Video Editor'
  },
  about: {
    type: String,
    default: ''
  },
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  skills: [String],
  contact: {
    email: String,
    phone: String,
    location: String,
    social: {
      linkedin: String,
      twitter: String,
      instagram: String
    }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const user =  mongoose.model('User', userSchema);
export default user;