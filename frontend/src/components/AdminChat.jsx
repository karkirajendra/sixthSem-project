import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../contexts/AuthContext";
import {
  getAdminChatRooms,
  getSellersForAdmin,
  getOrCreateAdminSellerChat,
  getAdminChatMessages,
  sendAdminMessage
} from '../api/adminChatApi';
import { FaPaperPlane, FaSearch, FaUser, FaComments, FaUserShield, FaStore, FaCrown } from 'react-icons/fa';

const AdminChat = () => {
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatRooms();
    loadSellers();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom._id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      const rooms = await getAdminChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const sellersList = await getSellersForAdmin();
      setSellers(sellersList);
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const chatMessages = await getAdminChatMessages(roomId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startChatWithSeller = async (sellerId) => {
    try {
      const room = await getOrCreateAdminSellerChat(sellerId);
      setSelectedRoom(room);
      
      // Add to chat rooms if not already there
      if (!chatRooms.find(r => r._id === room._id)) {
        setChatRooms([room, ...chatRooms]);
      }
    } catch (error) {
      console.error('Error starting chat with seller:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const messageData = {
        text: newMessage,
        receiverId: selectedRoom.participants.find(p => p._id !== currentUser.id)._id,
        roomId: selectedRoom._id
      };

      const sentMessage = await sendAdminMessage(messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to get message styling based on role
  const getMessageInfo = (msg) => {
    const isCurrentUser = msg.senderId._id === currentUser.id;
    const isAdmin = msg.senderId.role === 'admin';
    const isSeller = msg.senderId.role === 'seller';

    return {
      isCurrentUser,
      isAdmin,
      isSeller,
      senderName: msg.senderId.name,
      senderRole: msg.senderId.role,
      alignment: isCurrentUser ? 'justify-end' : 'justify-start',
      bubbleColor: isCurrentUser 
        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
        : (isAdmin 
          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800'
          : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'),
      roleIcon: isAdmin ? <FaCrown className="text-xs" /> : <FaStore className="text-xs" />,
      roleLabel: isAdmin ? 'Admin' : 'Seller',
      roleLabelColor: isAdmin ? 'text-purple-600' : 'text-green-600',
      borderColor: isAdmin ? 'border-purple-200' : 'border-green-200'
    };
  };

  // Helper function to get role icon and styling for user avatars
  const getRoleDisplayInfo = (user) => {
    const isAdmin = user.role === 'admin';
    return {
      icon: isAdmin ? <FaCrown className="text-purple-500" /> : <FaStore className="text-green-500" />,
      bgColor: isAdmin ? 'bg-purple-100' : 'bg-green-100',
      textColor: isAdmin ? 'text-purple-600' : 'text-green-600',
      roleLabel: isAdmin ? 'Admin' : 'Seller'
    };
  };

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOtherParticipant = (room) => {
    return room.participants.find(p => p._id !== currentUser.id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 h-96 bg-gray-300 rounded"></div>
            <div className="md:col-span-2 h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-lg mr-4">
          <FaUserShield className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Chat Center</h1>
          <p className="text-gray-600">Communicate with sellers and manage support</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Sellers and Chat Rooms */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <FaStore className="text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Start New Chat</h2>
            </div>
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search sellers..."
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredSellers.map(seller => {
                const roleInfo = getRoleDisplayInfo(seller);
                return (
                  <div
                    key={seller._id}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all"
                    onClick={() => startChatWithSeller(seller._id)}
                  >
                    <div className="relative">
                      {seller.profile?.avatar ? (
                        <img
                          src={seller.profile.avatar}
                          alt={seller.name}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${roleInfo.bgColor} flex items-center justify-center mr-3`}>
                          {roleInfo.icon}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                        {roleInfo.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{seller.name}</p>
                      <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                        {roleInfo.roleLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <FaComments className="text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Chats</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {chatRooms.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                  No recent chats
                </p>
              ) : (
                chatRooms.map(room => {
                  const otherParticipant = getOtherParticipant(room);
                  const roleInfo = getRoleDisplayInfo(otherParticipant);
                  return (
                    <div
                      key={room._id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                        selectedRoom?._id === room._id 
                          ? 'bg-purple-50 border-purple-200' 
                          : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="relative">
                        {otherParticipant.profile?.avatar ? (
                          <img
                            src={otherParticipant.profile.avatar}
                            alt={otherParticipant.name}
                            className="w-12 h-12 rounded-full mr-3"
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full ${roleInfo.bgColor} flex items-center justify-center mr-3`}>
                            {roleInfo.icon}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                          {roleInfo.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {otherParticipant.name}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                            {roleInfo.roleLabel}
                          </span>
                        </div>
                        {room.lastMessage && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {room.lastMessage.text}
                          </p>
                        )}
                      </div>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(room.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right side - Chat Messages */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center">
                  <div className="relative">
                    {getOtherParticipant(selectedRoom).profile?.avatar ? (
                      <img
                        src={getOtherParticipant(selectedRoom).profile.avatar}
                        alt={getOtherParticipant(selectedRoom).name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <FaStore className="text-green-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-2 bg-white rounded-full p-1">
                      <FaStore className="text-green-500 text-xs" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {getOtherParticipant(selectedRoom).name}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        Seller
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        Active conversation
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <FaComments className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p className="text-lg mb-2">No messages yet</p>
                    <p className="text-sm">Start the conversation with this seller!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const messageInfo = getMessageInfo(msg);
                    
                    return (
                      <div key={msg._id} className={`flex ${messageInfo.alignment}`}>
                        <div className="max-w-xs lg:max-w-md">
                          {/* Sender info for incoming messages */}
                          {!messageInfo.isCurrentUser && (
                            <div className="flex items-center mb-2 px-2">
                              {messageInfo.roleIcon}
                              <span className={`text-xs font-medium ml-1 ${messageInfo.roleLabelColor}`}>
                                {messageInfo.senderName}
                              </span>
                              <span className={`text-xs ml-1 px-2 py-1 rounded-full bg-green-100 ${messageInfo.roleLabelColor}`}>
                                {messageInfo.roleLabel}
                              </span>
                            </div>
                          )}
                          
                          {/* Message bubble */}
                          <div className={`px-4 py-3 rounded-lg shadow-sm border ${messageInfo.bubbleColor} ${messageInfo.borderColor} ${
                            messageInfo.isCurrentUser 
                              ? 'rounded-tr-none' 
                              : 'rounded-tl-none'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-xs opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {/* Role badge for own messages */}
                              {messageInfo.isCurrentUser && (
                                <div className="flex items-center">
                                  <FaCrown className="text-xs opacity-70 mr-1" />
                                  <span className="text-xs opacity-70">Admin</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 bg-white">
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your admin message..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      maxLength={1000}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-r-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={!newMessage.trim()}
                  >
                    <FaPaperPlane className="mr-2" />
                    Send
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-right">
                  {newMessage.length}/1000
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                  <FaComments className="text-4xl text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a chat to start</h3>
                <p className="text-sm text-gray-500">Choose a seller from the list to begin messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;