import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImage } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, ArrowLeft } from "lucide-react";
import { UserProfile } from "@shared/schema";

export const ProfileSetup = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    interestedIn: "",
    location: "",
    bio: "",
    interests: "",
  });
  const [profileImages, setProfileImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      setProfileImages(prev => [...prev, imageUrl]);
      toast({
        title: "Image uploaded successfully!",
        description: "Your profile photo has been added.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profileImages.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one profile photo.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profile: UserProfile = {
        id: user.uid,
        email: user.email!,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as "male" | "female" | "non-binary",
        interestedIn: formData.interestedIn as "men" | "women" | "everyone",
        bio: formData.bio,
        location: formData.location,
        interests: formData.interests.split(",").map(i => i.trim()).filter(Boolean),
        profileImages,
        createdAt: new Date(),
        lastActive: new Date(),
      };

      await updateUserProfile(profile);
      toast({
        title: "Profile created!",
        description: "Welcome to Lovelane. Start discovering amazing people!",
      });
    } catch (error) {
      toast({
        title: "Profile setup failed",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 pb-8">
        <div className="flex items-center justify-between text-white">
          <button className="text-2xl" data-testid="back-button">
            <ArrowLeft />
          </button>
          <h2 className="text-xl font-semibold">Setup Profile</h2>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="p-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* Profile Image Upload */}
          <div className="text-center">
            <div className="relative">
              {profileImages.length > 0 ? (
                <img
                  src={profileImages[0]}
                  alt="Profile"
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                  data-testid="profile-image-preview"
                />
              ) : (
                <div className="w-32 h-32 mx-auto bg-pink-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Camera className="text-pink-500 text-2xl" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingImage}
                data-testid="image-upload-input"
              />
            </div>
            <button
              type="button"
              className="text-pink-500 font-semibold mt-4"
              disabled={uploadingImage}
              data-testid="upload-photo-button"
            >
              {uploadingImage ? "Uploading..." : "Add Photos"}
            </button>
            <p className="text-sm text-gray-500 mt-1">
              {profileImages.length}/6 photos uploaded
            </p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              required
              data-testid="name-input"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
                min="18"
                max="100"
                data-testid="age-input"
              />
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none" data-testid="gender-select">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select
              value={formData.interestedIn}
              onValueChange={(value) => setFormData(prev => ({ ...prev, interestedIn: value }))}
            >
              <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none" data-testid="interested-in-select">
                <SelectValue placeholder="Interested In" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="everyone">Everyone</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              required
              data-testid="location-input"
            />

            <Textarea
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none h-24 resize-none"
              required
              data-testid="bio-textarea"
            />

            <Input
              placeholder="Interests (comma separated)"
              value={formData.interests}
              onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              required
              data-testid="interests-input"
            />

            <Button
              type="submit"
              disabled={loading || profileImages.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-pink-700 disabled:opacity-50"
              data-testid="complete-profile-button"
            >
              {loading ? "Creating Profile..." : "Complete Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
