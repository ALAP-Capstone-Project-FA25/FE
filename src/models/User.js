const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  // Giấy tờ tuỳ thân & bằng lái (tùy chọn, có thể bổ sung sau đăng ký)
  licenseNumber: { type: String },
  nationalId: { type: String },
  nationalIdImage: { type: String },
  driverLicenseImage: { type: String },
  // Temporary uploads that user can change before finalizing profile
  nationalIdImageTemp: { type: String },
  driverLicenseImageTemp: { type: String },
  // When true, documents are finalized and can't be reuploaded by user
  documentsLocked: { type: Boolean, default: false },
        // Phân quyền - chỉ dành cho khách hàng
        role: { type: String, enum: ["renter"], default: "renter" },
  // Trạng thái xác minh
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  rejectionReason: { type: String, default: "" },
  risky: { type: Boolean, default: false },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


// Middleware để update updatedAt khi save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);
