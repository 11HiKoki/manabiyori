import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

import { FormSection } from "../components/FormSection";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, spacing } from "../theme";
import type { PersonDraft, PersonProfile } from "../types";

type PersonFormScreenProps = {
  onCancel: () => void;
  onSave: (person: PersonDraft) => Promise<{ error?: string }>;
  initialPerson?: PersonProfile;
  submitLabel?: string;
  title?: string;
  subtitle?: string;
};

export function PersonFormScreen({
  onCancel,
  onSave,
  initialPerson,
  submitLabel = "保存",
  title = "人登録",
  subtitle = "その人らしさを、後から思い出せる形で残します。"
}: PersonFormScreenProps) {
  const [name, setName] = useState(initialPerson?.name ?? "");
  const [nickname, setNickname] = useState(initialPerson?.nickname ?? "");
  const [relationship, setRelationship] = useState(initialPerson?.relationship ?? "");
  const [metAt, setMetAt] = useState(initialPerson?.metAt ?? "");
  const [metPlace, setMetPlace] = useState(initialPerson?.metPlace ?? "");
  const [hobbies, setHobbies] = useState(initialPerson?.hobbies ?? "");
  const [likes, setLikes] = useState(initialPerson?.likes ?? "");
  const [favoritePoints, setFavoritePoints] = useState(initialPerson?.favoritePoints ?? "");
  const [dislikes, setDislikes] = useState(initialPerson?.dislikes ?? "");
  const [valuesNote, setValuesNote] = useState(initialPerson?.valuesNote ?? "");
  const [memo, setMemo] = useState(initialPerson?.memo ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("名前を入力してください。");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await onSave({
      name: trimmedName,
      nickname: nickname.trim(),
      relationship: relationship.trim(),
      metAt: metAt.trim() || null,
      metPlace: metPlace.trim(),
      hobbies: hobbies.trim(),
      likes: likes.trim(),
      favoritePoints: favoritePoints.trim(),
      dislikes: dislikes.trim(),
      valuesNote: valuesNote.trim(),
      nextTopic: initialPerson?.nextTopic ?? "",
      memo: memo.trim()
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScreenShell title={title} subtitle={subtitle}>
        <View style={styles.form}>
          <FormSection title="基本情報" caption="その人を思い出すための土台を残します。">
            <Field label="名前">
              <TextInput placeholder="例：山田 花子" placeholderTextColor={colors.textMuted} style={styles.input} value={name} onChangeText={setName} />
            </Field>

            <Field label="呼び名">
              <TextInput placeholder="例：はなちゃん" placeholderTextColor={colors.textMuted} style={styles.input} value={nickname} onChangeText={setNickname} />
            </Field>

            <Field label="関係性">
              <TextInput placeholder="例：読書会で会った人" placeholderTextColor={colors.textMuted} style={styles.input} value={relationship} onChangeText={setRelationship} />
            </Field>

            <Field label="初めて会った日">
              <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} value={metAt} onChangeText={setMetAt} />
            </Field>

            <Field label="出会った場所">
              <TextInput placeholder="例：勉強会、友人の紹介" placeholderTextColor={colors.textMuted} style={styles.input} value={metPlace} onChangeText={setMetPlace} />
            </Field>
          </FormSection>

          <FormSection title="好み・趣味" caption="好きなものと、その人自身の好きなところを分けて残します。">
            <Field label="趣味">
              <TextInput
                multiline
                placeholder="話していた趣味"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={hobbies}
                onChangeText={setHobbies}
              />
            </Field>

            <Field label="好きなもの">
              <TextInput
                multiline
                placeholder="好きそうなもの、よく話していたこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={likes}
                onChangeText={setLikes}
              />
            </Field>

            <Field label="その人の好きなところ">
              <TextInput
                multiline
                placeholder="魅力に感じるところ、尊敬しているところ、いいなと思ったところ"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={favoritePoints}
                onChangeText={setFavoritePoints}
              />
            </Field>
          </FormSection>

          <FormSection title="配慮したいこと" caption="苦手そうなものや、大事にしていそうなことを丁寧に扱います。">
            <Field label="苦手そうなもの・配慮したいこと">
              <TextInput
                multiline
                placeholder="避けた方がよさそうな話題や配慮"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={dislikes}
                onChangeText={setDislikes}
              />
            </Field>

            <Field label="大事にしていそうなこと">
              <TextInput
                multiline
                placeholder="価値観や考え方のメモ"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={valuesNote}
                onChangeText={setValuesNote}
              />
            </Field>
          </FormSection>

          <FormSection title="メモ" caption="会話メモに分けるほどではないプロフィール情報を残します。">
            <Field label="自由メモ">
              <TextInput
                multiline
                placeholder="その他の覚えておきたいこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                value={memo}
                onChangeText={setMemo}
              />
            </Field>
          </FormSection>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.actions}>
            <PrimaryButton disabled={saving} icon="close-outline" label="キャンセル" variant="ghost" onPress={onCancel} style={styles.actionButton} />
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

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  form: {
    gap: spacing.lg,
    paddingBottom: spacing.sm
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
    minHeight: 96,
    textAlignVertical: "top"
  },
  textAreaSmall: {
    minHeight: 74,
    textAlignVertical: "top"
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
