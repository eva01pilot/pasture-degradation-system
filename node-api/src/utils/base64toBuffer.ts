export const base64toBuffer = (base64: string, mimeType = "image/png") => {
  const buffer = Buffer.from(base64, "base64");
  const extension = mimeType.split("/")[1]; // e.g., "png"
  return { buffer, extension, mimeType };
};
