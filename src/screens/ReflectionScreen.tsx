import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AutoSaveStatusText } from "../components/AutoSaveStatusText";
import { MemoCard } from "../components/MemoCard";
import { Pill } from "../components/Pill";
import { ScreenShell } from "../components/ScreenShell";
import { Section } from "../components/Section";
import { useAutoSavedDraft } from "../hooks/useAutoSavedDraft";
import { colors, radii, spacing } from "../theme";
import type { Memo, MemoKind, ReflectionRange, WeekStart } from "../types";

type ReflectionScreenProps = {
  memos: Memo[];
  onOpenMemo: (memoId: string) => void;
  weekStart: WeekStart;
};

const ranges: ReflectionRange[] = ["週", "月", "年"];
const kinds: MemoKind[] = ["気づき", "学び", "失敗", "教訓"];

export function ReflectionScreen({ memos, onOpenMemo, weekStart }: ReflectionScreenProps) {
  const [range, setRange] = useState<ReflectionRange>("週");
  const [comments, setComments] = useState<Record<ReflectionRange, string>>({
    週: "",
    月: "",
    年: ""
  });
  const { status: autoSaveStatus } = useAutoSavedDraft<{ comments: Record<ReflectionRange, string>; range: ReflectionRange }>({
    draft: { comments, range },
    key: "autosave.reflection.comments",
    onRestore: (draft) => {
      if (draft.comments) {
        setComments((current) => ({ ...current, ...draft.comments }));
      }
      if (draft.range) {
        setRange(draft.range);
      }
    }
  });
  const today = useMemo(() => startOfDay(new Date()), []);

  const periodMemos = useMemo(() => memos.filter((memo) => isInRange(memo.date, range, weekStart, today)), [memos, range, today, weekStart]);
  const tagCounts = getTagCounts(periodMemos);
  const openActions = periodMemos.filter((memo) => !memo.nextActionDone);
  const typeSelectionCount = periodMemos.reduce((total, memo) => total + memo.types.length, 0);
  const periodLabel = rangeLabel(range, weekStart, today);

  return (
    <ScreenShell title="振り返り" subtitle="週・月・年の単位で、記録から行動の傾向を見つけます。">
      <View style={styles.tabs}>
        {ranges.map((item) => {
          const active = item === range;
          return (
            <Pressable key={item} onPress={() => setRange(item)} style={[styles.tab, active ? styles.tabActive : null]}>
              <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>{periodLabel}</Text>
        <Text style={styles.summaryTitle}>{periodMemos.length}件のメモから振り返る</Text>
        <Text style={styles.summaryText}>未完了の次の行動は {openActions.length} 件です。</Text>
      </View>

      <Section title="期間内のメモ一覧">
        <View style={styles.stack}>
          {periodMemos.length > 0 ? (
            periodMemos.map((memo) => <MemoCard compact key={memo.id} memo={memo} onPress={() => onOpenMemo(memo.id)} />)
          ) : (
            <Text style={styles.emptyText}>この期間のメモはまだありません。</Text>
          )}
        </View>
      </Section>

      <Section title="種別ごとの件数">
        <View style={styles.countPanel}>
          {kinds.map((kind) => {
            const count = periodMemos.filter((memo) => memo.types.includes(kind)).length;
            const ratio = typeSelectionCount ? count / typeSelectionCount : 0;

            return (
              <View key={kind} style={styles.countRow}>
                <View style={styles.countLabelRow}>
                  <Text style={styles.countLabel}>{kind}</Text>
                  <Text style={styles.countValue}>{count}件</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(ratio * 100, count > 0 ? 12 : 0)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="よく使ったタグ">
        <View style={styles.tags}>
          {tagCounts.length > 0 ? tagCounts.slice(0, 8).map(([tag, count]) => <Pill key={tag} label={`#${tag} ${count}`} />) : <Text style={styles.emptyText}>タグはまだありません。</Text>}
        </View>
      </Section>

      <Section title="未完了の次の行動">
        <View style={styles.actions}>
          {openActions.length > 0 ? (
            openActions.map((memo) => (
              <View key={memo.id} style={styles.actionItem}>
                <Text style={styles.actionTitle}>{memo.nextAction}</Text>
                <Text style={styles.actionMeta}>{memo.title}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>この期間の未完了アクションはありません。</Text>
          )}
        </View>
      </Section>

      <Section title="振り返りコメント">
        <AutoSaveStatusText status={autoSaveStatus} />
        <TextInput
          multiline
          placeholder={`${range}の振り返りを書く`}
          placeholderTextColor={colors.textMuted}
          style={styles.comment}
          textAlignVertical="top"
          value={comments[range]}
          onChangeText={(text) => setComments((current) => ({ ...current, [range]: text }))}
        />
      </Section>
    </ScreenShell>
  );
}

function isInRange(date: string, range: ReflectionRange, weekStart: WeekStart, today: Date) {
  const value = parseDate(date);

  if (range === "年") {
    return value.getFullYear() === today.getFullYear();
  }

  if (range === "月") {
    return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth();
  }

  const start = getWeekStartDate(today, weekStart);

  return value >= start && value <= today;
}

function rangeLabel(range: ReflectionRange, weekStart: WeekStart, today: Date) {
  switch (range) {
    case "週":
      return `${formatPeriodDate(getWeekStartDate(today, weekStart))} - ${formatPeriodDate(today)}`;
    case "月":
      return `${today.getFullYear()}年${today.getMonth() + 1}月`;
    case "年":
      return `${today.getFullYear()}年`;
    default:
      return "";
  }
}

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function getWeekStartDate(today: Date, weekStart: WeekStart) {
  const start = startOfDay(today);
  const day = start.getDay();
  const offset = weekStart === "monday" ? (day === 0 ? -6 : 1 - day) : -day;
  start.setDate(start.getDate() + offset);
  return start;
}

function formatPeriodDate(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function getTagCounts(memos: Memo[]) {
  const counts = memos.flatMap((memo) => memo.tags).reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

const styles = StyleSheet.create({
  tabs: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs
  },
  tab: {
    alignItems: "center",
    borderRadius: radii.sm,
    flex: 1,
    minHeight: 42,
    justifyContent: "center"
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.accentDark
  },
  summary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  summaryLabel: {
    color: colors.accentDark,
    fontSize: 13,
    fontWeight: "900"
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 14
  },
  stack: {
    gap: spacing.md
  },
  countPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  countRow: {
    gap: spacing.sm
  },
  countLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  countLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  countValue: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  barTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 9,
    overflow: "hidden"
  },
  barFill: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    height: "100%"
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actions: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  actionItem: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.xs,
    paddingBottom: spacing.md
  },
  actionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20
  },
  actionMeta: {
    color: colors.textMuted,
    fontSize: 12
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14
  },
  comment: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 132,
    padding: spacing.lg
  }
});
