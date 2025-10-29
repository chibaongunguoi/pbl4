import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const UserProfileSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, default: null },
  gender: {
    type: String,
    enum: {
      values: ["nam", "nữ"],
      message: '{VALUE} is not a valid gender'
    }
  },
  birthdate: { type: Date },
  // CV stored as a string path or URL pointing to a PDF
  cv: { type: String },
  description: { type: String },
  // Foreign key linking to the User model via username
  username: { type: String, ref: 'User', required: true }
});

// Remove cached model if it exists to avoid overwrite issues in dev
if (models.UserProfile) {
  delete models.UserProfile;
}

const UserProfile = model("UserProfile", UserProfileSchema, "UserProfile");
export default UserProfile;
