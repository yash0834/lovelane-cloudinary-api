import { useState } from "react";
import { UserProfile } from "@shared/schema";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { Heart, X } from "lucide-react";

interface SwipeCardProps {
  user: UserProfile;
  onLike: (userId: string) => void;
  onDislike: (userId: string) => void;
}

export const SwipeCard = ({ user, onLike, onDislike }: SwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { swipeHandlers, getSwipeStyle, dragOffset } = useSwipeGesture({
    onSwipeLeft: () => onDislike(user.id),
    onSwipeRight: () => onLike(user.id),
    threshold: 100,
  });

  const handleLike = () => onLike(user.id);
  const handleDislike = () => onDislike(user.id);

  const nextImage = () => {
    if (user.profileImages && user.profileImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev < user.profileImages.length - 1 ? prev + 1 : prev
      );
    }
  };

  const prevImage = () => {
    if (user.profileImages && user.profileImages.length > 0) {
      setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : prev);
    }
  };

  return (
    <div
      className="relative w-full h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
      style={getSwipeStyle()}
      {...swipeHandlers}
      data-testid={`swipe-card-${user.id}`}
    >
      {/* Swipe indicators */}
      <div className="absolute top-8 left-8 z-20">
        <div
          className={`px-4 py-2 rounded-full border-4 border-red-500 text-red-500 font-bold text-xl transform transition-opacity ${
            dragOffset.x < -50 ? "opacity-100" : "opacity-0"
          }`}
        >
          NOPE
        </div>
      </div>
      <div className="absolute top-8 right-8 z-20">
        <div
          className={`px-4 py-2 rounded-full border-4 border-green-500 text-green-500 font-bold text-xl transform transition-opacity ${
            dragOffset.x > 50 ? "opacity-100" : "opacity-0"
          }`}
        >
          LIKE
        </div>
      </div>

      {/* Image with dots indicator */}
      <div className="relative h-3/5">
        <img
          src={user.profileImages?.[currentImageIndex] || user.profileImages?.[0] || "/placeholder-profile.svg"}
          alt={user.name}
          className="w-full h-full object-cover"
          data-testid={`profile-image-${user.id}`}
        />
        
        {/* Image navigation areas */}
        <div
          className="absolute left-0 top-0 w-1/2 h-full z-10"
          onClick={prevImage}
          data-testid="prev-image-area"
        />
        <div
          className="absolute right-0 top-0 w-1/2 h-full z-10"
          onClick={nextImage}
          data-testid="next-image-area"
        />

        {/* Image dots */}
        {user.profileImages && user.profileImages.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {user.profileImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* User info */}
      <div className="p-6 h-2/5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800" data-testid="user-name">
              {user.name}, {user.age}
            </h3>
            <p className="text-gray-600" data-testid="user-location">{user.location}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4 flex-1 line-clamp-3" data-testid="user-bio">
          {user.bio}
        </p>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                data-testid={`interest-${index}`}
              >
                {interest}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{user.interests.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center space-x-8">
          <button
            onClick={handleDislike}
            className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl hover:bg-red-600 transition-colors shadow-lg"
            data-testid="dislike-button"
          >
            <X />
          </button>
          <button
            onClick={handleLike}
            className="w-20 h-20 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full flex items-center justify-center text-2xl hover:scale-105 transition-transform shadow-lg"
            data-testid="like-button"
          >
            <Heart />
          </button>
        </div>
      </div>
    </div>
  );
};
