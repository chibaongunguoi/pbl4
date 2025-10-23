import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const CompanySchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: false,
    trim: true 
  },
  website: { 
    type: String, 
    required: false,
    trim: true 
  },
  logo: { 
    type: String, 
    required: false,
    default: null 
  },
  description: { 
    type: String, 
    required: false,
    maxlength: 2000 
  },
  address: {
    type: String, 
    required: false,
    maxlength: 2000 
  },
  username: {
    type: String,
    ref: 'User',
    required: false,
    trim: true
  }
  
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});



// Virtual để tính số lượng jobs (nếu cần)
CompanySchema.virtual('jobCount', {
  ref: 'JobDetail',
  localField: 'name',
  foreignField: 'company',
  count: true
});

// Method để format thông tin công ty
CompanySchema.methods.getPublicInfo = function() {
  return {
    _id: this._id,
    name: this.name,
    logo: this.logo,
    description: this.description,
    website: this.website,
    industry: this.industry,
    companySize: this.companySize,
    address: this.address,
    verified: this.verified,
    totalJobs: this.totalJobs
  };
};

// Static method để tìm công ty theo tên
CompanySchema.statics.findByName = function(name) {
  return this.findOne({ name: new RegExp(name, 'i') });
};

const Company = models.Company || model("Company", CompanySchema, "Company");
export default Company;