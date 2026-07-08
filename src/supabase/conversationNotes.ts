import type { ConversationNote, ConversationNoteDraft } from "../types";
import { supabase } from "./client";
import type { ConversationNoteInsert, ConversationNoteRow, ConversationNoteUpdate } from "./types";

export function conversationNoteRowToNote(row: ConversationNoteRow): ConversationNote {
  return {
    id: row.id,
    personId: row.person_id,
    talkedAt: row.talked_at,
    place: row.place,
    topic: row.topics,
    impression: row.impression,
    nextQuestion: row.next_question,
    promised: row.promise_note,
    followUp: row.follow_up,
    followUpDone: row.follow_up_done,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function conversationNoteDraftToInsert(userId: string, draft: ConversationNoteDraft): ConversationNoteInsert {
  return {
    user_id: userId,
    person_id: draft.personId,
    talked_at: draft.talkedAt,
    place: draft.place,
    topics: draft.topic,
    impression: draft.impression,
    next_question: draft.nextQuestion,
    promise_note: draft.promised,
    follow_up: draft.followUp,
    follow_up_done: draft.followUpDone
  };
}

export function conversationNoteDraftToUpdate(draft: ConversationNoteDraft): ConversationNoteUpdate {
  return {
    talked_at: draft.talkedAt,
    place: draft.place,
    topics: draft.topic,
    impression: draft.impression,
    next_question: draft.nextQuestion,
    promise_note: draft.promised,
    follow_up: draft.followUp,
    follow_up_done: draft.followUpDone
  };
}

export async function fetchConversationNotes(userId: string, personId: string) {
  const { data, error } = await supabase
    .from("conversation_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("person_id", personId)
    .order("talked_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, conversationNotes: [] };
  }

  return { conversationNotes: (data ?? []).map(conversationNoteRowToNote) };
}

export async function createConversationNote(userId: string, draft: ConversationNoteDraft) {
  const { data, error } = await supabase
    .from("conversation_notes")
    .insert(conversationNoteDraftToInsert(userId, draft))
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { conversationNote: conversationNoteRowToNote(data) };
}

export async function updateConversationNote(userId: string, personId: string, conversationNoteId: string, draft: ConversationNoteDraft) {
  const { data, error } = await supabase
    .from("conversation_notes")
    .update(conversationNoteDraftToUpdate(draft))
    .eq("id", conversationNoteId)
    .eq("user_id", userId)
    .eq("person_id", personId)
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { conversationNote: conversationNoteRowToNote(data) };
}

export async function deleteConversationNote(userId: string, personId: string, conversationNoteId: string) {
  const { error } = await supabase
    .from("conversation_notes")
    .delete()
    .eq("id", conversationNoteId)
    .eq("user_id", userId)
    .eq("person_id", personId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
