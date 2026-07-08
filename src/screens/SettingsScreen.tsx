import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { Section } from "../components/Section";
import { colors, radii, spacing } from "../theme";
import type { WeekStart } from "../types";

type SettingsScreenProps = {
  onLogout: () => void | Promise<void>;
  onWeekStartChange: (weekStart: WeekStart) => void | Promise<void>;
  userEmail?: string;
  weekStart: WeekStart;
};

const weekStartOptions: Array<{ label: string; value: WeekStart }> = [
  { label: "月曜日", value: "monday" },
  { label: "日曜日", value: "sunday" }
];

export function SettingsScreen({ onLogout, onWeekStartChange, userEmail, weekStart }: SettingsScreenProps) {
  return (
    <ScreenShell title="設定" subtitle="MVPで使う設定だけをシンプルに置いています。">
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={28} color={colors.accentDark} />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.label}>ログイン中</Text>
          <Text style={styles.email}>{userEmail ?? "メールアドレス未取得"}</Text>
        </View>
      </View>

      <Section title="週次振り返り" caption="週タブの集計期間に使います。">
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>週の開始日</Text>
          <View style={styles.segmented}>
            {weekStartOptions.map((option) => {
              const active = option.value === weekStart;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  key={option.value}
                  onPress={() => {
                    void onWeekStartChange(option.value);
                  }}
                  style={({ pressed }) => [styles.segment, active ? styles.segmentActive : null, pressed ? styles.segmentPressed : null]}
                >
                  <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Section>

      <Section title="アプリ説明">
        <View style={styles.panel}>
          <Text style={styles.description}>
            仕事とプライベートの気づき、学び、失敗、教訓を記録し、週・月・年単位で振り返るためのメモアプリです。
          </Text>
        </View>
      </Section>

      <PrimaryButton icon="log-out-outline" label="ログアウト" variant="ghost" onPress={onLogout} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profile: {
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
    height: 58,
    justifyContent: "center",
    width: 58
  },
  profileText: {
    flex: 1,
    gap: spacing.xs
  },
  label: {
    color: colors.accentDark,
    fontSize: 13,
    fontWeight: "900"
  },
  email: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  panelLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  segmented: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs
  },
  segment: {
    alignItems: "center",
    borderRadius: radii.sm,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: spacing.md
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
    fontSize: 14,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: colors.accentDark
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22
  }
});
