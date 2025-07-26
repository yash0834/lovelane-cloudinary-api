import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SwipeCard } from "@/components/SwipeCard";
import { MatchModal } from "@/components/MatchModal";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ChatScreen } from "@/pages/ChatScreen";
import { useFirestoreCollection, addFirestoreDocument, getFirestoreDocuments } from "@/hooks/useFirestore";
import { UserProfile, Match, Swipe, Message } from "@shared/schema";
import { where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Sliders, Search, MessageCircle } from "lucide-react";

export const MainApp = () => {
  const { userProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("swipe");
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedChat, setSelectedChat] = useState<{
    matchId: string;
    partnerId: string;
    partnerProfile: UserProfile;
  } | null>(null);
  const [matchedUsers, setMatchedUsers] = useState<Map<string, UserProfile>>(new Map());

  // Fetch potential matches
  useEffect(() => {
    if (!userProfile) return;

    const fetchPotentialMatches = async () => {
      try {
        // Get users that match preferences and haven't been swiped on
        const users = await getFirestoreDocuments<UserProfile>("users", [
          where("id", "!=", userProfile.id)
        ]);

        // Filter out already swiped users and apply preference filters
        const swipes = await getFirestoreDocuments<Swipe>("swipes", [
          where("fromUserId", "==", userProfile.id)
        ]);
        const swipedUserIds = swipes.map(swipe => swipe.toUserId);
        
        const filteredUsers = users.filter(user => {
          // Don't show already swiped users
          if (swipedUserIds.includes(user.id)) return false;
          
          // Apply gender preference filter
          if (userProfile.interestedIn === "men" && user.gender !== "male") return false;
          if (userProfile.interestedIn === "women" && user.gender !== "female") return false;
          
          return true;
        });
        
        setPotentialMatches(filteredUsers);
      } catch (error) {
        console.error("Error fetching potential matches:", error);
      }
    };

    fetchPotentialMatches();
  }, [userProfile]);

  // Fetch matches
  const { data: matches } = useFirestoreCollection<Match>("matches", [
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  ]);

  // Fetch user profiles for matches
  useEffect(() => {
    if (!userProfile || matches.length === 0) return;

    const fetchMatchedUserProfiles = async () => {
      const userProfiles = new Map<string, UserProfile>();

      for (const match of matches) {
        const partnerId = match.user1Id === userProfile.id ? match.user2Id : match.user1Id;
        
        if (!userProfiles.has(partnerId)) {
          try {
            const userDoc = await getDoc(doc(db, "users", partnerId));
            if (userDoc.exists()) {
              userProfiles.set(partnerId, { id: partnerId, ...userDoc.data() } as UserProfile);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      }

      setMatchedUsers(userProfiles);
    };

    fetchMatchedUserProfiles();
  }, [matches, userProfile]);

  const handleLike = async (userId: string) => {
    if (!userProfile) return;

    try {
      // Record the like
      await addFirestoreDocument("swipes", {
        fromUserId: userProfile.id,
        toUserId: userId,
        isLike: true,
      });

      // Check if the other user also liked this user
      const existingLike = await getFirestoreDocuments<Swipe>("swipes", [
        where("fromUserId", "==", userId),
        where("toUserId", "==", userProfile.id),
        where("isLike", "==", true)
      ]);

      if (existingLike.length > 0) {
        // It's a match!
        await addFirestoreDocument("matches", {
          user1Id: userProfile.id,
          user2Id: userId,
          isActive: true,
        });

        const matchedUser = potentialMatches.find(user => user.id === userId);
        if (matchedUser) {
          setNewMatch(matchedUser);
          setShowMatchModal(true);
        }
      }

      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDislike = async (userId: string) => {
    if (!userProfile) return;

    try {
      await addFirestoreDocument("swipes", {
        fromUserId: userProfile.id,
        toUserId: userId,
        isLike: false,
      });

      setCurrentCardIndex(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your choice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartChat = () => {
    setShowMatchModal(false);
    if (newMatch) {
      const match = matches.find(m => 
        (m.user1Id === userProfile?.id && m.user2Id === newMatch.id) ||
        (m.user2Id === userProfile?.id && m.user1Id === newMatch.id)
      );
      if (match) {
        setSelectedChat({
          matchId: match.id,
          partnerId: newMatch.id,
          partnerProfile: newMatch
        });
      }
    }
  };

  const handleChatSelect = (matchId: string, partnerId: string) => {
    const partnerProfile = matchedUsers.get(partnerId);
    if (partnerProfile) {
      setSelectedChat({
        matchId,
        partnerId,
        partnerProfile
      });
    }
  };

  const handleBackFromChat = () => {
    setSelectedChat(null);
    setActiveTab("chats");
  };

  const handleKeepSwiping = () => {
    setShowMatchModal(false);
  };

  const renderSwipeTab = () => {
    const currentUser = potentialMatches[currentCardIndex];
    
    return (
      <div className="main-content">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 pb-8">
          <div className="flex items-center justify-between text-white">
            <h1 className="text-2xl font-bold" data-testid="app-title">Lovelane</h1>
            <button className="text-2xl" data-testid="filters-button">
              <Sliders />
            </button>
          </div>
        </div>

        <div className="px-6 -mt-4 relative z-10">
          {currentUser ? (
            <SwipeCard
              user={currentUser}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-pink-500 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2" data-testid="no-profiles-title">
                No more profiles
              </h3>
              <p className="text-gray-600" data-testid="no-profiles-description">
                Check back later for new people in your area
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMatchesTab = () => (
    <div className="main-content">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 pb-8">
        <h2 className="text-2xl font-bold text-white" data-testid="matches-title">Your Matches</h2>
      </div>
      
      <div className="px-6 -mt-4 relative z-10">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600" data-testid="no-matches-message">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {matches.map((match) => {
              const partnerId = match.user1Id === userProfile?.id ? match.user2Id : match.user1Id;
              const partnerProfile = matchedUsers.get(partnerId);
              
              if (!partnerProfile) return null;
              
              return (
                <div
                  key={match.id}
                  onClick={() => handleChatSelect(match.id, partnerId)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                  data-testid={`match-${match.id}`}
                >
                  <img
                    src={partnerProfile.profileImages?.[0] || "/placeholder-profile.svg"}
                    alt={partnerProfile.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800" data-testid="match-name">
                      {partnerProfile.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Matched on {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderChatsTab = () => (
    <div className="main-content">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 pb-8">
        <h2 className="text-2xl font-bold text-white" data-testid="chats-title">Messages</h2>
      </div>
      
      <div className="px-6 -mt-4 relative z-10">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-pink-500 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No conversations yet</h3>
            <p className="text-gray-600" data-testid="no-chats-message">
              Start chatting with your matches!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const partnerId = match.user1Id === userProfile?.id ? match.user2Id : match.user1Id;
              const partnerProfile = matchedUsers.get(partnerId);
              
              if (!partnerProfile) return null;
              
              return (
                <div
                  key={match.id}
                  onClick={() => handleChatSelect(match.id, partnerId)}
                  className="bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-4 cursor-pointer hover:shadow-xl transition-shadow"
                  data-testid={`chat-${match.id}`}
                >
                  <img
                    src={partnerProfile.profileImages?.[0] || "/placeholder-profile.svg"}
                    alt={partnerProfile.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800" data-testid="chat-partner-name">
                      {partnerProfile.name}
                    </h4>
                    <p className="text-gray-600 text-sm">Tap to start chatting</p>
                  </div>
                  <MessageCircle className="text-pink-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="main-content">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 pb-8">
        <h2 className="text-2xl font-bold text-white" data-testid="settings-title">Settings</h2>
      </div>
      
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={userProfile?.profileImages?.[0] || "/placeholder-profile.svg"}
              alt="Your profile"
              className="w-20 h-20 rounded-full object-cover"
              data-testid="user-profile-image"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800" data-testid="user-name">
                {userProfile?.name}
              </h3>
              <p className="text-gray-600" data-testid="user-email">{userProfile?.email}</p>
            </div>
          </div>
          
          <button
            onClick={signOut}
            className="w-full text-left p-4 hover:bg-gray-50 rounded-xl transition-colors text-red-500"
            data-testid="sign-out-button"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "swipe":
        return renderSwipeTab();
      case "matches":
        return renderMatchesTab();
      case "chats":
        return renderChatsTab();
      case "settings":
        return renderSettingsTab();
      default:
        return renderSwipeTab();
    }
  };

  // Show chat screen if a chat is selected
  if (selectedChat) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <ChatScreen
          matchId={selectedChat.matchId}
          partnerId={selectedChat.partnerId}
          partnerProfile={selectedChat.partnerProfile}
          onBack={handleBackFromChat}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {renderActiveTab()}
      
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {userProfile && newMatch && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          currentUser={userProfile}
          matchedUser={newMatch}
          onStartChat={handleStartChat}
          onKeepSwiping={handleKeepSwiping}
        />
      )}
    </div>
  );
};
