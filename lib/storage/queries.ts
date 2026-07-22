import { createClient } from "@/lib/supabase/server";
import type { DocumentTypeId } from "@/lib/player-documents";

export const AVATARS_BUCKET = "avatars";
export const DOCUMENTS_BUCKET = "documents";

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export const AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SIGNED_URL_SECONDS = 60 * 60;

export type StorageUploadResult = {
  storagePath: string;
  /** Raw `data.path` from Supabase upload response (before normalize). */
  uploadResponsePath: string | null;
  /** Raw `data.fullPath` from Supabase upload response when present. */
  uploadResponseFullPath: string | null;
  publicUrl: string | null;
};

/**
 * Normalize an object key for upload/sign.
 * Strips leading slashes and an accidental `bucket/` prefix so the path
 * used for createSignedUrl always matches the key written on upload.
 */
export function normalizeObjectPath(bucket: string, path: string): string {
  let normalized = path.trim();
  while (normalized.startsWith("/")) {
    normalized = normalized.slice(1);
  }
  const bucketPrefix = `${bucket}/`;
  if (normalized.startsWith(bucketPrefix)) {
    normalized = normalized.slice(bucketPrefix.length);
  }
  return normalized;
}

function extensionFromFile(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) {
    return fromName;
  }
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "bin";
  }
}

/** Stable document file stem matching UI ids (english-test, sat-act, …). */
export function documentFileStem(documentType: DocumentTypeId): string {
  return documentType;
}

export function buildAvatarStoragePath(
  playerId: string,
  file: File,
): string {
  return `${playerId}/avatar.${extensionFromFile(file)}`;
}

export function buildDocumentStoragePath(
  playerId: string,
  documentType: DocumentTypeId,
  file: File,
): string {
  return `${playerId}/${documentFileStem(documentType)}.${extensionFromFile(file)}`;
}

export function assertAvatarFile(file: File): void {
  if (!file || file.size <= 0) {
    throw new Error("Profile image is required.");
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("Profile image must be 5MB or smaller.");
  }
  if (
    !(AVATAR_MIME_TYPES as readonly string[]).includes(file.type) &&
    !file.type.startsWith("image/")
  ) {
    throw new Error("Profile image must be a JPEG, PNG, WebP, or GIF.");
  }
}

export function assertDocumentFile(
  file: File,
  acceptImages = true,
): void {
  if (!file || file.size <= 0) {
    throw new Error("A file is required.");
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    throw new Error("File must be 10MB or smaller.");
  }

  const allowed = acceptImages
    ? DOCUMENT_MIME_TYPES
    : DOCUMENT_MIME_TYPES.filter((t) => !t.startsWith("image/"));

  if (!(allowed as readonly string[]).includes(file.type)) {
    throw new Error("File type is not allowed.");
  }
}

export async function uploadStorageObject(input: {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}): Promise<StorageUploadResult> {
  const supabase = await createClient();
  const objectPath = normalizeObjectPath(input.bucket, input.path);

  // Upload raw bytes (not the File/Blob itself) so the SDK keys the object by
  // `objectPath` only — passing File can make some runtimes incorporate file.name.
  const body = new Uint8Array(await input.file.arrayBuffer());

  const { data, error } = await supabase.storage
    .from(input.bucket)
    .upload(objectPath, body, {
      cacheControl: "3600",
      upsert: input.upsert ?? true,
      contentType: input.file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(
      `uploadStorageObject failed (bucket=${input.bucket}, path=${objectPath}): ${error.message}`,
    );
  }

  const uploadResponsePath =
    typeof data?.path === "string" ? data.path : null;
  const uploadResponseFullPath =
    typeof (data as { fullPath?: string } | null)?.fullPath === "string"
      ? (data as { fullPath: string }).fullPath
      : null;

  const resolvedPath = normalizeObjectPath(
    input.bucket,
    uploadResponsePath ?? objectPath,
  );

  const {
    data: { publicUrl },
  } = supabase.storage.from(input.bucket).getPublicUrl(resolvedPath);

  return {
    storagePath: resolvedPath,
    uploadResponsePath,
    uploadResponseFullPath,
    publicUrl: input.bucket === AVATARS_BUCKET ? publicUrl : null,
  };
}

export async function removeStorageObject(
  bucket: string,
  path: string | null | undefined,
): Promise<void> {
  if (!path) return;
  const supabase = await createClient();
  const objectPath = normalizeObjectPath(bucket, path);
  const { error } = await supabase.storage.from(bucket).remove([objectPath]);
  if (error) {
    throw new Error(error.message);
  }
}

export async function createSignedStorageUrl(
  bucket: string,
  path: string,
  expiresIn = SIGNED_URL_SECONDS,
): Promise<string | null> {
  const supabase = await createClient();
  const objectPath = normalizeObjectPath(bucket, path);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresIn);

  if (error) {
    throw new Error(
      `createSignedStorageUrl failed (bucket=${bucket}, pathPassedIn=${JSON.stringify(path)}, objectPath=${JSON.stringify(objectPath)}): ${error.message}`,
    );
  }

  return data?.signedUrl ?? null;
}
