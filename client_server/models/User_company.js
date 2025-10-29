import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const UserCompanySchema = new Schema({
  userID: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyID: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  time: { 
    type: Date, 
    default: Date.now,
    required: true 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
UserCompanySchema.index({ userID: 1, companyID: 1 });
UserCompanySchema.index({ time: -1 });

// Remove cached model if it exists to avoid overwrite issues in dev
if (models.User_company) {
  delete models.User_company;
}

const User_company = model("User_company", UserCompanySchema, "User_company");
export default User_company;
