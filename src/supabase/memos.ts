import { supabase } from "./client";
import type { MemoField, MemoInsert, MemoRow, MemoType, MemoUpdate } from "./types";
import type { Domain, Memo, MemoDraft, MemoKind } from "../types";

const domainToField: Record<Domain, MemoField> = {
  仕事: "work",
  プライベート: "private"
};

const fieldToDomain: Record<MemoField, Domain> = {
  work: "仕事",
  private: "プライベート"
};

const kindToType: Record<MemoKind, MemoType> = {
  気づき: "insight",
  学び: "learning",
  失敗: "failure",
  教訓: "lesson"
};

const typeToKind: Record<MemoType, MemoKind> = {
  insight: "気づき",
  learning: "学び",
  failure: "失敗",
  lesson: "教訓"
};

export function memoRowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    domain: fieldToDomain[row.field],
    types: row.types.map((type) => typeToKind[type]),
    title: row.title,
    event: row.event,
    insight: row.insight,
    lesson: row.lesson,
    supportiveNote: row.supportive_note,
    successJournal: row.success_journal,
    strengthFeedback: row.strength_feedback,
    strengthFeedbackPersonId: row.strength_feedback_person_id,
    nextAction: row.next_action,
    nextActionDone: row.next_action_done,
    hesitation: row.hesitation,
    comparedOptions: row.compared_options,
    rejectedReason: row.rejected_reason,
    decisionCriteria: row.decision_criteria,
    aiTodo: row.ai_todo,
    dlabReading: row.dlab_reading,
    dlabVideo: row.dlab_video,
    valueItem: row.value_item,
    valueReflection: row.value_reflection,
    emotions: row.emotions,
    tags: [],
    date: row.occurred_at,
    visibility: row.visibility
  };
}

export function memoDraftToInsert(userId: string, draft: MemoDraft): MemoInsert {
  return {
    user_id: userId,
    field: domainToField[draft.domain],
    types: draft.types.map((kind) => kindToType[kind]),
    title: draft.title,
    event: draft.event,
    insight: draft.insight,
    lesson: draft.lesson,
    supportive_note: draft.supportiveNote,
    success_journal: draft.successJournal,
    strength_feedback: draft.strengthFeedback,
    strength_feedback_person_id: draft.strengthFeedbackPersonId,
    next_action: draft.nextAction,
    next_action_done: draft.nextActionDone,
    hesitation: draft.hesitation,
    compared_options: draft.comparedOptions,
    rejected_reason: draft.rejectedReason,
    decision_criteria: draft.decisionCriteria,
    ai_todo: draft.aiTodo,
    dlab_reading: draft.dlabReading,
    dlab_video: draft.dlabVideo,
    value_item: draft.valueItem,
    value_reflection: draft.valueReflection,
    emotions: draft.emotions,
    occurred_at: draft.date,
    visibility: draft.visibility
  };
}

export function memoDraftToUpdate(draft: MemoDraft): MemoUpdate {
  return {
    field: domainToField[draft.domain],
    types: draft.types.map((kind) => kindToType[kind]),
    title: draft.title,
    event: draft.event,
    insight: draft.insight,
    lesson: draft.lesson,
    supportive_note: draft.supportiveNote,
    success_journal: draft.successJournal,
    strength_feedback: draft.strengthFeedback,
    strength_feedback_person_id: draft.strengthFeedbackPersonId,
    next_action: draft.nextAction,
    next_action_done: draft.nextActionDone,
    hesitation: draft.hesitation,
    compared_options: draft.comparedOptions,
    rejected_reason: draft.rejectedReason,
    decision_criteria: draft.decisionCriteria,
    ai_todo: draft.aiTodo,
    dlab_reading: draft.dlabReading,
    dlab_video: draft.dlabVideo,
    value_item: draft.valueItem,
    value_reflection: draft.valueReflection,
    emotions: draft.emotions,
    occurred_at: draft.date,
    visibility: draft.visibility
  };
}

export async function fetchMemos(userId: string) {
  const { data, error } = await supabase
    .from("memos")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, memos: [] };
  }

  return { memos: (data ?? []).map(memoRowToMemo) };
}

export async function createMemo(userId: string, draft: MemoDraft) {
  const { data, error } = await supabase.from("memos").insert(memoDraftToInsert(userId, draft)).select("*").single();

  if (error) {
    return { error: error.message };
  }

  return { memo: memoRowToMemo(data) };
}

export async function updateMemo(userId: string, memoId: string, draft: MemoDraft) {
  const { data, error } = await supabase
    .from("memos")
    .update(memoDraftToUpdate(draft))
    .eq("id", memoId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { memo: memoRowToMemo(data) };
}

export async function deleteMemo(userId: string, memoId: string) {
  const { error } = await supabase.from("memos").delete().eq("id", memoId).eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  return {};
}
