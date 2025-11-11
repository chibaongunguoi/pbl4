import pkg from 'mongoose'
const { Schema, model, models } = pkg;

const NotificationSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  JobDetailID: {
    type: Schema.Types.ObjectId,
    ref: 'JobDetail',
    required: false
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['chưa đọc', 'đã đọc'],
    default: 'chưa đọc',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ userID: 1 });
NotificationSchema.index({ status: 1 });

// Remove cached model in dev to avoid OverwriteModelError
if (models.Notification) {
  delete models.Notification;
}

const Notification = model('Notification', NotificationSchema, 'Notification');
export default Notification;
