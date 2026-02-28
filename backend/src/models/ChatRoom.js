import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
    },
    isAdminChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a single room per participants/property combination
chatRoomSchema.index(
  { participants: 1, propertyId: 1, isAdminChat: 1 },
  { unique: false }
);

export default mongoose.model('ChatRoom', chatRoomSchema);

