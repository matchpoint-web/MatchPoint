/**
 * Player document types, definitions, and completion helpers.
 * Persistence: lib/player-documents-service.ts + lib/storage/queries.ts.
 */

export type DocumentKind = "file" | "url";

export type DocumentTypeId =
  | "transcript"
  | "sat-act"
  | "english-test"
  | "resume"
  | "highlight-video";

/** Storage / DB document_type values */
export type StorageDocumentType =
  | "transcript"
  | "sat_act"
  | "english_test"
  | "resume"
  | "highlight_video";

export type DocumentDefinition = {
  id: DocumentTypeId;
  title: string;
  description: string;
  kind: DocumentKind;
  optional?: boolean;
  accept?: string;
};

export type UploadedDocument = {
  id: DocumentTypeId;
  /** Display name for file uploads */
  fileName?: string;
  /** Highlight video URL (or signed file URL when available) */
  url?: string;
  uploadedAt: string;
};

export type PlayerDocumentsState = Partial<
  Record<DocumentTypeId, UploadedDocument>
>;

export const DOCUMENT_DEFINITIONS: DocumentDefinition[] = [
  {
    id: "transcript",
    title: "Transcript",
    description: "Official or unofficial academic transcript.",
    kind: "file",
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    id: "sat-act",
    title: "SAT / ACT",
    description: "Standardized test scores (optional).",
    kind: "file",
    optional: true,
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    id: "english-test",
    title: "TOEFL / IELTS / Duolingo",
    description: "English proficiency test results.",
    kind: "file",
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    id: "resume",
    title: "Resume / CV",
    description: "Tennis and academic resume.",
    kind: "file",
    accept: ".pdf,.doc,.docx",
  },
  {
    id: "highlight-video",
    title: "Highlight Video URL",
    description: "Link to YouTube, Vimeo, or similar.",
    kind: "url",
  },
];

const UI_TO_STORAGE: Record<DocumentTypeId, StorageDocumentType> = {
  transcript: "transcript",
  "sat-act": "sat_act",
  "english-test": "english_test",
  resume: "resume",
  "highlight-video": "highlight_video",
};

const STORAGE_TO_UI: Record<StorageDocumentType, DocumentTypeId> = {
  transcript: "transcript",
  sat_act: "sat-act",
  english_test: "english-test",
  resume: "resume",
  highlight_video: "highlight-video",
};

export function toStorageDocumentType(
  id: DocumentTypeId,
): StorageDocumentType {
  return UI_TO_STORAGE[id];
}

export function toUiDocumentType(
  type: string,
): DocumentTypeId | null {
  if (type in STORAGE_TO_UI) {
    return STORAGE_TO_UI[type as StorageDocumentType];
  }
  return null;
}

export function getDefaultDocumentsState(): PlayerDocumentsState {
  return {};
}

export function getUploadedCount(state: PlayerDocumentsState): number {
  return DOCUMENT_DEFINITIONS.filter((def) => Boolean(state[def.id])).length;
}

export function getRequiredDefinitions(): DocumentDefinition[] {
  return DOCUMENT_DEFINITIONS.filter((def) => !def.optional);
}

export function getDocumentsCompletion(state: PlayerDocumentsState): {
  uploaded: number;
  total: number;
  requiredUploaded: number;
  requiredTotal: number;
  percent: number;
} {
  const uploaded = getUploadedCount(state);
  const total = DOCUMENT_DEFINITIONS.length;
  const required = getRequiredDefinitions();
  const requiredUploaded = required.filter((def) =>
    Boolean(state[def.id]),
  ).length;
  const requiredTotal = required.length;
  const percent =
    requiredTotal === 0
      ? 0
      : Math.round((requiredUploaded / requiredTotal) * 100);

  return { uploaded, total, requiredUploaded, requiredTotal, percent };
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isDocumentTypeId(value: string): value is DocumentTypeId {
  return DOCUMENT_DEFINITIONS.some((def) => def.id === value);
}
