import { UserProfile } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  matchedUser: UserProfile;
  onStartChat: () => void;
  onKeepSwiping: () => void;
}

export const MatchModal = ({
  isOpen,
  onClose,
  currentUser,
  matchedUser,
  onStartChat,
  onKeepSwiping,
}: MatchModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-3xl p-8 text-center">
        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <img
              src={currentUser.profileImages[0]}
              alt="Your profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-pink-500"
              data-testid="current-user-image"
            />
            <img
              src={matchedUser.profileImages[0]}
              alt="Match profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-pink-500"
              data-testid="matched-user-image"
            />
          </div>
          <h2 className="text-3xl font-bold text-pink-500 mb-2" data-testid="match-title">
            It's a Match!
          </h2>
          <p className="text-gray-600" data-testid="match-description">
            You and <span className="font-semibold">{matchedUser.name}</span> liked each other
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onStartChat}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700"
            data-testid="start-chat-button"
          >
            Send Message
          </Button>
          <Button
            onClick={onKeepSwiping}
            variant="outline"
            className="w-full border-2 border-pink-500 text-pink-500 py-4 rounded-xl font-semibold hover:bg-pink-50"
            data-testid="keep-swiping-button"
          >
            Keep Swiping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
