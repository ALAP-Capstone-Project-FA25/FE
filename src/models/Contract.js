const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    // Thông tin hợp đồng
    contractNumber: { 
      type: String, 
      unique: true, 
      required: true 
    }, // Số hợp đồng (VD: HD-2024-001)
    
    // Liên kết với các entity khác
    renter: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // Khách hàng thuê xe
    vehicle: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Vehicle", 
      required: true 
    }, // Xe được thuê
    rental: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Rental", 
      required: true 
    }, // Thông tin thuê xe
    
    // Thông tin thuê xe
    rentalPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      startTime: { type: String, required: true }, // "08:00"
      endTime: { type: String, required: true }    // "18:00"
    },
    
    // Thông tin thanh toán
    paymentInfo: {
      totalAmount: { type: Number, required: true }, // Tổng tiền thuê
      depositAmount: { type: Number, required: true }, // Tiền cọc
      baseCost: { type: Number, required: true }, // Cước phí cơ bản
      weekendFee: { type: Number, default: 0 }, // Phụ phí cuối tuần
      paymentMethod: { type: String, required: true }, // "payos", "bank_transfer", etc.
      paymentStatus: { 
        type: String, 
        enum: ["pending", "paid", "failed", "refunded"], 
        default: "pending" 
      },
      paymentDate: { type: Date },
      transactionId: { type: String } // ID giao dịch từ PayOS
    },
    
    // Nội dung hợp đồng
    contractContent: {
      terms: { type: String, required: true }, // Điều khoản hợp đồng
      conditions: { type: String, required: true }, // Điều kiện thuê xe
      responsibilities: { type: String, required: true }, // Trách nhiệm các bên
      penalties: { type: String, required: true } // Xử phạt vi phạm
    },
    
    // Chữ ký điện tử
    digitalSignature: {
      renterSignature: { 
        type: String 
      }, // Base64 encoded signature image (required khi ký)
      renterSignedAt: { 
        type: Date 
      },
      renterIpAddress: { type: String }, // IP khi ký
      renterUserAgent: { type: String }, // Browser info
      
      // Chữ ký của công ty (có thể để trống nếu không cần)
      companySignature: { type: String },
      companySignedAt: { type: Date },
      companySignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      } // Admin/Staff ký thay công ty
    },
    
    // Trạng thái hợp đồng
    status: {
      type: String,
      enum: ["draft", "pending_signature", "signed", "active", "completed", "cancelled", "expired"],
      default: "draft"
    },
    
    // Thông tin bổ sung
    notes: { type: String }, // Ghi chú
    attachments: [String], // File đính kèm (đường dẫn)
    
    // Metadata
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Người tạo hợp đồng
    lastModifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }, // Người sửa cuối
    
    // Thời gian hiệu lực
    effectiveDate: { type: Date, required: true }, // Ngày có hiệu lực
    expiryDate: { type: Date, required: true }, // Ngày hết hạn
    
    // Lịch sử thay đổi
    changeHistory: [{
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      changedAt: { type: Date, default: Date.now },
      changeType: { type: String }, // "created", "signed", "modified", "cancelled"
      changeDescription: { type: String },
      previousStatus: { type: String },
      newStatus: { type: String }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual fields
contractSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'signed' && 
         this.effectiveDate <= now && 
         this.expiryDate >= now;
});

contractSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

contractSchema.virtual('daysRemaining').get(function() {
  if (this.isExpired) return 0;
  const now = new Date();
  const diffTime = this.expiryDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
contractSchema.index({ contractNumber: 1 });
contractSchema.index({ renter: 1 });
contractSchema.index({ vehicle: 1 });
contractSchema.index({ rental: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ effectiveDate: 1 });
contractSchema.index({ expiryDate: 1 });

// Pre-save middleware để tạo contract number
contractSchema.pre('validate', async function(next) {
  if (this.isNew && !this.contractNumber) {
    try {
      const year = new Date().getFullYear();
      const prefix = `HD-${year}-`;
      
      // Find the latest contract for this year
      const latestContract = await mongoose.model('Contract')
        .findOne({ contractNumber: new RegExp(`^${prefix}`) })
        .sort({ contractNumber: -1 })
        .select('contractNumber')
        .lean();
      
      let nextNumber = 1;
      if (latestContract && latestContract.contractNumber) {
        // Extract number from HD-2025-0001 -> 0001 -> 1
        const match = latestContract.contractNumber.match(/HD-\d{4}-(\d{4})$/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
      
      this.contractNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;
      console.log('✅ Auto-generated contractNumber:', this.contractNumber);
    } catch (err) {
      console.error('❌ Error generating contractNumber:', err);
      // Fallback to old method
      const count = await mongoose.model('Contract').countDocuments();
      this.contractNumber = `HD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
  }
  next();
});

// Methods
contractSchema.methods.addChangeHistory = function(changeType, description, changedBy) {
  this.changeHistory.push({
    changedBy,
    changedAt: new Date(),
    changeType,
    changeDescription: description,
    previousStatus: this.status,
    newStatus: this.status
  });
};

contractSchema.methods.signContract = function(signatureData, signedBy) {
  this.digitalSignature.renterSignature = signatureData.signature;
  this.digitalSignature.renterSignedAt = new Date();
  this.digitalSignature.renterIpAddress = signatureData.ipAddress;
  this.digitalSignature.renterUserAgent = signatureData.userAgent;
  
  this.status = 'signed';
  this.addChangeHistory('signed', 'Khách hàng đã ký hợp đồng điện tử', signedBy);
};

module.exports = mongoose.model("Contract", contractSchema);