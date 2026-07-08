import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { MemoCard } from "../components/MemoCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { Section } from "../components/Section";
import { colors, radii, spacing } from "../theme";
import type { AppRoute, Memo, MemoKind } from "../types";

type HomeScreenProps = {
  memos: Memo[];
  onNavigate: (route: AppRoute) => void;
  onOpenMemo: (memoId: string) => void;
};

const kinds: MemoKind[] = ["気づき", "学び", "失敗", "教訓"];

export function HomeScreen({ memos, onNavigate, onOpenMemo }: HomeScreenProps) {
  const weeklyMemos = memos.filter((memo) => memo.date >= "2026-06-29");
  const openActions = memos.filter((memo) => !memo.nextActionDone);
  const topTag = getTopTag(memos);

  return (
    <ScreenShell title="ホーム" subtitle="最近の気づきを見渡して、次の小さな行動を選びます。">
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>最近の記録</Text>
          <Text style={styles.heroTitle}>今週も、よく観察できています。</Text>
          <Text style={styles.heroText}>失敗も学びも同じ場所に置いて、次の一歩だけ決めていきましょう。</Text>
        </View>
        <PrimaryButton icon="create-outline" label="メモを書く" onPress={() => onNavigate("create")} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="calendar-outline" label="今週のメモ" value={`${weeklyMemos.length}件`} color={colors.accentDark} />
        <StatCard icon="flag-outline" label="未完了の行動" value={`${openActions.length}件`} color={colors.coral} />
        <StatCard icon="pricetag-outline" label="よく使うタグ" value={`#${topTag}`} color={colors.blue} />
      </View>

      <Section title="会った人メモ" caption="次の会話で思い出したいことを、人物ごとに残します。">
        <View style={styles.peoplePanel}>
          <View style={styles.peopleIcon}>
            <Ionicons name="people-outline" size={24} color={colors.accentDark} />
          </View>
          <View style={styles.peopleText}>
            <Text style={styles.peopleTitle}>人一覧を見る</Text>
            <Text style={styles.peopleCaption}>プロフィール、好きなもの、次に話したいことを確認できます。</Text>
          </View>
          <PrimaryButton icon="chevron-forward-outline" label="開く" variant="ghost" onPress={() => onNavigate("people")} style={styles.peopleButton} />
        </View>
      </Section>

      <Section title="種別のバランス">
        <View style={styles.kindGrid}>
          {kinds.map((kind) => (
            <View key={kind} style={styles.kindItem}>
              <Text style={styles.kindCount}>{memos.filter((memo) => memo.types.includes(kind)).length}</Text>
              <Text style={styles.kindLabel}>{kind}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section
        title="最近のメモ"
        action={<PrimaryButton icon="list-outline" label="一覧" variant="ghost" onPress={() => onNavigate("list")} style={styles.smallButton} />}
      >
        <View style={styles.stack}>
          {memos.length > 0 ? (
            memos.slice(0, 3).map((memo) => <MemoCard compact key={memo.id} memo={memo} onPress={() => onOpenMemo(memo.id)} />)
          ) : (
            <Text style={styles.emptyText}>まだメモがありません。</Text>
          )}
        </View>
      </Section>

      <Section title="次の行動" caption="まだ終わっていない行動だけを表示しています。">
        <View style={styles.actionList}>
          {openActions.length > 0 ? (
            openActions.slice(0, 4).map((memo) => (
              <View key={memo.id} style={styles.actionItem}>
                <Ionicons name="ellipse-outline" size={18} color={colors.coral} />
                <View style={styles.actionTextWrap}>
                  <Text style={styles.actionTitle}>{memo.nextAction}</Text>
                  <Text style={styles.actionMeta}>{memo.title}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>未完了の行動はありません。</Text>
          )}
        </View>
      </Section>
    </ScreenShell>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getTopTag(memos: Memo[]) {
  const counts = memos.flatMap((memo) => memo.tags).reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "記録";
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl
  },
  heroCopy: {
    gap: spacing.sm
  },
  heroLabel: {
    color: colors.accentDark,
    fontSize: 13,
    fontWeight: "900"
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  statCard: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minHeight: 112,
    padding: spacing.md
  },
  statValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  },
  kindGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  kindItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md
  },
  kindCount: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  kindLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  stack: {
    gap: spacing.md
  },
  smallButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md
  },
  actionList: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  actionItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md
  },
  actionTextWrap: {
    flex: 1,
    gap: spacing.xs
  },
  actionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  actionMeta: {
    color: colors.textMuted,
    fontSize: 12
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  peoplePanel: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg
  },
  peopleIcon: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  peopleText: {
    flex: 1,
    gap: spacing.xs
  },
  peopleTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  peopleCaption: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  peopleButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md
  }
});
