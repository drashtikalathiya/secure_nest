const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const getCloudinaryConfigError = () => {
  if (!CLOUDINARY_CLOUD_NAME) return "Cloudinary cloud name is missing.";
  if (!CLOUDINARY_UPLOAD_PRESET) return "Cloudinary upload preset is missing.";
  return null;
};

export const uploadImageToCloudinary = async (file) => {
  const configError = getCloudinaryConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await res.json();
  if (!res.ok || !data?.secure_url) {
    const message = data?.error?.message || "Cloudinary upload failed.";

    if (message.toLowerCase().includes("upload preset not found")) {
      throw new Error(
        "Cloudinary upload preset not found. Check REACT_APP_CLOUDINARY_UPLOAD_PRESET and make sure an unsigned preset with this exact name exists in your Cloudinary account.",
      );
    }

    throw new Error(message);
  }

  return data;
};
