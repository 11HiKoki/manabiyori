import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { MemoCard } from "../components/MemoCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { SearchField } from "../components/SearchField";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, spacing } from "../theme";
import type { Domain, Memo, MemoKind } from "../types";

type MemoListScreenProps = {
  memos: Memo[];
  onOpenMemo: (memoId: string) => void;
  loading?: boolean;
  error?: string | null;
  onCreate?: () => void;
  onRetry?: () => void;
};

type DomainFilter = "すべて" | Domain;
type KindFilter = "すべて" | MemoKind;

const domainOptions: DomainFilter[] = ["すべて", "仕事", "プライベート"];
const kindOptions: KindFilter[] = ["すべて", "気づき", "学び", "失敗", "教訓", "好奇心"];

export function MemoListScreen({ memos, onOpenMemo, loading = false, error = null, onCreate, onRetry }: MemoListScreenProps) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<DomainFilter>("すべて");
  const [kind, setKind] = useState<KindFilter>("すべて");

  const filteredMemos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return memos.filter((memo) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          memo.title,
          memo.event,
          memo.insight,
          memo.lesson,
          memo.supportiveNote,
          memo.successJournal,
          memo.strengthFeedback,
          memo.nextAction,
          memo.hesitation,
          memo.comparedOptions,
          memo.rejectedReason,
          memo.decisionCriteria,
          memo.aiTodo,
          memo.dlabReading,
          memo.dlabVideo,
          memo.valueItem,
          memo.valueReflection,
          memo.types.join(" "),
          memo.emotions.join(" "),
          memo.tags.join(" ")
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesDomain = domain === "すべて" || memo.domain === domain;
      const matchesKind = kind === "すべて" || memo.types.includes(kind);

      return matchesQuery && matchesDomain && matchesKind;
    });
  }, [domain, kind, memos, query]);

  const hasActiveFilters = query.trim().length > 0 || domain !== "すべて" || kind !== "すべて";
  const resetFilters = () => {
    setQuery("");
    setDomain("すべて");
    setKind("すべて");
  };

  return (
    <ScreenShell title="メモ一覧" subtitle="仕事とプライベートの記録を横断して見返せます。">
      <View style={styles.filters}>
        <SearchField label="メモを検索" placeholder="タイトル・本文・判断基準など" value={query} onChangeText={setQuery} />
        <FilterRow label="分野" options={domainOptions} value={domain} onChange={setDomain} />
        <FilterRow label="種別" options={kindOptions} value={kind} onChange={setKind} wrap />
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>{filteredMemos.length}件</Text>
        <Text style={styles.resultHint}>{loading ? "読み込み中" : "新しい順"}</Text>
      </View>

      {error ? (
        <View style={styles.messagePanel}>
          <View style={styles.messageHeading}>
            <Ionicons name="cloud-offline-outline" size={22} color={colors.coral} />
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>
          </View>
          {onRetry ? <PrimaryButton icon="refresh-outline" label="再読み込み" variant="ghost" onPress={onRetry} /> : null}
        </View>
      ) : null}

      {error && memos.length === 0 ? null : (
        <View style={styles.stack}>
          {filteredMemos.length > 0 ? (
            filteredMemos.map((memo) => <MemoCard key={memo.id} memo={memo} onPress={() => onOpenMemo(memo.id)} />)
          ) : loading ? (
            <View style={styles.messagePanel}>
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.accentDark} />
                <Text style={styles.emptyText}>メモを読み込んでいます。</Text>
              </View>
            </View>
          ) : hasActiveFilters ? (
            <View style={styles.messagePanel}>
              <Ionicons name="search-outline" size={26} color={colors.accentDark} />
              <Text style={styles.messageTitle}>条件に合うメモが見つかりません</Text>
              <Text style={styles.emptyText}>検索語を短くするか、分野・種別を「すべて」に戻してみてください。</Text>
              <PrimaryButton icon="refresh-outline" label="検索条件をリセット" variant="ghost" onPress={resetFilters} />
            </View>
          ) : (
            <View style={styles.messagePanel}>
              <Ionicons name="document-text-outline" size={26} color={colors.accentDark} />
              <Text style={styles.messageTitle}>まだメモがありません</Text>
              <Text style={styles.emptyText}>最初の気づきを一つ残すと、ここから振り返れるようになります。</Text>
              {onCreate ? <PrimaryButton icon="create-outline" label="最初のメモを書く" onPress={onCreate} /> : null}
            </View>
          )}
        </View>
      )}
    </ScreenShell>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
  wrap = false
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  wrap?: boolean;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={[styles.filterRow, wrap ? styles.filterWrap : null]}>
        {options.map((option) => {
          const active = value === option;

          return (
            <Pressable
              accessibilityLabel={`${label}：${option}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={option}
              onPress={() => onChange(option)}
              style={[styles.filterChip, active ? styles.filterChipActive : null]}
            >
              <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.md
  },
  filterGroup: {
    gap: spacing.sm
  },
  filterLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  filterWrap: {
    flexWrap: "wrap"
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  filterChipActive: {
    backgroundColor: colors.successSoft,
    borderColor: colors.accent
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  filterTextActive: {
    color: colors.accentDark
  },
  resultHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  resultText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  resultHint: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  stack: {
    gap: spacing.md
  },
  messagePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  messageHeading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  messageTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  errorText: {
    color: colors.coral,
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  }
});
