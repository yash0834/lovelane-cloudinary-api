export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset?: string;
}

export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: "dnmvyvvqh",
  apiKey: "592154457426537",
  uploadPreset: "ml_default", // Using default preset for now
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset || "ml_default");
  formData.append("cloud_name", cloudinaryConfig.cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
