import type { MemoVisibility } from "./supabase/types";

export type Domain = "仕事" | "プライベート";
export type MemoKind = "気づき" | "学び" | "失敗" | "教訓";
export type WeekStart = "monday" | "sunday";
export type AppRoute =
  | "login"
  | "home"
  | "create"
  | "edit"
  | "list"
  | "detail"
  | "reflection"
  | "people"
  | "personCreate"
  | "personEdit"
  | "personDetail"
  | "conversationCreate"
  | "conversationEdit"
  | "settings";
export type ReflectionRange = "週" | "月" | "年";

export type Memo = {
  id: string;
  domain: Domain;
  types: MemoKind[];
  title: string;
  event: string;
  insight: string;
  lesson: string;
  supportiveNote: string;
  successJournal: string;
  strengthFeedback: string;
  strengthFeedbackPersonId: string | null;
  nextAction: string;
  nextActionDone: boolean;
  hesitation: string;
  comparedOptions: string;
  rejectedReason: string;
  decisionCriteria: string;
  aiTodo: string;
  dlabReading: string;
  dlabVideo: string;
  valueItem: string;
  valueReflection: string;
  emotions: string[];
  tags: string[];
  date: string;
  visibility: MemoVisibility;
};

export type MemoDraft = Omit<Memo, "id" | "tags">;

export type PersonProfile = {
  id: string;
  name: string;
  nickname: string;
  relationship: string;
  metAt: string | null;
  metPlace: string;
  hobbies: string;
  likes: string;
  favoritePoints: string;
  strengthFeedback: string;
  dislikes: string;
  valuesNote: string;
  nextTopic: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type PersonDraft = Omit<PersonProfile, "id" | "createdAt" | "updatedAt">;

export type ConversationNote = {
  id: string;
  personId: string;
  talkedAt: string;
  place: string;
  topic: string;
  impression: string;
  nextQuestion: string;
  promised: string;
  followUp: string;
  followUpDone: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConversationNoteDraft = Omit<ConversationNote, "id" | "createdAt" | "updatedAt">;
