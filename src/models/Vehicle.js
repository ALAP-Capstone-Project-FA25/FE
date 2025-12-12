const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vin: { type: String, unique: true, sparse: true }, // số khung (có thể null cho xe nhỏ)
    plateNumber: { type: String, unique: true, required: true }, // biển số xe
    model: { type: String, required: true }, // model xe (VD: eScooter S1, EV Bike X)
    // Số chỗ ngồi
    seats: { type: Number, min: 1, default: 5 },
    
    // Thông số kỹ thuật
    transmission: { type: String, enum: ["automatic", "manual"], default: "automatic" }, // Số tự động hay số sàn
    horsepower: { type: Number, min: 0 }, // Công suất (HP)
    maxRange: { type: Number, min: 0 }, // Quãng đường tối đa khi sạc đầy (NEDC) - km
    airbags: { type: Number, min: 0, default: 0 }, // Số túi khí
    vehicleType: { type: String }, // Loại xe (Minicar, SUV, etc.)

    // Pin & năng lượng
    batteryCapacityKWh: { type: Number, required: true },
    stateOfChargePct: { type: Number, min: 0, max: 100, default: 100 },

    // Trạng thái hoạt động
    status: {
      type: String,
      enum: ["available", "reserved", "rented", "maintenance", "offline"],
      default: "available",
    },

    // Liên kết
    station: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true }, // xe thuộc điểm thuê nào
    currentRenter: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ai đang thuê xe

    // Thông tin khác
    images: [String], // ảnh chụp xe
    notes: String,
    odometerKm: { type: Number, default: 0 }, // quãng đường đã chạy
    dailyDistanceLimitKm: { type: Number, default: 300 }, // giới hạn km/ngày

    // Giá thuê
    hourlyRate: { type: Number, min: 0 }, // giá thuê theo giờ (VNĐ)
    dailyRate: { type: Number, min: 0 }, // giá thuê theo ngày (VNĐ)

    // Chính sách đặt cọc
    depositAmount: { type: Number, min: 0, required: true }, // Số tiền đặt cọc (VNĐ)
    depositPolicy: { type: String }, // Chính sách đặt cọc (thế chấn) cho từng xe

    // Bảo trì
    lastMaintenanceAt: { type: Date },
    maintenanceNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
