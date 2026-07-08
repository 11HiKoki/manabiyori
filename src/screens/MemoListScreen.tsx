import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { MemoCard } from "../components/MemoCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, spacing } from "../theme";
import type { Domain, Memo, MemoKind } from "../types";

type MemoListScreenProps = {
  memos: Memo[];
  onOpenMemo: (memoId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

type DomainFilter = "すべて" | Domain;
type KindFilter = "すべて" | MemoKind;

const domainOptions: DomainFilter[] = ["すべて", "仕事", "プライベート"];
const kindOptions: KindFilter[] = ["すべて", "気づき", "学び", "失敗", "教訓"];

export function MemoListScreen({ memos, onOpenMemo, loading = false, error = null, onRetry }: MemoListScreenProps) {
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
          memo.nextAction,
          memo.hesitation,
          memo.comparedOptions,
          memo.rejectedReason,
          memo.decisionCriteria,
          memo.valueItem,
          memo.valueReflection,
          memo.types.join(" "),
          memo.emotions.join(" ")
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesDomain = domain === "すべて" || memo.domain === domain;
      const matchesKind = kind === "すべて" || memo.types.includes(kind);

      return matchesQuery && matchesDomain && matchesKind;
    });
  }, [domain, kind, memos, query]);

  return (
    <ScreenShell title="メモ一覧" subtitle="仕事とプライベートの記録を横断して見返せます。">
      <View style={styles.filters}>
        <TextInput
          placeholder="タイトル・本文・判断基準で検索"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          value={query}
          onChangeText={setQuery}
        />
        <FilterRow options={domainOptions} value={domain} onChange={setDomain} />
        <FilterRow options={kindOptions} value={kind} onChange={setKind} wrap />
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>{filteredMemos.length}件</Text>
        <Text style={styles.resultHint}>{loading ? "読み込み中" : "新しい順"}</Text>
      </View>

      {error ? (
        <View style={styles.messagePanel}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry ? <PrimaryButton icon="refresh-outline" label="再読み込み" variant="ghost" onPress={onRetry} /> : null}
        </View>
      ) : null}

      <View style={styles.stack}>
        {filteredMemos.length > 0 ? (
          filteredMemos.map((memo) => <MemoCard key={memo.id} memo={memo} onPress={() => onOpenMemo(memo.id)} />)
        ) : (
          <View style={styles.messagePanel}>
            <Text style={styles.emptyText}>{loading ? "メモを読み込んでいます。" : "まだメモがありません。"}</Text>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

function FilterRow<T extends string>({
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
    <View style={[styles.filterRow, wrap ? styles.filterWrap : null]}>
      {options.map((option) => {
        const active = value === option;

        return (
          <Pressable key={option} onPress={() => onChange(option)} style={[styles.filterChip, active ? styles.filterChipActive : null]}>
            <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.md
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: spacing.lg
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
  errorText: {
    color: colors.coral,
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
