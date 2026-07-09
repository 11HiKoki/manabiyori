import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { colors, radii, shadows, spacing } from "../theme";
import type { PersonProfile } from "../types";

type PeopleListScreenProps = {
  people: PersonProfile[];
  loading?: boolean;
  error?: string | null;
  onCreate: () => void;
  onOpenPerson: (personId: string) => void;
  onRetry?: () => void;
};

export function PeopleListScreen({ people, loading = false, error = null, onCreate, onOpenPerson, onRetry }: PeopleListScreenProps) {
  const [query, setQuery] = useState("");

  const filteredPeople = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return people;
    }

    return people.filter((person) =>
      [
        person.name,
        person.nickname,
        person.relationship,
        person.metPlace,
        person.hobbies,
        person.likes,
        person.dislikes,
        person.valuesNote,
        person.memo
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [people, query]);

  return (
    <ScreenShell title="人一覧" subtitle="会った人のプロフィールを、次の会話につながる形で残します。">
      <View style={styles.topActions}>
        <TextInput
          placeholder="名前・関係性・好きなもので検索"
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          value={query}
          onChangeText={setQuery}
        />
        <PrimaryButton icon="person-add-outline" label="人を登録" onPress={onCreate} />
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultText}>{filteredPeople.length}人</Text>
        <Text style={styles.resultHint}>{loading ? "読み込み中" : "新しい順"}</Text>
      </View>

      {error ? (
        <View style={styles.messagePanel}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry ? <PrimaryButton icon="refresh-outline" label="再読み込み" variant="ghost" onPress={onRetry} /> : null}
        </View>
      ) : null}

      <View style={styles.stack}>
        {filteredPeople.length > 0 ? (
          filteredPeople.map((person) => <PersonCard key={person.id} person={person} onPress={() => onOpenPerson(person.id)} />)
        ) : (
          <View style={styles.messagePanel}>
            <Text style={styles.emptyText}>{loading ? "人一覧を読み込んでいます。" : "まだ人物プロフィールがありません。"}</Text>
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

function PersonCard({ person, onPress }: { person: PersonProfile; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}>
      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={24} color={colors.accentDark} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>
          {person.nickname ? <Text style={styles.nickname} numberOfLines={1}>{person.nickname}</Text> : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {person.relationship || "関係性 未入力"}
        </Text>
        {person.metAt || person.metPlace ? (
          <Text style={styles.metMeta} numberOfLines={1}>
            {[person.metAt, person.metPlace].filter(Boolean).join(" / ")}
          </Text>
        ) : null}
        <Text style={styles.preview} numberOfLines={2}>
          {person.likes || person.valuesNote || person.memo || "その人らしさを残しておけます。"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topActions: {
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
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.soft
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs
  },
  nameRow: {
    alignItems: "baseline",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  nickname: {
    color: colors.accentDark,
    fontSize: 13,
    fontWeight: "800"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  metMeta: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: "800"
  },
  preview: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
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
