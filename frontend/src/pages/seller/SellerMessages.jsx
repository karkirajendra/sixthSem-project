// src/pages/seller/SellerMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import {
  getSellerChatRooms,
  getSellerPropertyChats,
  getSellerChatMessages,
  sendSellerMessage,
  markSellerMessagesAsRead
} from '../../api/sellerChatApi';
import { FaPaperPlane, FaUser, FaComments, FaHome, FaUsers, FaStore, FaCrown, FaBuilding, FaTimes, FaCheck, FaCheckDouble } from 'react-icons/fa';

const SellerMessages = () => {
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [propertyChats, setPropertyChats] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wsRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const messageIds = useRef(new Set()); // Track message IDs to prevent duplicates

  useEffect(() => {
    loadChatData();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom._id);
      markMessagesAsRead(selectedRoom._id);
      initializeWebSocket(selectedRoom._id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWebSocket = (roomId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = `ws://localhost:5000/ws?roomId=${roomId}&userId=${currentUser.id}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          // Check for duplicate messages
          if (!messageIds.current.has(data.message._id)) {
            messageIds.current.add(data.message._id);
            setMessages(prev => [...prev, data.message]);
          }
        } else if (data.type === 'user_typing') {
          if (data.userId !== currentUser.id) {
            setTypingUser(data.userName || 'Someone');
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setTypingUser(null);
            }, 3000);
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const loadChatData = async () => {
    try {
      const [rooms, propertyChatsData] = await Promise.all([
        getSellerChatRooms(),
        getSellerPropertyChats()
      ]);
      setChatRooms(rooms);
      setPropertyChats(propertyChatsData);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const chatMessages = await getSellerChatMessages(roomId);
      // Reset message IDs to prevent duplicates
      messageIds.current = new Set(chatMessages.map(msg => msg._id));
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async (roomId) => {
    try {
      await markSellerMessagesAsRead(roomId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const otherParticipant = selectedRoom.participants.find(p => p._id !== currentUser.id);
      const messageData = {
        text: messageText,
        receiverId: otherParticipant._id,
        roomId: selectedRoom._id,
        propertyId: selectedRoom.propertyId?._id
      };

      const sentMessage = await sendSellerMessage(messageData);
      // Add to message IDs to prevent duplicates
      messageIds.current.add(sentMessage._id);
      
      // Fallback if WebSocket is not connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setMessages(prev => [...prev, sentMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        roomId: selectedRoom._id,
        userId: currentUser.id,
        userName: currentUser.name
      }));
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Helper function to determine message styling and info
  const getMessageInfo = (msg) => {
    const isCurrentUser = msg.senderId._id === currentUser.id;
    const isSeller = msg.senderId.role === 'seller';
    const isBuyer = msg.senderId.role === 'buyer';
    const isAdmin = msg.senderId.role === 'admin';

    return {
      isCurrentUser,
      isSeller,
      isBuyer,
      isAdmin,
      senderName: msg.senderId.name,
      senderRole: msg.senderId.role,
      alignment: isCurrentUser ? 'justify-end' : 'justify-start',
      bubbleColor: isCurrentUser 
        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
        : (isAdmin 
          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200'
          : (isBuyer 
            ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200'
            : 'bg-gray-200 text-gray-800')),
      roleIcon: isAdmin ? <FaCrown className="text-xs" /> : (isBuyer ? <FaUser className="text-xs" /> : <FaStore className="text-xs" />),
      roleLabel: isAdmin ? 'Admin' : (isBuyer ? 'Buyer' : 'Seller'),
      roleLabelColor: isAdmin ? 'text-purple-600' : (isBuyer ? 'text-blue-600' : 'text-teal-600')
    };
  };

  // Helper function to get role display info for avatars and lists
  const getRoleDisplayInfo = (user) => {
    const isAdmin = user.role === 'admin';
    const isBuyer = user.role === 'buyer';
    const isSeller = user.role === 'seller';
    
    return {
      icon: isAdmin ? <FaCrown className="text-purple-500" /> : (isBuyer ? <FaUser className="text-blue-500" /> : <FaStore className="text-teal-500" />),
      bgColor: isAdmin ? 'bg-purple-100' : (isBuyer ? 'bg-blue-100' : 'bg-teal-100'),
      textColor: isAdmin ? 'text-purple-600' : (isBuyer ? 'text-blue-600' : 'text-teal-600'),
      roleLabel: isAdmin ? 'Admin' : (isBuyer ? 'Buyer' : 'Seller'),
      badgeColor: isAdmin ? 'bg-purple-100 text-purple-600' : (isBuyer ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600')
    };
  };

  const getOtherParticipant = (room) => {
    return room.participants.find(p => p._id !== currentUser.id);
  };

  const getDisplayChats = () => {
    return activeTab === 'all' ? chatRooms : propertyChats;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-b from-blue-50 to-teal-50 min-h-screen">
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
    <div className="p-6 bg-gradient-to-b from-blue-50 to-teal-50 min-h-screen">
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-3 rounded-lg mr-4">
            <FaStore className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Seller Messages</h1>
            <p className="text-gray-600">Communicate with buyers and administrators</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md focus:outline-none"
        >
          {isMobileSidebarOpen ? <FaTimes /> : <FaComments />}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Chat Rooms */}
        <div className={`md:col-span-1 bg-white rounded-lg shadow-lg p-6 transition-all duration-300 ${
          isMobileSidebarOpen ? 'block' : 'hidden md:block'
        }`}>
          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <FaUsers className="inline mr-2" />
              All Chats
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                activeTab === 'properties'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('properties')}
            >
              <FaHome className="inline mr-2" />
              Property Chats
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getDisplayChats().length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaComments className="text-3xl text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {activeTab === 'all' ? 'No chats yet' : 'No property chats yet'}
                </p>
              </div>
            ) : (
              getDisplayChats().map(room => {
                const otherParticipant = getOtherParticipant(room);
                const roleInfo = getRoleDisplayInfo(otherParticipant);
                
                return (
                  <div
                    key={room._id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                      selectedRoom?._id === room._id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsMobileSidebarOpen(false);
                    }}
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {otherParticipant.name}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${roleInfo.badgeColor}`}>
                          {roleInfo.roleLabel}
                        </span>
                      </div>
                      {room.propertyId && (
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <FaBuilding className="mr-1" />
                          <span className="truncate">{room.propertyId.title}</span>
                        </div>
                      )}
                      {room.lastMessage && (
                        <p className="text-xs text-gray-500 truncate">
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

        {/* Right side - Chat Messages */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                <div className="flex items-center">
                  <div className="relative">
                    {getOtherParticipant(selectedRoom).profile?.avatar ? (
                      <img
                        src={getOtherParticipant(selectedRoom).profile.avatar}
                        alt={getOtherParticipant(selectedRoom).name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4`}>
                        {getRoleDisplayInfo(getOtherParticipant(selectedRoom)).icon}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {getOtherParticipant(selectedRoom).name}
                    </h3>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        {getRoleDisplayInfo(getOtherParticipant(selectedRoom)).roleLabel}
                      </span>
                      {selectedRoom.propertyId && (
                        <div className="flex items-center text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          <FaBuilding className="mr-1" />
                          <span className="truncate">{selectedRoom.propertyId.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-full p-4 inline-block mb-4">
                      <FaComments className="text-4xl text-blue-500" />
                    </div>
                    <p className="text-lg font-medium mb-2">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
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
                              <span className={`text-xs ml-1 px-2 py-1 rounded-full ${getRoleDisplayInfo(msg.senderId).badgeColor}`}>
                                ({messageInfo.roleLabel})
                              </span>
                            </div>
                          )}
                          
                          {/* Message bubble */}
                          <div className={`px-4 py-3 rounded-lg shadow-sm ${messageInfo.bubbleColor} ${
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
                              <div className="flex items-center">
                                {messageInfo.isCurrentUser && (
                                  <>
                                    {msg.read ? (
                                      <FaCheckDouble className="text-xs opacity-70 ml-2 text-blue-300" title="Read" />
                                    ) : (
                                      <FaCheck className="text-xs opacity-70 ml-2" title="Sent" />
                                    )}
                                  </>
                                )}
                                {/* Role badge for own messages */}
                                {messageInfo.isCurrentUser && (
                                  <div className="flex items-center ml-2">
                                    <FaStore className="text-xs opacity-70 mr-1" />
                                    <span className="text-xs opacity-70">Seller</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {isTyping && typingUser && (
                  <div className="flex justify-start">
                    <div className="max-w-xs">
                      <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-tl-none">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">{typingUser} is typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={1000}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-r-lg hover:from-blue-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center">
                  <FaComments className="text-4xl text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a chat to start</h3>
                <p className="text-sm text-gray-500">Choose a conversation to begin messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerMessages;