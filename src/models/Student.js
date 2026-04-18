import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional because OAuth users might not have a password
  googleId: { type: String },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  name: { type: String, default: '' },
  degree: { type: String, default: '' },
  program: { type: String, default: '' },
  semester: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  skills: { type: String, default: '' },
  interests: { type: String, default: '' },
  preferredTypes: { type: [String], default: [] },
  financialNeed: { type: Boolean, default: false },
  locationPreference: { type: String, default: '' },
  pastExperience: { type: String, default: '' },
  nationality: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
