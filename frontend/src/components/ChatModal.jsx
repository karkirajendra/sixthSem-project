// src/components/ChatModal.jsx
import { useState, useEffect, useRef } from "react";
import { FaTimes, FaPaperPlane, FaUser, FaStore, FaHome, FaCheck, FaCheckDouble } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import {
  getOrCreateChatRoom,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../api/chat";

const ChatModal = ({ propertyId, sellerId, sellerInfo, propertyTitle, onClose }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatRoom, setChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [messageIds, setMessageIds] = useState(new Set()); // Track message IDs to prevent duplicates

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        // Get or create chat room
        const room = await getOrCreateChatRoom(propertyId, sellerId);
        setChatRoom(room);

        // Fetch messages
        const chatMessages = await getMessages(room._id);
        setMessages(chatMessages);
        // Store message IDs to prevent duplicates
        setMessageIds(new Set(chatMessages.map(msg => msg._id)));

        // Mark messages as read
        await markMessagesAsRead(room._id);

        // Initialize WebSocket connection
        initializeWebSocket(room._id);
      } catch (err) {
        setError("Failed to load chat");
        console.error("Error initializing chat:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && sellerId) {
      initializeChat();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [currentUser, propertyId, sellerId]);

  const initializeWebSocket = (roomId) => {
    try {
      const wsUrl = `ws://localhost:5000?roomId=${roomId}&userId=${currentUser.id}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for room:', roomId);
        setError("");
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'new_message') {
            // Check if message already exists to prevent duplicates
            if (!messageIds.has(data.message._id)) {
              setMessages(prev => [...prev, data.message]);
              setMessageIds(prev => new Set(prev).add(data.message._id));
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
          } else if (data.type === 'message_read') {
            setMessages(prev => prev.map(msg => 
              msg._id === data.messageId ? { ...msg, read: true } : msg
            ));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError("Connection error - messages may not update in real-time");
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (roomId) {
            console.log('Attempting to reconnect WebSocket...');
            initializeWebSocket(roomId);
          }
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setError("Failed to connect - messages may not update in real-time");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chatRoom) return;

    const messageText = message.trim();
    setMessage("");

    try {
      const newMessage = {
        text: messageText,
        roomId: chatRoom._id,
        receiverId: sellerId,
        propertyId: propertyId,
      };

      const sentMessage = await sendMessage(newMessage);
      
      // Add message immediately for better UX (WebSocket will handle duplicates)
      setMessages(prev => [...prev, sentMessage]);
      setMessageIds(prev => new Set(prev).add(sentMessage._id));

    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
      setMessage(messageText);
    }
  };

  const handleTyping = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        roomId: chatRoom._id,
        userId: currentUser.id,
        userName: currentUser.name
      }));
    }
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
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-800',
      roleIcon: isSeller ? <FaStore className="text-xs" /> : <FaUser className="text-xs" />,
      roleLabel: isSeller ? 'Seller' : 'Buyer'
    };
  };

  // Get the OTHER participant's info for header
  const getOtherParticipantInfo = () => {
    if (currentUser.role === 'buyer') {
      // Buyer sees seller info
      return {
        name: sellerInfo?.name || 'Property Owner',
        role: 'Property Owner',
        avatar: sellerInfo?.profile?.avatar,
        icon: <FaStore className="text-white" />
      };
    } else {
      // Seller sees buyer info - we need to get this from chatRoom participants
      if (chatRoom?.participants) {
        const buyer = chatRoom.participants.find(p => p.role === 'buyer');
        return {
          name: buyer?.name || 'Buyer',
          role: 'Buyer', 
          avatar: buyer?.profile?.avatar,
          icon: <FaUser className="text-white" />
        };
      }
      return {
        name: 'Buyer',
        role: 'Buyer',
        avatar: null,
        icon: <FaUser className="text-white" />
      };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipantInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Shows OTHER participant's info */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative">
              {otherParticipant.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3 text-white">
                  {otherParticipant.icon}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {otherParticipant.name}
              </h2>
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-2">{otherParticipant.role}</span>
                {propertyTitle && (
                  <>
                    <span className="mx-1">•</span>
                    <FaHome className="mr-1" />
                    <span className="truncate max-w-xs">{propertyTitle}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Connection Status */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full p-4 inline-block">
                  <FaUser className="text-2xl text-gray-600" />
                </div>
              </div>
              <p className="text-sm font-medium mb-2">Start the conversation!</p>
              <p className="text-xs">Send a message to {otherParticipant.name}</p>
            </div>
            ) : (
            messages.map((msg) => {
              const messageInfo = getMessageInfo(msg);
              
              return (
                <div key={msg._id} className={`flex ${messageInfo.alignment}`}>
                  <div className="max-w-xs lg:max-w-md">
                    {/* Sender info (only for other person's messages) */}
                    {!messageInfo.isCurrentUser && (
                      <div className="flex items-center mb-1 px-2">
                        {messageInfo.roleIcon}
                        <span className="text-xs font-medium ml-1 text-gray-600">
                          {messageInfo.senderName}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`px-4 py-2 rounded-2xl ${messageInfo.bubbleColor} ${
                      messageInfo.isCurrentUser ? 'rounded-br-none' : 'rounded-bl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className="flex justify-end items-center mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {/* Message status for sent messages */}
                        {messageInfo.isCurrentUser && (
                          <div className="flex items-center ml-2">
                            {msg.read ? (
                              <FaCheckDouble className="text-xs opacity-70 text-blue-300" title="Read" />
                            ) : (
                              <FaCheck className="text-xs opacity-70" title="Sent" />
                            )}
                          </div>
                        )}
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
                <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600">{typingUser} is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder={`Message ${otherParticipant.name}...`}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-l-full focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-all"
              disabled={!chatRoom}
              maxLength={1000}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-r-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={!message.trim() || !chatRoom}
            >
              <FaPaperPlane />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">
            {message.length}/1000
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;