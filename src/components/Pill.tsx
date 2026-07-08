import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type PillTone = "work" | "private" | "insight" | "learning" | "failure" | "lesson" | "neutral";

type PillProps = {
  label: string;
  tone?: PillTone;
};

const toneStyles: Record<PillTone, { backgroundColor: string; color: string }> = {
  work: { backgroundColor: colors.blueSoft, color: colors.blue },
  private: { backgroundColor: colors.successSoft, color: colors.accentDark },
  insight: { backgroundColor: colors.successSoft, color: colors.accentDark },
  learning: { backgroundColor: colors.blueSoft, color: colors.blue },
  failure: { backgroundColor: colors.dangerSoft, color: colors.coral },
  lesson: { backgroundColor: colors.amberSoft, color: colors.amber },
  neutral: { backgroundColor: colors.surfaceMuted, color: colors.textMuted }
};

export function Pill({ label, tone = "neutral" }: PillProps) {
  const style = toneStyles[tone];

  return (
    <View style={[styles.pill, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function domainTone(domain: string): PillTone {
  return domain === "仕事" ? "work" : "private";
}

export function kindTone(kind: string): PillTone {
  switch (kind) {
    case "気づき":
      return "insight";
    case "学び":
      return "learning";
    case "失敗":
      return "failure";
    case "教訓":
      return "lesson";
    default:
      return "neutral";
  }
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    minHeight: 24,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  text: {
    fontSize: 11,
    fontWeight: "700"
  }
});
