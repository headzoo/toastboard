import imageCompression from "browser-image-compression";

const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024;

export async function compressGuestPhoto(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a photo (jpg, png, or heic).");
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error("That photo is a bit large — try one under 20 MB.");
  }

  return imageCompression(file, {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.82,
  });
}
