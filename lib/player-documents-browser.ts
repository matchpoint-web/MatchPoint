"use client";

import { createClient } from "@/lib/supabase/client";
import {
  DOCUMENT_DEFINITIONS,
  PLAYER_DOCUMENTS_BUCKET,
  toStorageDocumentType,
  type DocumentTypeId,
} from "@/lib/player-documents";

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.slice(0, 180) || "document";
}

/**
 * Upload a document file directly from the browser to Supabase Storage.
 * Does not go through Server Actions (avoids Next.js body size limits).
 */
export async function uploadDocumentFileToStorage(
  documentType: DocumentTypeId,
  file: File,
): Promise<{ storagePath: string; fileName: string }> {
  const definition = DOCUMENT_DEFINITIONS.find((def) => def.id === documentType);
  if (!definition || definition.kind !== "file") {
    throw new Error("Invalid file document type.");
  }

  if (!file || file.size === 0) {
    throw new Error("A file is required.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File must be 10MB or smaller.");
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const storageType = toStorageDocumentType(documentType);
  const safeName = sanitizeFileName(file.name);
  const storagePath = `${user.id}/${storageType}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from(PLAYER_DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(error.message);
  }

  return { storagePath, fileName: file.name };
}
