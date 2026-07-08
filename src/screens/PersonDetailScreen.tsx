import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, spacing } from "../theme";
import type { ConversationNote, PersonProfile } from "../types";

type PersonDetailScreenProps = {
  person: PersonProfile;
  conversationNotes: ConversationNote[];
  conversationNotesLoading?: boolean;
  conversationNotesError?: string | null;
  onBack: () => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => Promise<{ error?: string }>;
  onAddConversationNote: () => void;
  onEditConversationNote: (conversationNoteId: string) => void;
  onDeleteConversationNote: (conversationNoteId: string) => Promise<{ error?: string }>;
  onRetryConversationNotes?: () => void;
};

export function PersonDetailScreen({
  person,
  conversationNotes,
  conversationNotesLoading = false,
  conversationNotesError = null,
  onBack,
  onCreate,
  onEdit,
  onDelete,
  onAddConversationNote,
  onEditConversationNote,
  onDeleteConversationNote,
  onRetryConversationNotes
}: PersonDetailScreenProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [conversationNoteDeleteTarget, setConversationNoteDeleteTarget] = useState<ConversationNote | null>(null);
  const [conversationNoteDeleteError, setConversationNoteDeleteError] = useState<string | null>(null);
  const [deletingConversationNoteId, setDeletingConversationNoteId] = useState<string | null>(null);

  const deletePerson = async () => {
    setDeleting(true);
    setDeleteError(null);
    setDeleteConfirmVisible(false);

    const result = await onDelete();

    if (result.error) {
      setDeleteError(result.error);
      setDeleting(false);
    }
  };

  const deleteConversationNote = async () => {
    if (!conversationNoteDeleteTarget) {
      return;
    }

    const targetId = conversationNoteDeleteTarget.id;
    setDeletingConversationNoteId(targetId);
    setConversationNoteDeleteError(null);
    setConversationNoteDeleteTarget(null);

    const result = await onDeleteConversationNote(targetId);
    setDeletingConversationNoteId(null);

    if (result.error) {
      setConversationNoteDeleteError(result.error);
    }
  };

  return (
    <ScreenShell>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.accentDark} />
          <Text style={styles.backText}>人一覧へ</Text>
        </Pressable>
        <PrimaryButton icon="person-add-outline" label="新規" variant="ghost" onPress={onCreate} style={styles.newButton} />
      </View>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={34} color={colors.accentDark} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{person.name}</Text>
          {person.nickname ? <Text style={styles.nickname}>{person.nickname}</Text> : null}
          <Text style={styles.meta}>{person.relationship || "関係性 未入力"}</Text>
        </View>
      </View>

      <View style={styles.detailActions}>
        <PrimaryButton disabled={deleting} icon="create-outline" label="編集" onPress={onEdit} style={styles.actionButton} />
        <PrimaryButton
          disabled={deleting}
          icon="trash-outline"
          label={deleting ? "削除中" : "削除"}
          variant="ghost"
          onPress={() => setDeleteConfirmVisible(true)}
          style={styles.actionButton}
        />
      </View>

      {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}

      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>プロフィール</Text>
        <View style={styles.detailPanel}>
          <DetailBlock title="初めて会った日" body={person.metAt ?? ""} />
          <DetailBlock title="出会った場所" body={person.metPlace} />
          <DetailBlock title="趣味" body={person.hobbies} />
          <DetailBlock title="好きなもの" body={person.likes} />
          <DetailBlock title="苦手そうなもの・配慮したいこと" body={person.dislikes} />
          <DetailBlock title="大事にしていそうなこと" body={person.valuesNote} />
          <DetailBlock title="次に話したいこと" body={person.nextTopic} highlight />
          <DetailBlock title="自由メモ" body={person.memo} />
        </View>
      </View>

      <View style={styles.conversationPanel}>
        <View style={styles.conversationHeader}>
          <View style={styles.conversationTitleGroup}>
            <Text style={styles.sectionTitle}>会った日の記録</Text>
            <Text style={styles.sectionMeta}>{conversationNotesLoading ? "読み込み中" : `${conversationNotes.length}件`}</Text>
          </View>
          <PrimaryButton
            icon="chatbubble-ellipses-outline"
            label="会話メモを追加"
            onPress={onAddConversationNote}
            style={styles.conversationButton}
          />
        </View>

        {conversationNoteDeleteError ? <Text style={styles.deleteErrorText}>{conversationNoteDeleteError}</Text> : null}

        {conversationNotesLoading ? (
          <View style={styles.messagePanel}>
            <ActivityIndicator color={colors.accentDark} />
            <Text style={styles.messageText}>会話メモを読み込んでいます。</Text>
          </View>
        ) : null}

        {conversationNotesError ? (
          <View style={styles.messagePanel}>
            <Text style={styles.errorText}>{conversationNotesError}</Text>
            {onRetryConversationNotes ? (
              <PrimaryButton icon="refresh-outline" label="再読み込み" variant="ghost" onPress={onRetryConversationNotes} />
            ) : null}
          </View>
        ) : null}

        {!conversationNotesLoading && !conversationNotesError ? (
          <View style={styles.conversationStack}>
            {conversationNotes.length > 0 ? (
              conversationNotes.map((conversationNote) => (
                <ConversationNoteCard
                  conversationNote={conversationNote}
                  deleting={deletingConversationNoteId === conversationNote.id}
                  key={conversationNote.id}
                  onDelete={() => setConversationNoteDeleteTarget(conversationNote)}
                  onEdit={() => onEditConversationNote(conversationNote.id)}
                />
              ))
            ) : (
              <View style={styles.messagePanel}>
                <Text style={styles.messageText}>まだ会話メモがありません。</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

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
            <Text style={styles.confirmTitle}>人物プロフィールを削除しますか？</Text>
            <Text style={styles.confirmBody}>この人に紐づく会話メモも削除されます。</Text>
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
                onPress={deletePerson}
                style={styles.deleteConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setConversationNoteDeleteTarget(null)}
        transparent
        visible={conversationNoteDeleteTarget !== null}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmDialog}>
            <View style={styles.confirmIcon}>
              <Ionicons name="trash-outline" size={24} color={colors.coral} />
            </View>
            <Text style={styles.confirmTitle}>会話メモを削除しますか？</Text>
            <Text style={styles.confirmBody}>削除すると、この日の会話メモは一覧から消えます。</Text>
            <View style={styles.confirmActions}>
              <PrimaryButton
                disabled={deletingConversationNoteId !== null}
                icon="close-outline"
                label="キャンセル"
                variant="ghost"
                onPress={() => setConversationNoteDeleteTarget(null)}
                style={styles.actionButton}
              />
              <PrimaryButton
                disabled={deletingConversationNoteId !== null}
                icon="trash-outline"
                label={deletingConversationNoteId ? "削除中" : "削除する"}
                onPress={deleteConversationNote}
                style={styles.deleteConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

function DetailBlock({ title, body, highlight = false }: { title: string; body: string; highlight?: boolean }) {
  if (!body.trim()) {
    return null;
  }

  return (
    <View style={highlight ? styles.highlightBlock : styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockBody}>{body || "未入力"}</Text>
    </View>
  );
}

function ConversationNoteCard({
  conversationNote,
  deleting,
  onEdit,
  onDelete
}: {
  conversationNote: ConversationNote;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.noteCard}>
      <View style={styles.noteTop}>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={17} color={colors.accentDark} />
          <Text style={styles.dateText}>{conversationNote.talkedAt || "日付未入力"}</Text>
        </View>
        {conversationNote.followUp ? (
          <View style={conversationNote.followUpDone ? styles.doneBadge : styles.pendingBadge}>
            <Text style={conversationNote.followUpDone ? styles.doneBadgeText : styles.pendingBadgeText}>
              {conversationNote.followUpDone ? "フォロー完了" : "フォロー未完了"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.whenWhereRow}>
        <MiniBlock label="会った日" body={conversationNote.talkedAt} required />
        <MiniBlock label="会った場所" body={conversationNote.place} required />
      </View>

      <MiniBlock label="話した内容" body={conversationNote.topic} required strong />
      <MiniBlock label="印象に残ったこと" body={conversationNote.impression} />
      <MiniBlock label="次に聞きたいこと" body={conversationNote.nextQuestion} />
      <MiniBlock label="約束したこと" body={conversationNote.promised} />
      <MiniBlock label="フォローすること" body={conversationNote.followUp} />

      <View style={styles.noteActions}>
        <PrimaryButton disabled={deleting} icon="create-outline" label="編集" variant="secondary" onPress={onEdit} style={styles.noteActionButton} />
        <PrimaryButton
          disabled={deleting}
          icon="trash-outline"
          label={deleting ? "削除中" : "削除"}
          variant="ghost"
          onPress={onDelete}
          style={styles.noteActionButton}
        />
      </View>
    </View>
  );
}

function MiniBlock({ label, body, strong = false, required = false }: { label: string; body: string; strong?: boolean; required?: boolean }) {
  if (!required && !body.trim()) {
    return null;
  }

  return (
    <View style={styles.miniBlock}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={strong ? styles.miniBodyStrong : styles.miniBody}>{body || "未入力"}</Text>
    </View>
  );
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
  deleteErrorText: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.md,
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    padding: spacing.md
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    height: 66,
    justifyContent: "center",
    width: 66
  },
  headerText: {
    flex: 1,
    gap: spacing.xs
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32
  },
  nickname: {
    color: colors.accentDark,
    fontSize: 15,
    fontWeight: "900"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800"
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
  block: {
    gap: spacing.sm
  },
  highlightBlock: {
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    gap: spacing.sm,
    padding: spacing.lg
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
  conversationPanel: {
    gap: spacing.lg
  },
  conversationHeader: {
    alignItems: "stretch",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  conversationTitleGroup: {
    flex: 1,
    gap: spacing.xs
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  conversationButton: {
    alignSelf: "stretch",
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  conversationStack: {
    gap: spacing.md
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  noteActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm
  },
  noteActionButton: {
    flex: 1,
    minHeight: 42
  },
  noteTop: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  dateBadge: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  dateText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: "900"
  },
  pendingBadge: {
    backgroundColor: colors.amberSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  pendingBadgeText: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900"
  },
  doneBadge: {
    backgroundColor: colors.blueSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  doneBadgeText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "900"
  },
  whenWhereRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  miniBlock: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 180
  },
  miniLabel: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: "900"
  },
  miniBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21
  },
  miniBodyStrong: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22
  },
  messagePanel: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  messageText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  errorText: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
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
    backgroundColor: colors.coral,
    flex: 1
  }
});
