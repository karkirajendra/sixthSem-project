import asyncHandler from 'express-async-handler';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/user.js';
import Property from '../models/Property.js';

// Helper to build participants array (current user + other user)
const resolveParticipants = async (currentUserId, { sellerId, buyerId, otherUserId }) => {
  if (otherUserId) {
    return [currentUserId, otherUserId];
  }

  if (sellerId && buyerId) {
    return [sellerId, buyerId];
  }

  const ids = [currentUserId];
  if (sellerId && sellerId.toString() !== currentUserId.toString()) {
    ids.push(sellerId);
  }
  if (buyerId && buyerId.toString() !== currentUserId.toString()) {
    ids.push(buyerId);
  }

  return Array.from(new Set(ids));
};

// @desc    Get or create a chat room
// @route   POST /api/chat/room
// @access  Private
export const getOrCreateChatRoom = asyncHandler(async (req, res) => {
  const { propertyId, sellerId, buyerId, isAdminChat = false, otherUserId } = req.body;

  const currentUserId = req.user._id;

  const participants = await resolveParticipants(currentUserId, {
    sellerId,
    buyerId,
    otherUserId,
  });

  if (participants.length < 2) {
    res.status(400);
    throw new Error('A chat room requires at least two participants');
  }

  const normalizedParticipants = participants.map((id) => id.toString()).sort();

  // Find an existing room with same participants and property
  const existingRooms = await ChatRoom.find({
    propertyId: propertyId || null,
    isAdminChat: !!isAdminChat,
  }).lean();

  let room =
    existingRooms.find((r) => {
      const ids = r.participants.map((p) => p.toString()).sort();
      return (
        ids.length === normalizedParticipants.length &&
        ids.every((id, idx) => id === normalizedParticipants[idx])
      );
    }) || null;

  if (!room) {
    const created = await ChatRoom.create({
      participants,
      propertyId: propertyId || null,
      isAdminChat: !!isAdminChat,
    });
    room = created.toObject();
  }

  const populatedRoom = await ChatRoom.findById(room._id)
    .populate('participants', 'name role profile')
    .populate('propertyId', 'title location price images type')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId receiverId', select: 'name role profile' },
    });

  res.json(populatedRoom);
});

// @desc    Get chat rooms for current user
// @route   GET /api/chat/rooms
// @access  Private
export const getUserChatRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({
    participants: req.user._id,
  })
    .sort('-updatedAt')
    .populate('participants', 'name role profile')
    .populate('propertyId', 'title location price images type')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId receiverId', select: 'name role profile' },
    })
    .lean();

  res.json(rooms);
});

// @desc    Get property-related chats (primarily for sellers)
// @route   GET /api/chat/property-chats
// @access  Private
export const getPropertyChats = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({
    participants: req.user._id,
    propertyId: { $ne: null },
  })
    .sort('-updatedAt')
    .populate('participants', 'name role profile')
    .populate('propertyId', 'title location price images type')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId receiverId', select: 'name role profile' },
    })
    .lean();

  res.json(rooms);
});

// @desc    Get messages for a chat room (buyer endpoint)
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
export const getRoomMessages = asyncHandler(async (req, res) => {
  const room = await ChatRoom.findById(req.params.roomId);
  if (!room) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Ensure current user is a participant
  if (!room.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error('Not authorized to view messages for this room');
  }

  const messages = await Message.find({ roomId: room._id })
    .sort('createdAt')
    .populate('senderId', 'name role profile')
    .populate('receiverId', 'name role profile')
    .lean();

  res.json(messages);
});

// @desc    Get messages for a chat room (seller endpoint alias)
// @route   GET /api/seller/chat/messages/:roomId
// @access  Private (Seller/Admin)
export const getSellerRoomMessages = getRoomMessages;

// @desc    Send a message (buyer/admin endpoint)
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { text, receiverId, roomId, propertyId } = req.body;

  if (!text || !receiverId || !roomId) {
    res.status(400);
    throw new Error('Text, receiverId, and roomId are required');
  }

  const room = await ChatRoom.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Ensure both sender and receiver are participants in the room
  const participantsSet = room.participants.map((p) => p.toString());
  if (
    !participantsSet.includes(req.user._id.toString()) ||
    !participantsSet.includes(receiverId.toString())
  ) {
    res.status(403);
    throw new Error('Both sender and receiver must be participants in the room');
  }

  const message = await Message.create({
    roomId: room._id,
    senderId: req.user._id,
    receiverId,
    propertyId: propertyId || room.propertyId || null,
    text,
  });

  // Update last message on room
  room.lastMessage = message._id;
  await room.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name role profile')
    .populate('receiverId', 'name role profile')
    .lean();

  res.status(201).json(populatedMessage);
});

// @desc    Send a message (seller endpoint alias)
// @route   POST /api/seller/chat/message
// @access  Private (Seller/Admin)
export const sendSellerMessage = sendMessage;

// @desc    Get unread message count for current user
// @route   GET /api/chat/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiverId: req.user._id,
    read: false,
  });

  res.json({ unread: count });
});

// @desc    Mark messages in a room as read (buyer endpoint)
// @route   POST /api/chat/messages/read
// @access  Private
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    res.status(400);
    throw new Error('roomId is required');
  }

  const room = await ChatRoom.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error('Chat room not found');
  }

  // Ensure current user is a participant
  if (!room.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error('Not authorized to update messages for this room');
  }

  await Message.updateMany(
    {
      roomId,
      receiverId: req.user._id,
      read: false,
    },
    { $set: { read: true } }
  );

  res.json({ success: true });
});

// @desc    Mark messages in a room as read (seller endpoint alias)
// @route   PUT /api/seller/chat/messages/read
// @access  Private (Seller/Admin)
export const markSellerMessagesAsRead = markMessagesAsRead;

// @desc    Get seller chat rooms
// @route   GET /api/seller/chat/rooms
// @access  Private (Seller/Admin)
export const getSellerChatRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({
    participants: req.user._id,
  })
    .sort('-updatedAt')
    .populate('participants', 'name role profile')
    .populate('propertyId', 'title location price images type')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId receiverId', select: 'name role profile' },
    })
    .lean();

  res.json(rooms);
});

// @desc    Get seller property chats
// @route   GET /api/seller/chat/property-chats
// @access  Private (Seller/Admin)
export const getSellerPropertyChats = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({
    participants: req.user._id,
    propertyId: { $ne: null },
  })
    .sort('-updatedAt')
    .populate('participants', 'name role profile')
    .populate('propertyId', 'title location price images type')
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId receiverId', select: 'name role profile' },
    })
    .lean();

  res.json(rooms);
});

