import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";

type SectionProps = {
  title: string;
  caption?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function Section({ title, caption, children, action }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={styles.title}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg
  },
  headingRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  headingText: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24
  },
  caption: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  }
});
