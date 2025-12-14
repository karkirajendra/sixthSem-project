// src/pages/buyer/BuyerMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import {
  getChatRooms,
  getMessages,
  sendMessage,
  markMessagesAsRead
} from '../../api/chat';
import { FaPaperPlane, FaUser, FaComments, FaStore, FaHome, FaBuilding, FaCheck, FaCheckDouble, FaTimes } from 'react-icons/fa';

const BuyerMessages = () => {
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wsRef = useRef(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadChatRooms();
    
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
      const wsUrl = `ws://localhost:5000?roomId=${roomId}&userId=${currentUser.id}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          setMessages(prev => {
            if (prev.find(msg => msg._id === data.message._id)) {
              return prev;
            }
            return [...prev, data.message];
          });
          
          // Update chat room list with new message
          setChatRooms(prev => prev.map(room => 
            room._id === roomId 
              ? { ...room, lastMessage: data.message, hasUnread: data.message.senderId._id !== currentUser.id }
              : room
          ));
        } else if (data.type === 'user_typing') {
          if (data.userId !== currentUser.id) {
            setTypingUser(data.userName);
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              setTypingUser(null);
            }, 3000);
          }
        } else if (data.type === 'message_read') {
          // Update read status of messages
          setMessages(prev => prev.map(msg => 
            msg._id === data.messageId ? { ...msg, read: true } : msg
          ));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  };

  const loadChatRooms = async () => {
    try {
      const rooms = await getChatRooms();
      // Add unread status for each room
      const roomsWithUnread = rooms.map(room => ({
        ...room,
        hasUnread: room.lastMessage && 
                   room.lastMessage.senderId._id !== currentUser.id && 
                   !room.lastMessage.read
      }));
      setChatRooms(roomsWithUnread);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const chatMessages = await getMessages(roomId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
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

      const sentMessage = await sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      
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

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    
    // Mark as read and update local state
    setChatRooms(prev => prev.map(r => 
      r._id === room._id ? { ...r, hasUnread: false } : r
    ));
    
    // Prevent scrolling to footer by focusing on the messages container
    if (messagesContainerRef.current) {
      messagesContainerRef.current.focus();
    }
    
    // Close mobile sidebar if open
    setIsMobileSidebarOpen(false);
  };

  const getMessageInfo = (msg) => {
    const isCurrentUser = msg.senderId._id === currentUser.id;
    const isSeller = msg.senderId.role === 'seller';

    return {
      isCurrentUser,
      isSeller,
      senderName: msg.senderId.name,
      alignment: isCurrentUser ? 'justify-end' : 'justify-start',
      bubbleColor: isCurrentUser 
        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200',
      roleIcon: isSeller ? <FaStore className="text-xs" /> : <FaUser className="text-xs" />,
      roleLabel: isSeller ? 'Seller' : 'Buyer'
    };
  };

  const getRoleDisplayInfo = (user) => {
    const isSeller = user.role === 'seller';
    return {
      icon: isSeller ? <FaStore className="text-green-500" /> : <FaUser className="text-blue-500" />,
      bgColor: isSeller ? 'bg-green-100' : 'bg-blue-100',
      textColor: isSeller ? 'text-green-600' : 'text-blue-600',
      roleLabel: isSeller ? 'Property Owner' : 'Buyer',
      badgeColor: isSeller ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
    };
  };

  // Get OTHER participant (not current user)
  const getOtherParticipant = (room) => {
    return room.participants.find(p => p._id !== currentUser.id);
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
            <FaComments className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Messages</h1>
            <p className="text-gray-600">Chat with property owners</p>
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
          <div className="flex items-center mb-4">
            <FaComments className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {chatRooms.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaComments className="text-3xl text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No conversations yet</p>
                <p className="text-xs text-gray-400">Start chatting with property owners!</p>
              </div>
            ) : (
              chatRooms.map(room => {
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
                    onClick={() => handleRoomSelect(room)}
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
                        <p className={`text-sm font-medium text-gray-800 truncate ${room.hasUnread ? 'font-bold' : ''}`}>
                          {otherParticipant.name}
                        </p>
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${roleInfo.badgeColor}`}>
                            {roleInfo.roleLabel}
                          </span>
                          {room.hasUnread && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
                          )}
                        </div>
                      </div>
                      {room.propertyId && (
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <FaBuilding className="mr-1" />
                          <span className="truncate">{room.propertyId.title}</span>
                        </div>
                      )}
                      {room.lastMessage && (
                        <p className={`text-xs text-gray-500 truncate ${room.hasUnread ? 'font-semibold' : ''}`}>
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
              {/* Chat Header - Shows OTHER participant's info */}
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
                      <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                        <FaStore className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {getOtherParticipant(selectedRoom).name}
                    </h3>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        Property Owner
                      </span>
                      {selectedRoom.propertyId && (
                        <div className="flex items-center text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          <FaHome className="mr-1" />
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
                              <span className="text-xs font-medium ml-1 text-gray-600">
                                {messageInfo.senderName}
                              </span>
                              <span className="text-xs ml-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
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
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-r-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
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
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a conversation</h3>
                <p className="text-sm text-gray-500">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerMessages;