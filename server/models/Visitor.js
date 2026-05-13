import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  country: { type: String, default: 'Unknown' },
  countryCode: { type: String, default: '??' },
  city: { type: String, default: 'Unknown' },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 }
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;
