export const PLAYER_DOCUMENTS_STORAGE_KEY = "matchpoint-player-documents";

export type DocumentKind = "file" | "url";

export type DocumentTypeId =
  | "transcript"
  | "sat-act"
  | "english-test"
  | "resume"
  | "highlight-video";

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
  /** Highlight video URL */
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

function isUploadedDocument(value: unknown): value is UploadedDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Record<string, unknown>;
  return (
    typeof doc.id === "string" &&
    typeof doc.uploadedAt === "string" &&
    DOCUMENT_DEFINITIONS.some((def) => def.id === doc.id)
  );
}

function normalizeState(parsed: unknown): PlayerDocumentsState {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  const next: PlayerDocumentsState = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (isUploadedDocument(value) && value.id === key) {
      next[key as DocumentTypeId] = value;
    }
  }
  return next;
}

export function getDefaultDocumentsState(): PlayerDocumentsState {
  return {};
}

export function readPlayerDocuments(): PlayerDocumentsState {
  if (typeof window === "undefined") return getDefaultDocumentsState();
  try {
    const raw = localStorage.getItem(PLAYER_DOCUMENTS_STORAGE_KEY);
    if (!raw) return getDefaultDocumentsState();
    return normalizeState(JSON.parse(raw) as unknown);
  } catch {
    return getDefaultDocumentsState();
  }
}

export function writePlayerDocuments(state: PlayerDocumentsState): void {
  localStorage.setItem(PLAYER_DOCUMENTS_STORAGE_KEY, JSON.stringify(state));
}

export function upsertPlayerDocument(
  state: PlayerDocumentsState,
  document: UploadedDocument,
): PlayerDocumentsState {
  const next = { ...state, [document.id]: document };
  writePlayerDocuments(next);
  return next;
}

export function removePlayerDocument(
  state: PlayerDocumentsState,
  id: DocumentTypeId,
): PlayerDocumentsState {
  const next = { ...state };
  delete next[id];
  writePlayerDocuments(next);
  return next;
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
