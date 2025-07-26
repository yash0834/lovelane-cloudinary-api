import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection, addFirestoreDocument } from "@/hooks/useFirestore";
import { Message, UserProfile } from "@shared/schema";
import { where, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image } from "lucide-react";
import { uploadImage } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";

interface ChatScreenProps {
  matchId: string;
  partnerId: string;
  partnerProfile: UserProfile;
  onBack: () => void;
}

export const ChatScreen = ({ matchId, partnerId, partnerProfile, onBack }: ChatScreenProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this match
  const { data: messages } = useFirestoreCollection<Message>("messages", [
    where("matchId", "==", matchId),
    orderBy("createdAt", "asc")
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string, imageUrl?: string) => {
    if (!userProfile || (!text.trim() && !imageUrl)) return;

    setSending(true);
    try {
      await addFirestoreDocument("messages", {
        matchId,
        senderId: userProfile.id,
        receiverId: partnerId,
        text: text.trim(),
        imageUrl,
      });
      
      setMessageText("");
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(messageText);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      await sendMessage("", imageUrl);
      toast({
        title: "Image sent!",
        description: "Your image has been shared.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload and send image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 flex items-center space-x-4 text-white">
        <button onClick={onBack} className="text-xl" data-testid="back-button">
          <ArrowLeft />
        </button>
        <img
          src={partnerProfile.profileImages[0]}
          alt={partnerProfile.name}
          className="w-10 h-10 rounded-full object-cover"
          data-testid="partner-avatar"
        />
        <div className="flex-1">
          <h3 className="font-semibold" data-testid="partner-name">{partnerProfile.name}</h3>
          <p className="text-sm text-pink-100">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500" data-testid="no-messages">
              Start the conversation with {partnerProfile.name}!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromCurrentUser = message.senderId === userProfile?.id;
            
            return (
              <div
                key={message.id}
                className={`flex items-end space-x-2 ${
                  isFromCurrentUser ? "justify-end" : ""
                }`}
                data-testid={`message-${message.id}`}
              >
                {!isFromCurrentUser && (
                  <img
                    src={partnerProfile.profileImages[0]}
                    alt={partnerProfile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    isFromCurrentUser
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-md"
                      : "bg-gray-200 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="w-full rounded-lg mb-2"
                      data-testid="message-image"
                    />
                  )}
                  {message.text && (
                    <p data-testid="message-text">{message.text}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              disabled={sending}
              data-testid="message-input"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingImage}
                data-testid="image-upload-input"
              />
              <button
                className="text-gray-400 hover:text-pink-500 transition-colors"
                disabled={uploadingImage}
                data-testid="attach-image-button"
              >
                <Image className="w-5 h-5" />
              </button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={sending || !messageText.trim()}
            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-pink-600 hover:to-pink-700 disabled:opacity-50"
            data-testid="send-button"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
