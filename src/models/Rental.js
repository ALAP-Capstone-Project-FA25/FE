const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }, // FK ReservationId
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // FK RenterId
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true }, // FK VehicleId
    pickupStation: { type: mongoose.Schema.Types.ObjectId, ref: "Station" }, // FK PickupStationId
    returnStation: { type: mongoose.Schema.Types.ObjectId, ref: "Station" }, // FK ReturnStationId

    pickupTime: { type: Date }, // PickupTime
    returnTime: { type: Date }, // ReturnTime

    startOdometerKm: { type: Number, default: 0 }, // StartOdometerKm
    endOdometerKm: { type: Number, default: 0 },   // EndOdometerKm
    totalDistanceKm: { type: Number, default: 0 }, // TotalDistanceKm

    status: {
      type: String,
      enum: ["reserved", "ongoing", "completed", "cancelled"],
      default: "reserved",
    },

    contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" }, // ContractId
    
    // Thời gian đặt xe
    reservationTime: { type: Date, default: Date.now },

    // Thông tin thanh toán
    pricePerHour: { type: Number, default: 0 },
    pricePerDay: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    baseRentalAmount: { type: Number, default: 0 },
    weekendFee: { type: Number, default: 0 },
    
    // Thông tin đặt xe
    startDate: { type: String },
    endDate: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    note: { type: String },
    
    // Payment integration (VNPAY)
    orderCode: { type: String, unique: true, sparse: true }, // Mã đơn hàng cho VNPAY
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed", "cancelled"], 
      default: "pending" 
    },
    paymentTime: { type: Date }, // Thời gian thanh toán thành công

    // Ghi nhận tình trạng xe khi nhận/trả
    conditionCheckout: {
      photos: [String],
      note: String,
      batteryPct: Number,
    },
    conditionCheckin: {
      photos: [String],
      note: String,
      batteryPct: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rental", rentalSchema);
