import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const ChatHistorySchema = new Schema({
  userId: { type: String, required: true }, // admin user id
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Xóa model cũ nếu tồn tại để tránh cache
if (models.ChatHistory) {
  delete models.ChatHistory;
}

const ChatHistory = model("ChatHistory", ChatHistorySchema, "ChatHistory");
export default ChatHistory;