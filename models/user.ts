import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], required: true }
});

const User = models.User || model("User", UserSchema);
export default User;
