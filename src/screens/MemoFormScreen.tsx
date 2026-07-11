import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AutoSaveStatusText } from "../components/AutoSaveStatusText";
import { FormSection } from "../components/FormSection";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { useAutoSavedDraft } from "../hooks/useAutoSavedDraft";
import { colors, radii, spacing } from "../theme";
import type { Domain, Memo, MemoDraft, MemoKind, PersonProfile } from "../types";
import type { MemoVisibility } from "../supabase/types";

type MemoFormScreenProps = {
  onSave: (memo: MemoDraft) => Promise<{ error?: string }>;
  onCancel: () => void;
  initialMemo?: Memo;
  people?: PersonProfile[];
  submitLabel?: string;
  title?: string;
  subtitle?: string;
};

type MemoFormAutoSaveDraft = {
  aiTodo: string;
  comparedOptions: string;
  date: string;
  decisionCriteria: string;
  dlabReading: string;
  dlabVideo: string;
  domain: Domain;
  event: string;
  hesitation: string;
  insight: string;
  lesson: string;
  memoTitle: string;
  nextAction: string;
  nextActionDone: boolean;
  rejectedReason: string;
  selectedEmotions: string[];
  selectedTypes: MemoKind[];
  supportiveNote: string;
  successJournal: string;
  strengthFeedback: string;
  strengthFeedbackPersonId: string | null;
  valueItem: string;
  valueReflection: string;
  visibility: MemoVisibility;
};

const domains: Domain[] = ["仕事", "プライベート"];
const kinds: MemoKind[] = ["気づき", "学び", "失敗", "教訓"];
const emotions = ["安心", "焦り", "納得", "反省", "前向き", "もやもや"];
const visibilityOptions: Array<{ label: string; value: MemoVisibility }> = [
  { label: "自分だけ", value: "private" },
  { label: "友達", value: "friends" },
  { label: "公開", value: "public" }
];

export function MemoFormScreen({
  onSave,
  onCancel,
  initialMemo,
  people = [],
  submitLabel = "保存",
  title: screenTitle = "メモ登録",
  subtitle = "出来事を責めずに分解して、次の行動へつなげます。"
}: MemoFormScreenProps) {
  const [domain, setDomain] = useState<Domain>(initialMemo?.domain ?? "仕事");
  const [selectedTypes, setSelectedTypes] = useState<MemoKind[]>(initialMemo?.types.length ? initialMemo.types : ["気づき"]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(initialMemo?.emotions ?? []);
  const [visibility, setVisibility] = useState<MemoVisibility>(initialMemo?.visibility ?? "private");
  const [memoTitle, setMemoTitle] = useState(initialMemo?.title ?? "");
  const [event, setEvent] = useState(initialMemo?.event ?? "");
  const [insight, setInsight] = useState(initialMemo?.insight ?? "");
  const [lesson, setLesson] = useState(initialMemo?.lesson ?? "");
  const [supportiveNote, setSupportiveNote] = useState(initialMemo?.supportiveNote ?? "");
  const [successJournal, setSuccessJournal] = useState(initialMemo?.successJournal ?? "");
  const [strengthFeedback, setStrengthFeedback] = useState(initialMemo?.strengthFeedback ?? "");
  const [strengthFeedbackPersonId, setStrengthFeedbackPersonId] = useState<string | null>(initialMemo?.strengthFeedbackPersonId ?? null);
  const [nextAction, setNextAction] = useState(initialMemo?.nextAction ?? "");
  const [nextActionDone, setNextActionDone] = useState(initialMemo?.nextActionDone ?? false);
  const [hesitation, setHesitation] = useState(initialMemo?.hesitation ?? "");
  const [comparedOptions, setComparedOptions] = useState(initialMemo?.comparedOptions ?? "");
  const [rejectedReason, setRejectedReason] = useState(initialMemo?.rejectedReason ?? "");
  const [decisionCriteria, setDecisionCriteria] = useState(initialMemo?.decisionCriteria ?? "");
  const [aiTodo, setAiTodo] = useState(initialMemo?.aiTodo ?? "");
  const [dlabReading, setDlabReading] = useState(initialMemo?.dlabReading ?? "");
  const [dlabVideo, setDlabVideo] = useState(initialMemo?.dlabVideo ?? "");
  const [valueItem, setValueItem] = useState(initialMemo?.valueItem ?? "");
  const [valueReflection, setValueReflection] = useState(initialMemo?.valueReflection ?? "");
  const [date, setDate] = useState(initialMemo?.date ?? todayString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveKey = initialMemo ? `autosave.memo.edit.${initialMemo.id}` : "autosave.memo.create";
  const { clearDraft, status: autoSaveStatus } = useAutoSavedDraft<MemoFormAutoSaveDraft>({
    draft: {
      aiTodo,
      comparedOptions,
      date,
      decisionCriteria,
      dlabReading,
      dlabVideo,
      domain,
      event,
      hesitation,
      insight,
      lesson,
      memoTitle,
      nextAction,
      nextActionDone,
      rejectedReason,
      selectedEmotions,
      selectedTypes,
      supportiveNote,
      successJournal,
      strengthFeedback,
      strengthFeedbackPersonId,
      valueItem,
      valueReflection,
      visibility
    },
    enabled: !saving,
    key: autoSaveKey,
    onRestore: (draft) => {
      if (draft.domain) setDomain(draft.domain);
      if (draft.selectedTypes?.length) setSelectedTypes(draft.selectedTypes);
      if (draft.selectedEmotions) setSelectedEmotions(draft.selectedEmotions);
      if (draft.visibility) setVisibility(draft.visibility);
      if (draft.memoTitle !== undefined) setMemoTitle(draft.memoTitle);
      if (draft.event !== undefined) setEvent(draft.event);
      if (draft.insight !== undefined) setInsight(draft.insight);
      if (draft.lesson !== undefined) setLesson(draft.lesson);
      if (draft.supportiveNote !== undefined) setSupportiveNote(draft.supportiveNote);
      if (draft.successJournal !== undefined) setSuccessJournal(draft.successJournal);
      if (draft.strengthFeedback !== undefined) setStrengthFeedback(draft.strengthFeedback);
      if (draft.strengthFeedbackPersonId !== undefined) setStrengthFeedbackPersonId(draft.strengthFeedbackPersonId);
      if (draft.nextAction !== undefined) setNextAction(draft.nextAction);
      if (draft.nextActionDone !== undefined) setNextActionDone(draft.nextActionDone);
      if (draft.hesitation !== undefined) setHesitation(draft.hesitation);
      if (draft.comparedOptions !== undefined) setComparedOptions(draft.comparedOptions);
      if (draft.rejectedReason !== undefined) setRejectedReason(draft.rejectedReason);
      if (draft.decisionCriteria !== undefined) setDecisionCriteria(draft.decisionCriteria);
      if (draft.aiTodo !== undefined) setAiTodo(draft.aiTodo);
      if (draft.dlabReading !== undefined) setDlabReading(draft.dlabReading);
      if (draft.dlabVideo !== undefined) setDlabVideo(draft.dlabVideo);
      if (draft.valueItem !== undefined) setValueItem(draft.valueItem);
      if (draft.valueReflection !== undefined) setValueReflection(draft.valueReflection);
      if (draft.date !== undefined) setDate(draft.date);
    }
  });

  const save = async () => {
    if (selectedTypes.length === 0) {
      setError("種別を1つ以上選択してください。");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await onSave({
      domain,
      types: selectedTypes,
      title: memoTitle.trim() || "新しい気づき",
      event: event.trim() || "今日起きた出来事を短く記録しました。",
      insight: insight.trim() || "自分の反応や状況の見え方に変化がありました。",
      lesson: lesson.trim() || "次は少し早めに立ち止まるとよさそうです。",
      supportiveNote: supportiveNote.trim(),
      successJournal: successJournal.trim(),
      strengthFeedback: strengthFeedback.trim(),
      strengthFeedbackPersonId,
      nextAction: nextAction.trim() || "明日ひとつだけ試す行動を決める。",
      nextActionDone,
      hesitation: hesitation.trim(),
      comparedOptions: comparedOptions.trim(),
      rejectedReason: rejectedReason.trim(),
      decisionCriteria: decisionCriteria.trim(),
      aiTodo: aiTodo.trim(),
      dlabReading: dlabReading.trim(),
      dlabVideo: dlabVideo.trim(),
      valueItem: valueItem.trim(),
      valueReflection: valueReflection.trim(),
      emotions: selectedEmotions,
      date: date.trim() || todayString(),
      visibility
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
      <ScreenShell title={screenTitle} subtitle={subtitle}>
        <View style={styles.form}>
          <AutoSaveStatusText status={autoSaveStatus} />

          <FormSection title="基本情報" caption="あとから探しやすいように、分類と日付を整えます。">
            <Field label="分野">
              <Segmented options={domains} value={domain} onChange={setDomain} />
            </Field>

            <Field label="種別">
              <MultiSegmented options={kinds} values={selectedTypes} onChange={setSelectedTypes} />
            </Field>

            <Field label="タイトル">
              <TextInput
                placeholder="例：確認不足で手戻りが起きた"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={memoTitle}
                onChangeText={setMemoTitle}
              />
            </Field>

            <Field label="日付">
              <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} value={date} onChangeText={setDate} />
            </Field>

            <Field label="公開範囲">
              <VisibilitySegmented value={visibility} onChange={setVisibility} />
            </Field>
          </FormSection>

          <FormSection title="AI・Dラボメモ" caption="試したいAI活用や、Dラボで読みたい記事・観たい動画を残します。">
            <Field label="AIでやりたいこと">
              <TextInput
                multiline
                placeholder="AIで試したいこと、作りたいもの、相談したいこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={aiTodo}
                onChangeText={setAiTodo}
              />
            </Field>

            <Field label="Dラボで読みたい記事">
              <TextInput
                multiline
                placeholder="読みたい記事、あとで調べたいテーマ"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={dlabReading}
                onChangeText={setDlabReading}
              />
            </Field>

            <Field label="Dラボで観たい動画">
              <TextInput
                multiline
                placeholder="観たい動画、あとで見返したい内容"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={dlabVideo}
                onChangeText={setDlabVideo}
              />
            </Field>
          </FormSection>

          <FormSection title="出来事と気づき" caption="何が起きて、自分に何が見えたかを分けて残します。">
            <Field label="出来事">
              <TextInput
                multiline
                placeholder="何が起きたか"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                value={event}
                onChangeText={setEvent}
              />
            </Field>

            <Field label="気づき">
              <TextInput
                multiline
                placeholder="その出来事から見えたこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                value={insight}
                onChangeText={setInsight}
              />
            </Field>

            <Field label="教訓">
              <TextInput
                multiline
                placeholder="次に活かせる考え方"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textArea]}
                value={lesson}
                onChangeText={setLesson}
              />
            </Field>

            <Field label="やさしい言葉・アドバイス">
              <TextInput
                multiline
                placeholder="失敗した自分にかけたい言葉、次に向けたやさしい助言"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={supportiveNote}
                onChangeText={setSupportiveNote}
              />
            </Field>

            <Field label="感情">
              <MultiSegmented options={emotions} values={selectedEmotions} onChange={setSelectedEmotions} wrap />
            </Field>
          </FormSection>

          <FormSection title="一日の終わりの成功ジャーナル" caption="今日できたこと、うまくいったこと、小さな前進を残します。">
            <Field label="成功ジャーナル">
              <TextInput
                multiline
                placeholder="今日できたこと、うれしかったこと、小さく前に進んだこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={successJournal}
                onChangeText={setSuccessJournal}
              />
            </Field>
          </FormSection>

          <FormSection title="もらった強みフィードバック" caption="他人から言われた自分の強みを、言ってくれた人と一緒に残します。">
            {people.length > 0 ? (
              <Field label="言ってくれた人">
                <PersonSelector people={people} value={strengthFeedbackPersonId} onChange={setStrengthFeedbackPersonId} />
              </Field>
            ) : null}

            <Field label="自分の強みフィードバック">
              <TextInput
                multiline
                placeholder="例：説明がわかりやすい、安心して相談できると言ってもらえた"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={strengthFeedback}
                onChangeText={setStrengthFeedback}
              />
            </Field>
          </FormSection>

          <FormSection title="思考の途中経過" caption="迷い、比較、捨てた案も未来の判断材料になります。">
            <Field label="何に迷ったか">
              <TextInput
                multiline
                placeholder="迷ったこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={hesitation}
                onChangeText={setHesitation}
              />
            </Field>

            <Field label="比較した選択肢">
              <TextInput
                multiline
                placeholder="比較した案や選択肢"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={comparedOptions}
                onChangeText={setComparedOptions}
              />
            </Field>

            <Field label="捨てた理由">
              <TextInput
                multiline
                placeholder="なぜその案を選ばなかったか"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={rejectedReason}
                onChangeText={setRejectedReason}
              />
            </Field>

            <Field label="判断基準">
              <TextInput
                multiline
                placeholder="最終的に何を大事にしたか"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={decisionCriteria}
                onChangeText={setDecisionCriteria}
              />
            </Field>
          </FormSection>

          <FormSection title="次の行動" caption="振り返りを、次に試せる小さな行動へつなげます。">
            <Field label="次の行動">
              <TextInput
                multiline
                placeholder="明日以降に試す小さな行動"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={nextAction}
                onChangeText={setNextAction}
              />
            </Field>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: nextActionDone }}
              onPress={() => setNextActionDone((current) => !current)}
              style={({ pressed }) => [styles.checkRow, pressed ? styles.segmentPressed : null]}
            >
              <View style={nextActionDone ? styles.checkedBox : styles.checkBox}>
                {nextActionDone ? <Text style={styles.checkMark}>✓</Text> : null}
              </View>
              <Text style={styles.checkText}>次の行動を完了済みにする</Text>
            </Pressable>
          </FormSection>

          <FormSection title="価値観・信念に沿った行動" caption="その日に大切にしたい軸と、そこから見えたことを残します。">
            <Field label="選んだ項目">
              <TextInput
                placeholder="例：誠実に早めに伝える"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={valueItem}
                onChangeText={setValueItem}
              />
            </Field>

            <Field label="その項目に関する気づき">
              <TextInput
                multiline
                placeholder="価値観に沿って行動できたこと、難しかったこと"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.textAreaSmall]}
                value={valueReflection}
                onChangeText={setValueReflection}
              />
            </Field>
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

function Segmented<T extends string>({
  options,
  value,
  onChange,
  wrap = false
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  wrap?: boolean;
}) {
  return (
    <View style={[styles.segmented, wrap ? styles.segmentedWrap : null]}>
      {options.map((option) => {
        const active = option === value;

        return (
          <Pressable
            accessibilityRole="button"
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [styles.segment, wrap ? styles.segmentWrapItem : null, active ? styles.segmentActive : null, pressed ? styles.segmentPressed : null]}
          >
            <Text numberOfLines={2} style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MultiSegmented<T extends string>({
  options,
  values,
  onChange,
  wrap = false
}: {
  options: T[];
  values: T[];
  onChange: (value: T[]) => void;
  wrap?: boolean;
}) {
  const toggleValue = (option: T) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    onChange([...values, option]);
  };

  return (
    <View style={[styles.segmented, wrap ? styles.segmentedWrap : null]}>
      {options.map((option) => {
        const active = values.includes(option);

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={option}
            onPress={() => toggleValue(option)}
            style={({ pressed }) => [styles.segment, wrap ? styles.segmentWrapItem : null, active ? styles.segmentActive : null, pressed ? styles.segmentPressed : null]}
          >
            <Text numberOfLines={2} style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{active ? `✓ ${option}` : option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PersonSelector({
  people,
  value,
  onChange
}: {
  people: PersonProfile[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <View style={[styles.segmented, styles.segmentedWrap]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === null }}
        onPress={() => onChange(null)}
        style={({ pressed }) => [styles.segment, styles.segmentWrapItem, value === null ? styles.segmentActive : null, pressed ? styles.segmentPressed : null]}
      >
        <Text numberOfLines={2} style={[styles.segmentText, value === null ? styles.segmentTextActive : null]}>
          未選択
        </Text>
      </Pressable>
      {people.map((person) => {
        const active = person.id === value;
        const label = person.nickname ? `${person.name}（${person.nickname}）` : person.name;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={person.id}
            onPress={() => onChange(person.id)}
            style={({ pressed }) => [styles.segment, styles.personSegment, active ? styles.segmentActive : null, pressed ? styles.segmentPressed : null]}
          >
            <Text numberOfLines={2} style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function VisibilitySegmented({ value, onChange }: { value: MemoVisibility; onChange: (value: MemoVisibility) => void }) {
  return (
    <View style={styles.segmented}>
      {visibilityOptions.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.segment, active ? styles.segmentActive : null, pressed ? styles.segmentPressed : null]}
          >
            <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

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
  segmented: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs
  },
  segmentedWrap: {
    flexWrap: "wrap"
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
  checkMark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 18
  },
  checkText: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  segment: {
    alignItems: "center",
    borderRadius: radii.sm,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  segmentWrapItem: {
    minWidth: 120
  },
  personSegment: {
    flexBasis: "46%",
    flexGrow: 1,
    minWidth: 132
  },
  segmentActive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  segmentPressed: {
    opacity: 0.75
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  segmentTextActive: {
    color: colors.accentDark
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
