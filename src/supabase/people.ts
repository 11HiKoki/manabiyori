import type { PersonDraft, PersonProfile } from "../types";
import { supabase } from "./client";
import type { PersonInsert, PersonRow, PersonUpdate } from "./types";

export function personRowToProfile(row: PersonRow): PersonProfile {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    relationship: row.relationship,
    metAt: row.met_at,
    metPlace: row.met_place,
    hobbies: row.hobbies,
    likes: row.likes,
    favoritePoints: row.favorite_points,
    dislikes: row.dislikes,
    valuesNote: row.values_note,
    nextTopic: row.next_topic,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function personDraftToInsert(userId: string, draft: PersonDraft): PersonInsert {
  return {
    user_id: userId,
    name: draft.name,
    nickname: draft.nickname,
    relationship: draft.relationship,
    met_at: draft.metAt,
    met_place: draft.metPlace,
    hobbies: draft.hobbies,
    likes: draft.likes,
    favorite_points: draft.favoritePoints,
    dislikes: draft.dislikes,
    values_note: draft.valuesNote,
    next_topic: draft.nextTopic,
    memo: draft.memo
  };
}

export function personDraftToUpdate(draft: PersonDraft): PersonUpdate {
  return {
    name: draft.name,
    nickname: draft.nickname,
    relationship: draft.relationship,
    met_at: draft.metAt,
    met_place: draft.metPlace,
    hobbies: draft.hobbies,
    likes: draft.likes,
    favorite_points: draft.favoritePoints,
    dislikes: draft.dislikes,
    values_note: draft.valuesNote,
    next_topic: draft.nextTopic,
    memo: draft.memo
  };
}

export async function fetchPeople(userId: string) {
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, people: [] };
  }

  return { people: (data ?? []).map(personRowToProfile) };
}

export async function createPerson(userId: string, draft: PersonDraft) {
  const { data, error } = await supabase.from("people").insert(personDraftToInsert(userId, draft)).select("*").single();

  if (error) {
    return { error: error.message };
  }

  return { person: personRowToProfile(data) };
}

export async function updatePerson(userId: string, personId: string, draft: PersonDraft) {
  const { data, error } = await supabase
    .from("people")
    .update(personDraftToUpdate(draft))
    .eq("id", personId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { person: personRowToProfile(data) };
}

export async function deletePerson(userId: string, personId: string) {
  const { error } = await supabase.from("people").delete().eq("id", personId).eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
