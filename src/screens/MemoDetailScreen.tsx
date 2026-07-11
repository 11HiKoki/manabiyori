import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDate } from "../components/MemoCard";
import { Pill, domainTone, kindTone } from "../components/Pill";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, spacing } from "../theme";
import type { Memo, PersonProfile } from "../types";

type MemoDetailScreenProps = {
  memo: Memo;
  people?: PersonProfile[];
  onBack: () => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => Promise<{ error?: string }>;
};

export function MemoDetailScreen({ memo, people = [], onBack, onCreate, onEdit, onDelete }: MemoDetailScreenProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const hasThoughts = Boolean(memo.hesitation || memo.comparedOptions || memo.rejectedReason || memo.decisionCriteria);
  const hasValues = Boolean(memo.valueItem || memo.valueReflection);
  const hasLearningQueue = Boolean(memo.aiTodo || memo.dlabReading || memo.dlabVideo);
  const hasEndOfDayNotes = Boolean(memo.successJournal || memo.strengthFeedback);
  const strengthFeedbackPerson = people.find((person) => person.id === memo.strengthFeedbackPersonId);

  const deleteMemo = async () => {
    setDeleting(true);
    setDeleteError(null);
    setDeleteConfirmVisible(false);

    const result = await onDelete();

    if (result.error) {
      setDeleteError(result.error);
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    setDeleteConfirmVisible(true);
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.accentDark} />
          <Text style={styles.backText}>一覧へ</Text>
        </Pressable>
        <PrimaryButton icon="add-outline" label="新規" variant="ghost" onPress={onCreate} style={styles.newButton} />
      </View>

      <View style={styles.header}>
        <View style={styles.pills}>
          <Pill label={memo.domain} tone={domainTone(memo.domain)} />
          {memo.types.map((type) => (
            <Pill key={`type-${type}`} label={type} tone={kindTone(type)} />
          ))}
          {memo.emotions.map((emotion) => (
            <Pill key={`emotion-${emotion}`} label={emotion} />
          ))}
          <Pill label={visibilityLabel(memo.visibility)} />
        </View>
        <Text style={styles.date}>{formatDate(memo.date)} のメモ</Text>
        <Text style={styles.title}>{memo.title}</Text>
      </View>

      <View style={styles.detailActions}>
        <PrimaryButton disabled={deleting} icon="create-outline" label="編集" onPress={onEdit} style={styles.actionButton} />
        <PrimaryButton disabled={deleting} icon="trash-outline" label={deleting ? "削除中" : "削除"} variant="ghost" onPress={confirmDelete} style={styles.actionButton} />
      </View>

      {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>出来事と気づき</Text>
        <View style={styles.detailPanel}>
          <DetailBlock title="出来事" body={memo.event} />
          <DetailBlock title="気づき" body={memo.insight} />
          <DetailBlock title="教訓" body={memo.lesson} />
          <DetailBlock title="やさしい言葉・アドバイス" body={memo.supportiveNote} />
        </View>
      </View>

      {hasLearningQueue ? (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>AI・Dラボメモ</Text>
          <View style={styles.detailPanel}>
            <DetailBlock title="AIでやりたいこと" body={memo.aiTodo} />
            <DetailBlock title="Dラボで読みたい記事" body={memo.dlabReading} />
            <DetailBlock title="Dラボで観たい動画" body={memo.dlabVideo} />
          </View>
        </View>
      ) : null}

      {hasEndOfDayNotes ? (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>一日の終わりの記録</Text>
          <View style={styles.detailPanel}>
            <DetailBlock title="成功ジャーナル" body={memo.successJournal} />
            <DetailBlock title="言ってくれた人" body={strengthFeedbackPerson?.name ?? ""} />
            <DetailBlock title="自分の強みフィードバック" body={memo.strengthFeedback} />
          </View>
        </View>
      ) : null}

      {hasThoughts ? (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>思考の途中経過</Text>
          <View style={styles.detailPanel}>
            <DetailBlock title="何に迷ったか" body={memo.hesitation} />
            <DetailBlock title="比較した選択肢" body={memo.comparedOptions} />
            <DetailBlock title="捨てた理由" body={memo.rejectedReason} />
            <DetailBlock title="判断基準" body={memo.decisionCriteria} />
          </View>
        </View>
      ) : null}

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>次の行動</Text>
        <View style={styles.nextAction}>
          <View style={styles.nextHeader}>
            <Ionicons name={memo.nextActionDone ? "checkmark-circle" : "flag-outline"} size={20} color={memo.nextActionDone ? colors.accent : colors.coral} />
            <Text style={styles.nextTitle}>次の行動</Text>
          </View>
          <Text style={styles.nextBody}>{memo.nextAction}</Text>
          <Text style={styles.nextStatus}>{memo.nextActionDone ? "完了済み" : "未完了"}</Text>
        </View>
      </View>

      {hasValues ? (
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>価値観・信念に沿った行動</Text>
          <View style={styles.detailPanel}>
            <DetailBlock title="選んだ価値観・信念・座右の銘" body={memo.valueItem} />
            <DetailBlock title="価値観に関する気づき" body={memo.valueReflection} />
          </View>
        </View>
      ) : null}

      {memo.tags.length > 0 ? (
        <View style={styles.tags}>
          {memo.tags.map((tag) => (
            <Pill key={tag} label={`#${tag}`} />
          ))}
        </View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
        transparent
        visible={deleteConfirmVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmDialog}>
            <View style={styles.confirmIcon}>
              <Ionicons name="trash-outline" size={24} color={colors.coral} />
            </View>
            <Text style={styles.confirmTitle}>メモを削除しますか？</Text>
            <Text style={styles.confirmBody}>削除すると、このメモは一覧から消えます。</Text>
            <View style={styles.confirmActions}>
              <PrimaryButton
                disabled={deleting}
                icon="close-outline"
                label="キャンセル"
                variant="ghost"
                onPress={() => setDeleteConfirmVisible(false)}
                style={styles.actionButton}
              />
              <PrimaryButton
                disabled={deleting}
                icon="trash-outline"
                label={deleting ? "削除中" : "削除する"}
                onPress={deleteMemo}
                style={styles.deleteConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

function DetailBlock({ title, body }: { title: string; body: string }) {
  if (!body.trim()) {
    return null;
  }

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockBody}>{body || "未入力"}</Text>
    </View>
  );
}

function visibilityLabel(visibility: Memo["visibility"]) {
  switch (visibility) {
    case "friends":
      return "友達";
    case "public":
      return "公開";
    case "private":
    default:
      return "自分だけ";
  }
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 40
  },
  backText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "900"
  },
  newButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md
  },
  detailActions: {
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
  },
  header: {
    gap: spacing.md
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  date: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800"
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36
  },
  detailPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  detailSection: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24
  },
  block: {
    gap: spacing.sm
  },
  blockTitle: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "900"
  },
  blockBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24
  },
  nextAction: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    gap: spacing.sm,
    padding: spacing.lg
  },
  nextHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  nextTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  nextBody: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23
  },
  nextStatus: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(38, 51, 47, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  confirmDialog: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    maxWidth: 420,
    padding: spacing.xl,
    width: "100%"
  },
  confirmIcon: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  confirmTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  confirmBody: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    textAlign: "center"
  },
  confirmActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
    width: "100%"
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: colors.coral
  }
});
