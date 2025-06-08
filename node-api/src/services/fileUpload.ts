import { minioClient } from "..";

export const uploadFileToBucket = async (
  bucket: string,
  filename: string,
  mimeType: string,
  buffer: Buffer,
) => {
  const bucketExists = await minioClient.bucketExists(bucket);
  if (!bucketExists) {
    await minioClient.makeBucket(bucket, bucket);
  }

  await minioClient.putObject(bucket, filename, buffer, buffer.length, {
    "Content-Type": mimeType,
  });
};
