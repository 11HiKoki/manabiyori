import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AutoSaveStatusText } from "../components/AutoSaveStatusText";
import { FormSection } from "../components/FormSection";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { useAutoSavedDraft } from "../hooks/useAutoSavedDraft";
import { colors, radii, spacing } from "../theme";
import type { ConversationNote, ConversationNoteDraft, PersonProfile } from "../types";

type ConversationNoteFormScreenProps = {
  person: PersonProfile;
  onCancel: () => void;
  onSave: (conversationNote: ConversationNoteDraft) => Promise<{ error?: string }>;
  initialConversationNote?: ConversationNote;
  submitLabel?: string;
  title?: string;
  subtitle?: string;
};

type ConversationNoteFormAutoSaveDraft = {
  followUp: string;
  followUpDone: boolean;
  impression: string;
  nextQuestion: string;
  place: string;
  promised: string;
  talkedAt: string;
  topic: string;
};

export function ConversationNoteFormScreen({
  person,
  onCancel,
  onSave,
  initialConversationNote,
  submitLabel = "保存",
  title = "会話メモ登録",
  subtitle = `${person.name}さんと会った日の記録を残します。`
}: ConversationNoteFormScreenProps) {
  const [talkedAt, setTalkedAt] = useState(initialConversationNote?.talkedAt ?? getTodayText());
  const [place, setPlace] = useState(initialConversationNote?.place ?? "");
  const [topic, setTopic] = useState(initialConversationNote?.topic ?? "");
  const [impression, setImpression] = useState(initialConversationNote?.impression ?? "");
  const [nextQuestion, setNextQuestion] = useState(initialConversationNote?.nextQuestion ?? "");
  const [promised, setPromised] = useState(initialConversationNote?.promised ?? "");
  const [followUp, setFollowUp] = useState(initialConversationNote?.followUp ?? "");
  const [followUpDone, setFollowUpDone] = useState(initialConversationNote?.followUpDone ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveKey = initialConversationNote
    ? `autosave.conversation.edit.${initialConversationNote.id}`
    : `autosave.conversation.create.${person.id}`;
  const { clearDraft, status: autoSaveStatus } = useAutoSavedDraft<ConversationNoteFormAutoSaveDraft>({
    draft: {
      followUp,
      followUpDone,
      impression,
      nextQuestion,
      place,
      promised,
      talkedAt,
      topic
    },
    enabled: !saving,
    key: autoSaveKey,
    onRestore: (draft) => {
      if (draft.talkedAt !== undefined) setTalkedAt(draft.talkedAt);
      if (draft.place !== undefined) setPlace(draft.place);
      if (draft.topic !== undefined) setTopic(draft.topic);
      if (draft.impression !== undefined) setImpression(draft.impression);
      if (draft.nextQuestion !== undefined) setNextQuestion(draft.nextQuestion);
      if (draft.promised !== undefined) setPromised(draft.promised);
      if (draft.followUp !== undefined) setFollowUp(draft.followUp);
      if (draft.followUpDone !== undefined) setFollowUpDone(draft.followUpDone);
    }
  });

  const save = async () => {
    const trimmedTalkedAt = talkedAt.trim();

    if (!trimmedTalkedAt) {
      setError("会った日を入力してください。");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await onSave({
      personId: person.id,
      talkedAt: trimmedTalkedAt,
      place: place.trim(),
      topic: topic.trim(),
      impression: impression.trim(),
      nextQuestion: nextQuestion.trim(),
      promised: promised.trim(),
      followUp: followUp.trim(),
      followUpDone
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await clearDraft();
  };

  const cancel = async () => {
    await clearDraft();
    onCancel();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScreenShell title={title} subtitle={subtitle}>
        <View style={styles.form}>
          <AutoSaveStatusText status={autoSaveStatus} />

          <View style={styles.personPill}>
            <Ionicons name="person-outline" size={18} color={colors.accentDark} />
            <Text style={styles.personPillText}>{person.nickname || person.name}</Text>
          </View>

          <FormSection title="会った日・場所" caption="いつ、どこで会ったかを後から追えるようにします。">
            <Field label="会った日">
              <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} value={talkedAt} onChangeText={setTalkedAt} />
            </Field>

            <Field label="会った場所">
              <TextInput placeholder="例：カフェ、職場、勉強会" placeholderTextColor={colors.textMuted} style={styles.input} value={place} onChangeText={setPlace} />
            </Field>
          </FormSection>

          <FormSection title="話した内容" caption="話題と、そのとき印象に残ったことを分けて残します。">
            <Field label="話した内容">
              <TextInput
                multiline
                placeholder="その日に話したこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                value={topic}
                onChangeText={setTopic}
              />
            </Field>

            <Field label="印象に残ったこと">
              <TextInput
                multiline
                placeholder="表情、言葉、価値観が見えたこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={impression}
                onChangeText={setImpression}
              />
            </Field>
          </FormSection>

          <FormSection title="次につなげること" caption="次に聞くことや、忘れずにフォローしたいことを置いておきます。">
            <Field label="次に聞きたいこと">
              <TextInput
                multiline
                placeholder="次の会話で聞いてみたいこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={nextQuestion}
                onChangeText={setNextQuestion}
              />
            </Field>

            <Field label="約束したこと">
              <TextInput
                multiline
                placeholder="一緒に行く場所、送るもの、確認すること"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={promised}
                onChangeText={setPromised}
              />
            </Field>

            <Field label="フォローすること">
              <TextInput
                multiline
                placeholder="後で連絡すること、次回までにすること"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={followUp}
                onChangeText={setFollowUp}
              />
            </Field>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: followUpDone }}
              onPress={() => setFollowUpDone((current) => !current)}
              style={({ pressed }) => [styles.checkRow, pressed ? styles.pressed : null]}
            >
              <View style={followUpDone ? styles.checkedBox : styles.checkBox}>
                {followUpDone ? <Ionicons name="checkmark" size={18} color={colors.white} /> : null}
              </View>
              <Text style={styles.checkText}>フォロー完了</Text>
            </Pressable>
          </FormSection>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <PrimaryButton disabled={saving} icon="close-outline" label="キャンセル" variant="ghost" onPress={() => void cancel()} style={styles.actionButton} />
            <PrimaryButton disabled={saving} icon="checkmark-outline" label={saving ? "保存中" : submitLabel} onPress={save} style={styles.actionButton} />
          </View>
        </View>
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function getTodayText() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  form: {
    gap: spacing.lg,
    paddingBottom: spacing.sm
  },
  personPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  personPillText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "900"
  },
  field: {
    gap: spacing.sm
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  textArea: {
    minHeight: 104,
    textAlignVertical: "top"
  },
  textAreaSmall: {
    minHeight: 74,
    textAlignVertical: "top"
  },
  checkRow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 50,
    paddingHorizontal: spacing.md
  },
  checkBox: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  checkedBox: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  checkText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.78
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    flex: 1
  },
  errorText: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    padding: spacing.md
  }
});
