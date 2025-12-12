const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  avatarUrl: { type: String },
  phone: { type: String },
  dob: { type: Date },
  address: { type: String },
  ward: { type: String },
  district: { type: String },
  city: { type: String },
  // Phân quyền
  role: { type: String, enum: ["staff", "admin"], default: "staff" },
  // Phân công station
  stationId: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  // Trạng thái
  isVerified: { type: Boolean, default: true },
  verifyNote: { type: String, default: "" },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware để update updatedAt khi save
staffSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Staff", staffSchema);