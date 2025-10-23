import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: {
      values: ["admin", "user", "company"],
      message: '{VALUE} is not a valid role'
    },
    required: true 
  }
});

// Xóa model cũ nếu tồn tại để tránh cache
if (models.User) {
  delete models.User;
}

const User = model("User", UserSchema, "User");
export default User;
