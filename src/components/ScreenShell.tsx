import { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../theme";

type ScreenShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footerSpace?: boolean;
};

export function ScreenShell({ title, subtitle, children, footerSpace = true }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, footerSpace ? styles.footerSpace : null]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    alignSelf: "center",
    gap: spacing.xl,
    maxWidth: 760,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: "100%"
  },
  footerSpace: {
    paddingBottom: 96
  },
  header: {
    gap: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  }
});
