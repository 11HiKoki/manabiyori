import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "../theme";

type FormSectionProps = {
  title: string;
  caption?: string;
  children: ReactNode;
};

export function FormSection({ title, caption, children }: FormSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      <View style={styles.fields}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  header: {
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  caption: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  fields: {
    gap: spacing.lg
  }
});
