import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, spacing } from "../theme";
import type { Memo } from "../types";
import { domainTone, kindTone, Pill } from "./Pill";

type MemoCardProps = {
  memo: Memo;
  onPress: () => void;
  compact?: boolean;
};

export function MemoCard({ memo, onPress, compact = false }: MemoCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact ? styles.compactCard : null, pressed ? styles.pressed : null]}
    >
      <View style={styles.topRow}>
        <View style={styles.pills}>
          <Pill label={memo.domain} tone={domainTone(memo.domain)} />
          {memo.types.map((type) => (
            <Pill key={`type-${type}`} label={type} tone={kindTone(type)} />
          ))}
          {memo.emotions.map((emotion) => (
            <Pill key={`emotion-${emotion}`} label={emotion} />
          ))}
        </View>
        <Text style={styles.date}>{formatDate(memo.date)}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
          {memo.title}
        </Text>
        <LabeledPreview label="気づき" text={memo.insight || memo.event} lines={compact ? 2 : 3} />
        {!compact ? <LabeledPreview label="次の行動" text={memo.nextAction} lines={2} muted /> : null}
      </View>

      <View style={styles.footer}>
        {memo.tags.length > 0 ? (
          <View style={styles.tags}>
            {memo.tags.slice(0, compact ? 2 : 3).map((tag) => (
              <Pill key={tag} label={`#${tag}`} />
            ))}
          </View>
        ) : (
          <View style={styles.tagsPlaceholder} />
        )}
        <View style={styles.actionState}>
          <Ionicons
            name={memo.nextActionDone ? "checkmark-circle" : "ellipse-outline"}
            color={memo.nextActionDone ? colors.accent : colors.coral}
            size={16}
          />
          <Text style={styles.actionText}>{memo.nextActionDone ? "完了" : "未完了"}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function LabeledPreview({ label, text, lines, muted = false }: { label: string; text: string; lines: number; muted?: boolean }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={muted ? styles.previewMuted : styles.preview} numberOfLines={lines}>
        {text || "未入力"}
      </Text>
    </View>
  );
}

export function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return `${value.getMonth() + 1}/${value.getDate()}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.soft
  },
  compactCard: {
    padding: spacing.md
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  topRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  pills: {
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: spacing.sm
  },
  date: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    paddingTop: spacing.xs
  },
  body: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  preview: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  previewMuted: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  previewRow: {
    gap: spacing.xs
  },
  previewLabel: {
    color: colors.accentDark,
    fontSize: 11,
    fontWeight: "900"
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  tags: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tagsPlaceholder: {
    flex: 1
  },
  actionState: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  actionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  }
});
