import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const FollowSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jobId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Tạo compound index để tránh duplicate follow
FollowSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Follow = models.Follow || model("Follow", FollowSchema, "Follow");
export default Follow;
